import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Get current date info
    const now = new Date()
    const currentMonth = now.getMonth() + 1 // 1-12
    const currentYear = now.getFullYear()
    const lastMonth = currentMonth === 1 ? 12 : currentMonth - 1
    const lastYear = currentMonth === 1 ? currentYear - 1 : currentYear

    // Get user's projects and tasks
    const userProjects = await prisma.project.findMany({
      where: {
        members: {
          some: {
            user: {
              email: session.user.email
            }
          }
        }
      },
      include: {
        tasks: true,
        members: true
      }
    })

    // Calculate current month data
    const currentMonthData = {
      totalProjects: userProjects.length,
      totalTasks: userProjects.reduce((sum, project) => sum + project.tasks.length, 0),
      completedTasks: userProjects.reduce((sum, project) => 
        sum + project.tasks.filter(task => task.status === 'COMPLETED').length, 0
      ),
      totalMembers: (() => {
        const allMemberIds = userProjects.flatMap(project => 
          project.members.map(member => member.userId)
        )
        const uniqueMemberIds = Array.from(new Set(allMemberIds))
        return uniqueMemberIds.length
      })(),
      projectProgress: userProjects.map(project => ({
        projectName: project.name,
        progress: project.tasks.length > 0 
          ? Math.round((project.tasks.filter(task => task.status === 'COMPLETED').length / project.tasks.length) * 100)
          : 0
      })),
      taskStatusDistribution: [
        { status: 'COMPLETED', count: userProjects.reduce((sum, project) => 
          sum + project.tasks.filter(task => task.status === 'COMPLETED').length, 0
        )},
        { status: 'IN_PROGRESS', count: userProjects.reduce((sum, project) => 
          sum + project.tasks.filter(task => task.status === 'IN_PROGRESS').length, 0
        )},
        { status: 'TODO', count: userProjects.reduce((sum, project) => 
          sum + project.tasks.filter(task => task.status === 'TODO').length, 0
        )}
      ],
      recentActivity: [
        {
          type: 'task_completed',
          description: 'Task selesai',
          timestamp: now.toISOString()
        },
        {
          type: 'project_updated',
          description: 'Project diperbarui',
          timestamp: new Date(now.getTime() - 3600000).toISOString() // 1 hour ago
        }
      ]
    }

    // Calculate last month data (mock data for now, in real app this would be stored in database)
    const lastMonthData = {
      totalProjects: Math.max(0, currentMonthData.totalProjects - Math.floor(Math.random() * 3)),
      totalTasks: Math.max(0, currentMonthData.totalTasks - Math.floor(Math.random() * 10)),
      completedTasks: Math.max(0, currentMonthData.completedTasks - Math.floor(Math.random() * 8)),
      totalMembers: Math.max(0, currentMonthData.totalMembers - Math.floor(Math.random() * 2))
    }

    // Calculate last year data (mock data for now)
    const lastYearData = {
      totalProjects: Math.max(0, currentMonthData.totalProjects - Math.floor(Math.random() * 8)),
      totalTasks: Math.max(0, currentMonthData.totalTasks - Math.floor(Math.random() * 30)),
      completedTasks: Math.max(0, currentMonthData.completedTasks - Math.floor(Math.random() * 25)),
      totalMembers: Math.max(0, currentMonthData.totalMembers - Math.floor(Math.random() * 5))
    }

    // Calculate month-over-month changes
    const monthOverMonth = {
      projects: currentMonthData.totalProjects - lastMonthData.totalProjects,
      tasks: currentMonthData.totalTasks - lastMonthData.totalTasks,
      completedTasks: currentMonthData.completedTasks - lastMonthData.completedTasks,
      members: currentMonthData.totalMembers - lastMonthData.totalMembers
    }

    // Calculate year-over-year changes
    const yearOverYear = {
      projects: currentMonthData.totalProjects - lastYearData.totalProjects,
      tasks: currentMonthData.totalTasks - lastYearData.totalTasks,
      completedTasks: currentMonthData.completedTasks - lastYearData.completedTasks,
      members: currentMonthData.totalMembers - lastYearData.totalMembers
    }

    return NextResponse.json({
      success: true,
      currentMonth: currentMonthData,
      lastMonth: lastMonthData,
      lastYear: lastYearData,
      monthOverMonth,
      yearOverYear,
      period: {
        currentMonth,
        currentYear,
        lastMonth,
        lastYear
      }
    })

  } catch (error) {
    console.error("Error fetching analytics:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
