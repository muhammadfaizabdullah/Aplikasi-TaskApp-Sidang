"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/Button"
import { Avatar } from "@/components/ui/Avatar"
import { UserSearch } from "@/components/dashboard/UserSearch"
import { ArrowLeft, Plus, Users, AlertCircle } from "lucide-react"
import { useLanguage } from "@/components/providers/LanguageProvider"
import styles from './page.module.css'

interface User {
  id: string
  username: string
  name: string
  email: string
  image?: string
}

interface Project {
  id: string
  name: string
  description?: string
  members: {
    id: string
    role: string
    user: {
      id: string
      username: string
      name?: string
      email: string
      image?: string
    }
  }[]
}

export default function AddMemberPage() {
  const { data: session } = useSession()
  const { t } = useLanguage()
  const router = useRouter()
  const params = useParams()
  const projectId = params.id as string
  
  const [project, setProject] = useState<Project | null>(null)
  const [selectedUsers, setSelectedUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchProject()
  }, [projectId])

  const fetchProject = async () => {
    try {
      setIsLoading(true)
      setError("")
      
      const response = await fetch(`/api/projects/${projectId}`)
      if (response.ok) {
        const data = await response.json()
        setProject(data.project)
      } else {
        setError(t('failed_load_project_data'))
      }
    } catch (error) {
      console.error('Error fetching project:', error)
      setError(t('error_loading_project_data'))
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddMembers = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (selectedUsers.length === 0) {
      setError(t('select_at_least_one_user'))
      return
    }

    setIsSaving(true)
    setError("")

    try {
      const response = await fetch(`/api/projects/${projectId}/members`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userIds: selectedUsers.map(user => user.id)
        })
      })

      const data = await response.json()

      if (response.ok) {
        router.push(`/dashboard/projects/${projectId}`)
      } else {
        setError(data.error || t('failed_add_members'))
      }
    } catch (error) {
      console.error('Error adding members:', error)
      setError(t('error_adding_members'))
    } finally {
      setIsSaving(false)
    }
  }

  const handleUserSelect = (user: User) => {
    console.log('User selected:', user)
    if (!selectedUsers.find(u => u.id === user.id)) {
      setSelectedUsers(prev => [...prev, user])
      console.log('User added to selectedUsers')
    } else {
      console.log('User already selected')
    }
  }

  const handleRemoveUser = (userId: string) => {
    setSelectedUsers(prev => prev.filter(user => user.id !== userId))
  }

  const isUserAlreadyMember = (user: User) => {
    return project?.members.some(member => member.user.id === user.id) || false
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-themed py-6 md:py-8">
        <div className="max-w-5xl lg:max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-themed py-6 md:py-8">
        <div className="max-w-5xl lg:max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <AlertCircle className="h-16 w-16 text-red-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('project_not_found')}</h2>
            <p className="text-gray-600 mb-6">{t('project_not_found_desc')}</p>
            <Button
              onClick={() => router.push('/dashboard/projects')}
              className="px-6 py-2"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('back_to_projects')}
            </Button>
          </div>
        </div>
      </div>
    )
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
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors duration-200 hover:bg-gray-100 px-8 py-3 rounded-[8px]"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                {t('back')}
              </button>
              <div className="border-l border-gray-300 pl-4">
                <h1 className="text-3xl font-bold text-gray-900">{t('add team members')}</h1>
                <p className="text-gray-600 text-sm mt-1">{t('add new members to')} {project.name}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-[8px] shadow-xl border border-gray-200 overflow-hidden">
          <form onSubmit={handleAddMembers} className="divide-y divide-gray-200">
            {/* Form Content */}
            <div className="p-8 space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-[8px] p-4">
                  <div className="flex">
                    <AlertCircle className="h-5 w-5 text-red-400" />
                    <div className="ml-3">
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Current Team Members */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-900">{t('current team members')}</h2>
                <div className="bg-gray-50 rounded-[8px] p-4">
                  {project.members.length === 0 ? (
                    <p className="text-gray-500">{t('no_team_members_yet')}</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {project.members.map((member) => (
                        <div key={member.id} className="flex items-center space-x-3 p-3 bg-white rounded-[8px] border">
                          <Avatar
                            src={member.user.image}
                            alt={member.user.name || member.user.username}
                            fallback={member.user.username}
                            size="sm"
                            className="w-8 h-8"
                          />
                          <div>
                            <p className="font-medium text-gray-900 text-sm">
                              {member.user.name || member.user.username}
                            </p>
                            <p className="text-xs text-gray-500">{member.role}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Select Users to Add */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-900">{t('select users to add')}</h2>
                <UserSearch
                  onUserSelect={handleUserSelect}
                  excludeUsers={project?.members.map(m => m.user.id) || []}
                  placeholder={t('search username')}
                  currentUserId={session?.user?.id}
                />
              </div>

              {/* Selected Users */}
              {selectedUsers.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {t('selected users')} ({selectedUsers.length})
                  </h3>
                  <div className="space-y-3">
                    {selectedUsers.map((user) => (
                      <div
                        key={user.id}
                        className="flex items-center justify-between p-4 border rounded-[8px] bg-gray-50"
                      >
                        <div className="flex items-center space-x-4">
                          <Avatar
                            src={user.image}
                            alt={user.name || user.username}
                            fallback={user.username}
                            size="md"
                            className="w-12 h-12"
                          />
                          <div>
                            <p className="font-medium text-gray-900">
                              {user.name || user.username || 'No name'}
                            </p>
                            <p className="text-sm text-gray-600">@{user.username}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {isUserAlreadyMember(user) && (
                            <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                              {t('already_a_member')}
                            </span>
                          )}
                          <Button
                            onClick={() => handleRemoveUser(user.id)}
                            variant="outline"
                            size="sm"
                            className="px-4 py-2"
                          >
                            {t('remove user')}
                          </Button>
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
                  className="px-8 py-3 bg-yellow-500 hover:bg-yellow-600 text-white border-yellow-500 hover:border-yellow-600 rounded-[8px] font-medium transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  {t('cancel action')}
                </Button>
                <Button
                  type="submit"
                  disabled={isSaving || selectedUsers.length === 0}
                  className="px-8 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-[8px] font-medium transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  {isSaving ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      {t('adding_members')}
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-2" />
                      {t('add selected members')} ({selectedUsers.length})
                    </div>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}