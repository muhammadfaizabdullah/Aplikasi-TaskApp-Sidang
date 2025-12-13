"use client"
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Folder, Users, BarChart3, Settings, Menu, X, ChevronLeft, ChevronRight } from 'lucide-react'
import { useState, useEffect } from 'react'

function LightningBlueIcon() {
  return (
    <svg className="w-8 h-8 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  )
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [adminUsername, setAdminUsername] = useState<string | null>(null)

  // Client-side read of admin_token cookie and decode payload
  function readAdminUsernameFromCookie(): string | null {
    if (typeof document === 'undefined') return null
    const match = document.cookie.split('; ').find((c) => c.startsWith('admin_token='))
    if (!match) return null
    const token = match.split('=')[1]
    const parts = token.split('.')
    if (parts.length < 2) return null
    try {
      const payloadJson = JSON.parse(atob(parts[1]))
      return payloadJson?.username || null
    } catch {
      return null
    }
  }

  // initialize on mount
  useEffect(() => {
    const name = readAdminUsernameFromCookie()
    if (name) setAdminUsername(name)
  }, [])

  // Check if current path is auth pages
  const isAuthPage = pathname?.startsWith('/admin/auth')

  // If it's auth page, render children without sidebar
  if (isAuthPage) {
    return <>{children}</>
  }

  const navItem = (
    href: string,
    label: string,
    icon: React.ReactNode,
  ) => {
    const active = pathname?.startsWith(href)
    return (
      <Link
        href={href}
        className={`group flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-4'} px-5 py-4 rounded-[8px] transition-all duration-200 ${
          active 
            ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg transform scale-105' 
            : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600 hover:shadow-md hover:transform hover:scale-102'
        }`}
      >
        <span className={`transition-colors duration-200 ${
          active ? 'text-white' : 'text-gray-500 group-hover:text-blue-600'
        }`}>
          {icon}
        </span>
        {!sidebarCollapsed && (
          <span className={`font-semibold transition-colors duration-200 ${
            active ? 'text-white' : 'text-gray-700 group-hover:text-blue-600'
          }`}>
            {label}
          </span>
        )}
        {active && !sidebarCollapsed && (
          <div className="ml-auto w-2 h-2 bg-white rounded-full animate-pulse"></div>
        )}
      </Link>
    )
  }

  return (
    <div className="h-screen overflow-hidden flex bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed md:relative inset-y-0 left-0 z-50 ${sidebarCollapsed ? 'w-20' : 'w-80'} bg-white/80 backdrop-blur-lg border-r border-blue-100/50 p-6 flex flex-col gap-6 overflow-hidden shadow-xl transform transition-transform duration-300 ease-in-out ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}>
        {/* Header */}
        <div className="relative flex items-center justify-between p-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-[8px] shadow-lg">
          <div className={`flex items-center ${sidebarCollapsed ? 'justify-center w-full' : 'gap-4'}`}>
            <div className="p-3 bg-white/20 rounded-[8px] backdrop-blur-sm">
              <LightningBlueIcon />
            </div>
            {!sidebarCollapsed && (
              <div>
                <div className="text-blue-100 text-sm font-medium">Selamat datang,</div>
                <div className="text-xl font-bold text-white">{adminUsername || 'Admin'}</div>
              </div>
            )}
          </div>
          {/* Close button for mobile */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden p-2 text-white hover:bg-white/20 rounded-lg transition-colors"
            title="Close sidebar"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
          {/* Collapse toggle for desktop - floating visible */}
          <button
            onClick={() => setSidebarCollapsed(v => !v)}
            className={`hidden md:flex items-center justify-center w-8 h-8 rounded-full absolute ${sidebarCollapsed ? 'right-2 bottom-2 top-auto -translate-y-0' : 'right-3 top-1/2 -translate-y-1/2'} bg-white/25 hover:bg-white/35 text-white border border-white/30 shadow-md z-10`}
            title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {sidebarCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-3">
          {navItem('/admin/dashboard', 'Dashboard', <Home className="w-5 h-5" />)}
          {navItem('/admin/users', 'Manage Users', <Users className="w-5 h-5" />)}
          {navItem('/admin/projects', 'Projects', <Folder className="w-5 h-5" />)}
          {navItem('/admin/analytics', 'Analytics', <BarChart3 className="w-5 h-5" />)}
          {navItem('/admin/admins', 'Admin Management', <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>)}
        </nav>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Logout Button */}
        <button
          onClick={async () => {
            await fetch('/api/admin/auth/logout', { method: 'POST', credentials: 'include' })
            window.location.href = '/admin/auth/signin'
          }}
          className={`flex items-center w-full px-3 py-3 text-sm text-gray-700 hover:bg-red-50 hover:text-red-700 rounded-[8px] transition-all duration-200 ${sidebarCollapsed ? 'justify-center' : ''}`}
        >
          <div className="w-9 h-9 rounded-full bg-white text-gray-600 flex items-center justify-center mr-3 border border-gray-200 shadow-sm">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </div>
          {!sidebarCollapsed && 'Logout'}
        </button>
      </aside>
      
      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Mobile Header */}
        <div className="md:hidden bg-white/80 backdrop-blur-lg border-b border-blue-100/50 p-4 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Open sidebar"
            aria-label="Open sidebar"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-600 font-medium">Admin Panel</span>
          </div>
        </div>
        
        {/* Page Content */}
        <div className="h-full">
          {children}
        </div>
      </main>
    </div>
  )
}