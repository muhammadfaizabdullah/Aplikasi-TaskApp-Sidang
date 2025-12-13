"use client"
import { useEffect, useState } from 'react'

type Admin = {
  id: string
  username: string
  name: string
  createdAt: string
  updatedAt: string
}

export default function AdminManagementPage() {
  const [admins, setAdmins] = useState<Admin[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingAdmin, setEditingAdmin] = useState<Admin | null>(null)
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    name: ''
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    loadAdmins()
  }, [])

  const loadAdmins = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/admins')
      if (res.ok) {
        const data = await res.json()
        setAdmins(data.admins)
      }
      setLoading(false)
    } catch (error) {
      console.error('Error loading admins:', error)
      setLoading(false)
    }
  }

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    try {
      const res = await fetch('/api/admin/admins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await res.json()

      if (res.ok) {
        setSuccess('Admin created successfully!')
        setFormData({ username: '', password: '', name: '' })
        setShowCreateForm(false)
        loadAdmins()
      } else {
        setError(data.message || 'Failed to create admin')
      }
    } catch (error) {
      setError('Failed to create admin')
    }
  }

  const handleUpdateAdmin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingAdmin) return

    setError('')
    setSuccess('')

    try {
      const res = await fetch(`/api/admin/admins/${editingAdmin.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await res.json()

      if (res.ok) {
        setSuccess('Admin updated successfully!')
        setFormData({ username: '', password: '', name: '' })
        setEditingAdmin(null)
        loadAdmins()
      } else {
        setError(data.message || 'Failed to update admin')
      }
    } catch (error) {
      setError('Failed to update admin')
    }
  }

  const handleDeleteAdmin = async (adminId: string) => {
    if (!confirm('Are you sure you want to delete this admin?')) return

    try {
      const res = await fetch(`/api/admin/admins/${adminId}`, {
        method: 'DELETE'
      })

      const data = await res.json()

      if (res.ok) {
        setSuccess('Admin deleted successfully!')
        loadAdmins()
      } else {
        setError(data.message || 'Failed to delete admin')
      }
    } catch (error) {
      setError('Failed to delete admin')
    }
  }

  const startEdit = (admin: Admin) => {
    setEditingAdmin(admin)
    setFormData({
      username: admin.username,
      password: '',
      name: admin.name
    })
    setShowCreateForm(false)
  }

  const cancelEdit = () => {
    setEditingAdmin(null)
    setFormData({ username: '', password: '', name: '' })
    setError('')
    setSuccess('')
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
            <h1 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-red-600 to-pink-800 bg-clip-text text-transparent">
              Admin Management
            </h1>
            <p className="text-gray-600 mt-2 text-sm md:text-base">Kelola akun administrator TaskApp</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-600">{admins.length} Total Admins</span>
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-[8px]">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-[8px]">
            {success}
          </div>
        )}

        {/* Create/Edit Form */}
        {(showCreateForm || editingAdmin) && (
          <div className="bg-white/80 backdrop-blur-lg rounded-[8px] shadow-xl border border-white/20 p-4 md:p-6">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 md:mb-6">
              {editingAdmin ? 'Edit Admin' : 'Create New Admin'}
            </h2>
            <form onSubmit={editingAdmin ? handleUpdateAdmin : handleCreateAdmin} className="space-y-4 md:space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Username
                  </label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-[8px] focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100 transition-all duration-200 text-sm md:text-base"
                    placeholder="Enter username"
                    title="Admin username"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-[8px] focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100 transition-all duration-200 text-sm md:text-base"
                    placeholder="Enter full name"
                    title="Admin full name"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Password {editingAdmin && <span className="text-gray-500 text-xs md:text-sm">(leave empty to keep current)</span>}
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-[8px] focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100 transition-all duration-200 text-sm md:text-base"
                  placeholder="Enter password"
                  title="Admin password"
                  required={!editingAdmin}
                />
              </div>
              <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-4">
                <button
                  type="submit"
                  className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-[8px] font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl text-sm md:text-base"
                >
                  {editingAdmin ? 'Update Admin' : 'Create Admin'}
                </button>
                <button
                  type="button"
                  onClick={editingAdmin ? cancelEdit : () => setShowCreateForm(false)}
                  className="w-full sm:w-auto px-6 py-3 bg-yellow-500 text-white rounded-[8px] font-semibold hover:bg-yellow-600 transition-all duration-200 text-sm md:text-base"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Admins List */}
        <div className="bg-white/80 backdrop-blur-lg rounded-[8px] shadow-xl border border-white/20 overflow-hidden">
          <div className="p-4 md:p-6 border-b border-gray-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900">Administrators</h2>
              {!showCreateForm && !editingAdmin && (
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="px-4 md:px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-[8px] font-semibold hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-lg hover:shadow-xl text-sm md:text-base w-full sm:w-auto"
                >
                  + Create New Admin
                </button>
              )}
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gradient-to-r from-red-50 to-pink-50">
                <tr className="text-left text-sm text-gray-700">
                  <th className="px-3 md:px-6 py-4 font-semibold">Admin Info</th>
                  <th className="px-3 md:px-6 py-4 font-semibold hidden sm:table-cell">Created</th>
                  <th className="px-3 md:px-6 py-4 font-semibold hidden md:table-cell">Last Updated</th>
                  <th className="px-3 md:px-6 py-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {admins.map((admin) => (
                  <tr key={admin.id} className="hover:bg-red-50/50 transition-colors duration-200">
                    <td className="px-3 md:px-6 py-4">
                      <div className="flex items-center space-x-3 md:space-x-4">
                        <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-red-500 to-pink-600 rounded-full flex items-center justify-center text-white font-bold text-base md:text-lg">
                          {admin.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-semibold text-gray-900 text-base md:text-lg truncate">{admin.name}</div>
                          <div className="text-xs md:text-sm text-gray-600 truncate">@{admin.username}</div>
                          {/* Show dates on mobile */}
                          <div className="sm:hidden mt-1 space-y-1">
                            <div className="text-xs text-gray-500">
                              Created: {new Date(admin.createdAt).toLocaleDateString()}
                            </div>
                            <div className="text-xs text-gray-500">
                              Updated: {new Date(admin.updatedAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 md:px-6 py-4 hidden sm:table-cell">
                      <div className="text-sm text-gray-600">
                        {new Date(admin.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-3 md:px-6 py-4 hidden md:table-cell">
                      <div className="text-sm text-gray-600">
                        {new Date(admin.updatedAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-3 md:px-6 py-4">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
                        <button
                          onClick={() => startEdit(admin)}
                          className="px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-[8px] text-xs md:text-sm font-medium transition-colors duration-200 shadow-md hover:shadow-lg w-full sm:w-auto"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteAdmin(admin.id)}
                          className="px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-[8px] text-xs md:text-sm font-medium transition-colors duration-200 shadow-md hover:shadow-lg w-full sm:w-auto"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {admins.length === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No admins found</h3>
            <p className="text-gray-600">Create your first admin account to get started.</p>
          </div>
        )}
      </div>
    </div>
  )
}
