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

    const { searchParams } = new URL(request.url)
    const query = searchParams.get("q")

    if (!query || query.length < 2) {
      return NextResponse.json(
        { error: "Query must be at least 2 characters" },
        { status: 400 }
      )
    }

    // Search users by username (case insensitive for SQLite)
    const users = await prisma.user.findMany({
      where: {
        username: {
          contains: query.toLowerCase()
        },
        // Exclude current user
        email: {
          not: session.user.email
        }
      },
      select: {
        id: true,
        username: true,
        name: true,
        email: true,
        image: true,
      },
      take: 10, // Limit results
    })

    return NextResponse.json({
      users: users,
      query: query,
      total: users.length
    })
  } catch (error) {
    console.error("Error searching users:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

