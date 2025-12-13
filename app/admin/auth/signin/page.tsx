"use client"
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Lock, User } from 'lucide-react'
import { useLanguage } from '@/components/providers/LanguageProvider'

export default function AdminSignInPage() {
  const { t } = useLanguage()
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username, password })
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data?.message || 'Login gagal')
      }
      router.replace('/admin/dashboard')
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 md:p-6" suppressHydrationWarning>
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-60 md:w-80 h-60 md:h-80 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-60 md:w-80 h-60 md:h-80 bg-indigo-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute top-40 left-1/2 transform -translate-x-1/2 w-40 md:w-60 h-40 md:h-60 bg-cyan-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
      </div>

      {/* Main Login Card */}
      <div className="relative w-full max-w-sm md:max-w-md">
        {/* Card with 3D Effect */}
        <div className="bg-white/80 backdrop-blur-lg rounded-[8px] shadow-2xl p-6 md:p-8 space-y-6 md:space-y-8 border border-white/20 transform hover:scale-105 transition-all duration-300">
          {/* Header */}
          <div className="text-center space-y-3 md:space-y-4">
            <div className="mx-auto w-12 h-12 md:w-16 md:h-16 bg-blue-600 rounded-[8px] flex items-center justify-center shadow-lg transform rotate-3 hover:rotate-0 transition-transform duration-300">
              <svg className="w-6 h-6 md:w-8 md:h-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Admin Login
              </h1>
              <p className="text-gray-600 mt-2 text-sm md:text-base">{t('sign in to admin')}</p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6" autoComplete="off">
            {/* Username Field */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">Username</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="w-4 h-4 md:w-5 md:h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                </div>
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 md:pl-12 pr-4 py-3 md:py-4 bg-gray-50 border-2 border-gray-200 rounded-[8px] focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100 transition-all duration-200 placeholder-gray-400 text-sm md:text-base"
                  placeholder={t('enter admin username')}
                  autoComplete="username"
                  required
                  suppressHydrationWarning
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">Password</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                  <Lock className="w-4 h-4 md:w-5 md:h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 md:pl-12 pr-10 md:pr-12 py-3 md:py-4 bg-gray-50 border-2 border-gray-200 rounded-[8px] focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100 transition-all duration-200 placeholder-gray-400 text-sm md:text-base"
                  placeholder={t('enter password')}
                  autoComplete="current-password"
                  required
                  suppressHydrationWarning
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center justify-center text-gray-400 hover:text-blue-500 transition-colors focus:outline-none w-10 md:w-12 h-full z-20"
                  title="Toggle password visibility"
                  suppressHydrationWarning
                >
                  <Eye className="w-4 h-4 md:w-5 md:h-5" />
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border-2 border-red-200 rounded-[8px] p-3 md:p-4">
                <p className="text-xs md:text-sm text-red-600 font-medium">{error}</p>
              </div>
            )}

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 md:py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-[8px] shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-sm md:text-base"
              suppressHydrationWarning
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 md:w-5 md:h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>{t('processing')}</span>
                </div>
              ) : (
                t('sign in to admin')
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="text-center">
            <p className="text-xs md:text-sm text-gray-500">
              {t('admin panel')}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}


