import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import { verifyAdminToken } from '@/lib/adminSession'
import bcrypt from 'bcryptjs'

// PUT - Update admin
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const token = (await cookies()).get('admin_token')?.value
  if (!token || !verifyAdminToken(token)) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { username, password, name } = await request.json()

    if (!username || !name) {
      return NextResponse.json({ message: 'Username and name are required' }, { status: 400 })
    }

    // Check if admin exists
    const existingAdmin = await prisma.admin.findUnique({
      where: { id: params.id }
    })

    if (!existingAdmin) {
      return NextResponse.json({ message: 'Admin not found' }, { status: 404 })
    }

    // Check if username is taken by another admin
    const usernameTaken = await prisma.admin.findFirst({
      where: {
        username,
        id: { not: params.id }
      }
    })

    if (usernameTaken) {
      return NextResponse.json({ message: 'Username already exists' }, { status: 400 })
    }

    // Prepare update data
    const updateData: any = {
      username,
      name,
    }

    // Only update password if provided
    if (password && password.trim() !== '') {
      updateData.password = await bcrypt.hash(password, 10)
    }

    // Update admin
    const admin = await prisma.admin.update({
      where: { id: params.id },
      data: updateData,
      select: {
        id: true,
        username: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      }
    })

    return NextResponse.json({ admin, message: 'Admin updated successfully' })
  } catch (error) {
    console.error('Error updating admin:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - Delete admin
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const token = (await cookies()).get('admin_token')?.value
  if (!token || !verifyAdminToken(token)) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Check if admin exists
    const existingAdmin = await prisma.admin.findUnique({
      where: { id: params.id }
    })

    if (!existingAdmin) {
      return NextResponse.json({ message: 'Admin not found' }, { status: 404 })
    }

    // Prevent deleting the last admin
    const adminCount = await prisma.admin.count()
    if (adminCount <= 1) {
      return NextResponse.json({ message: 'Cannot delete the last admin' }, { status: 400 })
    }

    // Delete admin
    await prisma.admin.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Admin deleted successfully' })
  } catch (error) {
    console.error('Error deleting admin:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}


































