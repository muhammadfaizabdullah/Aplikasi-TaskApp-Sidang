import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { isInvalidJsonError, readJsonOrEmpty } from "@/lib/safeJson"

// POST (Add members to project)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    const { id: projectId } = await params
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    let body
    try {
      body = await readJsonOrEmpty<{ userIds: string[] }>(request)
    } catch (e) {
      if (isInvalidJsonError(e)) {
        return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
      }
      throw e
    }
    const { userIds } = body as any

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json(
        { error: "User IDs diperlukan" },
        { status: 400 }
      )
    }

    // Check if user is founder or admin of this project
    const currentUserMember = await prisma.projectMember.findFirst({
      where: {
        projectId: projectId,
        user: {
          email: session.user.email
        }
      }
    })

    if (!currentUserMember || (currentUserMember.role !== 'FOUNDER' && currentUserMember.role !== 'ADMIN')) {
      return NextResponse.json(
        { error: "Hanya founder dan admin yang bisa menambah member" },
        { status: 403 }
      )
    }

    // Check if project exists
    const project = await prisma.project.findUnique({
      where: { id: projectId }
    })

    if (!project) {
      return NextResponse.json(
        { error: "Project tidak ditemukan" },
        { status: 404 }
      )
    }

    // Check if users exist and get their details
    const users = await prisma.user.findMany({
      where: {
        id: { in: userIds }
      },
      select: {
        id: true,
        username: true,
        name: true,
        email: true
      }
    })

    if (users.length !== userIds.length) {
      return NextResponse.json(
        { error: "Beberapa user tidak ditemukan" },
        { status: 400 }
      )
    }

    // Check if users are already members
    const existingMembers = await prisma.projectMember.findMany({
      where: {
        projectId: projectId,
        userId: { in: userIds }
      }
    })

    const existingUserIds = existingMembers.map(m => m.userId)
    const newUserIds = userIds.filter(id => !existingUserIds.includes(id))

    if (newUserIds.length === 0) {
      return NextResponse.json(
        { error: "Semua user sudah menjadi member project ini" },
        { status: 400 }
      )
    }

    // Add new members
    const memberPromises = newUserIds.map(userId =>
      prisma.projectMember.create({
        data: {
          projectId: projectId,
          userId: userId,
          role: 'MEMBER'
        },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              name: true,
              email: true,
              image: true
            }
          }
        }
      })
    )

    const newMembers = await Promise.all(memberPromises)

    return NextResponse.json({
      success: true,
      members: newMembers,
      message: `Berhasil menambahkan ${newMembers.length} member ke project`
    })

  } catch (error) {
    console.error("Error adding members:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// GET project members
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    // ... existing code ...
  } catch (error) {
    // ... existing code ...
  }
}
