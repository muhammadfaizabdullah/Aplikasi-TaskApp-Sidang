"use client"

import { cn } from "@/lib/utils"

export function FieldLabel({ children, className = "" }: { children: React.ReactNode, className?: string }) {
  return (
    <label className={cn("block text-sm font-medium text-gray-700 mb-1", className)}>
      {children}
    </label>
  )
}

export function FieldHint({ children, className = "" }: { children?: React.ReactNode, className?: string }) {
  if (!children) return null
  return (
    <p className={cn("text-xs text-gray-500 mt-1", className)}>{children}</p>
  )
}

export function FormRow({ children, className = "" }: { children: React.ReactNode, className?: string }) {
  return (
    <div className={cn("space-y-2", className)}>
      {children}
    </div>
  )
}

export function FormGrid({ children, className = "" }: { children: React.ReactNode, className?: string }) {
  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6", className)}>
      {children}
    </div>
  )
}

export function Card({ children, className = "" }: { children: React.ReactNode, className?: string }) {
  return (
    <div className={cn("bg-white rounded-[8px] shadow-lg border border-gray-100 p-6", className)}>
      {children}
    </div>
  )
}






























