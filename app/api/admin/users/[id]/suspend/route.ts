import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import { verifyAdminToken } from '@/lib/adminSession'

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const token = (await cookies()).get('admin_token')?.value
  if (!token || !verifyAdminToken(token)) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  const { duration, reason } = await request.json().catch(() => ({ })) as { duration?: string; reason?: string }
  let suspendedUntil: Date | null = null
  if (duration) {
    const now = new Date()
    const map: Record<string, number> = {
      '1d': 1,
      '3d': 3,
      '7d': 7,
      '1m': 30,
      '3m': 90,
      '6m': 180,
      '1y': 365
    }
    const days = map[duration]
    if (days) {
      suspendedUntil = new Date(now.getTime() + days * 24 * 60 * 60 * 1000)
    }
  }
  await prisma.user.update({ where: { id: params.id }, data: { isSuspended: true, suspendedUntil, suspendedReason: reason || null } })
  return NextResponse.json({ success: true, suspendedUntil })
}

export const runtime = 'nodejs'


