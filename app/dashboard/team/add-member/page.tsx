"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Avatar } from "@/components/ui/Avatar"
import { useToast } from "@/components/ui/Toaster"
import { Button } from "@/components/ui/Button"
import { Search, UserPlus, ArrowLeft } from "lucide-react"
import { useLanguage } from "@/components/providers/LanguageProvider"

interface Project {
  id: string
  name: string
}

interface User {
  id: string
  username: string
  name?: string
  email: string
  image?: string
}

export default function TeamAddMemberPage() {
   const router = useRouter()
   const { addToast } = useToast()
   const { t } = useLanguage()
  const [username, setUsername] = useState("")
  const [searchResults, setSearchResults] = useState<User[]>([])
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProject, setSelectedProject] = useState("")
  const [role, setRole] = useState("MEMBER")
  const [isLoading, setIsLoading] = useState(false)
  const [isSearching, setIsSearching] = useState(false)

  // Fetch projects
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await fetch('/api/projects')
        if (res.ok) {
          const data = await res.json()
          setProjects(data.projects || [])
        }
      } catch (error) {
        console.error('Error fetching projects:', error)
      }
    }
    fetchProjects()
  }, [])

  // Search users
  const searchUsers = async () => {
    if (!username.trim()) return
    
    setIsSearching(true)
    try {
      const res = await fetch(`/api/users/search?q=${encodeURIComponent(username)}`)
      if (res.ok) {
        const data = await res.json()
        setSearchResults(data.users || [])
      }
    } catch (error) {
      console.error('Error searching users:', error)
    } finally {
      setIsSearching(false)
    }
  }

  // Add member to project
  const addMember = async () => {
    if (!selectedUser || !selectedProject || !role) {
      addToast({ type: 'warning', title: t('complete_data_warning'), message: t('please_complete_all_fields_message') })
      return
    }

    setIsLoading(true)
    try {
      const res = await fetch('/api/team', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: selectedUser.id,
          projectId: selectedProject,
          role: role
        })
      })

      if (res.ok) {
        addToast({ type: 'success', title: t('success_status'), message: t('member_added_successfully_message') })
        router.push('/dashboard/team')
      } else {
        const error = await res.json()
        addToast({ type: 'error', title: t('failed_status'), message: `${t('failed_add_member_error')}: ${error.message || t('error_occurred_message')}` })
      }
    } catch (error) {
      console.error('Error adding member:', error)
      addToast({ type: 'error', title: 'Error', message: t('error_occurred_message') })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.back()}
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors duration-200 hover:bg-gray-100 px-8 py-3 rounded-xl"
                suppressHydrationWarning={true}
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                {t('back')}
              </button>
              <div className="border-l border-gray-300 pl-4">
                <h1 className="text-3xl font-bold text-gray-900">{t('add team member title')}</h1>
                <p className="text-gray-600 text-sm mt-1">{t('add team member subtitle')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          <div className="divide-y divide-gray-200">
            {/* Form Content */}
            <div className="p-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column */}
                <div className="space-y-6">
                  {/* Cari User */}
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-900">{t('search user label')}</label>
                      <div className="flex gap-3">
                        <div className="relative flex-1">
                          <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder={t('enter username or email placeholder')}
                            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500 hover:border-gray-400"
                            onKeyDown={(e) => e.key === 'Enter' && searchUsers()}
                            suppressHydrationWarning={true}
                          />
                        </div>
                        <Button
                          onClick={searchUsers}
                          disabled={isSearching || !username.trim()}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-all duration-200 shadow-sm hover:shadow-md"
                          suppressHydrationWarning={true}
                        >
                          {isSearching ? t('searching_status') : t('search button')}
                        </Button>
                      </div>
                    </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  {/* Pilih Project */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-900">{t('select team project')}</label>
                    <select
                      value={selectedProject}
                      onChange={(e) => setSelectedProject(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 bg-white hover:border-gray-400"
                      aria-label={t('choose team project')}
                      suppressHydrationWarning={true}
                    >
                      <option value="">{t('choose team project')}</option>
                      {projects.map((project) => (
                        <option key={project.id} value={project.id}>
                          {project.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Role */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-900">{t('role label')}</label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 bg-white hover:border-gray-400"
                      aria-label={t('role label')}
                      suppressHydrationWarning={true}
                    >
                      <option value="MEMBER">{t('member role')}</option>
                      <option value="ADMIN">{t('admin_role')}</option>
                      <option value="FOUNDER">{t('founder_role')}</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Search Results */}
              {searchResults.length > 0 && (
                <div className="mt-8 space-y-6">
                  <label className="block text-xl font-semibold text-gray-900">
                    {t('select_user_label')}
                  </label>
                  <div className="space-y-4 max-h-80 overflow-y-auto">
                    {searchResults.map((user) => (
                      <div
                        key={user.id}
                        onClick={() => setSelectedUser(user)}
                        className={`p-5 border rounded-xl cursor-pointer transition-colors ${
                          selectedUser?.id === user.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center gap-5">
                          <Avatar
                            src={user.image}
                            alt={user.name || user.username}
                            fallback={user.username}
                            size="md"
                            className="w-12 h-12"
                          />
                          <div>
                            <div className="font-medium text-gray-900 text-lg">
                              {user.name || user.username}
                            </div>
                            <div className="text-base text-gray-600">
                              @{user.username} • {user.email}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="bg-gray-50 px-8 py-6">
              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  className="px-8 py-3 bg-yellow-500 hover:bg-yellow-600 text-white border-yellow-500 hover:border-yellow-600 rounded-xl font-medium transition-all duration-200 shadow-sm hover:shadow-md"
                  suppressHydrationWarning={true}
                >
                  {t('cancel')}
                </Button>
                <Button
                  type="button"
                  onClick={addMember}
                  disabled={!selectedUser || !selectedProject || isLoading}
                  className="px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-all duration-200 shadow-sm hover:shadow-md"
                  suppressHydrationWarning={true}
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <UserPlus className="w-4 h-4 mr-2" />
                      {t('add team member button')}
                    </div>
                  )}
                </Button>
              </div>
            </div>
          </div>
      </div>
      </div>
    </div>
  )
}








