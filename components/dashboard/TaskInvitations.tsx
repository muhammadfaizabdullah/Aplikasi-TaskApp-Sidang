"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/Button"
import { CheckCircle, XCircle, Clock, User, Calendar, FileText } from "lucide-react"

interface TaskInvitation {
  id: string
  taskTitle: string
  taskDescription?: string
  dueDate?: string
  status: string
  createdAt: string
  project: {
    id: string
    name: string
    description?: string
  }
  invitedBy: {
    username: string
    name?: string
    email: string
  }
}

export function TaskInvitations() {
  const [invitations, setInvitations] = useState<TaskInvitation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchInvitations()
  }, [])

  const fetchInvitations = async () => {
    try {
      const response = await fetch('/api/users/invitations')
      if (response.ok) {
        const data = await response.json()
        setInvitations(data.invitations)
      } else {
        setError("Gagal mengambil invitation")
      }
    } catch (err) {
      setError("Terjadi kesalahan saat mengambil invitation")
    } finally {
      setIsLoading(false)
    }
  }

  const respondToInvitation = async (invitationId: string, response: 'ACCEPT' | 'REJECT') => {
    try {
      const res = await fetch(`/api/projects/invite/${invitationId}/respond`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ response })
      })

      if (res.ok) {
        // Refresh invitations
        await fetchInvitations()
        // Show success message
        alert(response === 'ACCEPT' 
          ? 'Anda berhasil bergabung dengan project!'
          : 'Invitation berhasil ditolak'
        )
      } else {
        const data = await res.json()
        alert(data.error || 'Gagal merespon invitation')
      }
    } catch (err) {
      alert('Terjadi kesalahan saat merespon invitation')
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-6">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#16A34A]"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center p-6 text-red-600">
        <p>{error}</p>
      </div>
    )
  }

  if (invitations.length === 0) {
    return (
      <div className="text-center p-6 text-gray-500">
        <Clock className="w-12 h-12 mx-auto mb-2 text-gray-400" />
        <p>Tidak ada invitation tugas yang pending</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
        <FileText className="w-5 h-5" />
        Invitation Tugas ({invitations.length})
      </h3>
      
      <div className="space-y-4">
        {invitations.map((invitation) => (
          <div key={invitation.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h4 className="font-medium text-gray-900 mb-1">
                  {invitation.taskTitle}
                </h4>
                {invitation.taskDescription && (
                  <p className="text-sm text-gray-600 mb-2">
                    {invitation.taskDescription}
                  </p>
                )}
                
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    <span>Dari: @{invitation.invitedBy.username}</span>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <FileText className="w-4 h-4" />
                    <span>Project: {invitation.project.name}</span>
                  </div>
                  
                  {invitation.dueDate && (
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>Deadline: {new Date(invitation.dueDate).toLocaleDateString('id-ID')}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                onClick={() => respondToInvitation(invitation.id, 'ACCEPT')}
                className="bg-blue-600 hover:bg-blue-700 text-white"
                size="sm"
              >
                <CheckCircle className="w-4 h-4 mr-1" />
                Terima
              </Button>
              
              <Button
                onClick={() => respondToInvitation(invitation.id, 'REJECT')}
                variant="outline"
                className="text-red-600 border-red-600 hover:bg-red-50"
                size="sm"
              >
                <XCircle className="w-4 h-4 mr-1" />
                Tolak
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
