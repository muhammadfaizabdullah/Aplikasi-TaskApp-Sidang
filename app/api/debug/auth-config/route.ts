import { NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 404 })
  }

  const data = {
    nodeEnv: process.env.NODE_ENV,
    nextauthUrl: process.env.NEXTAUTH_URL,
    nextauthSecret: Boolean(process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET),
    googleIdSet: Boolean(process.env.GOOGLE_CLIENT_ID || process.env.AUTH_GOOGLE_ID),
    googleSecretSet: Boolean(process.env.GOOGLE_CLIENT_SECRET || process.env.AUTH_GOOGLE_SECRET),
    githubIdSet: Boolean(process.env.GITHUB_CLIENT_ID || process.env.GITHUB_ID || process.env.AUTH_GITHUB_ID),
    githubSecretSet: Boolean(process.env.GITHUB_CLIENT_SECRET || process.env.GITHUB_SECRET || process.env.AUTH_GITHUB_SECRET),
    emailServerUser: Boolean(process.env.EMAIL_SERVER_USER),
    emailServerPassword: Boolean(process.env.EMAIL_SERVER_PASSWORD),
    emailFrom: Boolean(process.env.EMAIL_FROM),
  }

  return NextResponse.json(data)
}


