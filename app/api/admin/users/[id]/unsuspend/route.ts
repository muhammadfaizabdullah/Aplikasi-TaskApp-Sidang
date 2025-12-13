import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import { verifyAdminToken } from '@/lib/adminSession'

export async function POST(_request: Request, { params }: { params: { id: string } }) {
  const token = (await cookies()).get('admin_token')?.value
  if (!token || !verifyAdminToken(token)) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  await prisma.user.update({ where: { id: params.id }, data: { isSuspended: false, suspendedUntil: null, suspendedReason: null } })
  return NextResponse.json({ success: true })
}

export const runtime = 'nodejs'


