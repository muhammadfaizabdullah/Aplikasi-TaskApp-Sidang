import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { InvalidJsonError, readJsonOrEmpty } from "@/lib/safeJson"

// GET project by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await auth()
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const project = await prisma.project.findUnique({
      where: { id: id },
      include: {
        founder: {
          select: {
            id: true,
            username: true,
            name: true,
            email: true,
            image: true
          }
        },
        members: {
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
        },
        tasks: {
          include: {
            assignees: {
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
            }
          }
        }
      }
    })

    if (!project) {
      return NextResponse.json(
        { error: "Project tidak ditemukan" },
        { status: 404 }
      )
    }

    // Check if user is founder or member of this project
    const isFounder = project.founder.email === session.user.email
    const userMember = project.members.find(
      member => member.user.email === session.user.email
    )
    const isMember = !!userMember
    const userRole = isFounder ? 'FOUNDER' : userMember?.role || null

    if (!isFounder && !isMember) {
      return NextResponse.json(
        { error: "Anda bukan member project ini" },
        { status: 403 }
      )
    }

    // Filter tasks based on user role
    let filteredTasks = project.tasks

    if (userRole === 'FOUNDER' || userRole === 'ADMIN') {
      // Founder and admin can see all tasks
      filteredTasks = project.tasks
    } else if (userRole === 'MEMBER') {
      // Members can only see tasks assigned to them
      filteredTasks = project.tasks.filter(task =>
        task.assignees.some(assignee => assignee.user.email === session.user.email)
      )
    } else {
      // If somehow no role, show no tasks
      filteredTasks = []
    }

    return NextResponse.json({
      project: {
        ...project,
        tasks: filteredTasks
      }
    })

  } catch (error) {
    console.error("Error fetching project:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// PUT (Update) project
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await auth()
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    let body
    try {
      body = await readJsonOrEmpty<{ name: string; description?: string; status?: string }>(request)
    } catch (e) {
      if (e instanceof InvalidJsonError) {
        return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
      }
      throw e
    }
    const { name, description, status } = body as any

    if (!name) {
      return NextResponse.json(
        { error: "Nama project diperlukan" },
        { status: 400 }
      )
    }

    // Check if user is founder or admin of this project
    const projectMember = await prisma.projectMember.findFirst({
      where: {
        projectId: id,
        user: {
          email: session.user.email
        }
      }
    })

    if (!projectMember || (projectMember.role !== 'FOUNDER' && projectMember.role !== 'ADMIN')) {
      return NextResponse.json(
        { error: "Hanya founder dan admin yang bisa mengedit project" },
        { status: 403 }
      )
    }

    // Get current project data for history tracking
    const currentProject = await prisma.project.findUnique({
      where: { id: id }
    })

    if (!currentProject) {
      return NextResponse.json(
        { error: "Project tidak ditemukan" },
        { status: 404 }
      )
    }

    // Update project
    const updatedProject = await prisma.project.update({
      where: { id: id },
      data: {
        name: name,
        description: description || null,
        status: status || 'ACTIVE'
      },
      include: {
        members: {
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
        }
      }
    })

    // Track changes in history
    const changes = []
    
    if (currentProject.name !== name) {
      changes.push({
        projectId: id,
        action: "NAME_CHANGE",
        oldValue: currentProject.name,
        newValue: name,
        changedBy: projectMember.userId
      })
    }
    
    if (currentProject.description !== (description || null)) {
      changes.push({
        projectId: id,
        action: "DESCRIPTION_CHANGE",
        oldValue: currentProject.description,
        newValue: description || null,
        changedBy: projectMember.userId
      })
    }
    
    if (currentProject.status !== (status || 'ACTIVE')) {
      changes.push({
        projectId: id,
        action: "STATUS_CHANGE",
        oldValue: currentProject.status,
        newValue: status || 'ACTIVE',
        changedBy: projectMember.userId
      })
    }

    // Save history if there are changes
    if (changes.length > 0) {
      await prisma.projectHistory.createMany({
        data: changes
      })
    }

    return NextResponse.json({
      success: true,
      project: updatedProject,
      message: "Project berhasil diperbarui"
    })

  } catch (error) {
    console.error("Error updating project:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// DELETE project
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await auth()
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Check if user is founder of this project
    const projectMember = await prisma.projectMember.findFirst({
      where: {
        projectId: id,
        user: {
          email: session.user.email
        }
      }
    })

    if (!projectMember || projectMember.role !== 'FOUNDER') {
      return NextResponse.json(
        { error: "Hanya founder yang bisa menghapus project" },
        { status: 403 }
      )
    }

    // Delete project (cascade will delete members and tasks)
    await prisma.project.delete({
      where: { id: id }
    })

    return NextResponse.json({
      success: true,
      message: "Project berhasil dihapus"
    })

  } catch (error) {
    console.error("Error deleting project:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

