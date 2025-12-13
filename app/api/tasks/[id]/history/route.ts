import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET task history
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await auth()
    const { searchParams } = new URL(request.url)
    const checkStatus = searchParams.get('check')

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Check if user has access to this task's project
    const task = await prisma.task.findUnique({
      where: { id: id },
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

    if (!task) {
      return NextResponse.json(
        { error: "Task tidak ditemukan" },
        { status: 404 }
      )
    }

    // Check if user is member of this project
    const isMember = task.project.members.length > 0
    if (!isMember) {
      return NextResponse.json(
        { error: "Anda bukan member project ini" },
        { status: 403 }
      )
    }

    // If checking status, return undo/redo availability
    if (checkStatus === 'status') {
      // Check for available undo actions (non-undone changes)
      const hasUndoActions = await prisma.taskHistory.findFirst({
        where: {
          taskId: id,
          isUndone: false
        }
      })

      // Check for available redo actions (undone changes)
      const hasRedoActions = await prisma.taskHistory.findFirst({
        where: {
          taskId: id,
          isUndone: true
        }
      })

      return NextResponse.json({
        canUndo: !!hasUndoActions,
        canRedo: !!hasRedoActions,
        undoAvailable: !!hasUndoActions,
        redoAvailable: !!hasRedoActions
      })
    }

    // Get task history
    const history = await prisma.taskHistory.findMany({
      where: {
        taskId: id,
        isUndone: false // Only show non-undone changes
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            email: true
          }
        }
      },
      orderBy: {
        changedAt: 'desc'
      },
      take: 10 // Limit to last 10 changes
    })

    return NextResponse.json({
      history: history
    })

  } catch (error) {
    console.error("Error fetching task history:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// POST undo last task change
export async function POST(
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

    const body = await request.json()
    const { action } = body // "undo"

    // Check if user has access to this task's project
    const task = await prisma.task.findUnique({
      where: { id: id },
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

    if (!task) {
      return NextResponse.json(
        { error: "Task tidak ditemukan" },
        { status: 404 }
      )
    }

    // Check if user is member of this project
    const isMember = task.project.members.length > 0
    if (!isMember) {
      return NextResponse.json(
        { error: "Anda bukan member project ini" },
        { status: 403 }
      )
    }

    if (action === "undo") {
      // Find the last non-undone change
      const lastChange = await prisma.taskHistory.findFirst({
        where: {
          taskId: id,
          isUndone: false
        },
        orderBy: {
          changedAt: 'desc'
        }
      })

      if (!lastChange) {
        return NextResponse.json(
          { error: "Tidak ada perubahan yang dapat di-undo" },
          { status: 400 }
        )
      }

      // Mark the change as undone
      await prisma.taskHistory.update({
        where: { id: lastChange.id },
        data: { isUndone: true }
      })

      // Revert the task based on the change type
      if (lastChange.action === "STATUS_CHANGE" && lastChange.oldValue) {
        await prisma.task.update({
          where: { id: id },
          data: {
            status: lastChange.oldValue,
            updatedAt: new Date()
          }
        })
      } else if (lastChange.action === "TITLE_CHANGE" && lastChange.oldValue) {
        await prisma.task.update({
          where: { id: id },
          data: {
            title: lastChange.oldValue,
            updatedAt: new Date()
          }
        })
      } else if (lastChange.action === "DESCRIPTION_CHANGE") {
        await prisma.task.update({
          where: { id: id },
          data: {
            description: lastChange.oldValue || null,
            updatedAt: new Date()
          }
        })
      } else if (lastChange.action === "PRIORITY_CHANGE" && lastChange.oldValue) {
        await prisma.task.update({
          where: { id: id },
          data: {
            priority: lastChange.oldValue,
            updatedAt: new Date()
          }
        })
      }

      return NextResponse.json({
        message: "Perubahan task berhasil di-undo",
        revertedChange: lastChange
      })

    } else if (action === "redo") {
      // Find the last undone change to redo
      const lastUndoneChange = await prisma.taskHistory.findFirst({
        where: {
          taskId: id,
          isUndone: true
        },
        orderBy: {
          changedAt: 'desc'
        }
      })

      if (!lastUndoneChange) {
        return NextResponse.json(
          { error: "Tidak ada perubahan yang dapat di-redo" },
          { status: 400 }
        )
      }

      // Mark the change as not undone (redo)
      await prisma.taskHistory.update({
        where: { id: lastUndoneChange.id },
        data: { isUndone: false }
      })

      // Re-apply the task change based on the change type
      if (lastUndoneChange.action === "STATUS_CHANGE" && lastUndoneChange.newValue) {
        await prisma.task.update({
          where: { id: id },
          data: {
            status: lastUndoneChange.newValue,
            updatedAt: new Date()
          }
        })
      } else if (lastUndoneChange.action === "TITLE_CHANGE" && lastUndoneChange.newValue) {
        await prisma.task.update({
          where: { id: id },
          data: {
            title: lastUndoneChange.newValue,
            updatedAt: new Date()
          }
        })
      } else if (lastUndoneChange.action === "DESCRIPTION_CHANGE") {
        await prisma.task.update({
          where: { id: id },
          data: {
            description: lastUndoneChange.newValue || null,
            updatedAt: new Date()
          }
        })
      } else if (lastUndoneChange.action === "PRIORITY_CHANGE" && lastUndoneChange.newValue) {
        await prisma.task.update({
          where: { id: id },
          data: {
            priority: lastUndoneChange.newValue,
            updatedAt: new Date()
          }
        })
      }

      return NextResponse.json({
        message: "Perubahan task berhasil di-redo",
        redoneChange: lastUndoneChange
      })

    } else {
      return NextResponse.json(
        { error: "Action tidak valid. Gunakan 'undo' atau 'redo'" },
        { status: 400 }
      )
    }

  } catch (error) {
    console.error("Error processing task undo:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}