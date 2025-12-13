import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: userId } = await params
    console.log('API: Received request for user ID:', userId)
    
    const session = await auth()
    if (!session?.user?.id) {
      console.log('API: Unauthorized - no session')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('API: Looking for user with ID:', userId)

    // Get user data
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        image: true,
        createdAt: true,
        updatedAt: true
      }
    })

    console.log('API: Found user:', user)

    if (!user) {
      console.log('API: User not found')
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({
      user: user
    })

  } catch (error) {
    console.error('API: Error fetching user:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
