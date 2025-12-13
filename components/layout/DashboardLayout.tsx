'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Avatar'
import {
  Home,
  FolderOpen,
  Users,
  TrendingUp,
  Settings,
  Menu,
  X,
  LogOut,
  ChevronRight,
  ChevronLeft,
  FileText
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useLanguage } from '@/components/providers/LanguageProvider'

interface DashboardLayoutProps {
  children: React.ReactNode
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { data: session } = useSession()
  const { t } = useLanguage()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  // Debug logging untuk memeriksa data session
  console.log('Session data:', {
    user: session?.user,
    image: session?.user?.image,
    name: session?.user?.name,
    email: session?.user?.email
  })

  const pathname = usePathname()

  // Function to clean user data (remove unwanted suffixes like -png)
  const cleanUserData = (data: string | null | undefined) => {
    if (!data) return ''
    // Remove common unwanted suffixes
    return data.replace(/-png$/, '').replace(/-jpg$/, '').replace(/-jpeg$/, '')
  }

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' })
  }

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed)
  }

  // Helper function to capitalize first letter
  const capitalize = (text: string) => {
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
  }

  const navigationItems = [
    { href: '/dashboard', icon: Home, label: t('dashboard') === 'Dashboard' ? 'Dashboard' : capitalize(t('dashboard')) },
    { href: '/dashboard/projects', icon: FolderOpen, label: t('projects') === 'Projects' ? 'Projects' : capitalize(t('projects')) },
    { href: '/dashboard/team', icon: Users, label: capitalize(t('team')) },
    { href: '/dashboard/analytics', icon: TrendingUp, label: capitalize(t('analytics')) },
    { href: '/dashboard/reports', icon: FileText, label: capitalize(t('reports')) },
    { href: '/dashboard/settings', icon: Settings, label: capitalize(t('settings')) },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-[rgb(var(--theme-bg-start))] via-[rgb(var(--theme-bg-middle))] to-[rgb(var(--theme-bg-end))]">
      {/* Mobile sidebar */}
      <div className={cn(
        'fixed inset-0 z-50 lg:hidden',
        sidebarOpen ? 'block' : 'hidden'
      )}>
        <div className="fixed inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 flex w-72 flex-col bg-white/80 backdrop-blur-lg border-r border-white/20 shadow-xl rounded-r-3xl">
          {/* Mobile Sidebar Content */}
          <div className="flex flex-col h-full">
            {/* Logo Section */}
            <div className="flex items-center justify-between px-5 py-6 theme-gradient-primary rounded-tr-3xl border-b border-white/20 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-[8px] flex items-center justify-center mr-0 flex-shrink-0">
                  <span className="text-white font-bold text-lg">T</span>
                </div>
                <div>
                  <div className="text-white text-xl font-bold">TaskApp</div>
                </div>
              </div>
              <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
            </div>

            {/* Greeting Section */}
            <div className="px-4 py-4 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  
                  <Avatar 
                    src={(session?.user?.image as string | undefined) || undefined}
                    alt={(session?.user?.name as string | undefined) || 'User'}
                    fallback={cleanUserData((session?.user as any)?.username) || cleanUserData(session?.user?.name) || 'User'} 
                    size="sm"
                    className="mr-3 flex-shrink-0"
                    clickable
                    onClick={() => { window.location.href = '/dashboard/settings' }}
                  />
                  <div>
                    <p className="text-sm text-gray-900">
                      {t('welcome')}, {cleanUserData((session?.user as any)?.username) || 'User'}!
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-2 py-4 space-y-2">
              {navigationItems.map((item) => {
                const isActive = pathname === item.href || 
                  (item.href !== '/dashboard' && pathname.startsWith(item.href))
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center px-3 py-2 text-sm font-medium rounded-[8px] transition-all duration-200 hover:scale-105',
                      isActive
                        ? 'bg-green-600 text-white shadow-lg'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    )}
                    suppressHydrationWarning={true}
                  >
                                      <div className={cn(
                    "w-10 h-10 rounded-[8px] flex items-center justify-center transition-all duration-200 flex-shrink-0",
                    isActive 
                      ? "bg-green-500 text-white" 
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200",
                    "mr-3"
                  )}>
                      <item.icon className="w-5 h-5" />
                    </div>
                    {item.label}
                  </Link>
                )
              })}
            </nav>

            {/* User Profile & Logout */}
            <div className="px-4 py-4 border-t border-gray-100">
              <div className="flex items-center mb-3">

                <Avatar 
                  src={(session?.user?.image as string | undefined) || undefined}
                  alt={(session?.user as any)?.username || (session?.user?.name as string | undefined) || 'User'}
                  fallback={(session?.user as any)?.username || session?.user?.name || 'User'} 
                  size="sm"
                  className="mr-3 flex-shrink-0"
                  clickable
                  onClick={() => { window.location.href = '/dashboard/settings' }}
                />
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    {(session?.user as any)?.username || session?.user?.name || 'User'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {session?.user?.email || ''}
                  </p>
                </div>
              </div>
              <button
                onClick={handleSignOut}
                className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-700 rounded-[8px] transition-all duration-200 hover:scale-105"
                suppressHydrationWarning={true}
              >
                <div className="w-10 h-10 rounded-[8px] bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors mr-3 flex items-center justify-center flex-shrink-0">
                  <LogOut className="w-5 h-5" />
                </div>
                {t('logout')}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className={cn(
        'hidden lg:fixed lg:inset-y-0 lg:flex lg:flex-col transition-all duration-300 ease-in-out',
        sidebarCollapsed ? 'lg:w-16' : 'lg:w-64'
      )}>
        <div className="flex flex-col flex-grow bg-themed border-r border-gray-200">
          {/* Logo */}
          <div className="flex items-center justify-between p-6 theme-gradient-primary rounded-br-3xl shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-[8px] flex items-center justify-center flex-shrink-0 bg-white/20">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              {!sidebarCollapsed && (
                <div>
                  <div className="text-white text-xl font-bold">TaskApp</div>
                </div>
              )}
            </div>
            <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
          </div>

          {/* Greeting Section */}
          <div className="px-4 py-4 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center">

                <Avatar 
                  src={session?.user?.image || undefined}
                  alt={session?.user?.name || session?.user?.username || 'User'}
                  fallback={cleanUserData(session?.user?.name) || cleanUserData(session?.user?.username) || 'User'} 
                  size="sm"
                  className={cn(
                    "flex-shrink-0",
                    sidebarCollapsed ? "mr-0" : "mr-3"
                  )}
                  clickable
                  onClick={() => { window.location.href = '/dashboard/settings' }}
                />
                {!sidebarCollapsed && (
                  <div>
                    <p className="text-sm text-gray-900">
                      {t('welcome')}, {cleanUserData((session?.user as any)?.username) || cleanUserData(session?.user?.name) || 'User'}!
                    </p>
                  </div>
                )}
              </div>
              <button
                onClick={toggleSidebar}
                className="p-1 hover:bg-gray-100 rounded-[8px] transition-colors flex-shrink-0"
                title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                suppressHydrationWarning={true}
              >
                {sidebarCollapsed ? (
                  <ChevronRight className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                ) : (
                  <ChevronLeft className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                )}
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-2 py-4 space-y-2">
            {navigationItems.map((item) => {
              const isActive = pathname === item.href || 
                (item.href !== '/dashboard' && pathname.startsWith(item.href))
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center px-3 py-2 text-sm font-medium rounded-[8px] transition-all duration-200 hover:scale-105',
                    isActive
                      ? 'bg-green-600 text-white shadow-lg'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  )}
                  title={sidebarCollapsed ? item.label : undefined}
                  suppressHydrationWarning={true}
                >
                                  <div className={cn(
                  "w-10 h-10 rounded-[8px] flex items-center justify-center transition-all duration-200 flex-shrink-0",
                  isActive 
                    ? "bg-green-500 text-white" 
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200",
                  sidebarCollapsed ? "mr-0" : "mr-3"
                )}>
                    <item.icon className="w-5 h-5" />
                  </div>
                  {!sidebarCollapsed && item.label}
                </Link>
              )
            })}
          </nav>

          {/* User Profile & Logout */}
          <div className="px-4 py-4 border-t border-gray-100">
            <div className="flex items-center mb-3">

              <Avatar 
                src={session?.user?.image || undefined}
                alt={session?.user?.name || session?.user?.username || 'User'}
                fallback={session?.user?.name || session?.user?.username || 'Demo User'} 
                size="sm"
                className={cn(
                  "flex-shrink-0",
                  sidebarCollapsed ? "mr-0" : "mr-3"
                )}
                clickable
                onClick={() => { window.location.href = '/dashboard/settings' }}
              />
              {!sidebarCollapsed && (
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    {cleanUserData(session?.user?.name) || cleanUserData(session?.user?.username) || 'User'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {session?.user?.email || ''}
                  </p>
                </div>
              )}
            </div>
            <button
              onClick={handleSignOut}
              className={cn(
                "flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-700 rounded-[8px] transition-all duration-200 hover:scale-105",
                sidebarCollapsed && "justify-center"
              )}
              title={sidebarCollapsed ? t('logout') : undefined}
              suppressHydrationWarning={true}
            >
              <div className={cn(
                "w-10 h-10 rounded-[8px] bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors flex items-center justify-center flex-shrink-0",
                sidebarCollapsed ? "mr-0" : "mr-3"
              )}>
                <LogOut className="w-5 h-5" />
              </div>
              {!sidebarCollapsed && t('logout')}
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className={cn(
        "transition-all duration-300 ease-in-out",
        sidebarCollapsed ? "lg:pl-16" : "lg:pl-64"
      )}>
        {/* Mobile menu trigger */}
        <Button
          variant="ghost"
          size="sm"
          className="fixed top-4 left-4 z-40 lg:hidden"
          onClick={() => setSidebarOpen(true)}
          suppressHydrationWarning={true}
        >
          <Menu className="w-5 h-5" />
        </Button>

        {/* Page content */}
        <main className="py-4 sm:py-6">
          <div className="mx-auto max-w-7xl px-3 sm:px-4 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
