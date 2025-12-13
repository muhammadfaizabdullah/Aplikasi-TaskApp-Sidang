"use client"
import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useLanguage } from '@/components/providers/LanguageProvider'

type User = { id: string; email: string; name: string | null; username: string | null; image: string | null; isSuspended: boolean; suspendedUntil: string | null; bannedAt: string | null; createdAt: string }
type Project = { id: string; name: string; founder: { id: string; email: string | null; name: string | null }; _count: { tasks: number; members: number }; status: string; updatedAt: string }
type Task = { id: string; title: string; status: string; updatedAt: string; project: { id: string; name: string; status: string }; createdBy: { id: string; name: string | null; username: string | null; email: string | null }; assignees: { user: { id: string; name: string | null; username: string | null; email: string | null } }[] }

export default function AdminDashboardPage() {
  const { t } = useLanguage()
  const router = useRouter()

  // Helper function to format status text
  const formatStatus = (status: string) => {
    return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  }
  const [users, setUsers] = useState<User[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  // responsive dialog for suspend/ban
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogType, setDialogType] = useState<'suspend'|'unsuspend'|'ban'|'unban'|null>(null)
  const [targetUser, setTargetUser] = useState<User | null>(null)
  const [reasonInput, setReasonInput] = useState('')
  const [durationInput, setDurationInput] = useState('7d')
  const [submitting, setSubmitting] = useState(false)

  async function fetchAll() {
    setLoading(true)
    try {
      const [u, p, t] = await Promise.all([
        fetch('/api/admin/users', { credentials: 'include' }).then((r) => r.ok ? r.json() : Promise.reject(r)),
        fetch('/api/admin/projects', { credentials: 'include' }).then((r) => r.ok ? r.json() : Promise.reject(r)),
        fetch('/api/admin/tasks', { credentials: 'include' }).then((r) => r.ok ? r.json() : Promise.reject(r)),
      ])
      setUsers(u.users)
      setProjects(p.projects)
      setTasks(t.tasks)
    } catch (e) {
      // Jika unauthorized, arahkan ke login admin
      router.replace('/admin/auth/signin')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAll()
  }, [])

  const stats = useMemo(() => {
    const totalUsers = users.length
    const totalProjects = projects.length
    const totalTasks = projects.reduce((sum, p) => sum + (p._count?.tasks ?? 0) + (Array.isArray((p as any).tasks) ? (p as any).tasks.length : 0), 0)
    const totalCompletedProjects = projects.filter((p: any) => (p.status || '').toLowerCase() === 'completed').length
    // definisi tim: jumlah project dengan anggota (members count) > 0
    const totalTeams = projects.filter((p: any) => (p._count?.members ?? (p.members?.length || 0)) > 0).length
    return { totalUsers, totalProjects, totalTasks, totalCompletedProjects, totalTeams }
  }, [users, projects])

  const statCards = [
    {
      id: 'total-users',
      title: 'Total Users',
      value: stats.totalUsers,
      icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z',
      gradient: 'from-blue-500 to-blue-600'
    },
    {
      id: 'total-projects',
      title: 'Total Projects',
      value: stats.totalProjects,
      icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10',
      gradient: 'from-indigo-500 to-indigo-600'
    },
    {
      id: 'total-tasks',
      title: 'Total Tasks',
      value: stats.totalTasks,
      icon: 'M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4',
      gradient: 'from-cyan-500 to-cyan-600'
    },
    {
      id: 'total-teams',
      title: 'Total Teams',
      value: stats.totalTeams,
      icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
      gradient: 'from-teal-500 to-teal-600'
    },
    {
      id: 'completed-projects',
      title: 'Completed',
      value: stats.totalCompletedProjects,
      icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
      gradient: 'from-emerald-500 to-emerald-600',
      span: 'col-span-2 md:col-span-1'
    }
  ]

  function openSuspendDialog(user: User, isUnsuspend = false, duration?: string) {
    setTargetUser(user)
    setDialogType(isUnsuspend ? 'unsuspend' : 'suspend')
    setReasonInput('')
    setDurationInput(duration || '7d')
    setDialogOpen(true)
  }

  async function submitSuspend() {
    if (!targetUser || !dialogType) return
    setSubmitting(true)
    try {
      const path = dialogType === 'unsuspend' ? `/api/admin/users/${targetUser.id}/unsuspend` : `/api/admin/users/${targetUser.id}/suspend`
      const init: RequestInit = dialogType === 'unsuspend'
        ? { method: 'POST', credentials: 'include' }
        : { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ duration: durationInput, reason: reasonInput || undefined }) }
      await fetch(path, init)
      await fetchAll()
      setDialogOpen(false)
    } finally {
      setSubmitting(false)
    }
  }

  function openBanDialog(user: User, isUnban = false) {
    setTargetUser(user)
    setDialogType(isUnban ? 'unban' : 'ban')
    setReasonInput('')
    setDialogOpen(true)
  }

  async function submitBan() {
    if (!targetUser || !dialogType) return
    setSubmitting(true)
    try {
      const path = dialogType === 'unban' ? `/api/admin/users/${targetUser.id}/unban` : `/api/admin/users/${targetUser.id}/ban`
      const init: RequestInit = dialogType === 'unban'
        ? { method: 'POST', credentials: 'include' }
        : { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ reason: reasonInput || undefined }) }
      await fetch(path, init)
      await fetchAll()
      setDialogOpen(false)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <div className="p-6 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
              Admin Dashboard
            </h1>
            <p className="text-gray-600 mt-2 text-sm md:text-base">Selamat datang di panel administrasi TaskApp</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-600">System Online</span>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4 md:gap-6">
          {statCards.map((card) => (
            <div
              key={card.id}
              className={`group relative overflow-hidden rounded-[8px] bg-gradient-to-br ${card.gradient} p-4 md:p-6 text-white shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 ${card.span || ''}`}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-white/20 rounded-[8px] backdrop-blur-sm">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={card.icon} />
                    </svg>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl md:text-3xl font-bold">{card.value}</div>
                    <div className={`text-${card.gradient.split('-')[1]}-100 text-xs md:text-sm`}>{card.title}</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Users Section */}
        <section className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h2 className="text-xl md:text-2xl font-bold text-gray-800">User Management</h2>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>{users.length} Total Users</span>
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-lg rounded-[8px] shadow-xl border border-white/20 overflow-hidden">
            <div className="sm:overflow-x-auto">
              <table className="w-full table-fixed">
                <thead className="bg-gradient-to-r from-blue-50 to-indigo-50 w-full">
                  <tr className="text-left text-sm text-gray-700 w-full">
                    <th className="px-3 md:px-6 py-4 font-semibold w-[50%] sm:w-auto">User Info</th>
                    <th className="px-3 md:px-6 py-4 font-semibold w-[30%] sm:w-auto">Registration Date</th>
                    <th className="px-3 md:px-6 py-4 font-semibold w-[50%] sm:w-auto">Actions</th>
                    <th className="px-3 md:px-6 py-4 font-semibold hidden lg:table-cell">Activity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {users.map((u, index) => (
                    <tr key={u.id || `user-${index}`} className="hover:bg-blue-50/50 transition-colors duration-200 border-b border-gray-100">
                      <td className="px-3 md:px-6 py-4">
                        <div className="flex items-center space-x-3 md:space-x-4">
                          <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm md:text-base">
                            {u.name?.charAt(0) || u.email.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="font-semibold text-gray-900 text-sm md:text-base truncate">{u.name || 'No Name'}</div>
                            <div className="text-xs md:text-sm text-gray-600 truncate">{u.email}</div>
                            <div className="text-xs text-blue-600 font-medium truncate">{u.username ? `@${u.username}` : '@no-username'}</div>
                              {/* Show status on mobile */}
                              <div className="sm:hidden mt-1">
                                {u.bannedAt ? (
                                  <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                                    Banned
                                  </span>
                                ) : u.isSuspended ? (
                                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                                    Suspended
                                  </span>
                                ) : (
                                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                                    Active
                                  </span>
                                )}
                              </div>
                              {/* Show suspend/ban details on mobile (no reasons available here, only until) */}
                              {u.isSuspended && u.suspendedUntil && (
                                <div className="sm:hidden mt-1 text-[11px] leading-4 text-gray-500">
                                  Until: {new Date(u.suspendedUntil).toLocaleDateString()}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-3 md:px-6 py-4 hidden sm:table-cell">
                          <div className="text-xs text-gray-600">
                            <div>{u.createdAt ? new Date(u.createdAt).toLocaleDateString('id-ID') : 'N/A'}</div>
                            <div className="text-gray-500">{u.createdAt ? new Date(u.createdAt).toLocaleTimeString('id-ID') : ''}</div>
                          </div>
                        </td>
                      <td className="px-3 md:px-6 py-4">
                        <div className="flex items-center space-x-2">
                          {u.bannedAt ? (
                            <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                              Banned
                            </span>
                          ) : u.isSuspended ? (
                            <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                              Suspended
                            </span>
                          ) : (
                            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                              Active
                            </span>
                          )}
                        </div>
                        {u.isSuspended && u.suspendedUntil && (
                          <div className="text-xs text-gray-500 mt-1">
                            Until: {new Date(u.suspendedUntil).toLocaleDateString()}
                          </div>
                        )}
                      </td>
                      <td className="px-3 md:px-6 py-4">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
                          {u.isSuspended ? (
                            <button 
                              onClick={() => openSuspendDialog(u, true)} 
                              className="px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded-[8px] text-xs md:text-sm font-medium transition-colors duration-200 shadow-md hover:shadow-lg w-full sm:w-auto"
                            >
                              Unsuspend
                            </button>
                          ) : (
                            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
                              <select 
                                id={`suspend-${u.id}`} 
                                className="px-2 py-2 border border-gray-300 rounded-[8px] text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto"
                                title="Select suspension duration"
                              >
                                <option value="1d">1 hari</option>
                                <option value="3d">3 hari</option>
                                <option value="7d">7 hari</option>
                                <option value="1m">1 bulan</option>
                                <option value="3m">3 bulan</option>
                                <option value="6m">6 bulan</option>
                                <option value="1y">1 tahun</option>
                              </select>
                              <button 
                                onClick={() => {
                                  const sel = document.getElementById(`suspend-${u.id}`) as HTMLSelectElement | null
                                  openSuspendDialog(u, false, sel?.value || '7d')
                                }} 
                                className="px-3 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-[8px] text-xs md:text-sm font-medium transition-colors duration-200 shadow-md hover:shadow-lg w-full sm:w-auto"
                              >
                                Suspend
                              </button>
                            </div>
                          )}
                          <button 
                            onClick={() => openBanDialog(u, !!u.bannedAt)} 
                            className={`px-3 py-2 text-white rounded-[8px] text-xs md:text-sm font-medium transition-colors duration-200 shadow-md hover:shadow-lg w-full sm:w-auto ${
                              u.bannedAt ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'
                            }`}
                          >
                            {u.bannedAt ? 'Unban' : 'Ban'}
                          </button>
                        </div>
                      </td>
                      <td className="px-3 md:px-6 py-4 hidden lg:table-cell">
                        <div className="space-y-1 max-w-[300px]">
                          {/* @ts-ignore dynamic */}
                          {(
                            // @ts-ignore
                            [...(u.createdTasks || []), ...(u.assignedTasks || [])].slice(0, 2)
                          ).map((t: any, idx: number) => (
                            <div key={`task-${t.id}-${idx}`} className="text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded-lg">
                              📋 {t.title}
                            </div>
                          ))}
                          {/* @ts-ignore */}
                          {(
                            // @ts-ignore
                            [...(u.foundedProjects || []), ...((u.projectMemberships || []).map((m: any) => m.project))].slice(0, 1)
                          ).map((p: any, idx: number) => (
                            <div key={`project-${p.id}-${idx}`} className="text-xs text-gray-600 bg-blue-50 px-2 py-1 rounded-lg">
                              📁 {p.name}
                            </div>
                          ))}
                        </div>
                      </td>
                </tr>
              ))}
            </tbody>
          </table>
            </div>
        </div>
      </section>

        {/* Projects Section */}
        <section className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h2 className="text-xl md:text-2xl font-bold text-gray-800">Project Management</h2>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
              <span>{projects.length} Total Projects</span>
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-lg rounded-[8px] shadow-xl border border-white/20 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full table-fixed">
                <thead className="bg-gradient-to-r from-indigo-50 to-purple-50">
                  <tr className="text-left text-sm text-gray-700">
                    <th className="px-3 md:px-6 py-4 font-semibold">Project Details</th>
                    <th className="px-3 md:px-6 py-4 font-semibold hidden sm:table-cell">Status</th>
                    <th className="px-3 md:px-6 py-4 font-semibold hidden sm:table-cell">Founder</th>
                    <th className="px-3 md:px-6 py-4 font-semibold hidden md:table-cell">Team Members</th>
                    <th className="px-3 md:px-6 py-4 font-semibold hidden lg:table-cell">Tasks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
              {projects.map((p: any, index: number) => (
                    <tr key={p.id || `project-${index}`} className="hover:bg-indigo-50/50 transition-colors duration-200">
                      <td className="px-3 md:px-6 py-4">
                        <div className="flex items-center space-x-3 md:space-x-4">
                          <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-[8px] flex items-center justify-center text-white font-bold text-base md:text-lg">
                            {p.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="font-semibold text-gray-900 text-base md:text-lg truncate">{p.name}</div>
                            <div className="text-xs md:text-sm text-gray-600 truncate">{p.description || 'No description'}</div>
                            <div className="flex items-center space-x-2 md:space-x-4 mt-2">
                              <div className="flex items-center space-x-1 text-xs text-gray-500">
                                <svg className="w-3 h-3 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                                <span>{p._count?.members ?? p.members?.length ?? 0} members</span>
                              </div>
                              <div className="flex items-center space-x-1 text-xs text-gray-500">
                                <svg className="w-3 h-3 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                                </svg>
                                <span>{p._count?.tasks ?? p.tasks?.length ?? 0} tasks</span>
                              </div>
                            </div>
                            {/* Show founder on mobile */}
                            <div className="sm:hidden mt-2">
                              <div className="flex items-center space-x-2">
                                <div className="w-6 h-6 bg-gradient-to-br from-gray-400 to-gray-500 rounded-full flex items-center justify-center text-white font-semibold text-xs">
                                  {p.founder?.username?.charAt(0) || p.founder?.name?.charAt(0) || p.founder?.email?.charAt(0)?.toUpperCase() || '?'}
                                </div>
                                <span className="text-xs text-gray-600 truncate">
                                  {p.founder?.username ? `@${p.founder.username}` : (p.founder?.name || 'Unknown Founder')}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 md:px-6 py-4 hidden sm:table-cell">
                        <div className="flex items-center space-x-2">
                          <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                            p.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                            p.status === 'ACTIVE' ? 'bg-blue-100 text-blue-800' :
                            p.status === 'ON_HOLD' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {formatStatus(p.status || 'PLANNING')}
                          </span>
                        </div>
                        {p.updatedAt && (
                          <div className="text-xs text-gray-500 mt-1">
                            Updated: {new Date(p.updatedAt).toLocaleDateString('id-ID')}
                          </div>
                        )}
                      </td>
                      <td className="px-3 md:px-6 py-4 hidden sm:table-cell">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                            {p.founder?.name?.charAt(0) || p.founder?.email?.charAt(0)?.toUpperCase() || '?'}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900 text-sm">{p.founder?.username ? `@${p.founder.username}` : (p.founder?.name || 'Unknown')}</div>
                            <div className="text-xs text-gray-600 truncate">{p.founder?.email || '-'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 md:px-6 py-4 hidden md:table-cell">
                        <div className="space-y-2 max-w-[250px]">
                          {(p.members || []).slice(0, 3).map((m: any, idx: number) => (
                            <div key={`member-${m.user?.id}-${idx}`} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-[8px]">
                              <div className="flex items-center space-x-2">
                                <div className="w-6 h-6 bg-gradient-to-br from-gray-400 to-gray-500 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                                  {m.user.username?.charAt(0) || m.user.name?.charAt(0) || m.user.email.charAt(0).toUpperCase()}
                                </div>
                                <span className="text-sm text-gray-700 truncate">
                                  {m.user.username ? `@${m.user.username}` : (m.user.name || m.user.email)}
                                </span>
                              </div>
                              <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700 font-medium">
                                {m.role}
                              </span>
                            </div>
                          ))}
                          {(p.members || []).length > 3 && (
                            <div className="text-xs text-gray-500 text-center">
                              +{(p.members || []).length - 3} more members
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-3 md:px-6 py-4 hidden lg:table-cell">
                        <div className="space-y-2 max-w-[300px]">
                          {/* Task Status Summary */}
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            {(() => {
                              const statusCounts = (p.tasks || []).reduce((acc: any, task: any) => {
                                acc[task.status] = (acc[task.status] || 0) + 1
                                return acc
                              }, {})

                              return Object.entries(statusCounts).map(([status, count], idx: number) => (
                                <div key={`status-${status}-${idx}`} className="flex items-center justify-between bg-gray-50 px-2 py-1 rounded">
                                  <span className={`px-1.5 py-0.5 text-xs font-medium rounded ${
                                    status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                                    status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                                    status === 'REVIEW' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-gray-100 text-gray-800'
                                  }`}>
                                    {status}
                                  </span>
                                  <span className="font-semibold text-gray-700">{String(count)}</span>
                                </div>
                              ))
                            })()}
                          </div>

                          {/* Recent Tasks */}
                          {(p.tasks || []).length > 0 && (
                            <div className="border-t pt-2 mt-2">
                              <div className="text-xs text-gray-500 mb-1">Recent Tasks:</div>
                              {(p.tasks || []).slice(0, 2).map((t: any, idx: number) => (
                                <div key={`ptask-${t.id}-${idx}`} className="flex items-center space-x-2 bg-gray-50 px-2 py-1 rounded text-xs">
                                  <div className={`w-2 h-2 rounded-full ${
                                    t.status === 'COMPLETED' ? 'bg-green-500' :
                                    t.status === 'IN_PROGRESS' ? 'bg-blue-500' :
                                    t.status === 'REVIEW' ? 'bg-yellow-500' :
                                    'bg-gray-500'
                                  }`}></div>
                                  <span className="text-gray-700 truncate flex-1">{t.title}</span>
                                </div>
                              ))}
                              {(p.tasks || []).length > 2 && (
                                <div className="text-xs text-gray-500 text-center mt-1">
                                  +{(p.tasks || []).length - 2} more tasks
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                </tr>
              ))}
            </tbody>
          </table>
            </div>
        </div>
      </section>

        {/* Tasks Section */}
        <section className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h2 className="text-xl md:text-2xl font-bold text-gray-800">Task Status Management</h2>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span>{tasks.length} Total Tasks</span>
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-lg rounded-[8px] shadow-xl border border-white/20 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gradient-to-r from-purple-50 to-pink-50">
                  <tr className="text-left text-sm text-gray-700">
                    <th className="px-3 md:px-6 py-4 font-semibold">Task Details</th>
                    <th className="px-3 md:px-6 py-4 font-semibold hidden sm:table-cell">Status</th>
                    <th className="px-3 md:px-6 py-4 font-semibold hidden md:table-cell">Project</th>
                    <th className="px-3 md:px-6 py-4 font-semibold hidden lg:table-cell">Assignee</th>
                    <th className="px-3 md:px-6 py-4 font-semibold hidden lg:table-cell">Last Updated</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {tasks.map((task: Task, index: number) => (
                    <tr key={task.id || `task-${index}`} className="hover:bg-purple-50/50 transition-colors duration-200">
                      <td className="px-3 md:px-6 py-4">
                        <div className="flex items-center space-x-3 md:space-x-4">
                          <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-[8px] flex items-center justify-center text-white font-bold text-sm md:text-base">
                            📋
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="font-semibold text-gray-900 text-sm md:text-base truncate">{task.title}</div>
                            <div className="text-xs text-gray-600 truncate">Created by: {task.createdBy?.username ? `@${task.createdBy.username}` : (task.createdBy?.name || 'Unknown')}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 md:px-6 py-4 hidden sm:table-cell">
                        <div className="flex items-center space-x-2">
                          <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                            task.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                            task.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                            task.status === 'REVIEW' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {formatStatus(task.status)}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 md:px-6 py-4 hidden md:table-cell">
                        <div className="space-y-1">
                          <div className="font-medium text-gray-900 text-sm">{task.project.name}</div>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            task.project.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                            task.project.status === 'ACTIVE' ? 'bg-blue-100 text-blue-800' :
                            task.project.status === 'ON_HOLD' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {formatStatus(task.project.status)}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 md:px-6 py-4 hidden lg:table-cell">
                        <div className="space-y-2 max-w-[200px]">
                          {task.assignees && task.assignees.length > 0 ? (
                            task.assignees.slice(0, 2).map((assignee, idx: number) => (
                              <div key={`assignee-${assignee.user?.id}-${idx}`} className="flex items-center space-x-2 bg-gray-50 px-2 py-1 rounded text-xs">
                                <div className="w-4 h-4 bg-gradient-to-br from-gray-400 to-gray-500 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                                  {assignee.user.username?.charAt(0) || assignee.user.name?.charAt(0) || '?'}
                                </div>
                                <span className="text-gray-700 truncate">
                                  {assignee.user.username ? `@${assignee.user.username}` : (assignee.user.name || assignee.user.email)}
                                </span>
                              </div>
                            ))
                          ) : (
                            <span className="text-xs text-gray-500">No assignee</span>
                          )}
                          {task.assignees && task.assignees.length > 2 && (
                            <div className="text-xs text-gray-500">
                              +{task.assignees.length - 2} more
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-3 md:px-6 py-4 hidden lg:table-cell">
                        <div className="text-xs text-gray-600">
                          <div>{new Date(task.updatedAt).toLocaleDateString('id-ID')}</div>
                          <div className="text-gray-500">{new Date(task.updatedAt).toLocaleTimeString('id-ID')}</div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      {/* Responsive Modal for Suspend/Ban (dashboard) */}
      {dialogOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => !submitting && setDialogOpen(false)}></div>
          <div className="relative w-full sm:max-w-md bg-white rounded-t-2xl sm:rounded-[8px] shadow-xl p-4 sm:p-6 m-0 sm:m-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base sm:text-lg font-bold text-gray-900">
                {dialogType === 'suspend' && t('suspend confirmation')}
                {dialogType === 'unsuspend' && t('unsuspend')}
                {dialogType === 'ban' && `${t('ban')} ${t('confirmation')}`}
                {dialogType === 'unban' && t('unban confirmation')}
              </h3>
              <button onClick={() => !submitting && setDialogOpen(false)} className="text-gray-500 hover:text-gray-700 text-sm sm:text-base">Tutup</button>
            </div>
            <div className="space-y-3">
              {targetUser && (
                <div className="text-sm text-gray-700">Akun: <span className="font-semibold">{targetUser.username ? `@${targetUser.username}` : (targetUser.name || targetUser.email)}</span></div>
              )}
              {dialogType === 'suspend' && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">{t('suspend duration')}</label>
                  <select value={durationInput} onChange={(e) => setDurationInput(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-[8px] focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" title="Select suspension duration">
                    <option value="1d">1 hari</option>
                    <option value="3d">3 hari</option>
                    <option value="7d">7 hari</option>
                    <option value="1m">1 bulan</option>
                    <option value="3m">3 bulan</option>
                    <option value="6m">6 bulan</option>
                    <option value="1y">1 tahun</option>
                  </select>
                </div>
              )}
              {(dialogType === 'suspend' || dialogType === 'ban') && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Alasan (opsional)</label>
                  <textarea value={reasonInput} onChange={(e) => setReasonInput(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-[8px] focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-y min-h-[80px]" placeholder={t('write reason')} />
                </div>
              )}
            </div>
            <div className="mt-4 flex flex-col sm:flex-row gap-2 sm:gap-3">
              {dialogType === 'suspend' && (
                <button onClick={submitSuspend} disabled={submitting} className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 disabled:opacity-50 text-white rounded-[8px] text-sm font-medium w-full sm:w-auto">{submitting ? t('saving') : t('suspend')}</button>
              )}
              {dialogType === 'unsuspend' && (
                <button onClick={submitSuspend} disabled={submitting} className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white rounded-[8px] text-sm font-medium w-full sm:w-auto">{submitting ? t('processing') : t('unsuspend')}</button>
              )}
              {dialogType === 'ban' && (
                <button onClick={submitBan} disabled={submitting} className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-[8px] text-sm font-medium w-full sm:w-auto">{submitting ? t('saving') : t('ban')}</button>
              )}
              {dialogType === 'unban' && (
                <button onClick={submitBan} disabled={submitting} className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white rounded-[8px] text-sm font-medium w-full sm:w-auto">{submitting ? t('processing') : t('unban')}</button>
              )}
              <button onClick={() => !submitting && setDialogOpen(false)} className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-[8px] text-sm font-medium w-full sm:w-auto">Batal</button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  )
}


