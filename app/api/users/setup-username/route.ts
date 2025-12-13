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

    const { username } = await request.json()

    if (!username || typeof username !== "string") {
      return NextResponse.json(
        { error: "Username is required" },
        { status: 400 }
      )
    }

    // Validate username format
    if (username.length < 4 || username.length > 16) {
      return NextResponse.json(
        { error: "Username must be between 4 and 16 characters" },
        { status: 400 }
      )
    }

    // Validate username format - only letters, numbers, and underscores, no spaces
    const usernameRegex = /^[a-zA-Z0-9_]+$/
    if (!usernameRegex.test(username)) {
      return NextResponse.json(
        { error: "Username can only contain letters, numbers, and underscores. No spaces allowed." },
        { status: 400 }
      )
    }

    // Check if username already exists
    const existingUser = await prisma.user.findUnique({
      where: { username: username.toLowerCase() },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "Username sudah digunakan" },
        { status: 409 }
      )
    }

    // Check if user exists in database
    let user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    // If user doesn't exist, create them first
    if (!user) {
      try {
        user = await prisma.user.create({
          data: {
            email: session.user.email,
            name: session.user.name || null,
            image: session.user.image || null,
          }
        })
      } catch (createError: any) {
        // Handle case where user might already exist (race condition)
        if (createError.code === 'P2002') {
          // Unique constraint violation, try to find the user again
          user = await prisma.user.findUnique({
            where: { email: session.user.email }
          })
          if (!user) {
            throw createError // Re-throw if it's not a duplicate email issue
          }
        } else {
          throw createError
        }
      }
    }

    // Update user with username
    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: { username: username.toLowerCase() },
    })

    return NextResponse.json({
      success: true,
      user: {
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
      },
    })
  } catch (error) {
    console.error("Error setting up username:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

