"use client"
import { useEffect, useState } from 'react'
import { useLanguage } from '@/components/providers/LanguageProvider'

type User = { 
  id: string; 
  email: string; 
  name: string | null; 
  username: string | null; 
  isSuspended: boolean; 
  suspendedUntil: string | null; 
  bannedAt: string | null;
  suspendedReason?: string | null;
  bannedReason?: string | null;
  createdAt: string;
}

export default function AdminUsersPage() {
  const { t } = useLanguage()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  // responsive dialog state for suspend/ban
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogType, setDialogType] = useState<'suspend'|'unsuspend'|'ban'|'unban'|null>(null)
  const [targetUser, setTargetUser] = useState<User | null>(null)
  const [reasonInput, setReasonInput] = useState('')
  const [durationInput, setDurationInput] = useState('7d')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    async function load() {
      setLoading(true)
      const res = await fetch('/api/admin/users', { credentials: 'include' })
      if (res.ok) {
        const data = await res.json()
        setUsers(data.users)
      }
      setLoading(false)
    }
    load()
  }, [])

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.username?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' ||
                         (statusFilter === 'active' && !user.bannedAt && !user.isSuspended) ||
                         (statusFilter === 'suspended' && user.isSuspended) ||
                         (statusFilter === 'banned' && user.bannedAt)
    
    return matchesSearch && matchesStatus
  })

  function openSuspendDialog(user: User, isUnsuspend = false) {
    setTargetUser(user)
    setDialogType(isUnsuspend ? 'unsuspend' : 'suspend')
    setReasonInput('')
    setDurationInput('7d')
    setDialogOpen(true)
  }

  async function submitSuspend() {
    if (!targetUser || !dialogType) return
    setSubmitting(true)
    try {
      const path = dialogType === 'unsuspend' ? `/api/admin/users/${targetUser.id}/unsuspend` : `/api/admin/users/${targetUser.id}/suspend`
      const init: RequestInit = dialogType === 'unsuspend'
        ? { method: 'POST' }
        : { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ duration: durationInput, reason: reasonInput || undefined }) }
      await fetch(path, init)
      const res = await fetch('/api/admin/users')
      if (res.ok) {
        const data = await res.json()
        setUsers(data.users)
      }
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
        ? { method: 'POST' }
        : { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ reason: reasonInput || undefined }) }
      await fetch(path, init)
      const res = await fetch('/api/admin/users')
      if (res.ok) {
        const data = await res.json()
        setUsers(data.users)
      }
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
              User Management
            </h1>
            <p className="text-gray-600 mt-2 text-sm md:text-base">Kelola dan pantau semua pengguna TaskApp</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-600">{users.length} Total Users</span>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white/80 backdrop-blur-lg rounded-[8px] shadow-xl border border-white/20 p-4 md:p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Cari user berdasarkan nama, email, atau username..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-[8px] focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100 transition-all duration-200 text-sm md:text-base"
                />
              </div>
            </div>
            <div className="md:w-48">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-[8px] focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100 transition-all duration-200 text-sm md:text-base"
                title="Filter users by status"
              >
                <option value="all">Semua Status</option>
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
                <option value="banned">Banned</option>
              </select>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white/80 backdrop-blur-lg rounded-[8px] shadow-xl border border-white/20 overflow-hidden">
          <div className="sm:overflow-x-auto">
            <table className="w-full table-fixed">
              <thead className="bg-gradient-to-r from-blue-50 to-indigo-50">
                <tr className="text-left text-sm text-gray-700">
                  <th className="px-3 md:px-6 py-4 font-semibold w-[60%] sm:w-auto">User Info</th>
                  <th className="px-3 md:px-6 py-4 font-semibold hidden sm:table-cell w-[20%]">Status</th>
                  <th className="px-3 md:px-6 py-4 font-semibold hidden md:table-cell w-[10%]">Join Date</th>
                  <th className="px-3 md:px-6 py-4 font-semibold w-[40%] sm:w-auto">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-blue-50/50 transition-colors duration-200">
                    <td className="px-3 md:px-6 py-4">
                      <div className="flex items-center space-x-3 md:space-x-4">
                        <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-base md:text-lg">
                          {u.name?.charAt(0) || u.email.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-semibold text-gray-900 text-base md:text-lg truncate">{u.name || 'No Name'}</div>
                          <div className="text-xs md:text-sm text-gray-600 truncate">{u.email}</div>
                          <div className="text-xs text-blue-600 font-medium truncate">{u.username ? `@${u.username}` : '@no-username'}</div>
                          {/* Show status on mobile */}
                          <div className="sm:hidden mt-1">
                            {u.bannedAt ? (
                              <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                                🚫 Banned
                              </span>
                            ) : u.isSuspended ? (
                              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                                ⏸️ Suspended
                              </span>
                            ) : (
                              <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                                ✅ Active
                              </span>
                            )}
                          </div>
                          {/* Show suspend/ban details on mobile */}
                          {(u.isSuspended || u.bannedAt) && (
                            <div className="sm:hidden mt-1 space-y-1">
                              {u.isSuspended && u.suspendedUntil && (
                                <div className="text-[11px] leading-4 text-gray-500">
                                  Until: {new Date(u.suspendedUntil).toLocaleDateString()}
                                </div>
                              )}
                              {u.isSuspended && u.suspendedReason && (
                                <div className="text-[11px] leading-4 text-yellow-800 bg-yellow-50 border border-yellow-100 px-2 py-1 rounded-lg break-words" title={u.suspendedReason || undefined}>
                                  Reason: <span className="font-medium">{u.suspendedReason}</span>
                                </div>
                              )}
                              {u.bannedAt && u.bannedReason && (
                                <div className="text-[11px] leading-4 text-red-800 bg-red-50 border border-red-100 px-2 py-1 rounded-lg break-words" title={u.bannedReason || undefined}>
                                  Reason: <span className="font-medium">{u.bannedReason}</span>
                                </div>
                              )}
                            </div>
                          )}
                          {/* Show join date on mobile */}
                          <div className="md:hidden mt-1 text-xs text-gray-500">
                            Joined: {new Date(u.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 md:px-6 py-4 hidden sm:table-cell">
                      <div className="flex items-center space-x-2">
                        {u.bannedAt ? (
                          <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                            🚫 Banned
                          </span>
                        ) : u.isSuspended ? (
                          <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                            ⏸️ Suspended
                          </span>
                        ) : (
                          <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                            ✅ Active
                          </span>
                        )}
                      </div>
                      {u.isSuspended && u.suspendedUntil && (
                        <div className="text-xs text-gray-500 mt-1">
                          Until: {new Date(u.suspendedUntil).toLocaleDateString()}
                        </div>
                      )}
                      {u.isSuspended && u.suspendedReason && (
                        <div className="text-xs text-gray-500 mt-1">
                          Reason: {u.suspendedReason}
                        </div>
                      )}
                      {u.bannedAt && u.bannedReason && (
                        <div className="text-xs text-gray-500 mt-1">
                          Reason: {u.bannedReason}
                        </div>
                      )}
                    </td>
                    <td className="px-3 md:px-6 py-4 hidden md:table-cell">
                      <div className="text-sm text-gray-600">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </div>
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
                                setDurationInput(sel?.value || '7d')
                                openSuspendDialog(u)
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No users found</h3>
            <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
          </div>
        )}
        {/* Responsive Modal for Suspend/Ban */}
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








