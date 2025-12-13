import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function GET(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    // Get user info
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true }
    })

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 })
    }

    // Get user's project memberships
    const projectMemberships = await prisma.projectMember.findMany({
      where: { userId: user.id },
      include: {
        project: {
          select: { status: true }
        }
      }
    })

    // Get user's tasks
    const userTasks = await prisma.taskAssignee.findMany({
      where: { userId: user.id },
      include: {
        task: {
          select: { status: true }
        }
      }
    })

    // Calculate stats
    const totalProjects = projectMemberships.length
    const activeProjects = projectMemberships.filter(pm => pm.project.status === 'ACTIVE').length
    const totalTasks = userTasks.length
    const completedTasks = userTasks.filter(ut => ut.task.status === 'COMPLETED').length

    // For now, teams joined and contribution score are placeholders
    // These would need additional logic based on your team/project structure
    const teamsJoined = totalProjects // Assuming each project is a "team"
    const activeTeams = activeProjects
    const contributionScore = completedTasks * 10 // Simple calculation

    return NextResponse.json({
      totalProjects,
      totalTasks,
      completedTasks,
      activeProjects,
      teamsJoined,
      activeTeams,
      contributionScore
    })
  } catch (error) {
    console.error('Error fetching user stats:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}