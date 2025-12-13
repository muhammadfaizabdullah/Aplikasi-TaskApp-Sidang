'use client'

import { SessionProvider, useSession, signOut } from 'next-auth/react'
import { useEffect, useRef } from 'react'
import { useToast } from '@/components/ui/Toaster'
import { useLanguage } from '@/components/providers/LanguageProvider'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

function RealtimeAccountGuard() {
  const { data: session, status } = useSession()
  const { addToast } = useToast()
  const { t } = useLanguage()
  const lastStateRef = useRef<{ isBanned?: boolean; isSuspended?: boolean; suspendedUntil?: string | null } | null>(null)
  const pathname = usePathname()
  const [overlay, setOverlay] = useState<{ title: string; message?: string; tone: 'error' | 'warning' } | null>(null)

  useEffect(() => {
    if (status !== 'authenticated') return
    // Jangan jalankan guard di halaman admin
    if (pathname?.startsWith('/admin')) return

    let cancelled = false

    const poll = async () => {
      try {
        const res = await fetch('/api/users/me', { cache: 'no-store' })
        if (!res.ok) return
        const data = await res.json()
        if (cancelled) return
        const isBanned = Boolean(data.user.bannedAt)
        const isSuspended = Boolean(data.user.isSuspended && (!data.user.suspendedUntil || new Date(data.user.suspendedUntil) > new Date()))

        const last = lastStateRef.current
        if (!last) {
          lastStateRef.current = { isBanned, isSuspended, suspendedUntil: data.user.suspendedUntil || null }
        } else {
          // Detect transition to banned/suspended
          if (!last.isBanned && isBanned) {
            const message = data.user.bannedReason || t('contact_support') || 'Silakan hubungi support.'
            setOverlay({ title: t('account_banned') || 'Akun dibanned', message, tone: 'error' })
            addToast({ type: 'error', title: t('account_banned') || 'Akun dibanned', message })
            setTimeout(() => signOut({ callbackUrl: '/auth/error?error=AccessDenied' }), 2500)
          } else if (!last.isSuspended && isSuspended) {
            const until = data.user.suspendedUntil ? new Date(data.user.suspendedUntil).toLocaleDateString('id-ID') : ''
            const reason = data.user.suspendedReason ? `${data.user.suspendedReason}` : ''
            const message = `${reason}${until ? ` (Hingga: ${until})` : ''}`
            setOverlay({ title: t('account_suspended') || 'Akun disuspend', message, tone: 'warning' })
            addToast({ type: 'warning', title: t('account_suspended') || 'Akun disuspend', message })
            setTimeout(() => signOut({ callbackUrl: '/auth/error?error=AccessDenied' }), 2500)
          }
          lastStateRef.current = { isBanned, isSuspended, suspendedUntil: data.user.suspendedUntil || null }
        }
      } catch {}
    }

    // initial check and periodic polling
    poll()
    const id = setInterval(poll, 10000) // 10s
    return () => { cancelled = true; clearInterval(id) }
  }, [status, session?.user?.id, addToast, t, pathname])

  if (!overlay) return null
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" />
      <div className="relative bg-white rounded-[8px] shadow-xl p-5 w-[92%] max-w-md border">
        <h3 className={`text-lg font-semibold ${overlay.tone === 'error' ? 'text-red-700' : 'text-yellow-700'}`}>{overlay.title}</h3>
        {overlay.message && <p className="mt-2 text-gray-700 text-sm">{overlay.message}</p>}
        <p className="mt-3 text-xs text-gray-500">Anda akan keluar secara otomatis...</p>
      </div>
    </div>
  )
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <SessionProvider 
      basePath="/api/auth"
      refetchInterval={0}
      refetchOnWindowFocus={false}
    >
      {/* Runtime guard for ban/suspend */}
      <RealtimeAccountGuard />
      {children}
    </SessionProvider>
  )
}
