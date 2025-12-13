import React from 'react'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  text?: string
  className?: string
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  text = 'Memuat...',
  className = ''
}) => {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16'
  }

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div 
        className={`${sizeClasses[size]} animate-spin rounded-full border-2 border-gray-200 border-t-transparent loading-spinner`}
      />
      {text && (
        <p className="mt-3 text-sm text-gray-600 animate-pulse">{text}</p>
      )}
    </div>
  )
}

export const FullPageLoading: React.FC<{ text?: string }> = ({ text = 'Memuat...' }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <LoadingSpinner size="lg" text={text} />
    </div>
  )
}

export const InlineLoading: React.FC<{ text?: string }> = ({ text = 'Memuat...' }) => {
  return (
    <div className="flex items-center justify-center py-8">
      <LoadingSpinner size="md" text={text} />
    </div>
  )
}

export const SkeletonLoader: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
  )
}
