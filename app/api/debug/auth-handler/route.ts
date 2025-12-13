import { NextResponse } from 'next/server'
import NextAuth from 'next-auth'
import { authOptions } from '@/lib/auth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Test NextAuth handler creation
    const handler = NextAuth(authOptions)
    
    return NextResponse.json({ 
      status: 'ok', 
      message: 'NextAuth handler created successfully',
      handlerType: typeof handler,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('NextAuth handler debug error:', error)
    return NextResponse.json({ 
      status: 'error', 
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}



