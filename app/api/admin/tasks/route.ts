import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import { verifyAdminToken } from '@/lib/adminSession'

export async function GET() {
  const token = (await cookies()).get('admin_token')?.value
  if (!token || !verifyAdminToken(token)) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  const tasks = await prisma.task.findMany({
    orderBy: { updatedAt: 'desc' },
    include: {
      project: {
        select: {
          id: true,
          name: true,
          status: true
        }
      },
      createdBy: {
        select: {
          id: true,
          name: true,
          username: true,
          email: true
        }
      },
      assignees: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              username: true,
              email: true
            }
          }
        }
      }
    },
    take: 100 // Limit to last 100 tasks for admin view
  })

  return NextResponse.json({ tasks })
}

export const runtime = 'nodejs'