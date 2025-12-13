import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { isInvalidJsonError, readJsonOrEmpty } from "@/lib/safeJson"

// PUT (Update member role)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; memberId: string }> }
) {
  try {
    const session = await auth()
    const { id: projectId, memberId } = await params

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    let body
    try {
      body = await readJsonOrEmpty<{ role: 'FOUNDER' | 'ADMIN' | 'MEMBER' }>(request)
    } catch (e) {
      if (isInvalidJsonError(e)) {
        return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
      }
      throw e
    }
    const { role } = body as any

    if (!role) {
      return NextResponse.json(
        { error: "Role diperlukan" },
        { status: 400 }
      )
    }

    // Validate current user membership and permissions
    const currentMember = await prisma.projectMember.findFirst({
      where: {
        projectId: projectId,
        user: { email: session.user.email }
      }
    })

    if (!currentMember || (currentMember.role !== 'FOUNDER' && currentMember.role !== 'ADMIN')) {
      return NextResponse.json(
        { error: "Hanya founder dan admin yang bisa mengubah role" },
        { status: 403 }
      )
    }

    // Do not allow editing your own role
    const targetMember = await prisma.projectMember.findUnique({
      where: { id: memberId },
      include: { user: true }
    })

    if (!targetMember || targetMember.projectId !== projectId) {
      return NextResponse.json(
        { error: "Member tidak ditemukan" },
        { status: 404 }
      )
    }

    if (targetMember.user.email === session.user.email) {
      return NextResponse.json(
        { error: "Tidak dapat mengubah role sendiri" },
        { status: 400 }
      )
    }

    // Admin cannot change founder or other admin to founder
    if (currentMember.role === 'ADMIN' && targetMember.role !== 'MEMBER') {
      return NextResponse.json(
        { error: "Admin hanya bisa mengubah role member" },
        { status: 403 }
      )
    }

    const updated = await prisma.projectMember.update({
      where: { id: memberId },
      data: { role }
    })

    return NextResponse.json({
      success: true,
      member: updated,
      message: "Role member berhasil diperbarui"
    })
  } catch (error) {
    console.error("Error updating member role:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// DELETE (Remove member from project)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; memberId: string }> }
) {
  try {
    const session = await auth()
    const { id: projectId, memberId } = await params

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const currentMember = await prisma.projectMember.findFirst({
      where: {
        projectId: projectId,
        user: { email: session.user.email }
      }
    })

    if (!currentMember || (currentMember.role !== 'FOUNDER' && currentMember.role !== 'ADMIN')) {
      return NextResponse.json(
        { error: "Hanya founder dan admin yang bisa menghapus member" },
        { status: 403 }
      )
    }

    const targetMember = await prisma.projectMember.findUnique({ where: { id: memberId }, include: { user: true } })

    if (!targetMember || targetMember.projectId !== projectId) {
      return NextResponse.json(
        { error: "Member tidak ditemukan" },
        { status: 404 }
      )
    }

    if (targetMember.user.email === session.user.email) {
      return NextResponse.json(
        { error: "Tidak dapat menghapus diri sendiri" },
        { status: 400 }
      )
    }

    // Do not allow removing the founder unless current is founder
    if (targetMember.role === 'FOUNDER' && currentMember.role !== 'FOUNDER') {
      return NextResponse.json(
        { error: "Hanya founder yang bisa menghapus founder" },
        { status: 403 }
      )
    }

    await prisma.projectMember.delete({ where: { id: memberId } })

    return NextResponse.json({ success: true, message: "Member berhasil dihapus" })
  } catch (error) {
    console.error("Error deleting member:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}










