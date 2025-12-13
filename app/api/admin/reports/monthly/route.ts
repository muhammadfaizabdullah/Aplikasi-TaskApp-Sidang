import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import { verifyAdminToken } from '@/lib/adminSession'
import jsPDF from 'jspdf'

export async function GET(request: Request) {
  const token = (await cookies()).get('admin_token')?.value
  if (!token || !verifyAdminToken(token)) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const month = parseInt(searchParams.get('month') || '0')
  const year = parseInt(searchParams.get('year') || '0')

  if (!month || !year || month < 1 || month > 12 || year < 2000) {
    return NextResponse.json({ message: 'Invalid month or year' }, { status: 400 })
  }

  try {
    // Month names for display
    const monthNames = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ]

    // Calculate date range for the month
    const startDate = new Date(year, month - 1, 1)
    const endDate = new Date(year, month, 1)

    // Get projects created in the month
    const projects = await prisma.project.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lt: endDate
        }
      },
      include: {
        founder: {
          select: { id: true, name: true, username: true, email: true }
        },
        members: {
          include: {
            user: {
              select: { id: true, name: true, username: true, email: true, role: true }
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
            createdAt: true,
            createdBy: {
              select: { name: true, username: true }
            }
          }
        }
      }
    })

    // Get current admin for signature
    const adminToken = (await cookies()).get('admin_token')?.value
    let adminName = 'Administrator'

    if (adminToken) {
      try {
        const parts = adminToken.split('.')
        if (parts.length >= 2) {
          const payload = JSON.parse(atob(parts[1]))
          const admin = await prisma.admin.findUnique({
            where: { id: payload.id },
            select: { name: true }
          })
          if (admin?.name) {
            adminName = admin.name
          }
        }
      } catch (error) {
        // If token parsing fails, use default name
        console.error('Error parsing admin token:', error)
      }
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
    doc.text('Laporan Bulanan', 105, 20, { align: 'center' })

    doc.setFontSize(18)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(255, 255, 255)
    doc.text('TaskApp Management System', 105, 32, { align: 'center' })

    // Subtitle
    doc.setFontSize(14)
    doc.setTextColor(0, 0, 0)
    doc.text(`PERIODE: ${monthNames[month - 1].toUpperCase()} ${year}`, 105, 50, { align: 'center' })

    let y = 65

    // Enhanced table container with modern shadow effect
    doc.setFillColor(255, 255, 255)
    doc.setDrawColor(226, 232, 240)
    doc.setLineWidth(1)
    doc.roundedRect(15, y - 5, 180, 18, 5, 5, 'FD')

    // Modern table headers with gradient background
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(31, 41, 55) // Dark gray

    // Header background with sophisticated gradient
    doc.setFillColor(241, 245, 249) // Light blue-gray
    doc.rect(15, y - 5, 180, 18, 'F')

    // Add subtle gradient overlay for header
    doc.setFillColor(186, 230, 253) // Very light blue
    doc.rect(15, y - 5, 180, 8, 'F')
    doc.setFillColor(219, 234, 254) // Light blue
    doc.rect(15, y + 3, 180, 10, 'F')

    // Header text with professional spacing and styling
    const headers = ['No', 'Project Name', 'Tasks', 'Founder', 'Admins', 'Members']
    const headerPositions = [22, 40, 85, 125, 155, 175]

    headers.forEach((header, index) => {
      doc.setTextColor(23, 23, 23) // Darker text for contrast
      doc.text(header, headerPositions[index], y + 5)
    })

    // Enhanced header bottom border with gradient effect
    doc.setDrawColor(59, 130, 246) // Blue accent
    doc.setLineWidth(1.5)
    doc.line(15, y + 10, 195, y + 10)

    // Add subtle inner shadow line
    doc.setDrawColor(148, 163, 184)
    doc.setLineWidth(0.3)
    doc.line(15, y + 11, 195, y + 11)

    y += 15

    // Enhanced table rows with modern styling
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)

    // Updated column widths and positions for better layout
    const columnWidths = [10, 45, 35, 25, 15, 15] // No, Project, Tasks, Founder, Admin, Member
    const columnPositions = [22, 40, 85, 125, 155, 175]

    projects.forEach((project, index) => {
      const tasksText = project.tasks.map(t => t.title).join(', ')
      const founderUsername = project.founder.username || project.founder.name || 'N/A'
      const admins = project.members.filter(m => m.role === 'ADMIN').map(m => m.user.username || m.user.name).join(', ')
      const members = project.members.filter(m => m.role === 'MEMBER').map(m => m.user.username || m.user.name).join(', ')

      // Process tasks to add @ prefix for "DAMAR" tasks
      const processedTasks = tasksText.split(', ').map(task => {
        if (task.toUpperCase().includes('DAMAR')) {
          return ` ${task.replace(/DAMAR/i, '@DAMAR')}`
        }
        return task
      }).join(', ')

      // Prepare cell content
      const cells = [
        (index + 1).toString(), // No
        project.name, // Project
        processedTasks || '-', // Tasks
        founderUsername.startsWith('@') ? founderUsername : `@${founderUsername}`, // Founder
        admins ? admins.split(', ').map(a => a.startsWith('@') ? a : `@${a}`).join(', ') : '-', // Admin
        members ? members.split(', ').map(m => m.startsWith('@') ? m : `@${m}`).join(', ') : '-' // Member
      ]

      // Calculate wrapped text for each cell
      const wrappedCells = cells.map((cell, cellIndex) => {
        if (cellIndex === 0) return [cell] // No column - single line
        return doc.splitTextToSize(cell, columnWidths[cellIndex])
      })

      // Calculate row height based on the tallest wrapped cell
      const rowHeight = Math.max(...wrappedCells.map(lines => lines.length * 4)) + 6 // 4 units per line + padding

      // Enhanced row background with modern alternating colors and subtle gradients
      if (index % 2 === 0) {
        // Even rows - very light blue-gray
        doc.setFillColor(252, 254, 255)
        doc.rect(15, y - 3, 180, rowHeight, 'F')
        // Add subtle gradient overlay
        doc.setFillColor(240, 249, 255)
        doc.rect(15, y - 3, 180, rowHeight * 0.3, 'F')
      } else {
        // Odd rows - pure white with subtle border
        doc.setFillColor(255, 255, 255)
        doc.rect(15, y - 3, 180, rowHeight, 'F')
      }

      // Render each cell with enhanced styling and text wrapping
      wrappedCells.forEach((lines, cellIndex) => {
        const x = columnPositions[cellIndex]
        let cellY = y + 4

        // Professional styling for different columns
        if (cellIndex === 0) { // Number column with modern badge
          doc.setFillColor(59, 130, 246) // Blue
          doc.roundedRect(19, y, 6, 6, 3, 3, 'F')
          doc.setTextColor(255, 255, 255)
          doc.setFontSize(9)
          doc.setFont('helvetica', 'bold')
          doc.text(lines[0], 22, cellY + 1, { align: 'center' })
          doc.setTextColor(31, 41, 55)
          doc.setFontSize(10)
          doc.setFont('helvetica', 'normal')
        } else if (cellIndex === 1) { // Project name - prominent styling
          doc.setFont('helvetica', 'bold')
          doc.setTextColor(17, 24, 39) // Darker for emphasis
          doc.setFontSize(10)
          lines.forEach((line: string) => {
            doc.text(line, x, cellY)
            cellY += 4.5
          })
          doc.setFont('helvetica', 'normal')
          doc.setFontSize(10)
        } else if (cellIndex === 2) { // Tasks - secondary emphasis
          doc.setFont('helvetica', 'normal')
          doc.setTextColor(55, 65, 81) // Medium gray
          doc.setFontSize(9)
          lines.forEach((line: string) => {
            doc.text(line, x, cellY)
            cellY += 4
          })
          doc.setFontSize(10)
        } else if (cellIndex === 3) { // Founder - special highlighting
          doc.setFont('helvetica', 'normal')
          doc.setTextColor(31, 41, 55)
          // Add subtle background for founder
          doc.setFillColor(254, 243, 199) // Light yellow
          doc.roundedRect(x - 2, y, columnWidths[cellIndex] + 4, rowHeight - 2, 2, 2, 'F')
          lines.forEach((line: string) => {
            doc.text(line, x, cellY)
            cellY += 4
          })
        } else { // Admin and Member columns - clean styling
          doc.setTextColor(55, 65, 81)
          doc.setFontSize(9)
          lines.forEach((line: string) => {
            doc.text(line, x, cellY)
            cellY += 4
          })
          doc.setFontSize(10)
        }
      })

      // Enhanced row separator with modern styling
      doc.setDrawColor(209, 213, 219) // Medium gray
      doc.setLineWidth(0.3)
      doc.line(15, y + rowHeight - 3, 195, y + rowHeight - 3)

      // Add subtle shadow effect for depth
      doc.setDrawColor(229, 231, 235)
      doc.setLineWidth(0.1)
      doc.line(15, y + rowHeight - 2, 195, y + rowHeight - 2)

      y += rowHeight

      // If y is too low, add new page
      if (y > 250) {
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
        doc.text('Laporan Bulanan (Lanjutan)', 105, 25, { align: 'center' })

        y = 50
      }
    })

    // Remove table outline - clean modern look without borders

    // Modern signature section at bottom right with outline and wider space
    const pageHeight = doc.internal.pageSize.height
    const pageWidth = doc.internal.pageSize.width

    // Position signature at bottom right with modern styling
    const signatureX = pageWidth - 85
    const signatureY = pageHeight - 65

    // Add signature outline box with increased height
    doc.setDrawColor(59, 130, 246) // Blue border
    doc.setLineWidth(1)
    doc.setFillColor(255, 255, 255) // White background
    doc.roundedRect(signatureX - 5, signatureY - 5, 80, 60, 5, 5, 'FD') // Fill and stroke

    // Date at the top
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(0, 0, 0)
    const currentDate = new Date().toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }) || new Date().toLocaleDateString('id-ID')
    doc.text(currentDate, signatureX + 20, signatureY + 3, { align: 'center' })

    // Add wider space for signature (empty space between date and name)
    
    // Admin name (full name of current admin)
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(31, 41, 55)
    doc.text(adminName, signatureX + 20, signatureY + 48, { align: 'center' })

    // Convert to buffer
    const pdfBuffer = Buffer.from(doc.output('arraybuffer'))

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="laporan-bulanan-${year}-${month}.pdf"`
      }
    })
  } catch (error) {
    console.error('Error generating report:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}