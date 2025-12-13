import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const imageFile = formData.get('image') as File
    
    if (!imageFile) {
      return NextResponse.json({ error: 'No image file provided' }, { status: 400 })
    }

    // Validate file type
    if (!imageFile.type.startsWith('image/')) {
      return NextResponse.json({ error: 'File must be an image' }, { status: 400 })
    }

    // Validate file size (512KB limit untuk mencegah error 431)
    if (imageFile.size > 512 * 1024) {
      return NextResponse.json({ 
        error: 'File size too large. Maximum 512KB to prevent session errors' 
      }, { status: 400 })
    }

    // Convert file to base64 for storage (in production, you'd use cloud storage)
    const bytes = await imageFile.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64Image = `data:${imageFile.type};base64,${buffer.toString('base64')}`

    // Update user profile with new image
    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: { image: base64Image }
    })

    // Return response with instructions to refresh session
    return NextResponse.json({ 
      message: 'Profile picture updated successfully',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        image: updatedUser.image
      },
      // Signal frontend to refresh session
      refreshSession: true
    })

  } catch (error) {
    console.error('Error updating profile picture:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
