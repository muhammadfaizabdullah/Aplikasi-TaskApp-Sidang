import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Test Prisma connection
    const userCount = await prisma.user.count()
    
    return NextResponse.json({ 
      status: 'ok', 
      message: 'Prisma connection is working',
      userCount,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Prisma debug error:', error)
    return NextResponse.json({ 
      status: 'error', 
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}



