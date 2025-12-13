import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import { verifyAdminToken } from '@/lib/adminSession'

export async function GET() {
  const token = (await cookies()).get('admin_token')?.value
  if (!token || !verifyAdminToken(token)) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  const projects = await prisma.project.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      founder: { select: { id: true, email: true, name: true, username: true } },
      members: { include: { user: { select: { id: true, email: true, username: true, name: true } } } },
      tasks: { select: { id: true, title: true, status: true }, take: 20 },
      _count: { select: { tasks: true, members: true } }
    }
  })
  return NextResponse.json({ projects })
}

export const runtime = 'nodejs'


