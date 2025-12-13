import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET project history
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

    // Check if user has access to this project
    const project = await prisma.project.findUnique({
      where: { id: id },
      include: {
        founder: true,
        members: {
          include: {
            user: true
          }
        }
      }
    })

    if (!project) {
      return NextResponse.json(
        { error: "Project tidak ditemukan" },
        { status: 404 }
      )
    }

    // Check if user is founder or member
    const isFounder = project.founder.email === session.user.email
    const isMember = project.members.some(
      member => member.user.email === session.user.email
    )

    if (!isFounder && !isMember) {
      return NextResponse.json(
        { error: "Anda bukan member project ini" },
        { status: 403 }
      )
    }

    // If checking status, return undo/redo availability
    if (checkStatus === 'status') {
      // Check if user is founder or admin (only they can undo/redo)
      const userMember = project.members.find(
        member => member.user.email === session.user.email
      )
      const isAdmin = userMember?.role === 'ADMIN'
  
      console.log('Permission check:', {
        userEmail: session.user.email,
        isFounder,
        isAdmin,
        userMemberRole: userMember?.role,
        canAccess: isFounder || isAdmin
      })
  
      if (!isFounder && !isAdmin) {
        console.log('User does not have permission to undo/redo')
        return NextResponse.json({
          canUndo: false,
          canRedo: false,
          undoAvailable: false,
          redoAvailable: false
        })
      }

      // Check for available undo actions (non-undone changes)
      const hasUndoActions = await prisma.projectHistory.findFirst({
        where: {
          projectId: id,
          isUndone: false
        }
      })
  
      // Check for available redo actions (undone changes)
      const hasRedoActions = await prisma.projectHistory.findFirst({
        where: {
          projectId: id,
          isUndone: true
        }
      })
  
      console.log('Undo/Redo availability check:', {
        hasUndoActions: !!hasUndoActions,
        hasRedoActions: !!hasRedoActions,
        undoCount: hasUndoActions ? 1 : 0,
        redoCount: hasRedoActions ? 1 : 0
      })
  
      return NextResponse.json({
        canUndo: !!hasUndoActions,
        canRedo: !!hasRedoActions,
        undoAvailable: !!hasUndoActions,
        redoAvailable: !!hasRedoActions
      })
    }

    // Get project history
    const history = await prisma.projectHistory.findMany({
      where: {
        projectId: id,
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
    console.error("Error fetching project history:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// GET /api/projects/[id]/history?check=status - Check undo/redo availability
// This is handled in the GET method with query parameter

// POST undo last change
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
    const { action } = body // "undo" or "redo"

    // Check if user has access to this project
    const project = await prisma.project.findUnique({
      where: { id: id },
      include: {
        founder: true,
        members: {
          include: {
            user: true
          }
        }
      }
    })

    if (!project) {
      return NextResponse.json(
        { error: "Project tidak ditemukan" },
        { status: 404 }
      )
    }

    // Check if user is founder or admin (only they can undo/redo)
    const isFounder = project.founder.email === session.user.email
    const userMember = project.members.find(
      member => member.user.email === session.user.email
    )
    const isAdmin = userMember?.role === 'ADMIN'

    if (!isFounder && !isAdmin) {
      return NextResponse.json(
        { error: "Hanya founder dan admin yang dapat melakukan undo/redo" },
        { status: 403 }
      )
    }

    if (action === "undo") {
      // Find the last non-undone change
      const lastChange = await prisma.projectHistory.findFirst({
        where: { 
          projectId: id,
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
      await prisma.projectHistory.update({
        where: { id: lastChange.id },
        data: { isUndone: true }
      })

      // Revert based on change type
      if (lastChange.action === "STATUS_CHANGE" && lastChange.oldValue) {
        await prisma.project.update({
          where: { id: id },
          data: {
            status: lastChange.oldValue,
            updatedAt: new Date()
          }
        })
      } else if (lastChange.action === "TASK_STATUS_CHANGED" && lastChange.oldValue) {
        // Find tasks in this project that have the status that was just set (newValue)
        // and change them back to the old status
        const tasksToRevert = await prisma.task.findMany({
          where: {
            projectId: id,
            status: lastChange.newValue
          }
        })

        // For simplicity, revert the first task found (most recent change)
        if (tasksToRevert.length > 0) {
          await prisma.task.update({
            where: { id: tasksToRevert[0].id },
            data: {
              status: lastChange.oldValue,
              updatedAt: new Date()
            }
          })
        }
      }

      return NextResponse.json({
        message: "Perubahan berhasil di-undo",
        revertedChange: lastChange
      })

    } else if (action === "redo") {
      // Find the last undone change
      const lastUndoneChange = await prisma.projectHistory.findFirst({
        where: { 
          projectId: id,
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

      // Mark the change as not undone
      await prisma.projectHistory.update({
        where: { id: lastUndoneChange.id },
        data: { isUndone: false }
      })

      // Apply the change again
      if (lastUndoneChange.action === "STATUS_CHANGE" && lastUndoneChange.newValue) {
        await prisma.project.update({
          where: { id: id },
          data: {
            status: lastUndoneChange.newValue,
            updatedAt: new Date()
          }
        })
      } else if (lastUndoneChange.action === "TASK_STATUS_CHANGED" && lastUndoneChange.newValue) {
        // Find tasks in this project that have the status that was undone (oldValue)
        // and change them back to the new status
        const tasksToRedo = await prisma.task.findMany({
          where: {
            projectId: id,
            status: lastUndoneChange.oldValue
          }
        })

        // For simplicity, redo the first task found
        if (tasksToRedo.length > 0) {
          await prisma.task.update({
            where: { id: tasksToRedo[0].id },
            data: {
              status: lastUndoneChange.newValue,
              updatedAt: new Date()
            }
          })
        }
      }

      return NextResponse.json({
        message: "Perubahan berhasil di-redo",
        reappliedChange: lastUndoneChange
      })

    } else {
      return NextResponse.json(
        { error: "Action tidak valid. Gunakan 'undo' atau 'redo'" },
        { status: 400 }
      )
    }

  } catch (error) {
    console.error("Error processing undo/redo:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}



