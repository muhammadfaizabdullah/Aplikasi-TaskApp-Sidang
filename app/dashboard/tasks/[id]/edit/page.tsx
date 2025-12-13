"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/Button"
import { ArrowLeft, Save, X, Trash2, Shield, Users, AlertCircle, Undo2 } from "lucide-react"
import { useLanguage } from "@/components/providers/LanguageProvider"
import { useToast } from "@/components/ui/Toaster"

interface Task {
  id: string
  title: string
  description?: string
  status: string
  priority: string
  dueDate?: string
  project: {
    id: string
    name: string
    status: string
  }
  assignees?: Array<{
    user: {
      id: string
      username: string
      name?: string
      image?: string
    }
  }>
  createdBy?: {
    id: string
    username: string
    name?: string
  }
}

interface UserPermissions {
  role: string
  canEditAll: boolean
  canEditStatusOnly: boolean
  canDelete: boolean
}

export default function EditTaskPage() {
  const router = useRouter()
  const params = useParams()
  const { data: session } = useSession()
  const { t } = useLanguage()
  const { addToast } = useToast()
  const taskId = params.id as string
  
  const [task, setTask] = useState<Task | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState("")
  const [projectCompleted, setProjectCompleted] = useState(false)
  const [errors, setErrors] = useState<{[key: string]: string}>({})
  const [userPermissions, setUserPermissions] = useState<UserPermissions>({
    role: 'MEMBER',
    canEditAll: false,
    canEditStatusOnly: false,
    canDelete: false
  })
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: "TODO",
    priority: "MEDIUM",
    dueDate: ""
  })
  const [assignees, setAssignees] = useState<string[]>([])
  const [projectMembers, setProjectMembers] = useState<Array<{
    id: string
    username: string
    name?: string
    image?: string
  }>>([])
  const [canUndo, setCanUndo] = useState(false)
  const [canRedo, setCanRedo] = useState(false)
  const [isUndoing, setIsUndoing] = useState(false)
  const [isRedoing, setIsRedoing] = useState(false)

  useEffect(() => {
    if (taskId) {
      fetchTask()
      checkUndoStatus()
    }
  }, [taskId])

  const fetchTask = async () => {
    try {
      setIsLoading(true)
      setError("")

      const response = await fetch(`/api/tasks/${taskId}`)
      if (response.ok) {
        const data = await response.json()
        setTask(data.task)

        // Check if project is completed
        if (data.task.project?.status === 'COMPLETED') {
          setProjectCompleted(true)
        }


        // Fetch user permissions for this project
        await fetchUserPermissions(data.task.project.id)

        setFormData({
          title: data.task.title,
          description: data.task.description || "",
          status: data.task.status,
          priority: data.task.priority,
          dueDate: data.task.dueDate ? new Date(data.task.dueDate).toISOString().split('T')[0] : ""
        })

        // Initialize assignees
        if (data.task.assignees) {
          setAssignees(data.task.assignees.map((assignee: any) => assignee.user.id))
        }

        // Fetch project members for assignee selection
        await fetchProjectMembers(data.task.project.id)
      } else {
        const data = await response.json()
        setError(data.error || "Gagal memuat task")
      }
    } catch (error) {
      console.error('Error fetching task:', error)
      setError("Terjadi kesalahan saat memuat task")
    } finally {
      setIsLoading(false)
    }
  }

  const fetchUserPermissions = async (projectId: string) => {
    try {
      // Fetch project data to get current user's membership
      const response = await fetch(`/api/projects/${projectId}`)
      if (response.ok) {
        const data = await response.json()
        // Find current user's membership in the project
        const currentUserMembership = data.project.members?.find((member: any) =>
          member.user?.email === session?.user?.email
        )

        const userRole = currentUserMembership?.role || 'MEMBER'

        // Determine permissions based on role
        const permissions: UserPermissions = {
          role: userRole,
          canEditAll: userRole === 'FOUNDER' || userRole === 'ADMIN',
          canEditStatusOnly: userRole === 'MEMBER',
          canDelete: userRole === 'FOUNDER'
        }

        console.log('Task Edit - User Permissions:', {
          userEmail: session?.user?.email,
          userRole,
          permissions,
          projectId
        })

        setUserPermissions(permissions)
      }
    } catch (error) {
      console.error('Error fetching user permissions:', error)
      // Default to member permissions if fetch fails
      setUserPermissions({
        role: 'MEMBER',
        canEditAll: false,
        canEditStatusOnly: true,
        canDelete: false
      })
    }
  }

  const fetchProjectMembers = async (projectId: string) => {
    try {
      const response = await fetch(`/api/projects/${projectId}`)
      if (response.ok) {
        const data = await response.json()
        const members = data.project.members?.map((member: any) => ({
          id: member.user.id,
          username: member.user.username,
          name: member.user.name,
          image: member.user.image
        })) || []
        setProjectMembers(members)
      }
    } catch (error) {
      console.error('Error fetching project members:', error)
    }
  }

  const checkUndoStatus = async () => {
    try {
      const response = await fetch(`/api/tasks/${taskId}/history?check=status`)
      if (response.ok) {
        const data = await response.json()
        setCanUndo(data.canUndo)
        setCanRedo(data.canRedo)
      }
    } catch (error) {
      console.error('Error checking undo status:', error)
      setCanUndo(false)
      setCanRedo(false)
    }
  }

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {}

    if (!formData.title.trim()) {
      newErrors.title = t('task_title_required')
    }

    if (!formData.status) {
      newErrors.status = t('task_status_required')
    }

    if (!formData.priority) {
      newErrors.priority = t('task_priority_required')
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Prevent submission if project is completed
    if (projectCompleted) {
      setError(t('task_cannot_edit_completed'))
      return
    }


    if (!validateForm()) {
      addToast({ type: 'error', title: t('validation_failed'), message: t('fill_required_fields') })
      return
    }

    setIsSaving(true)
    setError("")
    setErrors({})

    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          assigneeIds: assignees
        })
      })

      if (response.ok) {
        addToast({ type: 'success', title: t('success'), message: t('task_updated_successfully') })
        router.push(`/dashboard/projects/${task?.project?.id}`)
      } else {
        const data = await response.json()
        addToast({ type: 'error', title: t('failed'), message: data.error || t('failed_update_task') })
      }
    } catch (error) {
      console.error('Error updating task:', error)
      addToast({ type: 'error', title: t('error'), message: t('error_updating_task') })
    } finally {
      setIsSaving(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ""
      }))
    }
  }

  const handleUndo = async () => {
    setIsUndoing(true)
    try {
      const response = await fetch(`/api/tasks/${taskId}/history`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'undo' })
      })

      if (response.ok) {
        const data = await response.json()
        addToast({ type: 'success', title: t('success'), message: 'Perubahan berhasil di-undo' })

        // Redirect to project page to see the updated task status
        router.push(`/dashboard/projects/${task?.project?.id}`)
      } else {
        const data = await response.json()
        addToast({ type: 'error', title: t('failed'), message: data.error || 'Gagal melakukan undo' })
      }
    } catch (error) {
      console.error('Error undoing task change:', error)
      addToast({ type: 'error', title: t('error'), message: 'Terjadi kesalahan saat melakukan undo' })
    } finally {
      setIsUndoing(false)
    }
  }

  const handleRedo = async () => {
    setIsRedoing(true)
    try {
      const response = await fetch(`/api/tasks/${taskId}/history`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'redo' })
      })

      if (response.ok) {
        const data = await response.json()
        addToast({ type: 'success', title: t('success'), message: 'Perubahan berhasil di-redo' })

        // Redirect to project page to see the updated task status
        router.push(`/dashboard/projects/${task?.project?.id}`)
      } else {
        const data = await response.json()
        addToast({ type: 'error', title: t('failed'), message: data.error || 'Gagal melakukan redo' })
      }
    } catch (error) {
      console.error('Error redoing task change:', error)
      addToast({ type: 'error', title: t('error'), message: 'Terjadi kesalahan saat melakukan redo' })
    } finally {
      setIsRedoing(false)
    }
  }

  const handleDeleteTask = async () => {
    if (!confirm(t('are you sure delete task') + ` "${task?.title}"?`)) {
      return
    }

    setIsDeleting(true)
    setError("")

    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        addToast({ type: 'success', title: t('success'), message: t('task_deleted_successfully') })
        router.push(`/dashboard/projects/${task?.project?.id}`)
      } else {
        const data = await response.json()
        addToast({ type: 'error', title: t('failed'), message: data.error || t('failed_delete_task') })
      }
    } catch (error) {
      console.error('Error deleting task:', error)
      addToast({ type: 'error', title: t('error'), message: t('error_deleting_task') })
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

  if (!task) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">{t('project_not_found')}</p>
      </div>
    )
  }

  // Check if all required fields are filled
  const isFormValid = formData.title.trim() && formData.status && formData.priority

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
                <h1 className="text-3xl font-bold text-gray-900">{t('edit task title')}</h1>
                <p className="text-gray-600 text-sm mt-1">{t('edit task subtitle')} "{task.title}"</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* Undo Button */}
              <button
                onClick={handleUndo}
                disabled={isUndoing || !canUndo}
                className="bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 hover:shadow-lg hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                title={canUndo ? 'Undo last change' : 'No changes to undo'}
              >
                <Undo2 className="w-4 h-4 mr-2 text-white" />
                {t('undo')}
              </button>

              {/* Redo Button */}
              <button
                onClick={handleRedo}
                disabled={isRedoing || !canRedo}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 hover:shadow-lg hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                title={canRedo ? 'Redo last undone change' : 'No changes to redo'}
              >
                <svg className="w-4 h-4 mr-2 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12a9 9 0 0115-6.708L21 9m0 0l-6 6m6-6v6" />
                </svg>
                Redo
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <form onSubmit={handleSubmit} className="divide-y divide-gray-200">
            {/* Form Content */}
            <div className="p-6">
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-[8px]">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              {/* Project Completed Warning */}
              {projectCompleted && (
                <div className="mb-6">
                  <div className="p-3 bg-orange-50 border border-orange-200 rounded-[8px]">
                    <div className="flex items-center">
                      <AlertCircle className="w-4 h-4 text-orange-600 mr-2" />
                      <p className="text-xs text-orange-800 font-medium">
                        {t('project_completed_warning')}
                      </p>
                    </div>
                    <p className="text-xs text-orange-700 mt-1">
                      {t('project_completed_desc').replace('{projectName}', task?.project?.name || '')}
                    </p>
                  </div>
                </div>
              )}


              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-4">
                  {/* Task Title */}
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                      {t('task title')} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="title"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-[8px] focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        projectCompleted || !userPermissions.canEditAll
                          ? 'bg-gray-50 text-gray-500 cursor-not-allowed border-gray-300'
                          : (errors.title ? 'border-red-300 bg-red-50' : 'border-gray-300')
                      }`}
                      placeholder={t('enter task title')}
                      disabled={projectCompleted || !userPermissions.canEditAll}
                    />
                    {errors.title && userPermissions.canEditAll && !projectCompleted && (
                      <p className="text-sm text-red-600 flex items-center mt-1">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                        {errors.title}
                      </p>
                    )}
                    {!userPermissions.canEditAll && (
                      <p className="text-xs text-gray-500 mt-1">{t('only_founder_admin_edit_title')}</p>
                    )}
                  </div>

                  {/* Task Description */}
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                      {t('task description')}
                    </label>
                    <textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      rows={4}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-[8px] focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        projectCompleted || !userPermissions.canEditAll ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : ''
                      }`}
                      placeholder={t('describe this task')}
                      disabled={projectCompleted || !userPermissions.canEditAll}
                    />
                    {!userPermissions.canEditAll && (
                      <p className="text-xs text-gray-500 mt-1">{t('only_founder_admin_edit_desc')}</p>
                    )}
                  </div>

                  {/* Project Display */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('projects')}
                    </label>
                    <div className="w-full px-3 py-2 border border-gray-300 rounded-[8px] bg-gray-50 text-gray-700">
                      {task.project.name}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{t('project cannot be changed')}</p>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  {/* Task Status */}
                  <div>
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                      {t('status')} <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="status"
                      value={formData.status}
                      onChange={(e) => handleInputChange('status', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-[8px] focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        projectCompleted
                          ? 'bg-gray-50 text-gray-500 cursor-not-allowed border-gray-300'
                          : (errors.status ? 'border-red-300 bg-red-50' : 'border-gray-300')
                      }`}
                      disabled={projectCompleted}
                    >
                      <option value="TODO">{t('pending')}</option>
                      <option value="IN_PROGRESS">{t('in_progress')}</option>
                      <option value="REVIEW">Review</option>
                      <option value="COMPLETED">{t('completed')}</option>
                    </select>
                    {errors.status && !projectCompleted && (
                      <p className="text-sm text-red-600 flex items-center mt-1">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                        {errors.status}
                      </p>
                    )}
                    {userPermissions.canEditStatusOnly && (
                      <p className="text-xs text-blue-600 mt-1">{t('member_can_edit_status')}</p>
                    )}
                  </div>

                  {/* Task Priority */}
                  <div>
                    <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
                      {t('task priority')} <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="priority"
                      value={formData.priority}
                      onChange={(e) => handleInputChange('priority', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-[8px] focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        projectCompleted || !userPermissions.canEditAll
                          ? 'bg-gray-50 text-gray-500 cursor-not-allowed border-gray-300'
                          : (errors.priority ? 'border-red-300 bg-red-50' : 'border-gray-300')
                      }`}
                      disabled={projectCompleted || !userPermissions.canEditAll}
                    >
                      <option value="LOW">{t('low')}</option>
                      <option value="MEDIUM">{t('medium')}</option>
                      <option value="HIGH">{t('high')}</option>
                      <option value="URGENT">{t('urgent')}</option>
                    </select>
                    {errors.priority && userPermissions.canEditAll && !projectCompleted && (
                      <p className="text-sm text-red-600 flex items-center mt-1">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                        {errors.priority}
                      </p>
                    )}
                    {!userPermissions.canEditAll && (
                      <p className="text-xs text-gray-500 mt-1">{t('only_founder_admin_edit_priority')}</p>
                    )}
                  </div>

                  {/* Due Date */}
                  <div>
                    <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-1">
                      {t('end date')}
                    </label>
                    <input
                      type="date"
                      id="dueDate"
                      value={formData.dueDate}
                      onChange={(e) => handleInputChange('dueDate', e.target.value)}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-[8px] focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        projectCompleted || !userPermissions.canEditAll ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : ''
                      }`}
                      disabled={projectCompleted || !userPermissions.canEditAll}
                    />
                    {!userPermissions.canEditAll && (
                      <p className="text-xs text-gray-500 mt-1">{t('only_founder_admin_edit_due_date')}</p>
                    )}
                  </div>

                  {/* Assignee Selection - Only for Founder and Admin */}
                  {userPermissions.canEditAll && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('assign to')}
                      </label>
                      <div className="space-y-2">
                        <p className="text-xs text-gray-600">
                          {t('select team members')}
                        </p>
                        
                        {/* Select All Checkbox */}
                        {projectMembers.length > 0 && (
                          <div className="border border-gray-200 rounded-[8px] p-2 bg-gray-50">
                            <label className="flex items-center space-x-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={assignees.length === projectMembers.length && projectMembers.length > 0}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setAssignees(projectMembers.map(member => member.id))
                                  } else {
                                    setAssignees([])
                                  }
                                }}
                                className="w-4 h-4 rounded border-gray-300 hover:border-gray-400 text-blue-600 focus:ring-blue-500"
                              />
                              <span className="text-xs font-medium text-gray-700">
                                {assignees.length === projectMembers.length && projectMembers.length > 0
                                  ? t('deselect all')
                                  : t('select all')
                                }
                              </span>
                            </label>
                          </div>
                        )}
                        
                        <div className="max-h-32 overflow-y-auto border border-gray-200 rounded-[8px] p-2 space-y-1 bg-white">
                          {projectMembers.map((member) => (
                            <label key={member.id} className="flex items-center space-x-2 p-1 hover:bg-gray-50 rounded-[8px] cursor-pointer">
                              <input
                                type="checkbox"
                                checked={assignees.includes(member.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setAssignees(prev => [...prev, member.id])
                                  } else {
                                    setAssignees(prev => prev.filter(id => id !== member.id))
                                  }
                                }}
                                className="w-4 h-4 rounded border-gray-300 hover:border-gray-400 text-blue-600 focus:ring-blue-500"
                              />
                              <span className="text-xs text-gray-700">
                                {member.username}
                              </span>
                            </label>
                          ))}
                          {projectMembers.length === 0 && (
                            <div className="text-xs text-gray-500 p-2 text-center rounded-[8px]">
                              {t('no_members_available')}
                            </div>
                          )}
                        </div>
                        
                        {assignees.length > 0 && (
                          <div className="text-xs text-blue-600 font-medium bg-blue-50 px-2 py-1 rounded-[8px]">
                            {assignees.length} {t('lang') === 'id' ? 'dari' : 'of'} {projectMembers.length} {t('members_selected')}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Current Assignees Display - For non-editable view */}
                  {!userPermissions.canEditAll && task?.assignees && task.assignees.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('assigned_to')}
                      </label>
                      <div className="max-h-32 overflow-y-auto border border-gray-200 rounded-[8px] p-2 space-y-1 bg-gray-50">
                        {task.assignees.map((assignee: any) => (
                          <div key={assignee.user.id} className="flex items-center space-x-2 p-1">
                            <span className="text-xs text-gray-700">
                              {assignee.user.username}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="bg-gray-50 px-6 py-4">
              <div className="flex justify-between items-center">
                {/* Delete Button - Only for Founders - Left side */}
                <div>
                  {userPermissions.canDelete && !projectCompleted && (
                    <Button
                      type="button"
                      onClick={handleDeleteTask}
                      disabled={isDeleting}
                      variant="outline"
                      className="bg-red-600 hover:bg-red-700 text-white border-red-600 hover:border-red-700 rounded-[8px] transition-all duration-200 hover:shadow-lg hover:scale-105"
                    >
                      {isDeleting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin mr-2"></div>
                          {t('deleting_task')}
                        </>
                      ) : (
                        <>
                          <Trash2 className="w-4 h-4 mr-2 text-white" />
                          {t('delete task')}
                        </>
                      )}
                    </Button>
                  )}
                </div>

                {/* Other buttons - Right side */}
                <div className="flex space-x-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white border-yellow-500 hover:border-yellow-600 rounded-[8px] transition-all duration-200 hover:shadow-lg hover:scale-105"
                  >
                    {t('cancel')}
                  </Button>
  
                  <Button
                    type="submit"
                    disabled={
                      isSaving ||
                      projectCompleted ||
                      (!userPermissions.canEditAll && !userPermissions.canEditStatusOnly) ||
                      !isFormValid
                    }
                    className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-[8px] transition-all duration-200 hover:shadow-lg hover:scale-105"
                  >
                    {isSaving ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      </div>
                    ) : projectCompleted ? (
                      <div className="flex items-center">
                        <X className="w-4 h-4 mr-2" />
                        {t('cannot_edit')}
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
    </div>
  )
}
