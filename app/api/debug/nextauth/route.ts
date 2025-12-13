import { NextResponse } from 'next/server'
import { authOptions } from '@/lib/auth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Test NextAuth configuration
    const config = {
      providers: authOptions.providers?.length || 0,
      debug: authOptions.debug,
      trustHost: authOptions.trustHost,
      secret: Boolean(authOptions.secret),
      session: authOptions.session?.strategy,
      adapter: Boolean(authOptions.adapter)
    }
    
    return NextResponse.json({ 
      status: 'ok', 
      message: 'NextAuth configuration is valid',
      config,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('NextAuth debug error:', error)
    return NextResponse.json({ 
      status: 'error', 
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}



