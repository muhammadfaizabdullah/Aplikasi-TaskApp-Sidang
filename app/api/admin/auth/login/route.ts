import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { signAdminToken } from '@/lib/adminSession'

export async function POST(request: Request) {
  try {
    let { username, password } = await request.json()
    username = (username || '').trim()
    password = (password || '').trim()
    if (!username || !password) {
      return NextResponse.json({ message: 'Missing credentials' }, { status: 400 })
    }

    const admin = await prisma.admin.findUnique({ where: { username } })
    if (!admin) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 })
    }

    const stored = admin.password || ''
    const isHash = stored.startsWith('$2a$') || stored.startsWith('$2b$') || stored.startsWith('$2y$')
    const ok = isHash ? await bcrypt.compare(password, stored) : password === stored
    if (!ok) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 })
    }

    const token = signAdminToken({ id: admin.id, username: admin.username })
    const res = NextResponse.json({ success: true })
    res.headers.append('Set-Cookie', `admin_token=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${60 * 60 * 12}`)
    return res
  } catch (err) {
    return NextResponse.json({ message: 'Server error' }, { status: 500 })
  }
}

export const runtime = 'nodejs'


