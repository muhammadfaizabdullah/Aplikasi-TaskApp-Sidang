'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useToast } from '@/components/ui/Toaster'
import { useLanguage } from '@/components/providers/LanguageProvider'

export default function AuthErrorPage() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error') || 'Unknown'
  const message = searchParams.get('message') || ''
  const reason = searchParams.get('reason') || ''
  const until = searchParams.get('until') || ''
  const { addToast } = useToast()
  const { t } = useLanguage()
  const toastShownRef = useRef(false)

  const untilDate = useMemo(() => {
    if (!until) return null as Date | null
    const d = new Date(until)
    return isNaN(d.getTime()) ? null : d
  }, [until])

  const [remaining, setRemaining] = useState<string>("")

  // simple formatter HH:MM:SS or D hari HH:MM:SS
  const formatRemaining = (ms: number) => {
    if (ms <= 0) return '0:00:00'
    const totalSec = Math.floor(ms / 1000)
    const days = Math.floor(totalSec / 86400)
    const hours = Math.floor((totalSec % 86400) / 3600)
    const minutes = Math.floor((totalSec % 3600) / 60)
    const seconds = totalSec % 60
    const hms = `${hours.toString().padStart(2,'0')}:${minutes.toString().padStart(2,'0')}:${seconds.toString().padStart(2,'0')}`
    return days > 0 ? `${days} hari ${hms}` : hms
  }

  const getErrorMessage = (code: string) => {
    switch (code) {
      case 'Configuration':
        return 'Ada masalah dengan konfigurasi server.'
      case 'AccessDenied':
        return 'Akses ditolak.'
      case 'Verification':
        return 'Link verifikasi tidak valid atau sudah kadaluarsa.'
      default:
        return 'Terjadi kesalahan saat autentikasi. Silakan coba lagi.'
    }
  }

  useEffect(() => {
    if (toastShownRef.current) return
    if (error === 'AccessDenied') {
      if (reason === 'banned') {
        addToast({ type: 'error', title: t('account_banned') || 'Akun dibanned', message: message || t('contact_support') })
        toastShownRef.current = true
      } else if (reason === 'suspended') {
        const suffix = until ? ` (Hingga: ${new Date(until).toLocaleDateString('id-ID')})` : ''
        addToast({ type: 'warning', title: t('account_suspended') || 'Akun disuspend', message: `${message}${suffix}` })
        toastShownRef.current = true
      }
    }
  }, [error, reason, until, message, addToast, t])

  // countdown for suspended
  useEffect(() => {
    if (reason !== 'suspended' || !untilDate) return
    const tick = () => {
      const ms = untilDate.getTime() - Date.now()
      setRemaining(formatRemaining(ms))
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [reason, untilDate])

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md border rounded-[8px] p-6 bg-white shadow-xl">
        {error === 'AccessDenied' && (reason === 'banned' || reason === 'suspended') ? (
          <>
            <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mb-3 ${reason === 'banned' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-800'}`}>
              {reason === 'banned' ? (t('account_banned') || 'Akun dibanned') : (t('account_suspended') || 'Akun disuspend')}
            </div>
            <h1 className="text-xl font-bold mb-2">{reason === 'banned' ? (t('account_banned') || 'Akun Anda dibanned') : (t('account_suspended') || 'Akun Anda disuspend')}</h1>
            <p className="text-sm text-gray-700 mb-3">
              {message}
              {reason === 'suspended' && until ? (
                <span> (Hingga: {new Date(until).toLocaleDateString('id-ID')})</span>
              ) : null}
            </p>
            {reason === 'suspended' && untilDate && (
              <div className="text-xs text-gray-600 mb-3">
                Akun bisa digunakan lagi dalam: <span className="font-mono font-semibold">{remaining}</span>
              </div>
            )}
            <div className="flex gap-2 pt-3">
              <Link href="/" className="px-4 py-2 rounded bg-gray-900 text-white">Kembali ke Beranda</Link>
            </div>
          </>
        ) : (
          <>
            <h1 className="text-lg font-semibold mb-2">Login Error</h1>
            <p className="text-sm mb-1">Error Code: <span className="font-mono">{error}</span></p>
            <p className="text-sm mb-3">{getErrorMessage(error)}</p>
            {message && (
              <pre className="text-xs overflow-auto bg-gray-50 p-3 rounded border whitespace-pre-wrap">{message}</pre>
            )}
            <div className="flex gap-2 pt-3">
              <Link href="/auth/signin" className="px-4 py-2 rounded bg-blue-600 text-white">Coba Lagi</Link>
              <Link href="/" className="px-4 py-2 rounded border">Beranda</Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
