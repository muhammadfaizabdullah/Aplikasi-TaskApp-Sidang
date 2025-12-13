'use client'

import { createContext, useContext, useState } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTheme } from '@/components/providers/ThemeProvider'

type ToastType = 'success' | 'error' | 'warning' | 'info'

interface Toast {
  id: string
  type: ToastType
  title: string
  message?: string
}

interface ToastContextType {
  toasts: Toast[]
  addToast: (toast: Omit<Toast, 'id'>) => void
  removeToast: (id: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export const useToast = () => {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = (toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newToast = { ...toast, id }
    setToasts(prev => [...prev, newToast])

    // Auto remove after 5 seconds
    setTimeout(() => {
      removeToast(id)
    }, 5000)
  }

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
    </ToastContext.Provider>
  )
}

export const Toaster: React.FC = () => {
  const { toasts, removeToast } = useToast()
  const { theme } = useTheme()

  const getToastStyles = (type: ToastType) => {
    const themeBase = 'bg-[rgb(var(--theme-primary))] border-[rgb(var(--theme-primary-dark))]'
    switch (type) {
      case 'success':
        return `${themeBase} text-white`
      case 'error':
        return 'bg-red-600 text-white border-red-700'
      case 'warning':
        return `${themeBase} text-white`
      case 'info':
        return `${themeBase} text-white`
      default:
        return `${themeBase} text-white`
    }
  }

  const getIconColor = (type: ToastType) => {
    switch (type) {
      case 'success':
        return 'text-success-600'
      case 'error':
        return 'text-danger-600'
      case 'warning':
        return 'text-warning-600'
      case 'info':
        return 'text-blue-600'
      default:
        return 'text-gray-600'
    }
  }

  return (
    <div className="fixed inset-x-0 top-6 z-50 flex flex-col items-center gap-3 px-4 sm:top-8">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            'flex items-start p-4 rounded-[8px] border shadow-lg w-full max-w-md sm:max-w-lg backdrop-blur-sm/50',
            getToastStyles(toast.type),
            'bg-opacity-95'
          )}
        >
          <div className="flex-1">
            <h4 className="font-semibold text-sm sm:text-base">{toast.title}</h4>
            {toast.message && (
              <p className="text-xs sm:text-sm mt-1 opacity-90">{toast.message}</p>
            )}
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            className="ml-4 text-gray-500 hover:text-gray-700 transition-colors"
            aria-label="Tutup notifikasi"
            title="Tutup notifikasi"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  )
}
