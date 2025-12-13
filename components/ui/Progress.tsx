'use client'

import { cn } from '@/lib/utils'

interface ProgressProps {
  value: number
  max?: number
  className?: string
}

export const Progress: React.FC<ProgressProps> = ({ 
  value, 
  max = 100, 
  className 
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100)

  return (
    <div className={cn('w-full bg-[#DEFAD9] rounded-full h-2', className)}>
      <div
        className="bg-[#16A34A] h-2 rounded-full transition-all duration-300 ease-in-out"
        style={{ width: `${percentage}%` }}
      />
    </div>
  )
}
