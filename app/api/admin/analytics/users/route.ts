import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import { verifyAdminToken } from '@/lib/adminSession'

function getMonthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

export async function GET() {
  const token = (await cookies()).get('admin_token')?.value
  if (!token || !verifyAdminToken(token)) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  const users = await prisma.user.findMany({ select: { createdAt: true } })

  // Monthly: last 12 months including current
  const monthly: { label: string; count: number }[] = []
  const now = new Date()
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const key = getMonthKey(d)
    const count = users.filter(u => getMonthKey(new Date(u.createdAt)) === key).length
    monthly.push({ label: d.toLocaleString('id-ID', { month: 'short' }), count })
  }

  // Yearly: last 5 years including current
  const yearly: { label: string; count: number }[] = []
  const currentYear = now.getFullYear()
  for (let y = currentYear - 4; y <= currentYear; y++) {
    const count = users.filter(u => new Date(u.createdAt).getFullYear() === y).length
    yearly.push({ label: String(y), count })
  }

  return NextResponse.json({ monthly, yearly })
}








