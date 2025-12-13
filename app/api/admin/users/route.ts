import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import { verifyAdminToken } from '@/lib/adminSession'

export async function GET() {
  const token = (await cookies()).get('admin_token')?.value
  if (!token || !verifyAdminToken(token)) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      email: true,
      name: true,
      username: true,
      image: true,
      isSuspended: true,
      suspendedUntil: true,
      suspendedReason: true,
      bannedAt: true,
      bannedReason: true,
      createdAt: true,
      // Projects where user is founder
      foundedProjects: {
        select: {
          id: true,
          name: true,
          tasks: { select: { id: true, title: true }, take: 10 }
        },
        take: 10
      },
      // Memberships
      projectMemberships: {
        select: {
          project: {
            select: { id: true, name: true, tasks: { select: { id: true, title: true }, take: 10 } }
          },
          role: true
        },
        take: 10
      },
      // Tasks created and assigned
      createdTasks: { select: { id: true, title: true }, take: 10 },
      assignedTasks: { 
        select: { 
          task: {
            select: {
              id: true,
              title: true
            }
          }
        }, 
        take: 10 
      }
    }
  })
  return NextResponse.json({ users })
}

export const runtime = 'nodejs'