import crypto from 'crypto'

function getSecret(): string {
  return process.env.ADMIN_SESSION_SECRET || process.env.NEXTAUTH_SECRET || 'admin-dev-secret-change-me'
}

function base64url(input: Buffer | string): string {
  const buf = Buffer.isBuffer(input) ? input : Buffer.from(input)
  return buf.toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
}

export type AdminTokenPayload = {
  id: string
  username: string
  iat: number
}

export function signAdminToken(payload: Omit<AdminTokenPayload, 'iat'>): string {
  const header = { alg: 'HS256', typ: 'JWT' }
  const iat = Math.floor(Date.now() / 1000)
  const body = { ...payload, iat }
  const headerB64 = base64url(JSON.stringify(header))
  const payloadB64 = base64url(JSON.stringify(body))
  const data = `${headerB64}.${payloadB64}`
  const signature = crypto.createHmac('sha256', getSecret()).update(data).digest()
  const signatureB64 = base64url(signature)
  return `${data}.${signatureB64}`
}

export function verifyAdminToken(token: string): AdminTokenPayload | null {
  try {
    const [headerB64, payloadB64, signatureB64] = token.split('.')
    if (!headerB64 || !payloadB64 || !signatureB64) return null
    const data = `${headerB64}.${payloadB64}`
    const expected = base64url(crypto.createHmac('sha256', getSecret()).update(data).digest())
    if (expected !== signatureB64) return null
    const payload = JSON.parse(Buffer.from(payloadB64, 'base64').toString()) as AdminTokenPayload
    return payload
  } catch {
    return null
  }
}








