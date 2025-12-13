import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import jsPDF from 'jspdf'

export async function GET(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const month = parseInt(searchParams.get('month') || '0')
    const year = parseInt(searchParams.get('year') || '0')

    if (!month || !year || month < 1 || month > 12 || year < 2000) {
      return NextResponse.json({ message: 'Invalid month or year' }, { status: 400 })
    }

    // Month names for display
    const monthNames = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ]

    // Calculate date range for the month
    const startDate = new Date(year, month - 1, 1)
    const endDate = new Date(year, month, 1)

    // Get user info first
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, name: true, username: true, email: true }
    })

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 })
    }

    // Get user's projects and tasks for the month
    const userProjects = await prisma.projectMember.findMany({
      where: {
        userId: user.id,
        project: {
          createdAt: {
            gte: startDate,
            lt: endDate
          }
        }
      },
      include: {
        project: {
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
              where: {
                createdAt: {
                  gte: startDate,
                  lt: endDate
                }
              },
              select: {
                id: true,
                title: true,
                status: true,
                createdAt: true
              }
            }
          }
        }
      }
    })

    // Get user's personal tasks for the month through TaskAssignee
    const userTaskAssignments = await prisma.taskAssignee.findMany({
      where: {
        userId: user.id,
        task: {
          createdAt: {
            gte: startDate,
            lt: endDate
          }
        }
      },
      include: {
        task: {
          include: {
            project: {
              select: { id: true, name: true }
            },
            createdBy: {
              select: { name: true, username: true }
            }
          }
        }
      }
    })

    // Extract tasks from assignments
    const userTasks = userTaskAssignments.map(assignment => assignment.task)


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
    doc.text('Laporan Pengguna', 105, 20, { align: 'center' })

    doc.setFontSize(18)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(255, 255, 255)
    doc.text(`${user.name || user.username}`, 105, 32, { align: 'center' })

    // Subtitle
    doc.setFontSize(14)
    doc.setTextColor(0, 0, 0)
    doc.text(`PERIODE: ${monthNames[month - 1].toUpperCase()} ${year}`, 105, 50, { align: 'center' })

    let y = 65

    // User info section
    doc.setFillColor(255, 255, 255)
    doc.setDrawColor(226, 232, 240)
    doc.setLineWidth(1)
    doc.roundedRect(15, y - 5, 180, 25, 5, 5, 'FD')

    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(31, 41, 55)
    doc.text('Informasi Pengguna', 25, y + 3)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.setTextColor(55, 65, 81)
    doc.text(`Nama: ${user.name || 'N/A'}`, 25, y + 10)
    doc.text(`Username: @${user.username}`, 25, y + 16)
    doc.text(`Email: ${user.email}`, 105, y + 10)
    doc.text(`Total Project: ${userProjects.length}`, 105, y + 16)

    y += 35

    // Projects section - Table format
    if (userProjects.length > 0) {
      // Section title
      doc.setFillColor(255, 255, 255)
      doc.roundedRect(15, y - 5, 180, 15, 5, 5, 'FD')

      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(31, 41, 55)
      doc.text('Project yang Diikuti', 25, y + 3)

      y += 20

      // Table container with modern styling
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
      doc.text('Nama Project', 45, y + 2)
      doc.text('Role', 155, y + 2)

      // Header bottom border
      doc.setDrawColor(59, 130, 246)
      doc.setLineWidth(1)
      doc.line(15, y + 6, 195, y + 6)

      y += 12

      // Table rows
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(9)

      userProjects.forEach((member, index) => {
        if (y > 240) {
          doc.addPage()
          // Repeat header on new page
          doc.setFillColor(248, 250, 252)
          doc.rect(0, 0, 210, 297, 'F')

          doc.setFillColor(59, 130, 246)
          doc.rect(0, 0, 210, 40, 'F')
          doc.setFillColor(37, 99, 235)
          doc.rect(0, 30, 210, 10, 'F')

          doc.setTextColor(255, 255, 255)
          doc.setFontSize(18)
          doc.setFont('helvetica', 'bold')
          doc.text('Laporan Pengguna (Lanjutan)', 105, 25, { align: 'center' })

          y = 50
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

        // Project name (truncated if too long)
        const projectName = member.project.name.length > 20 ?
          member.project.name.substring(0, 17) + '...' : member.project.name
        doc.text(projectName, 45, y + 3)

        // Role with color coding
        const roleText = member.role === 'FOUNDER' ? 'Founder' :
                        member.role === 'ADMIN' ? 'Admin' : 'Member'
        if (member.role === 'FOUNDER') {
          doc.setTextColor(59, 130, 246)
        } else if (member.role === 'ADMIN') {
          doc.setTextColor(16, 185, 129)
        } else {
          doc.setTextColor(55, 65, 81)
        }
        doc.text(roleText, 155, y + 3)

        // Row separator
        doc.setDrawColor(229, 231, 235)
        doc.setLineWidth(0.2)
        doc.line(15, y + 7, 195, y + 7)

        y += 10
      })

      y += 15
    }

    // Tasks section - Table format
    if (userTasks.length > 0) {
      // Section title
      doc.setFillColor(255, 255, 255)
      doc.roundedRect(15, y - 5, 180, 15, 5, 5, 'FD')

      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(31, 41, 55)
      doc.text('Tugas yang Dikerjakan', 25, y + 3)

      y += 20

      // Table container with modern styling
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
      doc.text('Status', 140, y + 2)
      doc.text('Project', 165, y + 2)

      // Header bottom border
      doc.setDrawColor(59, 130, 246)
      doc.setLineWidth(1)
      doc.line(15, y + 6, 195, y + 6)

      y += 12

      // Table rows
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(8)

      userTasks.forEach((task, index) => {
        if (y > 235) {
          doc.addPage()
          // Repeat header on new page
          doc.setFillColor(248, 250, 252)
          doc.rect(0, 0, 210, 297, 'F')

          doc.setFillColor(59, 130, 246)
          doc.rect(0, 0, 210, 40, 'F')
          doc.setFillColor(37, 99, 235)
          doc.rect(0, 30, 210, 10, 'F')

          doc.setTextColor(255, 255, 255)
          doc.setFontSize(18)
          doc.setFont('helvetica', 'bold')
          doc.text('Laporan Pengguna (Lanjutan)', 105, 25, { align: 'center' })

          y = 50
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
        const taskTitle = task.title.length > 15 ?
          task.title.substring(0, 12) + '...' : task.title
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
        doc.text(statusText, 140, y + 3)

        // Project name (full name)
        const projectName = task.project?.name || '-'
        doc.setTextColor(55, 65, 81)
        doc.text(projectName, 165, y + 3)

        // Row separator
        doc.setDrawColor(229, 231, 235)
        doc.setLineWidth(0.2)
        doc.line(15, y + 9, 195, y + 9)

        y += 12
      })

      y += 15
    }

    // Signature section with wider space
    const pageHeight = doc.internal.pageSize.height
    const signatureY = pageHeight - 50

    doc.setDrawColor(59, 130, 246)
    doc.setLineWidth(1)
    doc.setFillColor(255, 255, 255)
    doc.roundedRect(120, signatureY - 5, 75, 45, 5, 5, 'FD')

    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(0, 0, 0)
    const currentDate = new Date().toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
    doc.text(currentDate, 135, signatureY + 3)

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
        'Content-Disposition': `attachment; filename="laporan-pengguna-${user.username || user.name || 'user'}-${year}-${month}.pdf"`
      }
    })
  } catch (error) {
    console.error('Error generating user report:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}