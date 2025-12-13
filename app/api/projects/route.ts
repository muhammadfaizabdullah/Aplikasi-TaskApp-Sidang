import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { isInvalidJsonError, readJsonOrEmpty } from "@/lib/safeJson"

// POST (Create new project)
export async function POST(request: NextRequest) {
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
      body = await readJsonOrEmpty<{ 
        name: string; 
        description?: string; 
        status?: string;
        startDate?: string;
        endDate?: string;
        memberIds?: string[] 
      }>(request)
    } catch (e) {
      if (isInvalidJsonError(e)) {
        return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
      }
      throw e
    }
    const { name, description, status, startDate, endDate, memberIds } = body as any

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: "Nama project diperlukan" },
        { status: 400 }
      )
    }

    // Check if user has username set
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!currentUser?.username) {
      return NextResponse.json(
        { error: "Anda harus mengatur username terlebih dahulu" },
        { status: 400 }
      )
    }

    // Create project
    const project = await prisma.project.create({
      data: {
        name: name.trim(),
        description: description ? description.trim() : null,
        status: status || 'PLANNING',
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        founderId: currentUser.id
      }
    })

    // Add founder as member
    await prisma.projectMember.create({
      data: {
        projectId: project.id,
        userId: currentUser.id,
        role: 'FOUNDER'
      }
    })

    // Add other members if provided
    if (memberIds && memberIds.length > 0) {
      const memberPromises = memberIds.map((userId: string) =>
        prisma.projectMember.create({
          data: {
            projectId: project.id,
            userId: userId,
            role: 'MEMBER'
          }
        })
      )
      await Promise.all(memberPromises)
    }

    return NextResponse.json({
      success: true,
      project: project,
      message: "Project berhasil dibuat"
    })

  } catch (error) {
    console.error("Error creating project:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// GET (Fetch all projects for current user)
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

    // Optimized query with full includes for dashboard
    const projectsPromise = prisma.project.findMany({
      where: {
        members: {
          some: {
            user: {
              email: session.user.email
            }
          }
        }
      },
      select: {
        id: true,
        name: true,
        description: true,
        status: true,
        createdAt: true,
        members: {
          select: {
            id: true,
            role: true,
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
        },
        tasks: {
          select: {
            id: true,
            status: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Race between timeout and query
    const projects = await Promise.race([projectsPromise, timeoutPromise]) as any

    return NextResponse.json({
      success: true,
      projects: projects
    })

  } catch (error) {
    console.error("Error fetching projects:", error)
    
    // Return empty array instead of error for better UX
    if (error instanceof Error && error.message === 'Request timeout') {
      console.warn("Projects query timed out, returning empty array")
      return NextResponse.json({
        success: true,
        projects: []
      })
    }
    
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
