import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { isInvalidJsonError, readJsonOrEmpty } from "@/lib/safeJson"

// GET tasks
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Get user ID from email
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    const tasks = await prisma.task.findMany({
      where: {
        OR: [
          {
            assignees: {
              some: {
                userId: user.id
              }
            }
          },
          {
            createdById: user.id
          }
        ]
      },
      include: {
        project: {
          select: {
            id: true,
            name: true
          }
        },
        assignees: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                name: true,
                image: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({
      tasks: tasks
    })

  } catch (error) {
    console.error("Error fetching tasks:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// POST create new task
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    let body
    try {
      body = await readJsonOrEmpty<{ title: string; description?: string; projectId: string; assigneeIds?: string[]; status?: string; priority?: string; dueDate?: string }>(request)
    } catch (e) {
      if (isInvalidJsonError(e)) {
        return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
      }
      throw e
    }
    const { title, description, projectId, assigneeIds, status, priority, dueDate } = body as any

    if (!title || !projectId) {
      return NextResponse.json(
        { error: "Judul task dan project ID diperlukan" },
        { status: 400 }
      )
    }

    // Get user ID from email
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    // Check if user is member of this project
    const projectMember = await prisma.projectMember.findFirst({
      where: {
        projectId: projectId,
        userId: user.id
      }
    })

    if (!projectMember) {
      return NextResponse.json(
        { error: "Anda bukan member project ini" },
        { status: 403 }
      )
    }

    // Check if all assignees are members of this project (if assignees are specified)
    if (assigneeIds && assigneeIds.length > 0) {
      const assigneeMembers = await prisma.projectMember.findMany({
        where: {
          projectId: projectId,
          userId: {
            in: assigneeIds
          }
        }
      })

      if (assigneeMembers.length !== assigneeIds.length) {
        return NextResponse.json(
          { error: "Semua assignee harus member project ini" },
          { status: 400 }
        )
      }
    }

    // Create task with multiple assignees
    const task = await prisma.task.create({
      data: {
        title: title,
        description: description || null,
        status: status || 'TODO',
        priority: priority || 'MEDIUM',
        dueDate: dueDate ? new Date(dueDate) : null,
        projectId: projectId,
        createdById: user.id,
        assignees: {
          create: (assigneeIds || []).map((assigneeId: string) => ({
            userId: assigneeId
          }))
        }
      },
      include: {
        project: {
          select: {
            id: true,
            name: true
          }
        },
        assignees: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                name: true,
                image: true
              }
            }
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      task: task,
      message: "Task berhasil dibuat"
    })

  } catch (error) {
    console.error("Error creating task:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
