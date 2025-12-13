import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import { verifyAdminToken } from '@/lib/adminSession'
import bcrypt from 'bcryptjs'

// GET - Get all admins
export async function GET() {
  const token = (await cookies()).get('admin_token')?.value
  if (!token || !verifyAdminToken(token)) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  const admins = await prisma.admin.findMany({
    select: {
      id: true,
      username: true,
      name: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: { createdAt: 'desc' }
  })

  return NextResponse.json({ admins })
}

// POST - Create new admin
export async function POST(request: Request) {
  const token = (await cookies()).get('admin_token')?.value
  if (!token || !verifyAdminToken(token)) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { username, password, name } = await request.json()

    if (!username || !password || !name) {
      return NextResponse.json({ message: 'Username, password, and name are required' }, { status: 400 })
    }

    // Check if username already exists
    const existingAdmin = await prisma.admin.findUnique({
      where: { username }
    })

    if (existingAdmin) {
      return NextResponse.json({ message: 'Username already exists' }, { status: 400 })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create admin
    const admin = await prisma.admin.create({
      data: {
        username,
        password: hashedPassword,
        name,
      },
      select: {
        id: true,
        username: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      }
    })

    return NextResponse.json({ admin, message: 'Admin created successfully' })
  } catch (error) {
    console.error('Error creating admin:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}































