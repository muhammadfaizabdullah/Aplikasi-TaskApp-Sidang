import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { isInvalidJsonError, readJsonOrEmpty } from "@/lib/safeJson"

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Add timeout to prevent long loading
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Request timeout')), 5000) // 5 seconds timeout
    })

    const userPromise = prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        username: true,
        name: true,
        email: true,
        image: true,
        isSuspended: true,
        suspendedUntil: true,
        suspendedReason: true,
        bannedAt: true,
        bannedReason: true
      }
    })

    // Race between timeout and query
    const user = await Promise.race([userPromise, timeoutPromise]) as any

    // Jika user tidak ditemukan di DB, gunakan data minimal dari session agar UI tetap jalan
    // Tapi jangan gunakan username dari session untuk konsistensi dengan server check
    if (!user) {
      const minimal = {
        id: session.user.id || 'temp',
        username: null, // Selalu null jika user tidak ada di DB
        name: session.user.name || null,
        email: session.user.email || null,
        image: session.user.image || null,
      }
      return NextResponse.json({ user: minimal })
    }

    return NextResponse.json({ user })

  } catch (error) {
    console.error("Error fetching user:", error)
    
    // Return error response for timeout
    if (error instanceof Error && error.message === 'Request timeout') {
      console.warn("User query timed out")
      return NextResponse.json(
        { error: "Request timeout" },
        { status: 408 }
      )
    }
    
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    let body
    try {
      body = await readJsonOrEmpty<{ name: string; username: string }>(request)
    } catch (e) {
      if (isInvalidJsonError(e)) {
        return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
      }
      throw e
    }
    const { name, username } = body as any

    if (!name || !username) {
      return NextResponse.json(
        { error: "Nama dan username diperlukan" },
        { status: 400 }
      )
    }

    if (username.length < 4 || username.length > 16) {
      return NextResponse.json(
        { error: "Username minimal 4 karakter, maksimal 16 karakter" },
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

    // Check if username already exists (excluding current user)
    const existingUser = await prisma.user.findFirst({
      where: {
        username: username.toLowerCase(),
        email: {
          not: session.user.email
        }
      }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "Username sudah digunakan" },
        { status: 409 }
      )
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        name: name.trim(),
        username: username.toLowerCase()
      },
      select: {
        id: true,
        username: true,
        name: true,
        email: true,
        image: true
      }
    })

    return NextResponse.json({
      success: true,
      user: updatedUser,
      message: "Profil berhasil diperbarui"
    })

  } catch (error) {
    console.error("Error updating user:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

