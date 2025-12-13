import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Ambil semua project members dari project yang user ikuti
    const members = await prisma.projectMember.findMany({
      where: {
        project: {
          members: {
            some: {
              user: {
                email: session.user.email
              }
            }
          }
        }
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
        },
        project: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: {
        joinedAt: 'desc'
      }
    })

    // Ambil data user sendiri dari database
    const currentUser = await prisma.user.findUnique({
      where: {
        email: session.user.email
      },
      select: {
        id: true,
        username: true,
        name: true,
        email: true,
        image: true
      }
    })

    // Tambahkan user sendiri ke dalam daftar jika belum ada
    if (currentUser) {
      const userExists = members.some(member => member.user.id === currentUser.id)
      if (!userExists) {
        // Gunakan data session yang lebih fresh untuk display name dan image
        const userWithFreshData = {
          ...currentUser,
          name: session.user.name || currentUser.name,
          image: session.user.image || currentUser.image
        }
        
        // Tambahkan user sendiri sebagai member dengan role "FOUNDER" dan project null
        members.unshift({
          id: `self-${currentUser.id}`,
          userId: currentUser.id,
          projectId: null,
          role: "FOUNDER",
          joinedAt: new Date(),
          user: userWithFreshData,
          project: null
        })
      } else {
        // Update existing user data with fresh session data
        const existingUserIndex = members.findIndex(member => member.user.id === currentUser.id)
        if (existingUserIndex !== -1) {
          members[existingUserIndex].user = {
            ...members[existingUserIndex].user,
            name: session.user.name || members[existingUserIndex].user.name,
            image: session.user.image || members[existingUserIndex].user.image
          }
        }
      }
    }

    return NextResponse.json({
      members: members
    })

  } catch (error) {
    console.error("Error fetching team members:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { userId, projectId, role } = await request.json()

    if (!userId || !projectId || !role) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Check if user is already a member of this project
    const existingMember = await prisma.projectMember.findFirst({
      where: {
        userId: userId,
        projectId: projectId
      }
    })

    if (existingMember) {
      return NextResponse.json(
        { error: "User is already a member of this project" },
        { status: 400 }
      )
    }

    // Check if current user has permission to add members (must be member of the project)
    const currentUserMember = await prisma.projectMember.findFirst({
      where: {
        userId: (await prisma.user.findUnique({ where: { email: session.user.email } }))?.id,
        projectId: projectId
      }
    })

    if (!currentUserMember) {
      return NextResponse.json(
        { error: "You don't have permission to add members to this project" },
        { status: 403 }
      )
    }

    // Add new member
    const newMember = await prisma.projectMember.create({
      data: {
        userId: userId,
        projectId: projectId,
        role: role
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
        },
        project: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    return NextResponse.json({
      message: "Member added successfully",
      member: newMember
    })

  } catch (error) {
    console.error("Error adding team member:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
