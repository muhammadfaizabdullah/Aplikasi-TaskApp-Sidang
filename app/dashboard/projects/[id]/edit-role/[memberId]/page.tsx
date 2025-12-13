"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/Button"
import { Avatar } from "@/components/ui/Avatar"
import { ArrowLeft, Save, Crown, Shield, User, AlertCircle } from "lucide-react"
import { useLanguage } from "@/components/providers/LanguageProvider"

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

interface Member {
  id: string
  role: string
  user: {
    id: string
    username: string
    name?: string
    email: string
    image?: string
  }
}

export default function EditRolePage() {
  const { data: session } = useSession()
  const { t, lang } = useLanguage()
  const router = useRouter()
  const params = useParams()
  const projectId = params.id as string
  const memberId = params.memberId as string
  
  const [project, setProject] = useState<Project | null>(null)
  const [member, setMember] = useState<Member | null>(null)
  const [selectedRole, setSelectedRole] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchProjectAndMember()
  }, [projectId, memberId])

  const fetchProjectAndMember = async () => {
    try {
      setIsLoading(true)
      setError("")
      
      const response = await fetch(`/api/projects/${projectId}`)
      if (response.ok) {
        const data = await response.json()
        setProject(data.project)
        
        // Find the member we're editing
        const targetMember = data.project.members.find((m: any) => m.id === memberId)
        if (targetMember) {
          setMember(targetMember)
          setSelectedRole(targetMember.role)
        } else {
          setError(t('member_not_found'))
        }
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

  const handleUpdateRole = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedRole) {
      setError(t('select_role_for_member'))
      return
    }

    if (selectedRole === member?.role) {
      setError(t('role_unchanged'))
      return
    }

    setIsSaving(true)
    setError("")

    try {
      const response = await fetch(`/api/projects/${projectId}/members/${memberId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: selectedRole })
      })

      const data = await response.json()

      if (response.ok) {
        router.push(`/dashboard/projects/${projectId}`)
      } else {
        setError(data.error || t('failed_update_role'))
      }
    } catch (error) {
      console.error('Error updating role:', error)
      setError(t('error_updating_role'))
    } finally {
      setIsSaving(false)
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'FOUNDER':
        return <Crown className="w-4 h-4" />
      case 'ADMIN':
        return <Shield className="w-4 h-4" />
      case 'MEMBER':
        return <User className="w-4 h-4" />
      default:
        return <User className="w-4 h-4" />
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'FOUNDER':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'ADMIN':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'MEMBER':
        return 'bg-green-100 text-green-800 border-green-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
        </div>
      </div>
    )
  }

  if (!project || !member) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('data_not_found')}</h2>
            <p className="text-gray-600 mb-6">{t('project_or_member_not_found')}</p>
            <Button
              onClick={() => router.push('/dashboard/projects')}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-medium"
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
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors duration-200 hover:bg-gray-100 px-8 py-3 rounded-xl"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                {t('back')}
              </button>
              <div className="border-l border-gray-300 pl-4">
                <h1 className="text-3xl font-bold text-gray-900">{t('edit member role')}</h1>
                <p className="text-gray-600 text-sm mt-1">{t('edit role for')} {member.user.name || member.user.username}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          <form onSubmit={handleUpdateRole} className="divide-y divide-gray-200">
            {/* Form Content */}
            <div className="p-8">
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                  <p className="text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {error}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column */}
                <div className="space-y-6">
                  {/* Project Info */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-900">
                      {lang === 'id' ? "Info Project" : "Project Info"}
                    </label>
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                      <p className="text-sm text-gray-900 font-medium">{project.name}</p>
                      {project.description && (
                        <p className="text-sm text-gray-600 mt-1">{project.description}</p>
                      )}
                    </div>
                  </div>

                  {/* Current Members */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      {lang === 'id' ? "Anggota Tim Saat Ini" : "Current Team Members"} ({project.members.length})
                    </label>
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                      {project.members.length === 0 ? (
                        <p className="text-sm text-gray-500">{lang === 'id' ? "Belum ada anggota tim" : "No team members yet"}</p>
                      ) : (
                        <div className="space-y-3">
                          {project.members.map((m) => (
                            <div key={m.id} className="flex items-center space-x-3 p-2 hover:bg-gray-100 rounded-lg">
                              <Avatar
                                src={m.user.image}
                                alt={m.user.name || m.user.username}
                                fallback={m.user.username}
                                size="sm"
                                className="cursor-pointer hover:opacity-80 transition-opacity"
                                clickable={true}
                                onClick={() => router.push('/dashboard/settings')}
                              />
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">
                                  {m.user.name || m.user.username}
                                </p>
                                <div className="flex items-center">
                                  <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full border ${getRoleColor(m.role)}`}>
                                    {getRoleIcon(m.role)}
                                    <span className="ml-1">{m.role}</span>
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  {/* Member Info */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      {lang === 'id' ? "Member yang Diedit" : "Member to Edit"}
                    </label>
                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                      <div className="flex items-center space-x-3">
                        <Avatar
                          src={member.user.image}
                          alt={member.user.name || member.user.username}
                          fallback={member.user.username}
                          size="md"
                          className="cursor-pointer hover:opacity-80 transition-opacity"
                          clickable={true}
                          onClick={() => router.push('/dashboard/settings')}
                        />
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {member.user.name || member.user.username || (lang === 'id' ? 'Tidak ada nama' : 'No name')}
                          </p>
                          <p className="text-xs text-gray-600">@{member.user.username}</p>
                        </div>
                      </div>
                      <div className="mt-3 flex items-center">
                        <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full border ${getRoleColor(member.role)}`}>
                          {getRoleIcon(member.role)}
                          <span className="ml-1">{lang === 'id' ? "Role Saat Ini:" : "Current Role:"} {member.role}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Role Selection */}
                  <div className="space-y-2">
                    <label htmlFor="role" className="block text-sm font-semibold text-gray-900">
                      {t('select new role')}
                    </label>
                    <select
                      id="role"
                      name="role"
                      value={selectedRole}
                      onChange={(e) => setSelectedRole(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 bg-white hover:border-gray-400"
                    >
                      <option value="MEMBER">{lang === 'id' ? "Anggota" : "Member"} - {lang === 'id' ? "Dapat melihat dan mengerjakan tugas" : "Can view and work on tasks"}</option>
                      <option value="ADMIN">{lang === 'id' ? "Admin" : "Admin"} - {lang === 'id' ? "Dapat mengelola anggota dan pengaturan project" : "Can manage members and project settings"}</option>
                      <option value="FOUNDER">{lang === 'id' ? "Founder" : "Founder"} - {lang === 'id' ? "Akses penuh ke semua fitur project" : "Full access to all project features"}</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="bg-gray-50 px-8 py-6">
              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  className="px-8 py-3 bg-yellow-500 hover:bg-yellow-600 text-white border-yellow-500 hover:border-yellow-600 rounded-xl font-medium transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  {t('cancel')}
                </Button>
                <Button
                  type="submit"
                  disabled={isSaving || selectedRole === member.role}
                  className="px-8 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  {isSaving ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      {t('updating')}
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <Save className="w-4 h-4 mr-2" />
                      {t('update role')}
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