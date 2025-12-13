"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/Button"
import { Avatar } from "@/components/ui/Avatar"
import { ArrowLeft, Save, Users, Crown, Shield, User, AlertCircle } from "lucide-react"
import { useLanguage } from "@/components/providers/LanguageProvider"
import { 
  canEditRole, 
  isFounder, 
  isAdmin, 
  isMember 
} from "@/lib/utils"

interface Member {
  id: string
  name: string
  username: string
  email: string
  image?: string
  memberData: Array<{
    projectId: string
    projectName: string
    role: string
    joinedAt: string
    lastActive: string
  }>
}

// Legacy block kept for reference (disabled to avoid duplicate export)
export default function EditTeamMemberPage() {
  const router = useRouter()
  const params = useParams()
  const { data: session } = useSession()
  const { t } = useLanguage()
  const memberId = params.id as string
  
  const [member, setMember] = useState<any>(null)
  const [userPermissions, setUserPermissions] = useState<{[key: string]: boolean}>({})
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [accessDenied, setAccessDenied] = useState(false)
  const [roleChanges, setRoleChanges] = useState<{[key: string]: string}>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Function to get current user's role in a specific project
  const getCurrentUserRoleInProject = (projectId: string, projectsData: any[]): string | null => {
    const project = projectsData.find(p => p.id === projectId)
    if (!project || !session?.user?.email) return null
    
    // Check if user is founder
    if (project.founder?.email === session.user.email) {
      return 'founder'
    }
    
    // Check if user is a member
    if (project.members && Array.isArray(project.members)) {
      const member = project.members.find((m: any) => m.user?.email === session.user.email)
      return member?.role?.toLowerCase() || null
    }
    
    return null
  }

  // Function to check if user can edit role for a specific project
  const canEditRoleInProject = (projectId: string, targetRole: string, projectsData: any[]): boolean => {
    const currentUserRole = getCurrentUserRoleInProject(projectId, projectsData)
    const targetMember = member?.memberData.find((m: any) => m.projectId === projectId)
    
    if (!targetMember) return false
    
    return canEditRole(currentUserRole, targetRole, session?.user?.id || '', memberId)
  }

  // Function to get role hierarchy level (higher number = higher role)
  const getRoleLevel = (role: string): number => {
    switch (role?.toLowerCase()) {
      case 'founder': return 3
      case 'admin': return 2
      case 'member': return 1
      default: return 0
    }
  }

  // Function to check if current user has higher role than target user
  const hasHigherRole = (currentUserRole: string | null, targetRole: string): boolean => {
    if (!currentUserRole) return false
    
    const currentLevel = getRoleLevel(currentUserRole)
    const targetLevel = getRoleLevel(targetRole)
    
    return currentLevel > targetLevel
  }

  useEffect(() => {
    const fetchMemberDetails = async () => {
      if (!memberId) return
      
      try {
        setIsLoading(true)
        
        // Check if user is trying to edit their own role
        if (session?.user?.id === memberId) {
          setAccessDenied(true)
          setError(t('cannot_edit_own_role'))
          setIsLoading(false)
          return
        }
        
        // Fetch user data
        let userData
        try {
          const response = await fetch(`/api/users/${memberId}`)
          if (!response.ok) {
            const errorText = await response.text()
            console.error('API Error:', errorText)
            throw new Error(`Failed to fetch member data: ${response.status} ${errorText}`)
          }
          userData = await response.json()
        } catch (error) {
          console.error('Failed to fetch user data, trying fallback:', error)
          // Fallback: try to get user data from projects
          const projectsResponse = await fetch('/api/projects')
          if (projectsResponse.ok) {
            const projectsData = await projectsResponse.json()
            // Find user in any project
            let foundUser = null
            for (const project of projectsData.projects || []) {
              if (project.founder?.id === memberId) {
                foundUser = project.founder
                break
              }
              const member = project.members?.find((m: any) => m.user?.id === memberId)
              if (member) {
                foundUser = member.user
                break
              }
            }
            if (foundUser) {
              userData = { user: foundUser }
            } else {
              throw new Error('User not found in any project')
            }
          } else {
            throw new Error('Failed to fetch projects data')
          }
        }
        
        // Fetch projects where this member is involved
        const projectsResponse = await fetch('/api/projects')
        if (!projectsResponse.ok) {
          throw new Error('Failed to fetch projects data')
        }
        
        const projectsData = await projectsResponse.json()
        console.log('Projects data:', projectsData)
        
        // Validate projects data structure
        if (!projectsData.projects || !Array.isArray(projectsData.projects)) {
          throw new Error('Invalid projects data structure')
        }
        
        // Filter projects where this member is a member
        const memberProjects = []
        const permissions: {[key: string]: boolean} = {}
        
        for (const project of projectsData.projects) {
          // Validate project structure
          if (!project || !project.id || !project.name) {
            console.warn('Invalid project structure:', project)
            continue
          }
          
          if (project.members && Array.isArray(project.members)) {
            const memberInProject = project.members.find((m: any) => m.user?.id === memberId)
            if (memberInProject && memberInProject.user) {
              memberProjects.push({
                projectId: project.id,
                projectName: project.name,
                role: memberInProject.role || 'MEMBER',
                joinedAt: memberInProject.createdAt || new Date().toISOString(),
                lastActive: new Date().toISOString()
              })
              
              // Check if current user can edit this member's role in this project
              const currentUserRole = getCurrentUserRoleInProject(project.id, projectsData.projects)
              const canEdit = hasHigherRole(currentUserRole, memberInProject.role) && 
                             canEditRole(currentUserRole, memberInProject.role, session?.user?.id || '', memberId)
              permissions[project.id] = canEdit
              
              console.log('Permission check:', {
                projectName: project.name,
                currentUserRole,
                targetRole: memberInProject.role,
                currentLevel: currentUserRole ? getRoleLevel(currentUserRole) : 0,
                targetLevel: getRoleLevel(memberInProject.role),
                hasHigherRole: currentUserRole ? hasHigherRole(currentUserRole, memberInProject.role) : false,
                canEdit
              })
            }
          }
        }
        
        // Check if user has any permissions to edit roles
        const hasAnyPermission = Object.values(permissions).some(Boolean)
        if (!hasAnyPermission) {
          setAccessDenied(true)
          setIsLoading(false)
          return
        }
        
        setUserPermissions(permissions)
        
        // Validate user data
        if (!userData.user || !userData.user.id) {
          throw new Error('Invalid user data structure')
        }
        
        const memberData = {
          id: userData.user.id,
          name: userData.user.name || '',
          username: userData.user.username || '',
          email: userData.user.email || '',
          image: userData.user.image || '',
          memberData: memberProjects
        }
        
        setMember(memberData)
      } catch (error) {
        console.error('Error fetching member details:', error)
        setError(`Terjadi kesalahan saat memuat data member: ${error instanceof Error ? error.message : 'Unknown error'}`)
      } finally {
        setIsLoading(false)
      }
    }

    fetchMemberDetails()
  }, [memberId, session?.user?.id])

  const handleRoleChange = (projectId: string, newRole: string) => {
    setRoleChanges(prev => ({
      ...prev,
      [projectId]: newRole
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (Object.keys(roleChanges).length === 0) {
      setError(t('no_changes_to_save'))
      return
    }

    setIsSubmitting(true)
    setError("")

    try {
      // Validate permissions for each role change
      const projectsResponse = await fetch('/api/projects')
      if (!projectsResponse.ok) {
        throw new Error('Failed to fetch projects data for validation')
      }
      
      const projectsData = await projectsResponse.json()
      
      // Check permissions for each role change
      for (const [projectId, newRole] of Object.entries(roleChanges)) {
        const currentUserRole = getCurrentUserRoleInProject(projectId, projectsData.projects)
        const targetMember = member?.memberData.find((m: any) => m.projectId === projectId)
        
        if (!targetMember) {
          throw new Error(`Member not found in project ${projectId}`)
        }

        const canEdit = canEditRole(currentUserRole, targetMember.role, session?.user?.id || '', memberId)

        if (!canEdit) {
          throw new Error(`You do not have permission to change role in this project`)
        }
        
        console.log('Permission validated for project:', projectId, {
          currentUserRole,
          targetRole: targetMember.role,
          newRole,
          canEdit
        })
      }

      // Proceed with role updates
      const updatePromises = Object.entries(roleChanges).map(([projectId, newRole]) =>
        fetch(`/api/projects/${projectId}/members/${memberId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ role: newRole })
        })
      )

      const responses = await Promise.all(updatePromises)
      
      // Check if all updates were successful
      const failedUpdates = responses.filter(response => !response.ok)
      
      if (failedUpdates.length > 0) {
        throw new Error(`Gagal mengupdate ${failedUpdates.length} role`)
      }

      alert(t('member_roles_updated_successfully'))
      router.push('/dashboard/team')

    } catch (error) {
      console.error('Error updating member roles:', error)
      setError(error instanceof Error ? error.message : t('error_updating_member_roles'))
    } finally {
      setIsSubmitting(false)
    }
  }

  const getRoleColor = (role: string) => {
    switch (role.toUpperCase()) {
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

  const getRoleIcon = (role: string) => {
    switch (role.toUpperCase()) {
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

  const getRoleText = (role: string) => {
    switch (role.toUpperCase()) {
      case 'FOUNDER':
        return 'Founder'
      case 'ADMIN':
        return 'Admin'
      case 'MEMBER':
        return t('member')
      default:
        return role
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

  if (accessDenied) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('access_denied_title')}</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <Button
              onClick={() => router.push('/dashboard/team')}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-medium"
            >
              {t('back_to_team')}
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (!member) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('member_not_found_title')}</h2>
            <p className="text-gray-600 mb-6">{t('member_not_found_description')}</p>
            <Button
              onClick={() => router.push('/dashboard/team')}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-medium"
            >
              {t('back_to_team')}
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
                <h1 className="text-3xl font-bold text-gray-900">{t('edit_member_role')}</h1>
                <p className="text-gray-600 text-sm mt-1">{t('edit_member_role_subtitle')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          <form onSubmit={handleSubmit} className="divide-y divide-gray-200">
            {/* Form Content */}
            <div className="p-8 space-y-6">
              {/* Member Info */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{t('member_information')}</h3>
                <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl">
                  <Avatar
                    src={member.image}
                    alt={member.name || member.username}
                    fallback={member.username}
                    size="lg"
                  />
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">
                      {member.name || member.username || 'No name'}
                    </h4>
                    <p className="text-gray-600">@{member.username}</p>
                    <p className="text-sm text-gray-500">{member.email}</p>
                  </div>
                </div>
              </div>

              {/* Project Roles */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{t('roles_in_projects')}</h3>
                {error && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                {member.memberData.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600">{t('member_not_joined_any_project')}</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {member.memberData.map((project: Member['memberData'][0], index: number) => {
                      const currentRole = roleChanges[project.projectId] || project.role
                      const hasChanges = roleChanges[project.projectId] && roleChanges[project.projectId] !== project.role
                      const canEditThisRole = userPermissions[project.projectId]

                      return (
                        <div
                          key={index}
                          className={`border rounded-xl p-4 ${hasChanges ? 'border-orange-300 bg-orange-50' : 'border-gray-200'}`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900 mb-2">{project.projectName}</h4>
                              <div className="flex items-center space-x-4">
                                <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full border ${getRoleColor(currentRole)}`}>
                                  {getRoleIcon(currentRole)}
                                  <span className="ml-1">{getRoleText(currentRole)}</span>
                                </span>
                                {hasChanges && (
                                  <span className="text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded-full">
                                    {t('will_be_changed')}
                                  </span>
                                )}
                                {!canEditThisRole && (
                                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                                    {t('cannot_edit')}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="ml-4">
                              {canEditThisRole ? (
                                <select
                                  value={currentRole}
                                  onChange={(e) => handleRoleChange(project.projectId, e.target.value)}
                                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 bg-white hover:border-gray-400"
                                  aria-label={`Select role for ${project.projectName}`}
                                >
                                  <option value="MEMBER">{t('member')}</option>
                                  <option value="ADMIN">Admin</option>
                                </select>
                              ) : (
                                <div className="px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-500">
                                  {getRoleText(currentRole)}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
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
                  className="px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-all duration-200 shadow-sm hover:shadow-md"
                  disabled={isSubmitting || Object.keys(roleChanges).length === 0}
                >
                  {isSubmitting ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <Save className="w-4 h-4 mr-2" />
                      {t('save changes')}
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
