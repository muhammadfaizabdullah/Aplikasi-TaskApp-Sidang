import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import { verifyAdminToken } from '@/lib/adminSession'

export async function GET() {
  const token = (await cookies()).get('admin_token')?.value
  if (!token || !verifyAdminToken(token)) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Get basic counts
    const [totalUsers, totalProjects, totalTasks, totalAdmins] = await Promise.all([
      prisma.user.count(),
      prisma.project.count(),
      prisma.task.count(),
      prisma.admin.count()
    ])

    // Get completed projects
    const completedProjects = await prisma.project.count({
      where: { status: 'completed' }
    })

    // Get active users (users who have created tasks or projects in the last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const activeUsers = await prisma.user.count({
      where: {
        OR: [
          {
            foundedProjects: {
              some: {
                createdAt: { gte: thirtyDaysAgo }
              }
            }
          },
          {
            createdTasks: {
              some: {
                createdAt: { gte: thirtyDaysAgo }
              }
            }
          }
        ]
      }
    })

    // Get user registration data for charts
    const users = await prisma.user.findMany({ 
      select: { createdAt: true },
      orderBy: { createdAt: 'desc' }
    })

    // Monthly registration data (last 12 months)
    const monthly: { label: string; count: number, key: string }[] = []
    const now = new Date()
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      const count = users.filter(u => {
        const userDate = new Date(u.createdAt)
        return `${userDate.getFullYear()}-${String(userDate.getMonth() + 1).padStart(2, '0')}` === monthKey
      }).length
      monthly.push({ 
        label: d.toLocaleString('id-ID', { month: 'short' }), 
        count,
        key: monthKey
      })
    }

    // Yearly registration data (last 5 years)
    const yearly: { label: string; count: number }[] = []
    const currentYear = now.getFullYear()
    for (let y = currentYear - 4; y <= currentYear; y++) {
      const count = users.filter(u => new Date(u.createdAt).getFullYear() === y).length
      yearly.push({ label: String(y), count })
    }

    // Project status distribution
    const projectStatusData = await prisma.project.groupBy({
      by: ['status'],
      _count: { status: true }
    })

    const projectStatusDistribution = projectStatusData.map(item => ({
      name: item.status || 'Active',
      value: item._count.status,
      color: item.status === 'completed' ? '#10B981' : 
             item.status === 'paused' ? '#F59E0B' : '#3B82F6'
    }))

    // Compute real-ish active users per month based on activity signals:
    // - users who created tasks
    // - users who created projects (founders)
    // - users who joined a project in that month
    const sinceStart = new Date(now.getFullYear(), now.getMonth() - 11, 1)

    const [recentTasks, recentProjects, recentJoins] = await Promise.all([
      prisma.task.findMany({
        where: { createdAt: { gte: sinceStart } },
        select: { createdAt: true, createdById: true }
      }),
      prisma.project.findMany({
        where: { createdAt: { gte: sinceStart } },
        select: { createdAt: true, founderId: true }
      }),
      prisma.projectMember.findMany({
        where: { joinedAt: { gte: sinceStart } },
        select: { joinedAt: true, userId: true }
      })
    ])

    const monthKeyFromDate = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const monthToUserIds = new Map<string, Set<string>>()

    const addActivity = (key: string, userId: string | null | undefined) => {
      if (!userId) return
      if (!monthToUserIds.has(key)) monthToUserIds.set(key, new Set<string>())
      monthToUserIds.get(key)!.add(userId)
    }

    for (const t of recentTasks) addActivity(monthKeyFromDate(new Date(t.createdAt)), t.createdById)
    for (const p of recentProjects) addActivity(monthKeyFromDate(new Date(p.createdAt)), p.founderId)
    for (const j of recentJoins) addActivity(monthKeyFromDate(new Date(j.joinedAt)), j.userId)

    const userActivityData = monthly.map((m) => ({
      name: m.label,
      active: monthToUserIds.get(m.key)?.size || 0,
      new: m.count
    }))

    // Calculate productivity percentage (mock calculation)
    const productivityPercentage = Math.min(95, Math.max(75, 85 + Math.floor(Math.random() * 20)))

    return NextResponse.json({
      stats: {
        totalUsers,
        totalProjects,
        totalTasks,
        totalAdmins,
        completedProjects,
        activeUsers,
        productivityPercentage
      },
      charts: {
        monthly: monthly.map(({ label, count }) => ({ label, count })),
        yearly,
        projectStatusDistribution,
        userActivityData
      }
    })
  } catch (error) {
    console.error('Error fetching analytics:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}



