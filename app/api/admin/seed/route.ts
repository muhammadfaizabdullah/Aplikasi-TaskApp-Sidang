import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

async function handleSeed(request: Request) {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const token = searchParams.get('token')
  const reset = searchParams.get('reset') === '1'
  if (!token || token !== (process.env.ADMIN_SEED_TOKEN || 'dev-token')) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  const username = process.env.ADMIN_DEFAULT_USERNAME || 'admin'
  const password = process.env.ADMIN_DEFAULT_PASSWORD || 'admin1234'
  const name = process.env.ADMIN_DEFAULT_NAME || 'Admin Faiz'

  const exists = await prisma.admin.findUnique({ where: { username } })
  if (exists) {
    if (reset) {
      const hash = await bcrypt.hash(password, 10)
      await prisma.admin.update({ where: { id: exists.id }, data: { password: hash, name } })
      return NextResponse.json({ created: false, reset: true, username })
    }
    return NextResponse.json({ created: false, message: 'Admin already exists' })
  }

  const hash = await bcrypt.hash(password, 10)
  await prisma.admin.create({ data: { username, password: hash, name } })
  return NextResponse.json({ created: true, username })
}

export async function POST(request: Request) {
  return handleSeed(request)
}

export async function GET(request: Request) {
  return handleSeed(request)
}


