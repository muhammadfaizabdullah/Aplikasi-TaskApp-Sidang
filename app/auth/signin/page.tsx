'use client'

import { useEffect, useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toaster'
import { Mail, ArrowLeft, Github } from 'lucide-react'
import Link from 'next/link'
import { useLanguage } from '@/components/providers/LanguageProvider'

export default function SignInPage() {
  const { t } = useLanguage()
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isEmailSent, setIsEmailSent] = useState(false)
  const [availableProviders, setAvailableProviders] = useState<{ google?: boolean; github?: boolean; email?: boolean } | null>(null)
  const router = useRouter()
  const { addToast } = useToast()


  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    try {
      const result = await signIn('google', { callbackUrl: '/dashboard', redirect: false })
      if (result?.error) {
        // If NextAuth returns URL in error shape (custom thrown message), redirect
        if (result.url) {
          window.location.href = result.url
          return
        }
        addToast({ type: 'error', title: 'Gagal masuk', message: 'Terjadi kesalahan saat masuk dengan Google' })
      } else if (result?.url) {
        window.location.href = result.url
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleGitHubSignIn = async () => {
    setIsLoading(true)
    try {
      const result = await signIn('github', { callbackUrl: '/dashboard', redirect: false })
      if (result?.error) {
        if (result.url) {
          window.location.href = result.url
          return
        }
        addToast({ type: 'error', title: 'Gagal masuk', message: 'Terjadi kesalahan saat masuk dengan GitHub' })
      } else if (result?.url) {
        window.location.href = result.url
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) {
      addToast({ type: 'warning', title: 'Email diperlukan', message: 'Silakan masukkan alamat email Anda' })
      return
    }

    setIsLoading(true)
    try {
      const result = await signIn('email', { email, callbackUrl: '/dashboard', redirect: false })
      if (result?.error) {
        addToast({ type: 'error', title: 'Gagal kirim email', message: 'Terjadi kesalahan saat mengirim link masuk' })
      } else {
        setIsEmailSent(true)
        addToast({ type: 'success', title: 'Email terkirim', message: `Silakan cek email ${email} untuk link masuk` })
      }
    } catch (_err) {
      addToast({ type: 'error', title: 'Gagal kirim email', message: 'Terjadi kesalahan saat mengirim link masuk' })
    } finally {
      setIsLoading(false)
    }
  }

  // Tidak ada login credentials — hanya Google, GitHub, Email

  useEffect(() => {
    let isMounted = true
    const loadProviders = async () => {
      try {
        const res = await fetch('/api/auth/providers', { cache: 'no-store' })
        if (!res.ok) throw new Error('Failed to load providers')
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const data: Record<string, any> = await res.json()
        if (!isMounted) return
        setAvailableProviders({
          google: Boolean(data?.google),
          github: Boolean(data?.github),
          email: Boolean(data?.email),
        })
      } catch {
        if (!isMounted) return
        setAvailableProviders({})
      }
    }
    loadProviders()
    return () => {
      isMounted = false
    }
  }, [])

  if (isEmailSent) {
    return (
      <div className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-foreground mb-2">Cek Email Anda</h2>
            <p className="text-muted-foreground mb-8">Kami telah mengirim link masuk ke {email}</p>
            <Button variant="outline" onClick={() => setIsEmailSent(false)}>Kirim Ulang Email</Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8" suppressHydrationWarning>
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center text-primary hover:text-primary/80 mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali ke Beranda
          </Link>
        </div>

        <div className="bg-card py-8 px-4 shadow-sm border border-border rounded-lg sm:px-10">
          {/* Logo dan Header di dalam kotak */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="w-20 h-20 bg-green-600 rounded-[8px] flex items-center justify-center">
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Masuk ke TaskApp</h2>
            <p className="text-sm text-muted-foreground">Pilih cara masuk yang Anda inginkan</p>
          </div>

          <div className="space-y-4">
            {/* Credentials di-nonaktifkan */}

            {availableProviders?.google && (
            <Button onClick={handleGoogleSignIn} disabled={isLoading} className="w-full text-primary border-primary/40 hover:bg-primary hover:text-primary-foreground" variant="outline">
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Masuk dengan Google
            </Button>
            )}

            {availableProviders?.github && (
            <Button onClick={handleGitHubSignIn} disabled={isLoading} className="w-full text-primary border-primary/40 hover:bg-primary hover:text-primary-foreground" variant="outline">
              <Github className="w-5 h-5 mr-2" />
              Masuk dengan GitHub
            </Button>
            )}

            <div className="relative mb-12">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
            </div>

            {/* Tampilkan form email hanya jika provider Email dikonfigurasi */}
            {availableProviders?.email && (
              <form onSubmit={handleEmailSignIn} className="space-y-4 mt-4" suppressHydrationWarning>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-foreground">Email</label>
                  <input id="email" name="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-border rounded-[8px] shadow-sm placeholder-muted-foreground focus:outline-none focus:ring-primary focus:border-primary bg-background text-foreground" placeholder="Masukkan email Anda" suppressHydrationWarning />
                </div>

                <Button type="submit" disabled={isLoading} className="w-full bg-primary text-primary-foreground hover:bg-primary/90" suppressHydrationWarning>
                  <Mail className="w-5 h-5 mr-2" />
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    </div>
                  ) : 'Kirim Link Verifikasi'}
                </Button>
              </form>
            )}

            {availableProviders && !availableProviders.google && !availableProviders.github && !availableProviders.email && (
              <p className="text-sm text-muted-foreground">{t('no login methods')}</p>
            )}
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">{t('no account')}{' '}<Link href="/auth/signup" className="font-medium text-primary hover:text-primary/80">{t('sign up here')}</Link></p>
          </div>
        </div>
      </div>
    </div>
  )
}
