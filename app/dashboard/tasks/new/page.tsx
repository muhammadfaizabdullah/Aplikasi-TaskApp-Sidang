"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/Toaster"
import { Button } from "@/components/ui/Button"
import { Card, FieldLabel, FieldHint, FormGrid, FormRow } from "@/components/ui/Form"
import { ArrowLeft, Plus } from "lucide-react"
import { useLanguage } from "@/components/providers/LanguageProvider"

interface Project {
  id: string
  name: string
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
}

export default function NewTaskPage() {
  const router = useRouter()
  const { addToast } = useToast()
  const { t } = useLanguage()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [projectId, setProjectId] = useState("")
  const [assigneeIds, setAssigneeIds] = useState<string[]>([])
  const [status, setStatus] = useState("TODO")
  const [priority, setPriority] = useState("MEDIUM")
  const [dueDate, setDueDate] = useState("")
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState("")
  const [errors, setErrors] = useState<{[key: string]: string}>({})

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    try {
      setIsLoading(true)
      setError("")
      
      const response = await fetch('/api/projects')
      if (response.ok) {
        const data = await response.json()
        setProjects(data.projects || [])
      } else {
        setError("Gagal memuat data projects")
      }
    } catch (error) {
      console.error('Error fetching projects:', error)
      setError("Terjadi kesalahan saat memuat data projects")
    } finally {
      setIsLoading(false)
    }
  }

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {}

    if (!title.trim()) {
      newErrors.title = "Judul task wajib diisi"
    }

    if (!projectId) {
      newErrors.projectId = "Project wajib dipilih"
    }

    if (!status) {
      newErrors.status = "Status task wajib dipilih"
    }

    if (!priority) {
      newErrors.priority = "Prioritas task wajib dipilih"
    }

    if (!dueDate) {
      newErrors.dueDate = "Tanggal deadline wajib diisi"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      setError("Mohon lengkapi semua field yang wajib diisi")
      return
    }

    setIsSaving(true)
    setError("")
    setErrors({})

    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || null,
          projectId: projectId,
          assigneeIds: assigneeIds,
          status: status,
          priority: priority,
          dueDate: dueDate || null
        })
      })

      const data = await response.json()

      if (response.ok) {
        addToast({ type: 'success', title: 'Berhasil', message: 'Task berhasil dibuat' })
        router.push(`/dashboard/projects/${projectId}`)
      } else {
        setError(data.error || 'Gagal membuat task')
        addToast({ type: 'error', title: 'Gagal', message: data.error || 'Gagal membuat task' })
      }
    } catch (error) {
      console.error('Error creating task:', error)
      setError('Terjadi kesalahan saat membuat task')
      addToast({ type: 'error', title: 'Error', message: 'Terjadi kesalahan saat membuat task' })
    } finally {
      setIsSaving(false)
    }
  }

  const selectedProject = projects.find(p => p.id === projectId)
  const availableAssignees = selectedProject?.members || []

  const handleInputChange = (field: string, value: string) => {
    // Update the appropriate state based on field
    switch (field) {
      case 'title':
        setTitle(value)
        break
      case 'description':
        setDescription(value)
        break
      case 'projectId':
        setProjectId(value)
        setAssigneeIds([]) // Clear assignees when project changes
        break
      case 'status':
        setStatus(value)
        break
      case 'priority':
        setPriority(value)
        break
      case 'dueDate':
        setDueDate(value)
        break
    }

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ""
      }))
    }
  }

  // Helper function to clean username from unwanted suffixes
  const cleanUsername = (username: string) => {
    if (!username) return ''
    
    // Remove common image file extensions and suffixes
    let cleaned = username
      .replace(/\.(png|jpg|jpeg|gif|webp)$/i, '') // Remove file extensions
      .replace(/-png$/, '') // Remove -png suffix
      .replace(/-jpg$/, '') // Remove -jpg suffix
      .replace(/-jpeg$/, '') // Remove -jpeg suffix
      .replace(/-gif$/, '') // Remove -gif suffix
      .replace(/-webp$/, '') // Remove -webp suffix
      .replace(/-image$/, '') // Remove -image suffix
      .replace(/-img$/, '') // Remove -img suffix
    
    return cleaned
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
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
                <h1 className="text-3xl font-bold text-gray-900">{t('create new task')}</h1>
                <p className="text-gray-600 text-sm mt-1">{t('create new task subtitle')}</p>
              </div>
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
                        value={title}
                        onChange={(e) => handleInputChange('title', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-[8px] focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          errors.title ? 'border-red-300 bg-red-50' : 'border-gray-300'
                        }`}
                        placeholder={t('enter task title')}
                      />
                      {errors.title && (
                        <p className="text-sm text-red-600 flex items-center mt-1">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                          </svg>
                          {errors.title}
                        </p>
                      )}
                    </div>

                    {/* Task Description */}
                    <div>
                      <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                        {t('task description')}
                      </label>
                      <textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-[8px] focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder={t('describe this task')}
                      />
                    </div>

                    {/* Project Selection */}
                    <div>
                      <label htmlFor="project" className="block text-sm font-medium text-gray-700 mb-1">
                        {t('projects')} <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="project"
                        value={projectId}
                        onChange={(e) => handleInputChange('projectId', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-[8px] focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          errors.projectId ? 'border-red-300 bg-red-50' : 'border-gray-300'
                        }`}
                      >
                        <option value="">{t('select project')}</option>
                        {projects.map((project) => (
                          <option key={project.id} value={project.id}>
                            {project.name}
                          </option>
                        ))}
                      </select>
                      {errors.projectId && (
                        <p className="text-sm text-red-600 flex items-center mt-1">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                          </svg>
                          {errors.projectId}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-4">
                    {/* Status */}
                    <div>
                      <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                        {t('status')} <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="status"
                        value={status}
                        onChange={(e) => handleInputChange('status', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-[8px] focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          errors.status ? 'border-red-300 bg-red-50' : 'border-gray-300'
                        }`}
                      >
                        <option value="TODO">{t('pending')}</option>
                        <option value="IN_PROGRESS">{t('in_progress')}</option>
                        <option value="REVIEW">Review</option>
                        <option value="COMPLETED">{t('completed')}</option>
                      </select>
                      {errors.status && (
                        <p className="text-sm text-red-600 flex items-center mt-1">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                          </svg>
                          {errors.status}
                        </p>
                      )}
                    </div>

                    {/* Priority */}
                    <div>
                      <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
                        {t('task priority')} <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="priority"
                        value={priority}
                        onChange={(e) => handleInputChange('priority', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-[8px] focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          errors.priority ? 'border-red-300 bg-red-50' : 'border-gray-300'
                        }`}
                      >
                        <option value="LOW">{t('low')}</option>
                        <option value="MEDIUM">{t('medium')}</option>
                        <option value="HIGH">{t('high')}</option>
                        <option value="URGENT">{t('urgent')}</option>
                      </select>
                      {errors.priority && (
                        <p className="text-sm text-red-600 flex items-center mt-1">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                          </svg>
                          {errors.priority}
                        </p>
                      )}
                    </div>

                    {/* Due Date - Using standardized label */}
                    <div>
                      <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-1">
                        {t('end date')} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        id="dueDate"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        className={`w-full px-3 py-2 border rounded-[8px] focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          errors.dueDate ? 'border-red-300 bg-red-50' : 'border-gray-300'
                        }`}
                      />
                      {errors.dueDate && (
                        <p className="text-sm text-red-600 flex items-center mt-1">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                          </svg>
                          {errors.dueDate}
                        </p>
                      )}
                    </div>

                    {/* Assignee Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('assign to')}
                      </label>
                      <div className="space-y-2">
                        <p className="text-xs text-gray-600">
                          {t('select team members')}
                        </p>
                        
                        {/* Select All Checkbox */}
                        {availableAssignees.length > 0 && (
                          <div className="border border-gray-200 rounded-[8px] p-2 bg-gray-50">
                            <label className="flex items-center space-x-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={assigneeIds.length === availableAssignees.length && availableAssignees.length > 0}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setAssigneeIds(availableAssignees.map(member => member.user.id))
                                  } else {
                                    setAssigneeIds([])
                                  }
                                }}
                                className="w-4 h-4 rounded border-gray-300 hover:border-gray-400 text-blue-600 focus:ring-blue-500"
                              />
                              <span className="text-xs font-medium text-gray-700">
                                {assigneeIds.length === availableAssignees.length && availableAssignees.length > 0
                                  ? t('deselect all')
                                  : t('select all')
                                }
                              </span>
                            </label>
                          </div>
                        )}
                        
                        <div className="max-h-32 overflow-y-auto border border-gray-200 rounded-[8px] p-2 space-y-1 bg-white">
                          {availableAssignees.map((member) => (
                            <label key={member.user.id} className="flex items-center space-x-2 p-1 hover:bg-gray-50 rounded-[8px] cursor-pointer">
                              <input
                                type="checkbox"
                                checked={assigneeIds.includes(member.user.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setAssigneeIds([...assigneeIds, member.user.id])
                                  } else {
                                    setAssigneeIds(assigneeIds.filter(id => id !== member.user.id))
                                  }
                                }}
                                className="w-4 h-4 rounded border-gray-300 hover:border-gray-400 text-blue-600 focus:ring-blue-500"
                              />
                              <span className="text-xs text-gray-700">
                                {cleanUsername(member.user.username)}
                                <span className="text-gray-500 ml-1">({member.role})</span>
                              </span>
                            </label>
                          ))}
                          {availableAssignees.length === 0 && (
                            <div className="text-xs text-gray-500 p-2 text-center rounded-[8px]">
                              {t('select project first')}
                            </div>
                          )}
                        </div>
                        
                        {assigneeIds.length > 0 && (
                          <div className="text-xs text-blue-600 font-medium bg-blue-50 px-2 py-1 rounded-[8px]">
                            {assigneeIds.length} {t('lang') === 'id' ? 'dari' : 'of'} {availableAssignees.length} {t('members_selected')}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="bg-gray-50 px-6 py-4">
                <div className="flex justify-end space-x-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white border-yellow-500 hover:border-yellow-600"
                  >
                    {t('cancel')}
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSaving || !title.trim() || !projectId || !status || !priority || !dueDate}
                    className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {isSaving ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <Plus className="w-4 h-4 mr-2" />
                        {t('create task')}
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
