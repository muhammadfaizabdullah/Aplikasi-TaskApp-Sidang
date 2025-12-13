"use client"
import { useEffect, useState } from 'react'
import { useLanguage } from '@/components/providers/LanguageProvider'

interface UserStats {
  totalProjects: number
  totalTasks: number
  completedTasks: number
  activeProjects: number
  teamsJoined: number
  activeTeams: number
  contributionScore: number
}

export default function UserReportsPage() {
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState<UserStats>({
    totalProjects: 0,
    totalTasks: 0,
    completedTasks: 0,
    activeProjects: 0,
    teamsJoined: 0,
    activeTeams: 0,
    contributionScore: 0
  })
  const { t } = useLanguage()

  useEffect(() => {
    fetchUserStats()
  }, [])

  const fetchUserStats = async () => {
    try {
      const response = await fetch('/api/user/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Error fetching user stats:', error)
    }
  }

  const generateReport = async (month: number, year: number) => {
    setLoading(true)
    try {
      const url = `/api/user/reports/monthly?month=${month}&year=${year}`
      window.open(url, '_blank')
    } catch (error) {
      console.error('Error generating report:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <div className="p-6 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-4xl font-bold text-blue-600">
              {t('user reports') || 'User Reports'}
            </h1>
            <p className="text-gray-600 mt-2 text-sm md:text-base">{t('user reports subtitle') || 'User Reports Subtitle'}</p>
          </div>
        </div>

        {/* Monthly Report Generator */}
        <div className="bg-white/80 backdrop-blur-lg rounded-[8px] shadow-xl border border-white/20 p-4 md:p-6">
          <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-4">{t('generate monthly report') || 'Generate Monthly Report'}</h3>
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('month') || 'Month'}</label>
              <select
                id="user-month"
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                defaultValue={new Date().getMonth() + 1}
              >
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {new Date(0, i).toLocaleString('en-US', { month: 'long' })}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('year') || 'Year'}</label>
              <select
                id="user-year"
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                defaultValue={new Date().getFullYear()}
              >
                {Array.from({ length: 5 }, (_, i) => {
                  const year = new Date().getFullYear() - i
                  return (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  )
                })}
              </select>
            </div>
            <button
              onClick={() => {
                const month = (document.getElementById('user-month') as HTMLSelectElement).value
                const year = (document.getElementById('user-year') as HTMLSelectElement).value
                generateReport(parseInt(month), parseInt(year))
              }}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (t('generating') || 'Generating...') : (t('download pdf report') || 'Download Pdf Report')}
            </button>
          </div>
        </div>

        {/* User Statistics Overview */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <div className="bg-white/80 backdrop-blur-lg rounded-[8px] shadow-xl border border-white/20 p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm font-medium text-gray-600">{t('my projects') || 'My Projects'}</p>
                <p className="text-2xl md:text-3xl font-bold text-gray-900">{stats.totalProjects}</p>
                <p className="text-xs md:text-sm text-green-600">{t('active') || 'Active'}: {stats.activeProjects}</p>
              </div>
              <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-[8px] flex items-center justify-center">
                <svg className="w-5 h-5 md:w-6 md:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-lg rounded-[8px] shadow-xl border border-white/20 p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm font-medium text-gray-600">{t('my tasks') || 'My Tasks'}</p>
                <p className="text-2xl md:text-3xl font-bold text-gray-900">{stats.totalTasks}</p>
                <p className="text-xs md:text-sm text-green-600">{t('completed') || 'Completed'}: {stats.completedTasks}</p>
              </div>
              <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-[8px] flex items-center justify-center">
                <svg className="w-5 h-5 md:w-6 md:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-lg rounded-[8px] shadow-xl border border-white/20 p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm font-medium text-gray-600">{t('teams joined') || 'Teams Joined'}</p>
                <p className="text-2xl md:text-3xl font-bold text-gray-900">{stats.teamsJoined}</p>
                <p className="text-xs md:text-sm text-green-600">{t('active teams') || 'Active Teams'}</p>
              </div>
              <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-[8px] flex items-center justify-center">
                <svg className="w-5 h-5 md:w-6 md:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-lg rounded-[8px] shadow-xl border border-white/20 p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm font-medium text-gray-600">{t('contribution score') || 'Contribution Score'}</p>
                <p className="text-2xl md:text-3xl font-bold text-gray-900">{stats.contributionScore}</p>
                <p className="text-xs md:text-sm text-green-600">{t('this month') || 'This Month'}</p>
              </div>
              <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-[8px] flex items-center justify-center">
                <svg className="w-5 h-5 md:w-6 md:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}