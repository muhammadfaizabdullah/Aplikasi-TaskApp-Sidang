import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { projectId, userId, taskTitle, taskDescription, dueDate } = await request.json()

    if (!projectId || !userId || !taskTitle) {
      return NextResponse.json(
        { error: "Project ID, User ID, dan Task Title diperlukan" },
        { status: 400 }
      )
    }

    // Cek apakah user yang mengirim invitation adalah project owner atau admin
    const projectMember = await prisma.projectMember.findFirst({
      where: {
        projectId: projectId,
        user: {
          email: session.user.email
        },
        role: {
          in: ['FOUNDER', 'ADMIN']
        }
      }
    })

    if (!projectMember) {
      return NextResponse.json(
        { error: "Anda tidak memiliki permission untuk mengirim invitation" },
        { status: 403 }
      )
    }

    // Cek apakah user yang diinvite sudah ada di project
    const existingMember = await prisma.projectMember.findFirst({
      where: {
        projectId: projectId,
        userId: userId
      }
    })

    if (existingMember) {
      return NextResponse.json(
        { error: "User sudah menjadi member project ini" },
        { status: 400 }
      )
    }

    // Buat task invitation
    const invitation = await prisma.taskInvitation.create({
      data: {
        projectId: projectId,
        invitedUserId: userId,
        invitedByUserId: projectMember.userId,
        taskTitle: taskTitle,
        taskDescription: taskDescription || null,
        dueDate: dueDate ? new Date(dueDate) : null,
        status: 'PENDING' // PENDING, ACCEPTED, REJECTED
      }
    })

    return NextResponse.json({
      success: true,
      invitation: {
        id: invitation.id,
        status: invitation.status,
        message: "Invitation berhasil dikirim"
      }
    })

  } catch (error) {
    console.error("Error creating invitation:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
