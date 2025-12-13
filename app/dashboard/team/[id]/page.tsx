"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/Button"
import { useLanguage } from "@/components/providers/LanguageProvider"
import { Avatar } from "@/components/ui/Avatar"
import { ArrowLeft, Calendar, Circle, Mail, User, Users, Edit } from "lucide-react"

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

export default function TeamMemberDetailPage() {
  const router = useRouter()
  const params = useParams()
  const memberId = params.id as string
  const { t } = useLanguage()
  
  const [member, setMember] = useState<Member | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchMemberDetails()
  }, [memberId])

  const fetchMemberDetails = async () => {
    try {
      setIsLoading(true)
      setError("")
      
      console.log('Fetching member details for ID:', memberId)
      
      // First try to get user data from API
      let userData
      try {
        const response = await fetch(`/api/users/${memberId}`)
        console.log('Response status:', response.status)
        
        if (!response.ok) {
          const errorText = await response.text()
          console.error('API Error:', errorText)
          throw new Error(`Failed to fetch member data: ${response.status} ${errorText}`)
        }
        
        userData = await response.json()
        console.log('User data:', userData)
      } catch (apiError) {
        console.error('API call failed, trying alternative approach:', apiError)
        
        // Fallback: try to get user data from team page
        const teamResponse = await fetch('/api/projects')
        if (!teamResponse.ok) {
          throw new Error('Failed to fetch projects data')
        }
        
        const projectsData = await teamResponse.json()
        console.log('Projects data:', projectsData)
        
        // Find user in projects data
        let foundUser = null
        for (const project of projectsData.projects) {
          if (project.members) {
            const member = project.members.find((m: any) => m.user.id === memberId)
            if (member) {
              foundUser = member.user
              break
            }
          }
        }
        
        if (!foundUser) {
          throw new Error('User not found in any project')
        }
        
        userData = { user: foundUser }
      }
      
      // Fetch projects where this member is involved
      const projectsResponse = await fetch('/api/projects')
      if (!projectsResponse.ok) {
        throw new Error('Failed to fetch projects data')
      }
      
      const projectsData = await projectsResponse.json()
      console.log('Projects data:', projectsData)
      
      // Filter projects where this member is a member
      const memberProjects = projectsData.projects.filter((project: any) => 
        project.members?.some((member: any) => member.user.id === memberId)
      )
      
      console.log('Member projects:', memberProjects)
      
      // Transform data to match our interface
      const memberData = memberProjects.map((project: any) => {
        const memberInfo = project.members.find((m: any) => m.user.id === memberId)
        return {
          projectId: project.id,
          projectName: project.name,
          role: memberInfo.role,
          joinedAt: memberInfo.joinedAt || project.createdAt,
          lastActive: memberInfo.lastActive || new Date().toISOString()
        }
      })
      
      const memberInfo: Member = {
        id: userData.user.id,
        name: userData.user.name,
        username: userData.user.username,
        email: userData.user.email,
        image: userData.user.image,
        memberData: memberData
      }
      
      setMember(memberInfo)
    } catch (error) {
      console.error('Error fetching member details:', error)
      setError(`Terjadi kesalahan saat memuat data member: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsLoading(false)
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
        return '👑'
      case 'ADMIN':
        return '🛡️'
      case 'MEMBER':
        return '👤'
      default:
        return '👤'
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
      </div>
    )
  }

  if (!member) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">{t('member_not_found')}</h1>
          <p className="text-gray-600 mb-6">{t('member_not_found_desc')}</p>
          <Button onClick={() => router.push('/dashboard/team')}>
            {t('back')} to {t('team')}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
          <Button
            onClick={() => router.back()}
            className="bg-[#F9A600] hover:bg-[#F9A600]/90 text-white px-4 py-2 rounded-[8px] text-sm sm:text-base w-full sm:w-auto"
          >
            <ArrowLeft className="w-4 h-4 mr-2 text-white" />
            {t('back')}
          </Button>
          <div className="flex-1">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{t('member_details')}</h1>
            <p className="text-gray-600 mt-1 text-sm sm:text-base">{t('member_details')}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Member Profile */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="text-center mb-6">
              <Avatar
                src={member.image}
                alt={member.name || member.username}
                fallback={member.username}
                size="xl"
                className="mx-auto mb-4"
              />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                {member.name || member.username || t('no_name')}
              </h2>
              <p className="text-gray-600 mb-4">@{member.username}</p>
              
              {/* Online Status */}
              <div className="flex items-center justify-center space-x-2 mb-4">
                <Circle className="w-3 h-3 text-green-600" />
                <span className="text-sm text-green-600 font-medium">{t('online')}</span>
              </div>
            </div>

            {/* Member Info */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600">{member.email}</span>
              </div>
              <div className="flex items-center space-x-3">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600">
                  {t('monthly_data')}: {new Date(member.memberData[0]?.joinedAt || new Date()).toLocaleDateString(t('lang') === 'id' ? 'id-ID' : 'en-US')}
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <Circle className="w-3 h-3 text-gray-400" />
                <span className="text-sm text-gray-600">
                  {t('last_active')}: {new Date(member.memberData[0]?.lastActive || new Date()).toLocaleDateString(t('lang') === 'id' ? 'id-ID' : 'en-US')}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Project Memberships */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('project_memberships')}</h3>
            
            {member.memberData.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600">{t('this_member_not_in_any_project')}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {member.memberData.map((project, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 mb-2">{project.projectName}</h4>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full border ${getRoleColor(project.role)}`}>
                            {getRoleIcon(project.role)}
                            <span className="ml-1">{getRoleText(project.role)}</span>
                          </span>
                          <span className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            {t('monthly_data')}: {new Date(project.joinedAt).toLocaleDateString(t('lang') === 'id' ? 'id-ID' : 'en-US')}
                          </span>
                        </div>
                      </div>
                      <Button
                        onClick={() => router.push(`/dashboard/projects/${project.projectId}`)}
                        variant="outline"
                        size="sm"
                        className="text-blue-600 border-blue-200 hover:bg-blue-50"
                      >
                        {t('view_project')}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
