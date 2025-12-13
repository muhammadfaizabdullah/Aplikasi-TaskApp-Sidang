import { handlers } from '@/lib/auth'

export const { GET, POST } = handlers

// Pastikan route ini berjalan di Node.js runtime, bukan Edge
export const runtime = 'nodejs'
// Hindari cache pada route auth agar selalu dinamis
export const dynamic = 'force-dynamic'