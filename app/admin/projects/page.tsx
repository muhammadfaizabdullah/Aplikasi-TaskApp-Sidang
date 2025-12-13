"use client"
import { useEffect, useState } from 'react'

type Member = { user: { id: string; name: string | null; email: string | null; username: string | null }, role: string }
type Task = { id: string; title: string; status?: string }
type Project = { 
  id: string; 
  name: string; 
  description?: string;
  status?: string;
  createdAt: string;
  founder?: { id: string; email: string | null; name: string | null; username: string | null }; 
  members?: Member[]; 
  tasks?: Task[]; 
  _count?: { tasks: number; members: number } 
}

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  // Helper function to format status text
  const formatStatus = (status: string) => {
    return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  useEffect(() => {
    async function load() {
      setLoading(true)
      const res = await fetch('/api/admin/projects')
      if (res.ok) {
        const data = await res.json()
        setProjects(data.projects)
      }
      setLoading(false)
    }
    load()
  }, [])

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.founder?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.founder?.email?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' ||
                         (statusFilter === 'active' && (!project.status || project.status === 'active')) ||
                         (statusFilter === 'completed' && project.status === 'completed') ||
                         (statusFilter === 'paused' && project.status === 'paused')
    
    return matchesSearch && matchesStatus
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <div className="p-6 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-800 bg-clip-text text-transparent">
              Project Management
            </h1>
            <p className="text-gray-600 mt-2 text-sm md:text-base">Kelola dan pantau semua proyek TaskApp</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-600">{projects.length} Total Projects</span>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white/80 backdrop-blur-lg rounded-[8px] shadow-xl border border-white/20 p-4 md:p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Cari proyek berdasarkan nama, deskripsi, atau founder..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-[8px] focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100 transition-all duration-200 text-sm md:text-base"
                />
              </div>
            </div>
            <div className="md:w-48">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-[8px] focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100 transition-all duration-200 text-sm md:text-base"
                title="Filter projects by status"
              >
                <option value="all">Semua Status</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="paused">Paused</option>
              </select>
            </div>
          </div>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
          {filteredProjects.map((project) => (
            <div key={project.id} className="group bg-white/80 backdrop-blur-lg rounded-[8px] shadow-xl border border-white/20 p-4 md:p-6 hover:shadow-2xl transition-all duration-300 hover:scale-105">
              {/* Project Header */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-4 gap-3">
                <div className="flex items-center space-x-3 md:space-x-4">
                  <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-[8px] flex items-center justify-center text-white font-bold text-lg md:text-xl">
                    {project.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-gray-900 text-base md:text-lg group-hover:text-indigo-600 transition-colors truncate">
                      {project.name}
                    </h3>
                    <p className="text-xs md:text-sm text-gray-600 line-clamp-2">
                      {project.description || 'No description available'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                    project.status === 'completed' ? 'bg-green-100 text-green-800' :
                    project.status === 'paused' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {formatStatus(project.status || 'active')}
                  </span>
                </div>
              </div>

              {/* Project Stats */}
              <div className="grid grid-cols-2 gap-3 md:gap-4 mb-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-[8px] p-3 md:p-4">
                  <div className="flex items-center space-x-2">
                    <svg className="w-4 h-4 md:w-5 md:h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <span className="text-xs md:text-sm font-semibold text-blue-800">
                      {project._count?.members ?? project.members?.length ?? 0} Members
                    </span>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-[8px] p-3 md:p-4">
                  <div className="flex items-center space-x-2">
                    <svg className="w-4 h-4 md:w-5 md:h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                    <span className="text-xs md:text-sm font-semibold text-purple-800">
                      {project._count?.tasks ?? project.tasks?.length ?? 0} Tasks
                    </span>
                  </div>
                </div>
              </div>

              {/* Task Status Breakdown */}
              {(project.tasks && project.tasks.length > 0) && (
                <div className="mb-4">
                  <h4 className="text-xs md:text-sm font-semibold text-gray-700 mb-2">Task Status Overview</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {(() => {
                      const statusCounts = (project.tasks || []).reduce((acc: any, task: any) => {
                        acc[task.status] = (acc[task.status] || 0) + 1
                        return acc
                      }, {})

                      return Object.entries(statusCounts).map(([status, count]) => (
                        <div key={status} className="flex items-center justify-between bg-gray-50 px-2 py-1 rounded">
                          <span className={`px-1.5 py-0.5 text-xs font-medium rounded ${
                            status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                            status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                            status === 'REVIEW' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {formatStatus(status)}
                          </span>
                          <span className="font-semibold text-gray-700 text-xs">{String(count)}</span>
                        </div>
                      ))
                    })()}
                  </div>
                </div>
              )}

              {/* Founder Info */}
              <div className="mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-7 h-7 md:w-8 md:h-8 bg-gradient-to-br from-gray-400 to-gray-500 rounded-full flex items-center justify-center text-white font-semibold text-xs md:text-sm">
                    {project.founder?.username?.charAt(0) || project.founder?.name?.charAt(0) || project.founder?.email?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs md:text-sm font-semibold text-gray-900 truncate">
                      {project.founder?.username ? `@${project.founder.username}` : (project.founder?.name || 'Unknown Founder')}
                    </div>
                    <div className="text-xs text-gray-600 truncate">{project.founder?.email || '-'}</div>
                  </div>
                </div>
              </div>

              {/* Recent Members */}
              <div className="mb-4">
                <h4 className="text-xs md:text-sm font-semibold text-gray-700 mb-2">Team Members</h4>
                <div className="space-y-2">
                  {(project.members || []).slice(0, 3).map((member) => (
                    <div key={member.user.id} className="flex items-center justify-between bg-gray-50 px-2 md:px-3 py-2 rounded-[8px]">
                      <div className="flex items-center space-x-2 min-w-0 flex-1">
                        <div className="w-5 h-5 md:w-6 md:h-6 bg-gradient-to-br from-gray-400 to-gray-500 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                          {member.user.username?.charAt(0) || member.user.name?.charAt(0) || member.user.email?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                        <span className="text-xs md:text-sm text-gray-700 truncate">
                          {member.user.username ? `@${member.user.username}` : (member.user.name || member.user.email)}
                        </span>
                      </div>
                      <span className="text-xs px-2 py-1 rounded-full bg-indigo-100 text-indigo-700 font-medium">
                        {member.role}
                      </span>
                    </div>
                  ))}
                  {(project.members || []).length > 3 && (
                    <div className="text-xs text-gray-500 text-center">
                      +{(project.members || []).length - 3} more members
                    </div>
                  )}
                </div>
              </div>

              {/* Recent Tasks */}
              <div>
                <h4 className="text-xs md:text-sm font-semibold text-gray-700 mb-2">Recent Tasks</h4>
                <div className="space-y-2">
                  {(project.tasks || []).slice(0, 3).map((task: any) => (
                    <div key={task.id} className="flex items-center space-x-2 bg-gray-50 px-2 md:px-3 py-2 rounded-[8px]">
                      <div className={`w-2 h-2 rounded-full ${
                        task.status === 'COMPLETED' ? 'bg-green-500' :
                        task.status === 'IN_PROGRESS' ? 'bg-blue-500' :
                        task.status === 'REVIEW' ? 'bg-yellow-500' :
                        'bg-gray-500'
                      }`}></div>
                      <span className="text-xs md:text-sm text-gray-700 truncate flex-1">{task.title}</span>
                      <span className={`px-1.5 py-0.5 text-xs font-medium rounded ${
                        task.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                        task.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                        task.status === 'REVIEW' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {formatStatus(task.status)}
                      </span>
                    </div>
                  ))}
                  {(project.tasks || []).length > 3 && (
                    <div className="text-xs text-gray-500 text-center">
                      +{(project.tasks || []).length - 3} more tasks
                    </div>
                  )}
                </div>
              </div>

              {/* Project Activity */}
              <div className="mb-4">
                <h4 className="text-xs md:text-sm font-semibold text-gray-700 mb-2">Project Activity</h4>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-xs text-gray-600 bg-blue-50 px-2 py-1 rounded">
                    <svg className="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <span>Project created by {project.founder?.username ? `@${project.founder.username}` : (project.founder?.name || 'Unknown')}</span>
                  </div>
                  {(project.members && project.members.length > 0) && (
                    <div className="flex items-center space-x-2 text-xs text-gray-600 bg-green-50 px-2 py-1 rounded">
                      <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <span>{project.members.length} team member{project.members.length !== 1 ? 's' : ''} joined</span>
                    </div>
                  )}
                  {(project.tasks && project.tasks.length > 0) && (
                    <div className="flex items-center space-x-2 text-xs text-gray-600 bg-purple-50 px-2 py-1 rounded">
                      <svg className="w-3 h-3 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                      </svg>
                      <span>{project.tasks.length} task{project.tasks.length !== 1 ? 's' : ''} created</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Project Progress & Timestamps */}
              <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
                {/* Progress Indicator */}
                {(project.tasks && project.tasks.length > 0) && (
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-gray-700">Progress</span>
                      <span className="text-xs text-gray-600">
                        {Math.round(((project.tasks.filter((t: any) => t.status === 'COMPLETED').length / project.tasks.length) * 100))}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${Math.round(((project.tasks.filter((t: any) => t.status === 'COMPLETED').length / project.tasks.length) * 100))}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {/* Timestamps */}
                <div className="grid grid-cols-1 gap-1 text-xs text-gray-500">
                  <div className="flex items-center space-x-2">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Created: {new Date(project.createdAt).toLocaleDateString('id-ID')}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Last Updated: {new Date(project.createdAt).toLocaleDateString('id-ID')}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredProjects.length === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No projects found</h3>
            <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
          </div>
        )}
      </div>
    </div>
  )
}








