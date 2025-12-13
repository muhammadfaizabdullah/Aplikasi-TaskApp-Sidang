import React from 'react'

interface ProgressBarProps {
  progress: number
  className?: string
  showLabel?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  className = '',
  showLabel = false,
  size = 'md'
}) => {
  const sizeClasses = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3'
  }

  const clampedProgress = Math.min(Math.max(progress, 0), 100)

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex justify-between text-sm text-gray-600 mb-1">
          <span>Progress</span>
          <span>{clampedProgress}%</span>
        </div>
      )}
      <div className={`w-full bg-gray-200 rounded-full ${sizeClasses[size]}`}>
        <div
          className={`bg-green-600 rounded-full transition-all duration-300 ${sizeClasses[size]}`}
          data-progress={clampedProgress}
        ></div>
      </div>
    </div>
  )
}
