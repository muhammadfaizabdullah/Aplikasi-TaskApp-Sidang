"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { useToast } from "@/components/ui/Toaster"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/Button"
import { ArrowLeft, Save, Trash2 } from "lucide-react"
import { useLanguage } from "@/components/providers/LanguageProvider"
import {
  canEditProject,
  canEditProjectDetails,
  canEditProjectStatus,
  canDeleteProject,
  isFounder,
  isAdmin,
  isMember
} from "@/lib/utils"

interface Project {
  id: string
  name: string
  description: string | null
  status: string
  startDate?: string
  endDate?: string
  founder: {
    id: string
    email: string
  }
  members: Array<{
    id: string
    role: string
    user: {
      id: string
      email: string
    }
  }>
}

export default function EditProjectPage() {
  const router = useRouter()
  const { addToast } = useToast()
  const params = useParams()
  const { data: session } = useSession()
  const { t } = useLanguage()
  const projectId = params.id as string
  
  const [project, setProject] = useState<Project | null>(null)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [status, setStatus] = useState("ACTIVE")
  const [endDate, setEndDate] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState("")
  const [accessDenied, setAccessDenied] = useState(false)
  const [projectDeleteConfirm, setProjectDeleteConfirm] = useState<boolean>(false)
  const [errors, setErrors] = useState<{[key: string]: string}>({})

  // Get current user's role in this project
  const getCurrentUserRole = (): string | null => {
    if (!project || !session?.user?.email) return null
    
    // Check if user is founder
    if (project.founder.email === session.user.email) {
      return 'founder'
    }
    
    // Check if user is a member
    const member = project.members.find(m => m.user.email === session.user.email)
    return member?.role?.toLowerCase() || null
  }

  const currentUserRole = getCurrentUserRole()

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value)
    if (errors.name) {
      setErrors(prev => ({ ...prev, name: "" }))
    }
  }

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatus(e.target.value)
    if (errors.status) {
      setErrors(prev => ({ ...prev, status: "" }))
    }
  }


  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEndDate(e.target.value)
    if (errors.endDate) {
      setErrors(prev => ({ ...prev, endDate: "" }))
    }
  }

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDescription(e.target.value)
  }

  useEffect(() => {
    fetchProject()
  }, [projectId])

  useEffect(() => {
    // Check permissions after project is loaded
    if (project && !isLoading) {
      const userRole = getCurrentUserRole()
      if (!canEditProject(userRole)) {
        setAccessDenied(true)
      }
    }
  }, [project, isLoading])

  const fetchProject = async () => {
    try {
      setIsLoading(true)
      setError("")
      
      const response = await fetch(`/api/projects/${projectId}`)
      if (response.ok) {
        const data = await response.json()
        setProject(data.project)
        setName(data.project.name)
        setDescription(data.project.description || "")
        setStatus(data.project.status)
        setEndDate(data.project.endDate ? new Date(data.project.endDate).toISOString().split('T')[0] : "")
      } else {
        setError("Gagal memuat data project")
      }
    } catch (error) {
      console.error('Error fetching project:', error)
      setError("Terjadi kesalahan saat memuat data project")
    } finally {
      setIsLoading(false)
    }
  }

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {}

    // Founder can edit everything
    if (currentUserRole === 'founder') {
      if (!name.trim()) {
        newErrors.name = "Nama project wajib diisi"
      }
      if (!status) {
        newErrors.status = "Status project wajib dipilih"
      }
    }
    // Admin can edit everything except dates
    else if (currentUserRole === 'admin') {
      if (!name.trim()) {
        newErrors.name = "Nama project wajib diisi"
      }
      if (!status) {
        newErrors.status = "Status project wajib dipilih"
      }
    }
    // Member can only edit status
    else if (currentUserRole === 'member') {
      if (!status) {
        newErrors.status = "Status project wajib dipilih"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      addToast({ type: 'error', title: 'Validasi Gagal', message: 'Mohon lengkapi semua field yang wajib diisi' })
      return
    }

    setIsSaving(true)
    setError("")
    setErrors({})

    try {
      // Prepare data based on user role
      let updateData: any = {}

      if (currentUserRole === 'founder') {
        // Founder can edit everything
        updateData = {
          name: name.trim(),
          description: description.trim() || null,
          status: status,
          endDate: endDate || null
        }
      } else if (currentUserRole === 'admin') {
        // Admin can edit everything except dates
        updateData = {
          name: name.trim(),
          description: description.trim() || null,
          status: status
        }
      } else if (currentUserRole === 'member') {
        // Member can only edit status
        updateData = {
          status: status
        }
      }

      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData)
      })

      const data = await response.json()

      if (response.ok) {
        addToast({ type: 'success', title: 'Berhasil', message: 'Project berhasil diperbarui' })
        router.push('/dashboard/projects')
      } else {
        setError(data.error || 'Gagal mengupdate project')
        addToast({ type: 'error', title: 'Gagal', message: data.error || 'Gagal mengupdate project' })
      }
    } catch (error) {
      console.error('Error updating project:', error)
      setError('Terjadi kesalahan saat mengupdate project')
      addToast({ type: 'error', title: 'Error', message: 'Terjadi kesalahan saat mengupdate project' })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteProject = async () => {
    if (!project) return
    setIsDeleting(true)
    try {
      const res = await fetch(`/api/projects/${project.id}`, { method: 'DELETE' })
      const data = await res.json()
      if (res.ok) {
        setProjectDeleteConfirm(false)
        // Redirect to projects list
        router.push('/dashboard/projects')
      } else {
        alert(data.error || t('failed_delete_project'))
      }
    } catch (e) {
      console.error('Error deleting project:', e)
      alert(t('error_deleting_project'))
    } finally {
      setIsDeleting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
      </div>
    )
  }

  if (accessDenied) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Akses Ditolak</h1>
          <p className="text-gray-600 mb-6">Anda tidak memiliki izin untuk mengedit project ini.</p>
          <Button
            onClick={() => router.back()}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-[8px]"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('back')}
          </Button>
        </div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Project Tidak Ditemukan</h1>
          <Button
            onClick={() => router.push('/dashboard/projects')}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-[8px]"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('back')} to {t('projects')}
          </Button>
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
                <h1 className="text-3xl font-bold text-gray-900">{t('edit project')}</h1>
                <p className="text-gray-600 text-sm mt-1">{t('edit project subtitle')}</p>
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
            <div className="p-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column */}
                <div className="space-y-6">
                  {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
                      <p className="text-sm text-red-600">{error}</p>
                    </div>
                  )}

                  {/* Project Name - Only Founder and Admin can edit */}
                  <div className="space-y-2">
                    <label htmlFor="name" className="block text-sm font-semibold text-gray-900">
                      {t('project name')} {canEditProjectDetails(currentUserRole) && <span className="text-red-500">*</span>}
                    </label>
                    <input
                      id="name"
                      type="text"
                      value={name}
                      onChange={handleNameChange}
                      className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500 hover:border-gray-400 ${
                        canEditProjectDetails(currentUserRole)
                          ? (errors.name ? 'border-red-300 bg-red-50' : 'border-gray-300')
                          : 'border-gray-300 bg-gray-50 text-gray-500'
                      }`}
                      disabled={!canEditProjectDetails(currentUserRole)}
                      placeholder={t('enter project name')}
                      aria-label="Project name"
                    />
                    {errors.name && canEditProjectDetails(currentUserRole) && (
                      <p className="text-sm text-red-600 flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                        {errors.name}
                      </p>
                    )}
                    {!canEditProjectDetails(currentUserRole) && (
                      <p className="text-xs text-gray-500">{t('only_founder_admin_can_edit')}</p>
                    )}
                  </div>

                  {/* Project Description - Founder and Admin can edit */}
                  <div className="space-y-2">
                    <label htmlFor="description" className="block text-sm font-semibold text-gray-900">
                      {t('description')}
                    </label>
                    <textarea
                      id="description"
                      value={description}
                      onChange={handleDescriptionChange}
                      rows={6}
                      className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500 resize-none hover:border-gray-400 ${
                        (currentUserRole === 'founder' || currentUserRole === 'admin')
                          ? 'border-gray-300'
                          : 'border-gray-300 bg-gray-50 text-gray-500'
                      }`}
                      placeholder={t('describe this project')}
                      disabled={currentUserRole === 'member'}
                      aria-label="Project description"
                    />
                    {currentUserRole === 'member' && (
                      <p className="text-xs text-gray-500">{t('only_founder_admin_can_edit')}</p>
                    )}
                    {(currentUserRole === 'founder' || currentUserRole === 'admin') && (
                      <p className="text-xs text-gray-500">{t('you can edit later')}</p>
                    )}
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  {/* Project Status - All roles can edit */}
                  <div className="space-y-2">
                    <label htmlFor="status" className="block text-sm font-semibold text-gray-900">
                      {t('project status')} <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="status"
                      value={status}
                      onChange={handleStatusChange}
                      className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 bg-white hover:border-gray-400 ${
                        errors.status ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                      aria-label="Select project status"
                    >
                      <option value="PLANNING">{t('planning')}</option>
                      <option value="ACTIVE">{t('active')}</option>
                      <option value="ON_HOLD">{t('on_hold')}</option>
                      <option value="COMPLETED">{t('completed')}</option>
                    </select>
                    {errors.status && (
                      <p className="text-sm text-red-600 flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                        {errors.status}
                      </p>
                    )}
                    {status === 'COMPLETED' && (
                      <p className="text-xs text-orange-600">⚠️ {t('project_completed_tasks_cannot_edit')}</p>
                    )}
                  </div>


                  {/* End Date - Only Founder can edit */}
                  <div className="space-y-2">
                    <label htmlFor="endDate" className="block text-sm font-semibold text-gray-900">
                      {t('end date')}
                    </label>
                    <input
                      type="date"
                      id="endDate"
                      value={endDate}
                      onChange={handleEndDateChange}
                      className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 hover:border-gray-400 ${
                        currentUserRole === 'founder'
                          ? (errors.endDate ? 'border-red-300 bg-red-50' : 'border-gray-300')
                          : 'border-gray-300 bg-gray-50 text-gray-500'
                      }`}
                      disabled={currentUserRole !== 'founder'}
                      aria-label="Project end date"
                    />
                    {errors.endDate && currentUserRole === 'founder' && (
                      <p className="text-sm text-red-600 flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                        {errors.endDate}
                      </p>
                    )}
                    {currentUserRole !== 'founder' && (
                      <p className="text-xs text-gray-500">{t('only_founder_can_edit_dates')}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="bg-gray-50 px-8 py-6">
              <div className="flex justify-between items-center">
                {/* Delete Button - Left side - Only for Founders */}
                <div>
                  {canDeleteProject(currentUserRole) && (
                    <Button
                      type="button"
                      onClick={() => setProjectDeleteConfirm(true)}
                      disabled={isDeleting}
                      variant="outline"
                      className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white border-red-600 hover:border-red-700 rounded-xl font-medium transition-all duration-200 shadow-sm hover:shadow-md"
                    >
                      {isDeleting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin mr-2"></div>
                          {t('deleting')}
                        </>
                      ) : (
                        <>
                          <Trash2 className="w-4 h-4 mr-2 text-white" />
                          {t('delete project')}
                        </>
                      )}
                    </Button>
                  )}
                </div>

                {/* Other buttons - Right side */}
                <div className="flex space-x-4">
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
                    disabled={
                      isSaving ||
                      (currentUserRole === 'founder' && (!name.trim() || !status)) ||
                      (currentUserRole === 'admin' && (!name.trim() || !status)) ||
                      (currentUserRole === 'member' && !status)
                    }
                    className="px-8 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    {isSaving ? (
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
            </div>
          </form>
        </div>
      </div>

      {/* Delete Project Confirmation Modal */}
      {projectDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {t('confirm delete project')}
            </h3>
            <p className="text-gray-600 mb-6">
              {t('are you sure delete project')} {t('delete project cannot be undone')}
            </p>
            <div className="flex space-x-3">
              <Button
                onClick={() => setProjectDeleteConfirm(false)}
                variant="outline"
                className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white border-yellow-500 hover:border-yellow-600"
              >
                {t('cancel')}
              </Button>
              <Button
                onClick={handleDeleteProject}
                className="flex-1 bg-red-600 hover:bg-red-700"
                disabled={isDeleting}
              >
                {isDeleting ? t('deleting') : t('delete project')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
