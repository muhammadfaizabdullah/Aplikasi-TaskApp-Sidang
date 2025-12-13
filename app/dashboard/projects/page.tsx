"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/Button"
import { useLanguage } from "@/components/providers/LanguageProvider"
import { Plus, Users, Calendar, CheckCircle, Edit, Eye, Download } from "lucide-react"

interface Project {
  id: string
  name: string
  description?: string
  status: string
  createdAt: string
  dueDate?: string
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

export default function ProjectsPage() {
  const { data: session, status } = useSession()
  const { t, lang } = useLanguage()
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const router = useRouter()


  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
      return
    }
    if (status === 'authenticated') {
      fetchProjects()
    }
  }, [status, router])

  const fetchProjects = async () => {
    try {
      setIsLoading(true)
      setError("")
      
      // Add timeout for better UX
      const timeoutId = setTimeout(() => {
        setIsLoading(false)
        setError(t('loading_timeout') || "Loading timeout - silakan refresh halaman")
      }, 5000) // 5 seconds timeout
      
      const response = await fetch('/api/projects', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      })
      
      clearTimeout(timeoutId)
      
      if (response.ok) {
        const data = await response.json()
        setProjects(data.projects || [])
      } else {
        const errorData = await response.json().catch(() => ({}))
        setError(errorData.error || t('failed_load_projects') || "Failed to load projects")
      }
    } catch (error) {
      console.error('Error fetching projects:', error)
      setError(t('error_loading_projects') + (error instanceof Error ? error.message : String(error)) || "An error occurred while loading projects: " + (error instanceof Error ? error.message : String(error)))
    } finally {
      setIsLoading(false)
    }
  }

  const canEditProject = (projectStatus: string) => {
    // Disable edit for completed projects
    return projectStatus !== 'COMPLETED'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800'
      case 'COMPLETED':
        return 'bg-blue-100 text-blue-800'
      case 'ON_HOLD':
        return 'bg-yellow-100 text-yellow-800'
      case 'PLANNING':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return t('active')
      case 'COMPLETED':
        return t('completed')
      case 'ON_HOLD':
        return t('on_hold')
      case 'PLANNING':
        return t('planning')
      default:
        return status
    }
  }

  const getProjectProgress = (project: Project) => {
    if (!project.tasks || project.tasks.length === 0) return 0
    const completedTasks = project.tasks.filter(task => task.status === 'COMPLETED').length
    return Math.round((completedTasks / project.tasks.length) * 100)
  }

  const getDueDate = (project: Project, lang: 'id' | 'en') => {
    if (project.dueDate) {
      return new Date(project.dueDate).toLocaleDateString(lang === 'id' ? 'id-ID' : 'en-US', {
        month: 'numeric',
        day: 'numeric',
        year: 'numeric'
      })
    }
    // Fallback to created date + 30 days if no due date
    const dueDate = new Date(project.createdAt)
    dueDate.setDate(dueDate.getDate() + 30)
    return dueDate.toLocaleDateString(lang === 'id' ? 'id-ID' : 'en-US', {
      month: 'numeric',
      day: 'numeric',
      year: 'numeric'
    })
  }

  // Store lang in a variable that can be accessed in the render function
  const currentLang = lang as 'id' | 'en'

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto mb-4"></div>
        </div>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">{t('access_denied')}</h1>
          <p className="text-gray-600 mb-6">{t('login_required')}</p>
          <Button onClick={() => router.push('/auth/signin')}>
            {t('login')}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <header>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 sm:mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{t('projects')}</h1>
            <p className="text-gray-600 mt-2 text-sm sm:text-base">{t('projects subtitle') || 'Manage all team projects'}</p>
          </div>
          <Button
            onClick={() => router.push('/dashboard/projects/new')}
            className="bg-green-600 hover:bg-green-700 rounded-[8px] px-4 sm:px-6 py-2 sm:py-3 w-full sm:w-auto"
          >
            <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            {t('new project') || 'New Project'}
          </Button>
        </div>
      </header>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-[8px]">
          <p className="text-sm text-red-600">{error}</p>
          <button 
            onClick={fetchProjects}
            className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
          >
            {t('try_again')}
          </button>
        </div>
      )}

      {projects.length === 0 && !error ? (
        <div className="text-center py-8 sm:py-12">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
            <Plus className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
          </div>
          <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
            {t('no_projects_yet')}
          </h3>
          <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base">
            {t('start_by_creating_first_project')}
          </p>
          <Button
            onClick={() => router.push('/dashboard/projects/new')}
            className="bg-green-600 hover:bg-green-700 rounded-[8px] px-4 sm:px-6 py-2 sm:py-3"
          >
            <Plus className="w-4 h-4 mr-2 text-white" />
            {t('create_project')}
          </Button>
        </div>
      ) : projects.length > 0 ? (
        <div className="space-y-4 sm:space-y-6">
          {projects.map((project) => (
            <div
              key={project.id}
              className={`bg-white border rounded-[8px] p-4 sm:p-6 hover:shadow-md transition-shadow ${
                project.status === 'COMPLETED' ? 'border-green-200 bg-green-50' : 'border-gray-200'
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                {/* Project Info */}
                <div className="flex-1">
                  {/* Status Badge */}
                  <div className="mb-3">
                    <span className={`px-2 sm:px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(project.status)}`}>
                      {getStatusText(project.status)}
                    </span>
                  </div>

                  {/* Project Name & Description with Icon */}
                  <div className="flex items-center space-x-2 sm:space-x-3 mb-2">
                    {/* Icon: Light green square with dark grey circle */}
                    <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-md bg-green-100 flex items-center justify-center flex-shrink-0">
                      <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-gray-700"></div>
                    </div>
                    <h3 className={`text-base sm:text-lg font-semibold ${
                      project.status === 'COMPLETED' ? 'text-green-800 line-through' : 'text-gray-900'
                    }`}>
                      {project.name}
                    </h3>
                  </div>
                  {project.description && (
                    <p className={`text-xs sm:text-sm mb-3 sm:mb-4 ${
                      project.status === 'COMPLETED' ? 'text-green-600' : 'text-gray-600'
                    }`}>
                      {project.description}
                    </p>
                  )}

                  {/* Progress Bar */}
                  <div className="mb-3 sm:mb-4">
                    <div className="w-full bg-gray-200 rounded-full h-1.5 sm:h-2">
                      <div
                        className="bg-green-600 h-1.5 sm:h-2 rounded-full transition-all duration-300 progress-bar"
                        data-progress={getProjectProgress(project)}
                      ></div>
                    </div>
                  </div>

                  {/* Project Details */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-6 space-y-2 sm:space-y-0 text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">
                    <span className="flex items-center">
                      <Users className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 text-purple-600" />
                      {(() => {
                        const memberCount = project.members?.filter(member => {
                          const role = member.role?.toLowerCase();
                          console.log(`Member role: ${member.role}, lowercase: ${role}`);
                          return role === 'admin' || role === 'member';
                        }).length || 0;
                        console.log(`Filtered member count: ${memberCount}`);
                        return memberCount;
                      })()} {t('members label') || 'members'}
                    </span>
                    <span className="flex items-center">
                      <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 text-green-600" />
                      {(project.tasks?.length || 0)} {t('tasks label') || 'tasks'}
                    </span>
                  </div>

                  {/* Due Date */}
                  <div className="flex items-center text-xs sm:text-sm text-gray-600">
                    <Calendar className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 text-blue-600" />
                    <span>Due: {getDueDate(project, currentLang)}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row lg:flex-col space-y-2 sm:space-y-0 sm:space-x-2 lg:space-x-0 lg:space-y-2 lg:ml-6">
                  <Button
                    onClick={() => router.push(`/dashboard/projects/${project.id}`)}
                    className="bg-green-600 hover:bg-green-700 text-white rounded-[8px] px-3 sm:px-4 py-2 text-sm sm:text-base"
                  >
                    <Eye className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 text-white" />
                    {t('view details') || 'View Details'}
                  </Button>
                  <Button
                    onClick={() => router.push(`/dashboard/projects/${project.id}/edit`)}
                    className={`rounded-[8px] px-3 sm:px-4 py-2 text-sm sm:text-base ${
                      canEditProject(project.status)
                        ? 'bg-orange-500 hover:bg-orange-600 text-white'
                        : 'bg-gray-300 text-gray-600 cursor-not-allowed'
                    }`}
                    disabled={!canEditProject(project.status)}
                    title={canEditProject(project.status) ? (t('edit project') || 'Edit Project') : (t('project_completed_cannot_edit') || 'Project completed, cannot edit')}
                  >
                    <Edit className={`w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 ${
                      canEditProject(project.status) ? 'text-white' : 'text-gray-600'
                    }`} />
                    {canEditProject(project.status) ? (t('edit') || 'Edit') : ('Cannot Edit')}
                  </Button>
                  <Button
                    onClick={() => window.open(`/api/projects/${project.id}/report`, '_blank')}
                    className="bg-blue-600 hover:bg-blue-700 text-white rounded-[8px] px-3 sm:px-4 py-2 text-sm sm:text-base"
                    title={t('download project report') || 'Download Project Report'}
                  >
                    <Download className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 text-white" />
                    Unduh Report
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-8 sm:py-12">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
            <svg className="w-6 h-6 sm:w-8 sm:h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
            {t('failed_load_projects')}
          </h3>
          <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base">
            {error}
          </p>
          <Button
            onClick={fetchProjects}
            className="bg-green-600 hover:bg-green-700 rounded-[8px] px-4 sm:px-6 py-2 sm:py-3"
          >
            {t('try_again')}
          </Button>
        </div>
      ) : null}
    </div>
  )
}

