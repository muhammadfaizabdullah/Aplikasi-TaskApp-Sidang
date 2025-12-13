import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import jsPDF from 'jspdf'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const projectId = params.id

    // Get user info
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, name: true, username: true, email: true }
    })

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 })
    }

    // Check if user has access to this project
    const membership = await prisma.projectMember.findFirst({
      where: {
        projectId: projectId,
        userId: user.id
      }
    })

    if (!membership) {
      return NextResponse.json({ message: 'Access denied' }, { status: 403 })
    }

    // Get project details
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        founder: {
          select: { id: true, name: true, username: true }
        },
        members: {
          include: {
            user: {
              select: { id: true, name: true, username: true }
            }
          }
        },
        tasks: {
          include: {
            assignees: {
              include: {
                user: {
                  select: { name: true, username: true }
                }
              }
            }
          }
        }
      }
    })

    if (!project) {
      return NextResponse.json({ message: 'Project not found' }, { status: 404 })
    }

    // Generate PDF with modern design
    const doc = new jsPDF()

    // Set modern font
    doc.setFont('helvetica', 'normal')

    // Add subtle background pattern
    doc.setFillColor(248, 250, 252)
    doc.rect(0, 0, 210, 297, 'F')

    // Header section with gradient background
    doc.setFillColor(59, 130, 246) // Blue gradient start
    doc.rect(0, 0, 210, 40, 'F')
    doc.setFillColor(37, 99, 235) // Blue gradient end
    doc.rect(0, 30, 210, 10, 'F')

    // Title with modern typography
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(24)
    doc.setFont('helvetica', 'bold')
    doc.text('Laporan Project', 105, 20, { align: 'center' })

    doc.setFontSize(18)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(255, 255, 255)
    doc.text(project.name, 105, 32, { align: 'center' })

    let y = 50

    // Project info section
    doc.setFillColor(255, 255, 255)
    doc.setDrawColor(226, 232, 240)
    doc.setLineWidth(1)
    doc.roundedRect(15, y - 5, 180, 35, 5, 5, 'FD')

    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(31, 41, 55)
    doc.text('Informasi Project', 25, y + 3)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.setTextColor(55, 65, 81)
    doc.text(`Nama: ${project.name}`, 25, y + 10)
    doc.text(`Status: ${project.status}`, 25, y + 16)
    doc.text(`Founder: ${project.founder.name || project.founder.username}`, 25, y + 22)
    doc.text(`Total Member: ${project.members.length}`, 105, y + 10)
    doc.text(`Total Task: ${project.tasks.length}`, 105, y + 16)

    y += 45

    // Members section
    if (project.members.length > 0) {
      doc.setFillColor(255, 255, 255)
      doc.roundedRect(15, y - 5, 180, 15, 5, 5, 'FD')

      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(31, 41, 55)
      doc.text('Anggota Project', 25, y + 3)

      y += 20

      // Members table
      doc.setFillColor(255, 255, 255)
      doc.roundedRect(15, y - 5, 180, 12, 3, 3, 'FD')

      // Table headers
      doc.setFontSize(10)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(31, 41, 55)

      // Header background
      doc.setFillColor(241, 245, 249)
      doc.rect(15, y - 5, 180, 12, 'F')

      // Header gradient overlay
      doc.setFillColor(186, 230, 253)
      doc.rect(15, y - 5, 180, 6, 'F')
      doc.setFillColor(219, 234, 254)
      doc.rect(15, y + 1, 180, 6, 'F')

      // Header text
      doc.setTextColor(23, 23, 23)
      doc.text('No', 22, y + 2)
      doc.text('Nama', 45, y + 2)
      doc.text('Username', 120, y + 2)
      doc.text('Role', 165, y + 2)

      // Header bottom border
      doc.setDrawColor(59, 130, 246)
      doc.setLineWidth(1)
      doc.line(15, y + 6, 195, y + 6)

      y += 12

      // Table rows
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(9)

      project.members.forEach((member, index) => {
        if (y > 235) {
          doc.addPage()
          y = 30
        }

        // Row background
        if (index % 2 === 0) {
          doc.setFillColor(252, 254, 255)
          doc.rect(15, y - 2, 180, 10, 'F')
          doc.setFillColor(240, 249, 255)
          doc.rect(15, y - 2, 180, 3, 'F')
        } else {
          doc.setFillColor(255, 255, 255)
          doc.rect(15, y - 2, 180, 10, 'F')
        }

        // Row content
        doc.setTextColor(31, 41, 55)
        doc.text((index + 1).toString(), 22, y + 3)

        const memberName = member.user.name || 'N/A'
        const memberUsername = member.user.username || 'N/A'
        const memberRole = member.role

        doc.text(memberName, 45, y + 3)
        doc.text(`@${memberUsername}`, 120, y + 3)

        // Role with color coding
        if (memberRole === 'FOUNDER') {
          doc.setTextColor(59, 130, 246)
        } else if (memberRole === 'ADMIN') {
          doc.setTextColor(16, 185, 129)
        } else {
          doc.setTextColor(55, 65, 81)
        }
        doc.text(memberRole, 165, y + 3)

        // Row separator
        doc.setDrawColor(229, 231, 235)
        doc.setLineWidth(0.2)
        doc.line(15, y + 7, 195, y + 7)

        y += 10
      })

      y += 15
    }

    // Tasks section
    if (project.tasks.length > 0) {
      doc.setFillColor(255, 255, 255)
      doc.roundedRect(15, y - 5, 180, 15, 5, 5, 'FD')

      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(31, 41, 55)
      doc.text('Tugas Project', 25, y + 3)

      y += 20

      // Tasks table
      doc.setFillColor(255, 255, 255)
      doc.roundedRect(15, y - 5, 180, 12, 3, 3, 'FD')

      // Table headers
      doc.setFontSize(10)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(31, 41, 55)

      // Header background
      doc.setFillColor(241, 245, 249)
      doc.rect(15, y - 5, 180, 12, 'F')

      // Header gradient overlay
      doc.setFillColor(186, 230, 253)
      doc.rect(15, y - 5, 180, 6, 'F')
      doc.setFillColor(219, 234, 254)
      doc.rect(15, y + 1, 180, 6, 'F')

      // Header text
      doc.setTextColor(23, 23, 23)
      doc.text('No', 22, y + 2)
      doc.text('Nama Tugas', 35, y + 2)
      doc.text('Status', 130, y + 2)
      doc.text('Assignee', 165, y + 2)

      // Header bottom border
      doc.setDrawColor(59, 130, 246)
      doc.setLineWidth(1)
      doc.line(15, y + 6, 195, y + 6)

      y += 12

      // Table rows
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(8)

      project.tasks.forEach((task, index) => {
        if (y > 235) {
          doc.addPage()
          y = 30
        }

        // Row background
        if (index % 2 === 0) {
          doc.setFillColor(252, 254, 255)
          doc.rect(15, y - 2, 180, 12, 'F')
          doc.setFillColor(240, 249, 255)
          doc.rect(15, y - 2, 180, 4, 'F')
        } else {
          doc.setFillColor(255, 255, 255)
          doc.rect(15, y - 2, 180, 12, 'F')
        }

        // Row content
        doc.setTextColor(31, 41, 55)
        doc.text((index + 1).toString(), 22, y + 3)

        // Task title (truncated if too long)
        const taskTitle = task.title.length > 20 ?
          task.title.substring(0, 17) + '...' : task.title
        doc.text(taskTitle, 35, y + 3)

        // Status with color coding
        const statusText = task.status === 'COMPLETED' ? 'Selesai' :
                          task.status === 'IN_PROGRESS' ? 'Dalam Proses' : 'Pending'
        if (task.status === 'COMPLETED') {
          doc.setTextColor(16, 185, 129)
        } else if (task.status === 'IN_PROGRESS') {
          doc.setTextColor(245, 158, 11)
        } else {
          doc.setTextColor(239, 68, 68)
        }
        doc.text(statusText, 130, y + 3)

        // Assignees
        const assignees = task.assignees.map(a => a.user.username || a.user.name).join(', ')
        const assigneeText = assignees.length > 10 ?
          assignees.substring(0, 7) + '...' : assignees || '-'
        doc.setTextColor(55, 65, 81)
        doc.text(assigneeText, 165, y + 3)

        // Row separator
        doc.setDrawColor(229, 231, 235)
        doc.setLineWidth(0.2)
        doc.line(15, y + 9, 195, y + 9)

        y += 12
      })
    }

    // Signature section with wider space
    const pageHeight = doc.internal.pageSize.height
    const signatureY = pageHeight - 50

    doc.setFillColor(255, 255, 255)
    doc.roundedRect(120, signatureY - 5, 75, 45, 5, 5, 'F')

    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(0, 0, 0)
    const currentDate = new Date().toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }) || new Date().toLocaleDateString('id-ID')
    doc.text(currentDate, 135, signatureY + 3)

    // Add role text below date
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    const roleText = membership.role === 'FOUNDER' ? 'FOUNDER' : membership.role === 'ADMIN' ? 'ADMIN' : 'USER'
    doc.text(roleText, 135, signatureY + 10)

    // Add wider space for signature (empty space between date and name)

    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(31, 41, 55)
    doc.text(user.name || user.username || 'User', 135, signatureY + 33)

    // Convert to buffer
    const pdfBuffer = Buffer.from(doc.output('arraybuffer'))

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="laporan-project-${project.name.replace(/[^a-zA-Z0-9]/g, '-')}.pdf"`
      }
    })
  } catch (error) {
    console.error('Error generating project report:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}