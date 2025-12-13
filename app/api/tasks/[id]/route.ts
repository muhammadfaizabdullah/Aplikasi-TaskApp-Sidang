import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { isInvalidJsonError, readJsonOrEmpty } from "@/lib/safeJson"

// GET task by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await auth()
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const taskId = id

    const task = await prisma.task.findUnique({
      where: { id: taskId },
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
        },
        createdBy: {
          select: {
            id: true,
            username: true,
            name: true,
            email: true
          }
        }
      }
    })

    if (!task) {
      return NextResponse.json(
        { error: "Task tidak ditemukan" },
        { status: 404 }
      )
    }

    // Check if user is member of this project
    const projectMember = await prisma.projectMember.findFirst({
      where: {
        projectId: task.projectId,
        user: {
          email: session.user.email
        }
      }
    })

    if (!projectMember) {
      return NextResponse.json(
        { error: "Anda bukan member project ini" },
        { status: 403 }
      )
    }

    return NextResponse.json({
      task: task
    })

  } catch (error) {
    console.error("Error fetching task:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// PUT (Update) task
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await auth()
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const taskId = id
    let body
    try {
      body = await readJsonOrEmpty<{ title: string; description?: string; status?: string; priority?: string; dueDate?: string; assigneeIds?: string[] }>(request)
    } catch (e) {
      if (isInvalidJsonError(e)) {
        return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
      }
      throw e
    }
    const { title, description, status, priority, dueDate, assigneeIds } = body as any

    if (!title) {
      return NextResponse.json(
        { error: "Judul task diperlukan" },
        { status: 400 }
      )
    }

    // Get task to check project
    const existingTask = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        project: {
          include: {
            members: {
              where: {
                user: {
                  email: session.user.email
                }
              }
            }
          }
        }
      }
    })

    if (!existingTask) {
      return NextResponse.json(
        { error: "Task tidak ditemukan" },
        { status: 404 }
      )
    }

    // Check user permissions based on role
    const projectMember = existingTask.project.members[0]
    const userRole = projectMember?.role || 'MEMBER'
    const isCreator = existingTask.createdById === session.user.id
    const isFounder = userRole === 'FOUNDER'
    const isAdmin = userRole === 'ADMIN'
    const isMember = userRole === 'MEMBER'

    // Prepare update data based on permissions
    let updateData: any = {}

    if (isFounder || isAdmin) {
      // Founder and Admin can edit everything
      updateData = {
        title: title,
        description: description || null,
        status: status || 'TODO',
        priority: priority || 'MEDIUM',
        dueDate: dueDate ? new Date(dueDate) : null
      }

      // Handle assignee changes if provided
      if (assigneeIds !== undefined) {
        // First, remove all existing assignees
        await prisma.taskAssignee.deleteMany({
          where: { taskId: taskId }
        })

        // Then add new assignees
        if (assigneeIds.length > 0) {
          updateData.assignees = {
            create: assigneeIds.map((userId: string) => ({
              userId: userId
            }))
          }
        }
      }
    } else if (isMember) {
      // Members can only change status
      if (status && status !== existingTask.status) {
        updateData.status = status
      } else {
        return NextResponse.json(
          { error: "Sebagai member, Anda hanya dapat mengubah status task" },
          { status: 403 }
        )
      }
    } else {
      return NextResponse.json(
        { error: "Anda tidak memiliki izin untuk mengedit task ini" },
        { status: 403 }
      )
    }

    // Update task
    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: updateData,
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

    // Create history entry for task update
    const user = await prisma.user.findUnique({
      where: { email: session.user.email! }
    })

    if (user) {
      // Determine what changed and create appropriate history entries
      const changes = []

      if (title !== existingTask.title) {
        changes.push({
          taskId: taskId,
          action: "TITLE_CHANGE",
          oldValue: existingTask.title,
          newValue: title,
          changedBy: user.id
        })
      }

      if (description !== existingTask.description) {
        changes.push({
          taskId: taskId,
          action: "DESCRIPTION_CHANGE",
          oldValue: existingTask.description || "",
          newValue: description || "",
          changedBy: user.id
        })
      }

      if (status && status !== existingTask.status) {
        changes.push({
          taskId: taskId,
          action: "STATUS_CHANGE",
          oldValue: existingTask.status,
          newValue: status,
          changedBy: user.id
        })
      }

      if (priority && priority !== existingTask.priority) {
        changes.push({
          taskId: taskId,
          action: "PRIORITY_CHANGE",
          oldValue: existingTask.priority,
          newValue: priority,
          changedBy: user.id
        })
      }

      // Create history entries for all changes
      if (changes.length > 0) {
        await prisma.taskHistory.createMany({
          data: changes
        })

        // Also create project history entries for task status changes
        const projectHistoryChanges = changes
          .filter(change => change.action === "STATUS_CHANGE")
          .map(change => ({
            projectId: existingTask.projectId,
            action: "TASK_STATUS_CHANGED",
            oldValue: change.oldValue,
            newValue: change.newValue,
            changedBy: change.changedBy
          }))

        if (projectHistoryChanges.length > 0) {
          await prisma.projectHistory.createMany({
            data: projectHistoryChanges
          })
        }
      }
    }

    return NextResponse.json({
      success: true,
      task: updatedTask,
      message: "Task berhasil diperbarui"
    })

  } catch (error) {
    console.error("Error updating task:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// DELETE task
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await auth()
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const taskId = id

    // Get task to check project
    const existingTask = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        project: {
          include: {
            members: {
              where: {
                user: {
                  email: session.user.email
                }
              }
            }
          }
        }
      }
    })

    if (!existingTask) {
      return NextResponse.json(
        { error: "Task tidak ditemukan" },
        { status: 404 }
      )
    }

    // Check if user is founder (only founders can delete tasks)
    const projectMember = existingTask.project.members[0]
    const userRole = projectMember?.role || 'MEMBER'
    const isFounder = userRole === 'FOUNDER'

    if (!projectMember || !isFounder) {
      return NextResponse.json(
        { error: "Hanya founder yang dapat menghapus task" },
        { status: 403 }
      )
    }

    // Delete task
    await prisma.task.delete({
      where: { id: taskId }
    })

    return NextResponse.json({
      success: true,
      message: "Task berhasil dihapus"
    })

  } catch (error) {
    console.error("Error deleting task:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
