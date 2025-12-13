"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/Button"
import { Avatar } from "@/components/ui/Avatar"
import { ArrowLeft, Edit, Users, Calendar, CheckCircle, Clock, AlertCircle, Plus, User, Crown, Shield, Trash2, UserMinus, Undo2, Redo2, UserRoundMinus } from "lucide-react"
import { useRouter, useParams } from "next/navigation"
import { useSession } from "next-auth/react"
import { useLanguage } from "@/components/providers/LanguageProvider"
import { useToast } from "@/components/ui/Toaster"
import { 
  canEditRole, 
  canAddRemoveMembers, 
  canEditProject, 
  canDeleteProject, 
  canAssignTasks,
  canEditProjectDetails,
  canEditProjectStatus,
  isFounder,
  isAdmin,
  isMember
} from "@/lib/utils"

interface Task {
  id: string
  title: string
  description?: string
  status: string
  priority: string
  dueDate?: string
  assignees: {
    user: {
      id: string
      username: string
      name?: string
      image?: string
    }
  }[]
}

interface ProjectMember {
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

interface Project {
  id: string
  name: string
  description?: string
  status: string
  createdAt: string
  founder: {
    id: string
    username: string
    name?: string
    email: string
    image?: string
  }
  members: ProjectMember[]
  tasks: Task[]
}

export default function ProjectDetailPage() {
  const { data: session } = useSession()
  const { t, lang } = useLanguage()
  const [project, setProject] = useState<Project | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [deleteConfirm, setDeleteConfirm] = useState<{ memberId: string; userName: string } | null>(null)
  const [deleteTaskConfirm, setDeleteTaskConfirm] = useState<{ taskId: string; taskTitle: string } | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isDeletingTask, setIsDeletingTask] = useState(false)
  const [projectDeleteConfirm, setProjectDeleteConfirm] = useState<boolean>(false)
  const [isProjectDeleting, setIsProjectDeleting] = useState<boolean>(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [history, setHistory] = useState<any[]>([])
  const [isUndoRedoLoading, setIsUndoRedoLoading] = useState(false)
  const [undoRedoStatus, setUndoRedoStatus] = useState({
    canUndo: false,
    canRedo: false
  })
  const router = useRouter()
  const params = useParams()
  const projectId = params.id as string
  const { addToast } = useToast()

  // Get current user's role in this project
  const getCurrentUserRole = (): string | null => {
    if (!project || !session?.user?.email) return null
    
    // Check if user is founder
    if (project.founder.email === session.user.email) {
      console.log('User is founder:', session.user.email)
      return 'founder'
    }
    
    // Check if user is a member
    const member = project.members.find(m => m.user.email === session.user.email)
    if (member) {
      console.log('User is member with role:', member.role, 'for user:', session.user.email)
      return member.role.toLowerCase()
    }
    
    console.log('User not found in project:', session.user.email)
    return null
  }

  const currentUserRole = getCurrentUserRole()
  
  // Debug logging
  useEffect(() => {
    if (project && session?.user?.email) {
      console.log('Current user email:', session.user.email)
      console.log('Project founder email:', project.founder.email)
      console.log('Project members:', project.members.map(m => ({ email: m.user.email, role: m.role })))
      console.log('Current user role:', currentUserRole)
    }
  }, [project, session, currentUserRole])

  // Debug logging to check current language
  useEffect(() => {
    console.log('Current language:', lang)
  }, [lang])

  useEffect(() => {
    fetchProject()
    fetchHistory()
    fetchUndoRedoStatus()
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

  const fetchHistory = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}/history`)
      if (response.ok) {
        const data = await response.json()
        setHistory(data.history)
      }
    } catch (error) {
      console.error('Error fetching history:', error)
    }
  }

  const fetchUndoRedoStatus = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}/history?check=status`)
      if (response.ok) {
        const data = await response.json()
        console.log('Undo/Redo Status Response:', data)
        setUndoRedoStatus({
          canUndo: data.canUndo,
          canRedo: data.canRedo
        })
        console.log('Updated undoRedoStatus:', { canUndo: data.canUndo, canRedo: data.canRedo })
      } else {
        console.error('API Error:', response.status, response.statusText)
      }
    } catch (error) {
      console.error('Error fetching undo/redo status:', error)
      setUndoRedoStatus({
        canUndo: false,
        canRedo: false
      })
    }
  }

  const handleUndo = async () => {
    try {
      setIsUndoRedoLoading(true)
      const response = await fetch(`/api/projects/${projectId}/history`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'undo' })
      })

      if (response.ok) {
        const data = await response.json()
        addToast({
          type: 'success',
          title: t('success'),
          message: data.message
        })
        // Refresh project and history
        await fetchProject()
        await fetchHistory()
        await fetchUndoRedoStatus() // This should make redo active and undo disabled
        console.log('After undo - should be: Undo disabled, Redo active')
      } else {
        const error = await response.json()
        addToast({
          type: 'error',
          title: t('failed'),
          message: error.error
        })
      }
    } catch (error) {
      console.error('Error undoing change:', error)
      addToast({
        type: 'error',
        title: 'Gagal',
        message: t('undo_failed')
      })
    } finally {
      setIsUndoRedoLoading(false)
    }
  }

  const handleRedo = async () => {
    try {
      setIsUndoRedoLoading(true)
      const response = await fetch(`/api/projects/${projectId}/history`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'redo' })
      })

      if (response.ok) {
        const data = await response.json()
        addToast({
          type: 'success',
          title: t('success'),
          message: data.message
        })
        // Refresh project and history
        await fetchProject()
        await fetchHistory()
        await fetchUndoRedoStatus() // This should make undo active and redo disabled
        console.log('After redo - should be: Undo active, Redo disabled')
      } else {
        const error = await response.json()
        addToast({
          type: 'error',
          title: t('failed'),
          message: error.error
        })
      }
    } catch (error) {
      console.error('Error redoing change:', error)
      addToast({
        type: 'error',
        title: 'Gagal',
        message: t('redo_failed')
      })
    } finally {
      setIsUndoRedoLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-blue-100 text-blue-800'
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800'
      case 'REVIEW':
        return 'bg-yellow-100 text-yellow-800'
      case 'TODO':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return t('completed')
      case 'IN_PROGRESS':
        return t('in_progress')
      case 'REVIEW':
        return t('review')
      case 'TODO':
        return t('pending')
      default:
        return status
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH':
      case 'URGENT':
        return 'bg-red-100 text-red-800'
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800'
      case 'LOW':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return t('high')
      case 'URGENT':
        return t('urgent')
      case 'MEDIUM':
        return t('medium')
      case 'LOW':
        return t('low')
      default:
        return priority
    }
  }

  const getProjectStatusText = (status: string) => {
    switch (status) {
      case 'PLANNING':
        return t('planning')
      case 'ACTIVE':
        return t('active')
      case 'ON_HOLD':
        return t('on_hold')
      case 'COMPLETED':
        return t('completed')
      default:
        return status
    }
  }

  const handleRemoveMember = async (memberId: string) => {
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/projects/${projectId}/members/${memberId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        // Remove member from state
        setProject(prev => prev ? {
          ...prev,
          members: prev.members.filter(m => m.id !== memberId)
        } : null)
        setDeleteConfirm(null)
        addToast({ type: 'success', title: t('success'), message: t('member removed successfully') })
      } else {
        const data = await response.json()
        addToast({ type: 'error', title: t('failed'), message: data.error || t('failed_remove_member') })
      }
    } catch (error) {
      console.error('Error removing member:', error)
      addToast({ type: 'error', title: t('error'), message: t('error_removing_member') })
    } finally {
      setIsDeleting(false)
    }
  }

  const handleDeleteTask = async (taskId: string) => {
    setIsDeletingTask(true)
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        // Remove task from state
        setProject(prev => prev ? {
          ...prev,
          tasks: prev.tasks.filter(t => t.id !== taskId)
        } : null)
        setDeleteTaskConfirm(null)
        addToast({ type: 'success', title: t('success'), message: t('task_deleted_successfully') })
      } else {
        const data = await response.json()
        addToast({ type: 'error', title: t('failed'), message: data.error || t('failed_delete_task') })
      }
    } catch (error) {
      console.error('Error deleting task:', error)
      addToast({ type: 'error', title: t('error'), message: t('error_deleting_task') })
    } finally {
      setIsDeletingTask(false)
    }
  }

  const handleDeleteProject = async () => {
    if (!project) return
    setIsProjectDeleting(true)
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
      setIsProjectDeleting(false)
    }
  }

  const canManageMember = (member: ProjectMember) => {
    const hasPermission = canAddRemoveMembers(currentUserRole)
    console.log('canManageMember:', { currentUserRole, memberRole: member.role, hasPermission })
    return hasPermission
  }

  const canRemoveMember = (member: ProjectMember) => {
    if (!session?.user?.email) return false
    
    // Cannot remove yourself
    if (member.user.email === session.user.email) {
      console.log('Cannot remove yourself')
      return false
    }
    
    // Cannot remove founder
    if (isFounder(member.role)) {
      console.log('Cannot remove founder')
      return false
    }
    
    const hasPermission = canAddRemoveMembers(currentUserRole)
    console.log('canRemoveMember:', { currentUserRole, memberRole: member.role, hasPermission })
    return hasPermission
  }

  const canChangeRole = (member: ProjectMember) => {
    if (!session?.user?.email) return false
    
    // Cannot change founder role (except by founder)
    if (isFounder(member.role) && !isFounder(currentUserRole)) {
      console.log('Cannot change founder role (not founder)')
      return false
    }
    
    const hasPermission = canEditRole(currentUserRole, member.role, session.user.id, member.user.id)
    console.log('canChangeRole:', { 
      currentUserRole, 
      memberRole: member.role, 
      currentUserId: session.user.id, 
      targetUserId: member.user.id, 
      hasPermission 
    })
    return hasPermission
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'FOUNDER':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'ADMIN':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'MEMBER':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
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
    
    // Debug logging
    if (username !== cleaned) {
      console.log(`Cleaned username: "${username}" -> "${cleaned}"`)
    }
    
    return cleaned
  }

  const getProjectProgress = () => {
    if (!project || project.tasks.length === 0) return 0
    
    const completedTasks = project.tasks.filter(task => task.status === 'COMPLETED').length
    return Math.round((completedTasks / project.tasks.length) * 100)
  }

  // Helper function to check if all tasks are completed
  const areAllTasksCompleted = () => {
    if (!project || project.tasks.length === 0) {
      return false; // Cannot delete if no tasks
    }
    return project.tasks.every(task => task.status === 'COMPLETED');
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">{t('project_not_found')}</h1>
          <p className="text-gray-600 mb-6">{t('project_not_found_desc')}</p>
          <Button onClick={() => router.push('/dashboard/projects')}>
            {t('back_to_projects')}
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
            onClick={() => router.push('/dashboard/projects')}
            className="bg-[#F9A600] hover:bg-[#F9A600]/90 text-white px-3 py-2 rounded-[8px] text-sm w-auto flex items-center justify-center"
          >
            <ArrowLeft className="w-4 h-4 mr-2 text-white" />
            {t('back')}
          </Button>
          <div className="flex-1">
            <h1 className="text-lg sm:text-xl font-bold text-gray-900">{project.name}</h1>
            {project.description && (
              <p className="text-gray-600 mt-1 text-xs sm:text-sm">{project.description}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Undo/Redo buttons - only for founder and admin */}
          {(currentUserRole === 'founder' || currentUserRole === 'admin') && (
            <>
              <Button
                onClick={handleUndo}
                disabled={isUndoRedoLoading || !undoRedoStatus.canUndo}
                className="bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-3 py-2 rounded-[8px] text-sm"
                title={undoRedoStatus.canUndo ? 'Undo last change' : 'No changes to undo'}
              >
                <Undo2 className="w-4 h-4 mr-1 text-white" />
                {t('undo')}
              </Button>
              <Button
                onClick={handleRedo}
                disabled={isUndoRedoLoading || !undoRedoStatus.canRedo}
                className="bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-3 py-2 rounded-[8px] text-sm"
                title={undoRedoStatus.canRedo ? 'Redo last undone change' : 'No changes to redo'}
              >
                <Redo2 className="w-4 h-4 mr-1 text-white" />
                {t('redo')}
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[calc(100vh-120px)]">
        {/* Main Content - Tasks */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-[8px] shadow-sm border border-gray-200 p-4 h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">{t('tasks label')}</h2>
              {canAssignTasks(currentUserRole) && (
                <Button
                  onClick={() => router.push('/dashboard/tasks/new')}
                  disabled={project.status === 'COMPLETED'}
                  className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white text-sm px-3 py-2"
                  title={project.status === 'COMPLETED' ? t('cannot_add_tasks_completed_project') : t('add task')}
                >
                  <Plus className="w-4 h-4 mr-2 text-white" />
                  {t('add task')}
                </Button>
              )}
            </div>

            {project.tasks.length === 0 ? (
              <div className="text-center py-6 flex-1 flex flex-col items-center justify-center">
                <CheckCircle className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                <h3 className="text-base font-medium text-gray-900 mb-2">{t('no_tasks_yet')}</h3>
                <p className="text-sm text-gray-600 mb-3">{t('start_by_creating_first_task')}</p>
                {canAssignTasks(currentUserRole) && (
                  <Button
                    onClick={() => router.push('/dashboard/tasks/new')}
                    disabled={project.status === 'COMPLETED'}
                    className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white text-sm px-4 py-2"
                    title={project.status === 'COMPLETED' ? t('cannot_add_tasks_completed_project') : t('add task')}
                  >
                    <Plus className="w-4 h-4 mr-2 text-white" />
                    Add Task
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-3 flex-1 overflow-y-auto">
                {project.tasks.map((task) => (
                  <div
                    key={task.id}
                    className="border border-gray-200 rounded-lg p-3 hover:shadow-sm transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 mb-1 text-sm">{task.title}</h3>
                        {task.description && (
                          <p className="text-xs text-gray-600 mb-2 line-clamp-2">{task.description}</p>
                        )}
                        <div className="flex items-center space-x-3 text-xs text-gray-500">
                          {task.assignees && task.assignees.length > 0 && (
                            <div className="flex items-center space-x-1">
                              <User className="w-3 h-3 text-blue-600" />
                              <span>
                                {task.assignees.length === 1
                                  ? (task.assignees[0].user.name || task.assignees[0].user.username)
                                  : `${task.assignees.length} ${t('assignees')}`
                                }
                              </span>
                            </div>
                          )}
                          {task.dueDate && (
                            <div className="flex items-center space-x-1">
                              <Calendar className="w-3 h-3 text-purple-600" />
                              <span>{new Date(task.dueDate).toLocaleDateString('id-ID')}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 ml-3">
                        <div className="flex items-center space-x-1">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(task.status)}`}>
                            {getStatusText(task.status)}
                          </span>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(task.priority)}`}>
                            {getPriorityText(task.priority)}
                          </span>
                        </div>
                        {/* Edit Task Button */}
                        <Button
                          onClick={() => router.push(`/dashboard/tasks/${task.id}/edit`)}
                          disabled={project.status === 'COMPLETED' || task.status === 'COMPLETED'}
                          variant="outline"
                          size="sm"
                          className="inline-flex items-center justify-center p-1.5 text-xs font-medium text-white bg-[#F9A600] border border-[#F9A600] rounded-[8px] hover:bg-[#F9A600]/90 hover:text-white hover:border-[#F9A600] focus:outline-none focus:ring-2 focus:ring-[#F9A600] focus:ring-offset-2 transition-all duration-200 hover:shadow-lg hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                          title={project.status === 'COMPLETED' || task.status === 'COMPLETED' ? t('cannot_edit_completed_task') : t('edit_task')}
                        >
                          <Edit className="w-3 h-3" />
                        </Button>

                        {/* Delete Task Button - Only for Founder and Admin */}
                        {(currentUserRole === 'founder' || currentUserRole === 'admin') && (
                          <Button
                            onClick={() => setDeleteTaskConfirm({
                              taskId: task.id,
                              taskTitle: task.title
                            })}
                            disabled={project.status === 'COMPLETED' || isDeletingTask}
                            variant="outline"
                            size="sm"
                            className="inline-flex items-center justify-center p-1.5 text-xs font-medium bg-red-600 hover:bg-red-700 text-white border-red-600 hover:border-red-700 rounded-[8px] focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-200 hover:shadow-lg hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                            title={project.status === 'COMPLETED' ? t('cannot_delete_tasks_completed_project') : t('delete task')}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* Action Buttons - Inside Task Card */}
            <div className="mt-4 pt-4 border-t border-gray-200 flex flex-col sm:flex-row flex-wrap gap-3">
              {/* Edit Project Button - All roles can edit */}
              {canEditProject(currentUserRole) && (
                <Button
                  onClick={() => router.push(`/dashboard/projects/${project.id}/edit`)}
                  disabled={project.status === 'COMPLETED'}
                  className="bg-[#F9A600] hover:bg-[#F9A600]/90 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-4 py-2 rounded-[8px] text-sm sm:text-base w-full sm:w-auto"
                  title={project.status === 'COMPLETED' ? t('cannot_edit_completed_project') : t('edit project')}
                >
                  <Edit className="w-4 h-4 mr-2 text-white" />
                  {t('edit project')}
                </Button>
              )}

              {/* Create Task Button - Only Founder and Admin */}
              {canAssignTasks(currentUserRole) && (
                <Button
                  onClick={() => router.push(`/dashboard/tasks/new?projectId=${project.id}`)}
                  disabled={project.status === 'COMPLETED'}
                  className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-4 py-2 rounded-[8px] text-sm sm:text-base w-full sm:w-auto"
                  title={project.status === 'COMPLETED' ? t('cannot_create_tasks_completed_project') : t('create task')}
                >
                  <Plus className="w-4 h-4 mr-2 text-white" />
                  {t('create task')}
                </Button>
              )}

              {/* Delete Project Button - Only Founder */}
              {canDeleteProject(currentUserRole) && (
                <Button
                  onClick={() => setProjectDeleteConfirm(true)}
                  disabled={project.status === 'COMPLETED' || !areAllTasksCompleted()}
                  className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white w-full sm:w-auto px-6 py-3 rounded-[8px] text-sm sm:text-base font-medium"
                  title={
                    project.status === 'COMPLETED' 
                      ? t('cannot_delete_completed_project') 
                      : !areAllTasksCompleted() 
                        ? t('cannot_delete_project_with_incomplete_tasks')
                        : t('delete project')
                  }
                >
                  <Trash2 className="w-4 h-4 mr-2 text-white" />
                  {t('delete project')}
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar - Project Info & Team */}
        <div className="flex flex-col space-y-4 h-full overflow-y-auto">
          {/* Project Information */}
          <div className="bg-white rounded-[8px] shadow-sm border border-gray-200 p-4">
            <h3 className="text-base font-semibold text-gray-900 mb-3">{t('project information')}</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600">{t('owner')}:</span>
                <span className="text-xs font-medium text-gray-900">
                  {project.founder?.name || cleanUsername(project.founder?.username || '') || t('no_name')}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600">{t('created')}:</span>
                <span className="text-xs font-medium text-gray-900">
                  {new Date(project.createdAt).toLocaleDateString('id-ID')}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600">{t('status')}:</span>
                <span className="text-xs font-medium text-gray-900">{getProjectStatusText(project.status)}</span>
              </div>
            </div>
          </div>

          {/* Team Members */}
          <div className="bg-white rounded-[8px] shadow-sm border border-gray-200 p-4">
            <h3 className="text-base font-semibold text-gray-900 mb-3">{t('team members')}</h3>
            <div className="space-y-2">
              {/* Founder - Always shown first */}
              <div className="flex items-center justify-between p-2 bg-purple-50 rounded-lg border border-purple-200">
                <div className="flex items-center space-x-2">
                  <Avatar
                    src={project.founder.image}
                    alt={project.founder.name || cleanUsername(project.founder.username)}
                    fallback={cleanUsername(project.founder.username)}
                    size="sm"
                    className="bg-purple-100 cursor-pointer hover:opacity-80 transition-opacity"
                    clickable={true}
                    onClick={() => router.push('/dashboard/settings')}
                  />
                  <div className="flex-1">
                    <p className="text-xs font-medium text-gray-900">
                      {project.founder.name || cleanUsername(project.founder.username) || t('no_name')}
                    </p>
                    <div className="flex items-center space-x-1 mt-1">
                      <span className="inline-flex items-center px-1.5 py-0.5 text-xs font-medium rounded-full border bg-purple-100 text-purple-800 border-purple-200">
                        <Crown className="w-3 h-3" />
                        <span className="ml-1">{t('founder')}</span>
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Founder cannot be edited or removed */}
                <div className="text-xs text-gray-500 italic">
                  {t('project owner')}
                </div>
              </div>

              {/* Members */}
              {project.members
                .filter(member => member.user.id !== project.founder.id) // Filter out founder from members list
                .map((member) => (
                <div key={member.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Avatar
                      src={member.user.image}
                      alt={member.user.name || cleanUsername(member.user.username)}
                      fallback={cleanUsername(member.user.username)}
                      size="sm"
                      className="bg-blue-100 cursor-pointer hover:opacity-80 transition-opacity"
                      clickable={true}
                      onClick={() => router.push('/dashboard/settings')}
                    />
                    <div className="flex-1">
                      <p className="text-xs font-medium text-gray-900">
                        {member.user.name || cleanUsername(member.user.username) || t('no_name')}
                      </p>
                      <div className="flex items-center space-x-1 mt-1">
                        <span className={`inline-flex items-center px-1.5 py-0.5 text-xs font-medium rounded-full border ${getRoleColor(member.role)}`}>
                          {getRoleIcon(member.role)}
                          <span className="ml-1">{member.role === 'MEMBER' ? t('member') : member.role}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  {canManageMember(member) && (
                    <div className="flex items-center space-x-2">
                      {canChangeRole(member) && (
                        <Button
                          onClick={() => router.push(`/dashboard/projects/${project.id}/edit-role/${member.id}`)}
                          disabled={isUpdating || project.status === 'COMPLETED'}
                          variant="outline"
                          size="sm"
                          className="inline-flex items-center justify-center p-2 text-sm font-medium text-white bg-[#F9A600] border border-[#F9A600] rounded-[8px] hover:bg-[#F9A600]/90 hover:text-white hover:border-[#F9A600] focus:outline-none focus:ring-2 focus:ring-[#F9A600] focus:ring-offset-2 transition-all duration-200 hover:shadow-lg hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                          title={project.status === 'COMPLETED' ? t('cannot_edit_roles_completed_project') : t('edit_role')}
                        >
                          <Edit className="w-4 h-4 text-white" />
                        </Button>
                      )}
                      
                      {canRemoveMember(member) && (
                        <Button
                          onClick={() => setDeleteConfirm({
                            memberId: member.id,
                            userName: member.user.name || cleanUsername(member.user.username)
                          })}
                          disabled={isDeleting || project.status === 'COMPLETED'}
                          variant="outline"
                          size="sm"
                          className="inline-flex items-center justify-center p-2 text-sm font-medium bg-red-600 hover:bg-red-700 text-white border-red-600 hover:border-red-700 rounded-[8px] focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-200 hover:shadow-lg hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                          title={project.status === 'COMPLETED' ? t('cannot_remove_members_completed_project') : t('remove_member')}
                        >
                          <UserRoundMinus className="w-4 h-4 text-white" />
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            {/* Add Member Button - Only for Founder and Admin */}
            {canAddRemoveMembers(currentUserRole) && (
              <Button
                onClick={() => router.push(`/dashboard/projects/${project.id}/add-member`)}
                disabled={project.status === 'COMPLETED'}
                variant="outline"
                className="w-full mt-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white border-green-600 text-sm py-2"
                title={project.status === 'COMPLETED' ? t('cannot_add_members_completed_project') : t('add member project')}
              >
                <Users className="w-4 h-4 mr-2 text-white" />
                {t('add member project')}
              </Button>
            )}
          </div>

          {/* Project History - Only for founder and admin */}
          {(currentUserRole === 'founder' || currentUserRole === 'admin') && (
            <div className="bg-white rounded-[8px] shadow-sm border border-gray-200 p-4 flex-1 flex flex-col">
              <h3 className="text-base font-semibold text-gray-900 mb-3">{t('project history')}</h3>
              <div className="space-y-2 flex-1 overflow-y-auto">
                {history.length === 0 ? (
                  <p className="text-xs text-gray-500 text-center py-2">{t('no changes yet')}</p>
                ) : (
                  history.map((change, index) => (
                    <div key={change.id} className="flex items-start space-x-2 p-2 bg-gray-50 rounded-[8px] text-xs">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">
                          {change.action === 'STATUS_CHANGE' && t('status_changed')}
                          {change.action === 'NAME_CHANGE' && t('name_changed')}
                          {change.action === 'DESCRIPTION_CHANGE' && t('description_changed')}
                          {change.action === 'TASK_TITLE_CHANGED' && t('task_title_changed')}
                          {change.action === 'TASK_DESCRIPTION_CHANGED' && t('task_description_changed')}
                          {change.action === 'TASK_STATUS_CHANGED' && t('task_status_changed')}
                          {change.action === 'TASK_PRIORITY_CHANGED' && t('task_priority_changed')}
                        </div>
                        <div className="text-gray-600 mt-1">
                          {change.action === 'STATUS_CHANGE' && (
                            <span>
                              {change.oldValue} → {change.newValue}
                            </span>
                          )}
                          {change.action === 'NAME_CHANGE' && (
                            <span>
                              "{change.oldValue}" → "{change.newValue}"
                            </span>
                          )}
                          {change.action === 'DESCRIPTION_CHANGE' && (
                            <span>
                              {t('description_updated')}
                            </span>
                          )}
                        </div>
                        <div className="text-gray-500 mt-1">
                          {t('by')} {change.user.name || change.user.username} • {new Date(change.changedAt).toLocaleString('id-ID')}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Remove Member Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {t('confirm remove member')}
            </h3>
            <p className="text-gray-600 mb-6">
              {t('are you sure remove member').replace('{name}', deleteConfirm.userName)} {t('this action cannot be undone')}
            </p>
            <div className="flex space-x-3">
              <Button
                onClick={() => setDeleteConfirm(null)}
                variant="outline"
                className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white border-yellow-500 hover:border-yellow-600"
              >
                {t('cancel')}
              </Button>
              <Button
                onClick={() => handleRemoveMember(deleteConfirm.memberId)}
                className="flex-1 bg-red-600 hover:bg-red-700"
                disabled={isDeleting}
              >
                {isDeleting ? t('removing') : t('remove')}
              </Button>
            </div>
          </div>
        </div>
      )}

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
                disabled={isProjectDeleting}
              >
                {isProjectDeleting ? t('deleting') : t('delete project')}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Task Confirmation Modal */}
      {deleteTaskConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {t('confirm delete task')}
            </h3>
            <p className="text-gray-600 mb-6">
              {t('are you sure delete task')} "<strong>{deleteTaskConfirm.taskTitle}</strong>"? {t('this action cannot be undone')}
            </p>
            <div className="flex space-x-3">
              <Button
                onClick={() => setDeleteTaskConfirm(null)}
                variant="outline"
                className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white border-yellow-500 hover:border-yellow-600"
              >
                {t('cancel')}
              </Button>
              <Button
                onClick={() => handleDeleteTask(deleteTaskConfirm.taskId)}
                className="flex-1 bg-red-600 hover:bg-red-700"
                disabled={isDeletingTask}
              >
                {isDeletingTask ? t('deleting') : t('delete task')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}