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

    // Ambil semua invitation yang pending untuk user yang sedang login
    const invitations = await prisma.taskInvitation.findMany({
      where: {
        invitedUser: {
          email: session.user.email
        },
        status: 'PENDING'
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            description: true
          }
        },
        invitedBy: {
          select: {
            username: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({
      invitations: invitations
    })

  } catch (error) {
    console.error("Error fetching invitations:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
