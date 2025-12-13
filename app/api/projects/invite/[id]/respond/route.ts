import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { response } = await request.json() // 'ACCEPT' atau 'REJECT'
    const { id } = await params

    if (!response || !['ACCEPT', 'REJECT'].includes(response)) {
      return NextResponse.json(
        { error: "Response harus 'ACCEPT' atau 'REJECT'" },
        { status: 400 }
      )
    }

    // Cek apakah invitation ada dan untuk user yang sedang login
    const invitation = await prisma.taskInvitation.findFirst({
      where: {
        id: id,
        invitedUser: {
          email: session.user.email
        },
        status: 'PENDING'
      },
      include: {
        project: true
      }
    })

    if (!invitation) {
      return NextResponse.json(
        { error: "Invitation tidak ditemukan atau sudah direspon" },
        { status: 404 }
      )
    }

    if (response === 'ACCEPT') {
      // Tambahkan user ke project sebagai member
      await prisma.projectMember.create({
        data: {
          projectId: invitation.projectId,
          userId: invitation.invitedUserId,
          role: 'MEMBER'
        }
      })

      // Buat task untuk user yang menerima
      await prisma.task.create({
        data: {
          projectId: invitation.projectId,
          title: invitation.taskTitle,
          description: invitation.taskDescription,
          assigneeId: invitation.invitedUserId,
          createdById: invitation.invitedByUserId,
          dueDate: invitation.dueDate,
          status: 'TODO'
        }
      })
    }

    // Update status invitation
    await prisma.taskInvitation.update({
      where: { id: id },
      data: { status: response }
    })

    return NextResponse.json({
      success: true,
      message: response === 'ACCEPT' 
        ? "Anda berhasil bergabung dengan project dan tugas telah dibuat"
        : "Invitation berhasil ditolak"
    })

  } catch (error) {
    console.error("Error responding to invitation:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
