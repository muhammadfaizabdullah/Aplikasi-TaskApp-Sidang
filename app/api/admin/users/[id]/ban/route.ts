import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import { verifyAdminToken } from '@/lib/adminSession'

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const token = (await cookies()).get('admin_token')?.value
  if (!token || !verifyAdminToken(token)) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }
  const { reason } = await request.json().catch(() => ({})) as { reason?: string }

  await prisma.user.update({ where: { id: params.id }, data: { bannedAt: new Date(), bannedReason: reason || null, isSuspended: false, suspendedUntil: null, suspendedReason: null } })
  return NextResponse.json({ success: true })
}

export const runtime = 'nodejs'








