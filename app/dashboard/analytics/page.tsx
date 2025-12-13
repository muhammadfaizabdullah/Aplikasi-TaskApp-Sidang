"use client"

import { useState, useEffect } from "react"
import { useLanguage } from "@/components/providers/LanguageProvider"
import { BarChart3 } from "lucide-react"
import { MonthlyComparisonCharts } from "@/components/charts/MonthlyComparisonCharts"

interface AnalyticsData {
  currentMonth: {
    totalProjects: number
    totalTasks: number
    completedTasks: number
    totalMembers: number
    projectProgress: { projectName: string; progress: number }[]
    taskStatusDistribution: { status: string; count: number }[]
    recentActivity: { type: string; description: string; timestamp: string }[]
  }
  lastMonth: {
    totalProjects: number
    totalTasks: number
    completedTasks: number
    totalMembers: number
  }
  lastYear: {
    totalProjects: number
    totalTasks: number
    completedTasks: number
    totalMembers: number
  }
  monthOverMonth: {
    projects: number
    tasks: number
    completedTasks: number
    members: number
  }
  yearOverYear: {
    projects: number
    tasks: number
    completedTasks: number
    members: number
  }
  period: {
    currentMonth: number
    currentYear: number
    lastMonth: number
    lastYear: number
  }
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const { t } = useLanguage()

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      setIsLoading(true)
      setError("")
      
      const response = await fetch('/api/analytics')
      if (response.ok) {
        const data = await response.json()
        setAnalytics(data)
      } else {
        setError(t('analytics load error'))
        // Fallback ke mock data
        setAnalytics({
          currentMonth: {
            totalProjects: 2,
            totalTasks: 2,
            completedTasks: 0,
            totalMembers: 2,
            projectProgress: [
              { projectName: "PAIS", progress: 0 },
              { projectName: "DEMO", progress: 0 }
            ],
            taskStatusDistribution: [
              { status: 'COMPLETED', count: 0 },
              { status: 'IN_PROGRESS', count: 2 },
              { status: 'PENDING', count: 0 }
            ],
            recentActivity: []
          },
          lastMonth: {
            totalProjects: 10,
            totalTasks: 42,
            completedTasks: 35,
            totalMembers: 7
          },
          lastYear: {
            totalProjects: 8,
            totalTasks: 35,
            completedTasks: 28,
            totalMembers: 5
          },
          monthOverMonth: {
            projects: 0,
            tasks: 0,
            completedTasks: 0,
            members: 0
          },
          yearOverYear: {
            projects: 4,
            tasks: 13,
            completedTasks: 10,
            members: 3
          },
          period: {
            currentMonth: 1,
            currentYear: 2025,
            lastMonth: 12,
            lastYear: 2024
          }
        })
      }
    } catch (error) {
      console.error('Error fetching analytics:', error)
      setError(t('analytics error'))
              // Fallback ke mock data yang sama
        setAnalytics({
          currentMonth: {
            totalProjects: 2,
            totalTasks: 2,
            completedTasks: 0,
            totalMembers: 2,
            projectProgress: [
              { projectName: "PAIS", progress: 0 },
              { projectName: "DEMO", progress: 0 }
            ],
            taskStatusDistribution: [
              { status: 'COMPLETED', count: 0 },
              { status: 'IN_PROGRESS', count: 2 },
              { status: 'PENDING', count: 0 }
            ],
            recentActivity: []
          },
        lastMonth: {
          totalProjects: 10,
          totalTasks: 42,
          completedTasks: 35,
          totalMembers: 7
        },
        lastYear: {
          totalProjects: 8,
          totalTasks: 35,
          completedTasks: 28,
          totalMembers: 5
        },
        monthOverMonth: {
          projects: 0,
          tasks: 0,
          completedTasks: 0,
          members: 0
        },
        yearOverYear: {
          projects: 4,
          tasks: 13,
          completedTasks: 10,
          members: 3
        },
        period: {
          currentMonth: 1,
          currentYear: 2025,
          lastMonth: 12,
          lastYear: 2024
        }
      })
    } finally {
      setIsLoading(false)
    }
  }


  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-slate-600 mx-auto mb-4"></div>
          <p className="text-slate-600 text-lg">{t('analytics loading')}</p>
        </div>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="text-center py-12 bg-slate-50">
        <p className="text-slate-600">{t('analytics no data')}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 sm:space-y-8 capitalize">
      {/* Header */}
      <header>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{t('analytics dashboard')}</h1>
        <p className="text-gray-600 mt-2 text-sm sm:text-base">{t('analytics dashboard subtitle')}</p>
      </header>

        {error && (
          <div className="bg-rose-50 border border-rose-200 rounded-[8px] sm:rounded-[8px] p-3 sm:p-4 max-w-2xl mx-auto">
            <p className="text-xs sm:text-sm text-rose-600 text-center">{error}</p>
          </div>
        )}

        {/* Monthly Comparison Charts */}
        <div>
          <MonthlyComparisonCharts
            currentMonth={analytics.currentMonth}
            lastMonth={analytics.lastMonth}
            lastYear={analytics.lastYear}
          />
        </div>
    </div>
  )
}

