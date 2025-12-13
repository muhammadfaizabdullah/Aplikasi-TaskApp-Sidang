import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Role-based permission utilities
export const ROLES = {
  FOUNDER: 'founder',
  ADMIN: 'admin',
  MEMBER: 'member'
} as const

export type UserRole = typeof ROLES[keyof typeof ROLES]

export function isFounder(role?: string | null): boolean {
  const result = role?.toLowerCase() === ROLES.FOUNDER
  console.log('isFounder check:', { role, result })
  return result
}

export function isAdmin(role?: string | null): boolean {
  const result = role?.toLowerCase() === ROLES.ADMIN
  console.log('isAdmin check:', { role, result })
  return result
}

export function isMember(role?: string | null): boolean {
  const result = role?.toLowerCase() === ROLES.MEMBER
  console.log('isMember check:', { role, result })
  return result
}

export function isFounderOrAdmin(role?: string | null): boolean {
  return isFounder(role) || isAdmin(role)
}

// Function to check if user can edit role
export function canEditRole(userRole: string | null, targetRole: string, currentUserId: string, targetUserId: string): boolean {
  console.log('canEditRole check:', { userRole, targetRole, currentUserId, targetUserId })
  
  // If no user role, cannot edit
  if (!userRole) {
    console.log('No user role, cannot edit')
    return false
  }
  
  // User cannot edit their own role
  if (currentUserId === targetUserId) {
    console.log('Cannot edit own role')
    return false
  }
  
  const userRoleLower = userRole.toLowerCase()
  const targetRoleLower = targetRole.toLowerCase()
  
  // Founder can edit any role
  if (userRoleLower === 'founder') {
    console.log('Founder can edit any role')
    return true
  }
  
  // Admin can only edit member roles (not founder or other admin)
  if (userRoleLower === 'admin') {
    if (targetRoleLower === 'founder') {
      console.log('Admin cannot edit founder role')
      return false
    }
    if (targetRoleLower === 'admin') {
      console.log('Admin cannot edit other admin role')
      return false
    }
    if (targetRoleLower === 'member') {
      console.log('Admin can edit member role')
      return true
    }
  }
  
  // Member cannot edit any role
  if (userRoleLower === 'member') {
    console.log('Member cannot edit any role')
    return false
  }
  
  console.log('Default: cannot edit')
  return false
}

export function canAddRemoveMembers(userRole?: string | null): boolean {
  return isFounderOrAdmin(userRole)
}

export function canEditProject(userRole?: string | null): boolean {
  return isFounderOrAdmin(userRole) || isMember(userRole)
}

export function canDeleteProject(userRole?: string | null): boolean {
  return isFounder(userRole)
}

export function canAssignTasks(userRole?: string | null): boolean {
  return isFounderOrAdmin(userRole)
}

export function canEditProjectStatus(userRole?: string | null): boolean {
  return true // All roles can edit project status
}

export function canEditProjectDetails(userRole?: string | null): boolean {
  return isFounderOrAdmin(userRole)
}

export function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function formatDateTime(date: Date | string) {
  return new Date(date).toLocaleString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function calculateProgress(completed: number, total: number) {
  if (total === 0) return 0
  return Math.round((completed / total) * 100)
}

export function getStatusColor(status: string) {
  switch (status.toLowerCase()) {
    case 'completed':
      return 'success'
    case 'in_progress':
      return 'warning'
    case 'review':
      return 'info'
    case 'todo':
      return 'secondary'
    default:
      return 'secondary'
  }
}

export function getPriorityColor(priority: string) {
  switch (priority.toLowerCase()) {
    case 'urgent':
      return 'danger'
    case 'high':
      return 'warning'
    case 'medium':
      return 'info'
    case 'low':
      return 'success'
    default:
      return 'info'
  }
}
