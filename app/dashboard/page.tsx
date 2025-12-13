"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { FullPageLoading } from "@/components/ui/LoadingSpinner"
import { fetchUserData, fetchProjects } from "@/lib/api"
import { FolderOpen, ClipboardList, Users, TrendingUp, Plus, FileText, UserPlus, PlusCircle } from "lucide-react"
import { useLanguage } from "@/components/providers/LanguageProvider"

interface User {
  id: string
  username: string
  name: string
  email: string
}

interface Project {
  id: string
  name: string
  description?: string
  status: string
  createdAt: string
  members: {
    id: string
    role: string
    user: {
      id: string
      username: string
      name: string
      email: string
      image?: string
    }
  }[]
  tasks: {
    id: string
    status: string
  }[]
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { t, lang } = useLanguage()
  const [user, setUser] = useState<User | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [theme, setTheme] = useState<'green' | 'blue' | 'purple'>('green')

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    }
  }, [status, router])

  useEffect(() => {
    if (status === "authenticated" && session?.user?.email) {
      setIsLoading(true)
      
      // Set timeout to 8s for better UX
      const loadingTimeout = setTimeout(() => {
        setIsLoading(false)
        console.warn("Dashboard loading timed out")
      }, 8000) // 8 seconds total timeout
      
      Promise.all([fetchUserDataLocal(), fetchProjectsLocal()])
        .finally(() => {
          clearTimeout(loadingTimeout)
          setIsLoading(false)
        })
    }
  }, [status, session])

  // Read current theme from document (set by ThemeProvider)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const t = (document.documentElement.getAttribute('data-theme') as 'green' | 'blue' | 'purple') || 'green'
      setTheme(t)
    }
  }, [])

  // Redirect to setup username if no username
  useEffect(() => {
    if (status === "authenticated" && session?.user?.email && user && !user.username) {
      router.push("/setup-username")
    }
  }, [status, session, user, router])

  const fetchUserDataLocal = async () => {
    try {
      const userData = await fetchUserData()
      if (userData && typeof userData === 'object' && 'user' in userData) {
        const userDataTyped = userData as { user: User }
        setUser(userDataTyped.user)
        
        // Redirect to setup username if no username
        if (!userDataTyped.user.username) {
          router.push("/setup-username")
          return
        }
      }
    } catch (error) {
      console.error("Error fetching user data:", error)
      // Use session data as fallback
      setUser({
        id: session?.user?.id || 'temp',
        username: session?.user?.username || 'demo_user',
        name: session?.user?.name || 'Demo User',
        email: session?.user?.email || 'demo@example.com'
      })
    }
  }

  const fetchProjectsLocal = async () => {
    try {
      const data = await fetchProjects()
      if (data && typeof data === 'object' && 'projects' in data) {
        setProjects(data.projects as Project[] || [])
      }
    } catch (error) {
      console.error("Error fetching projects:", error)
      // Use empty array as fallback
      setProjects([])
    }
  }

  const getProjectProgress = (project: Project) => {
    if (!project.tasks || project.tasks.length === 0) return 0
    const completedTasks = project.tasks.filter(task => task.status === 'COMPLETED').length
    return Math.round((completedTasks / project.tasks.length) * 100)
  }

  const getUniqueMembersCount = () => {
    const allMembers = projects.flatMap(project => 
      project.members?.map(member => member.user.id) || []
    )
    const uniqueMemberIds = Array.from(new Set(allMembers))
    // Exclude current user from count
    const currentUserId = session?.user?.id
    const filteredMembers = uniqueMemberIds.filter(id => id !== currentUserId)
    
    
    return filteredMembers.length
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'completed':
        return 'bg-blue-100 text-blue-800'
      case 'on_hold':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const themeTextPrimary = () => {
    switch (theme) {
      case 'blue':
        return 'text-blue-600'
      case 'purple':
        return 'text-purple-600'
      case 'green':
      default:
        return 'text-green-600'
    }
  }

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t('loading')}</p>
        </div>
      </div>
    )
  }

  if (status === "unauthenticated") {
    return null
  }

  return (
    <div className="space-y-5 sm:space-y-7">
      <header>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{t('dashboard')}</h1>
        <p className="text-gray-600 mt-2 text-sm sm:text-base">{t('dashboard subtitle')}</p>
      </header>

      {/* Stats Overview - Dipindah ke atas */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
        <div className="dashboard-card bg-white rounded-[8px] sm:rounded-[8px] shadow-lg border border-gray-100 p-4 sm:p-5 hover:shadow-xl transition-all duration-300 hover:scale-105">
          <div className="flex items-center">
            <div className="p-2 sm:p-3 bg-gradient-to-br from-amber-100 to-amber-200 rounded-[8px] sm:rounded-[8px]">
              <FolderOpen className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600" />
            </div>
            <div className="ml-3 sm:ml-4">
              <p className="text-xs sm:text-sm font-medium text-gray-500">{t('total projects')}</p>
              <p className="text-lg sm:text-2xl font-bold text-gray-800">{projects.length}</p>
            </div>
          </div>
        </div>

        <div className="dashboard-card bg-white rounded-[8px] sm:rounded-[8px] shadow-lg border border-gray-100 p-4 sm:p-5 hover:shadow-xl transition-all duration-300 hover:scale-105">
          <div className="flex items-center">
            <div className="p-2 sm:p-3 bg-gradient-to-br from-blue-100 to-blue-200 rounded-[8px] sm:rounded-[8px]">
              <ClipboardList className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
            </div>
            <div className="ml-3 sm:ml-4">
              <p className="text-xs sm:text-sm font-medium text-gray-500">{t('total tasks')}</p>
              <p className="text-lg sm:text-2xl font-bold text-gray-800">
                {projects.reduce((total, project) => total + (project.tasks?.length || 0), 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="dashboard-card bg-white rounded-[8px] sm:rounded-[8px] shadow-lg border border-gray-100 p-4 sm:p-5 hover:shadow-xl transition-all duration-300 hover:scale-105">
          <div className="flex items-center">
            <div className="p-2 sm:p-3 bg-gradient-to-br from-purple-100 to-purple-200 rounded-[8px] sm:rounded-[8px]">
              <Users className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
            </div>
            <div className="ml-3 sm:ml-4">
              <p className="text-xs sm:text-sm font-medium text-gray-500">{t('total members')}</p>
              <p className="text-lg sm:text-2xl font-bold text-gray-800">
                {getUniqueMembersCount()}
              </p>
            </div>
          </div>
        </div>

        <div className="dashboard-card bg-white rounded-[8px] sm:rounded-[8px] shadow-lg border border-gray-100 p-4 sm:p-5 hover:shadow-xl transition-all duration-300 hover:scale-105">
          <div className="flex items-center">
            <div className="p-2 sm:p-3 bg-gradient-to-br from-green-100 to-green-200 rounded-[8px] sm:rounded-[8px]">
              <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
            </div>
            <div className="ml-3 sm:ml-4">
              <p className="text-xs sm:text-sm font-medium text-gray-500">{t('avg progress')}</p>
              <p className="text-lg sm:text-2xl font-bold text-gray-800">
                {projects.length > 0 
                  ? Math.round(projects.reduce((total, project) => total + getProjectProgress(project), 0) / projects.length)
                  : 0}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions Section - Dipindah ke bawah */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 md:gap-5">
        <button
          onClick={() => router.push('/dashboard/projects/new')}
          className="dashboard-card new-project-card bg-green-50 text-gray-800 p-4 sm:p-5 rounded-[8px] sm:rounded-[8px] shadow-lg border border-green-100 hover:shadow-xl transition-all duration-300 hover:scale-105 text-left group hover:border-green-200 order-3 md:order-1 col-span-2 md:col-span-2"
        >
          <div className="mb-2 sm:mb-3">
            <PlusCircle className="w-6 h-6 sm:w-7 sm:h-7 new-project-icon" />
          </div>
          <h3 className="font-semibold text-sm sm:text-base lg:text-lg mb-2 leading-tight">{t('qaNewProject')}</h3>
        </button>


        <button
          onClick={() => router.push('/dashboard/team/add-member')}
          className="dashboard-card bg-purple-50 text-gray-800 p-4 sm:p-5 rounded-[8px] sm:rounded-[8px] shadow-lg border border-purple-100 hover:shadow-xl transition-all duration-300 hover:scale-105 text-left group hover:border-purple-200 hover:bg-purple-100 order-2 md:order-3"
        >
          <div className="mb-2 sm:mb-3">
            <UserPlus className="w-6 h-6 sm:w-7 sm:h-7 text-purple-600" />
          </div>
          <h3 className="font-semibold text-sm sm:text-base lg:text-lg mb-2 leading-tight">{t('qaInviteMember')}</h3>
        </button>
      </div>

      {/* Projects Section */}
      <div className="dashboard-card bg-white text-gray-800 rounded-[8px] sm:rounded-[8px] shadow-lg border border-gray-100 p-4 sm:p-5 hover:shadow-xl transition-all duration-300 relative">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-4 sm:mb-5">
          <h3 className="text-lg sm:text-xl font-semibold">{t('latest projects')}</h3>
          <button
            onClick={() => router.push('/dashboard/projects')}
            className="absolute top-4 right-4 text-black hover:text-gray-800 text-sm font-bold sm:static sm:top-auto sm:right-auto"
          >
            {t('view all')} →
          </button>
        </div>

        {projects.length === 0 ? (
          <div className="text-center py-6 sm:py-8">
            <div className="text-3xl sm:text-4xl mb-3 sm:mb-4">📁</div>
            <p className="text-gray-500 mb-4 text-sm sm:text-base">{t('no_projects')}</p>
                             <button
                   onClick={() => router.push('/dashboard/projects/new')}
                   className="bg-[#16A34A] text-[#F6FEFF] px-3 sm:px-4 py-2 rounded-[8px] hover:bg-[#15803D] transition-colors font-semibold text-sm sm:text-base"
                 >
                   {t('create_first_project')}
                 </button>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {projects.slice(0, 3).map((project) => (
              <div key={project.id} className="border border-gray-200 rounded-[8px] p-3 sm:p-4 hover:shadow-sm transition-shadow bg-gray-50">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                  <div className="flex-1">
                    <h4 className="font-medium text-black mb-1 text-sm sm:text-base">{project.name}</h4>
                    {project.description && (
                      <p className="text-xs sm:text-sm text-gray-600 mb-2">{project.description}</p>
                    )}
                    <div className="flex flex-wrap items-center gap-x-3 sm:gap-x-4 gap-y-1 text-xs sm:text-sm text-gray-500">
                      <span>📅 {new Date(project.createdAt).toLocaleDateString(lang === 'id' ? 'id-ID' : 'en-US')}</span>
                      <span>👥 {(project.members?.length || 0)} {t('members label')}</span>
                      <span>📋 {(project.tasks?.length || 0)} {t('tasks label')}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end space-x-2 sm:space-x-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                      {t(project.status.toLowerCase())}
                    </span>
                    <div className="text-right">
                      <div className="text-xs sm:text-sm font-medium text-gray-900">{getProjectProgress(project)}%</div>
                      <div className="w-12 sm:w-16 bg-gray-200 rounded-full h-1.5 sm:h-2">
                        <div
                          className="bg-green-600 h-1.5 sm:h-2 rounded-full transition-all duration-300 progress-bar"
                          data-progress={getProjectProgress(project)}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
