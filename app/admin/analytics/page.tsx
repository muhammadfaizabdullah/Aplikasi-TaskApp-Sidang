"use client"
import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LineChart, Line, PieChart, Pie, Cell } from 'recharts'
import { useLanguage } from '@/components/providers/LanguageProvider'

type Point = { label: string; count: number }

export default function AdminAnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const { t } = useLanguage()

  useEffect(() => {
    async function load() {
      setLoading(true)
      const res = await fetch('/api/admin/analytics')
      if (res.ok) {
        const data = await res.json()
        setAnalyticsData(data)
      }
      setLoading(false)
    }
    load()
  }, [])

  if (!analyticsData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
        </div>
      </div>
    )
  }

  const { stats, charts } = analyticsData
  const { monthly, yearly, projectStatusDistribution, userActivityData } = charts as {
    monthly: Array<{ label: string; count: number }>
    yearly: Array<{ label: string; count: number }>
    projectStatusDistribution: Array<{ name: string; value: number; color: string }>
    userActivityData: Array<{ name: string; active: number; new: number }>
  }


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <div className="p-6 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-800 bg-clip-text text-transparent">
              {t('admin analytics title') || 'Dasbor Analitik'}
            </h1>
            <p className="text-gray-600 mt-2 text-sm md:text-base">{t('admin analytics subtitle') || 'Insight dan statistik TaskApp'}</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-600">{t('real time label') || 'Data real-time'}</span>
          </div>
        </div>

        {/* Monthly Report Generator */}
        <div className="bg-white/80 backdrop-blur-lg rounded-[8px] shadow-xl border border-white/20 p-4 md:p-6">
          <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-4">{t('generate monthly report') || 'Generate Monthly Report'}</h3>
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('month') || 'Month'}</label>
              <select
                id="month"
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                defaultValue={new Date().getMonth() + 1}
              >
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {new Date(0, i).toLocaleString('id-ID', { month: 'long' })}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('year') || 'Year'}</label>
              <select
                id="year"
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
                const month = (document.getElementById('month') as HTMLSelectElement).value
                const year = (document.getElementById('year') as HTMLSelectElement).value
                const url = `/api/admin/reports/monthly?month=${month}&year=${year}`
                window.open(url, '_blank')
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {t('download pdf report') || 'Download PDF Report'}
            </button>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <div className="bg-white/80 backdrop-blur-lg rounded-[8px] shadow-xl border border-white/20 p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm font-medium text-gray-600">{t('total users') || 'Total Pengguna'}</p>
                <p className="text-2xl md:text-3xl font-bold text-gray-900">{stats.totalUsers}</p>
                <p className="text-xs md:text-sm text-green-600">{t('active users') || 'Aktif'}: {stats.activeUsers}</p>
              </div>
              <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-[8px] flex items-center justify-center">
                <svg className="w-5 h-5 md:w-6 md:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-lg rounded-[8px] shadow-xl border border-white/20 p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm font-medium text-gray-600">{t('total projects') || 'Total Project'}</p>
                <p className="text-2xl md:text-3xl font-bold text-gray-900">{stats.totalProjects}</p>
                <p className="text-xs md:text-sm text-green-600">{t('completed projects') || 'Selesai'}: {stats.completedProjects}</p>
              </div>
              <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-[8px] flex items-center justify-center">
                <svg className="w-5 h-5 md:w-6 md:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-lg rounded-[8px] shadow-xl border border-white/20 p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm font-medium text-gray-600">{t('total tasks') || 'Total Tugas'}</p>
                <p className="text-2xl md:text-3xl font-bold text-gray-900">{stats.totalTasks}</p>
                <p className="text-xs md:text-sm text-green-600">{t('across all projects') || 'Di semua project'}</p>
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
                <p className="text-xs md:text-sm font-medium text-gray-600">{t('total admins') || 'Total Admin'}</p>
                <p className="text-2xl md:text-3xl font-bold text-gray-900">{stats.totalAdmins}</p>
                <p className="text-xs md:text-sm text-green-600">{t('system admins') || 'Administrator sistem'}</p>
              </div>
              <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-[8px] flex items-center justify-center">
                <svg className="w-5 h-5 md:w-6 md:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
          {/* User Registration Chart */}
          <div className="bg-white/80 backdrop-blur-lg rounded-[8px] shadow-xl border border-white/20 p-4 md:p-6">
            <div className="mb-4 md:mb-6">
              <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2">{t('user registration trend') || 'Tren Pendaftaran Pengguna'}</h3>
              <p className="text-sm md:text-base text-gray-600">{t('user registration trend desc') || 'Pendaftaran pengguna bulanan dalam 12 bulan terakhir'}</p>
            </div>
            <div className="h-64 md:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthly}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="label" 
                    tick={{ fontSize: 12 }}
                    stroke="#6b7280"
                  />
                  <YAxis 
                    allowDecimals={false} 
                    tick={{ fontSize: 12 }}
                    stroke="#6b7280"
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'white',
                      border: 'none',
                      borderRadius: '12px',
                      boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                    }}
                  />
                  <Bar 
                    dataKey="count" 
                    fill="url(#blueGradient)" 
                    radius={[8, 8, 0, 0]}
                  />
                  <defs>
                    <linearGradient id="blueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3B82F6" />
                      <stop offset="100%" stopColor="#1D4ED8" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Project Status Distribution */}
          <div className="bg-white/80 backdrop-blur-lg rounded-[8px] shadow-xl border border-white/20 p-4 md:p-6">
            <div className="mb-4 md:mb-6">
              <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2">{t('project status distribution title') || 'Distribusi Status Project'}</h3>
              <p className="text-sm md:text-base text-gray-600">{t('project status distribution desc') || 'Status terkini semua project'}</p>
            </div>
            <div className="h-64 md:h-80 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={projectStatusDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={120}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {projectStatusDistribution.map((entry: { name: string; value: number; color: string }, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'white',
                      border: 'none',
                      borderRadius: '12px',
                      boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap justify-center gap-4 mt-4">
              {projectStatusDistribution.map((item: { name: string; value: number; color: string }, index: number) => (
                <div key={index} className="flex items-center space-x-2">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      item.name === 'Active' ? 'bg-blue-500' :
                      item.name === 'Completed' ? 'bg-green-500' :
                      'bg-yellow-500'
                    }`}
                  ></div>
                  <span className="text-xs md:text-sm text-gray-600">{item.name.replace('_', ' ').toUpperCase()}: {item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* User Activity Chart */}
        <div className="bg-white/80 backdrop-blur-lg rounded-[8px] shadow-xl border border-white/20 p-4 md:p-6">
          <div className="mb-4 md:mb-6">
            <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2">{t('user activity overview') || 'User Activity Overview'}</h3>
            <p className="text-sm md:text-base text-gray-600">{t('active users vs new registrations over time') || 'Active Users vs New Registrations Over Time'}</p>
          </div>
          <div className="h-64 md:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={userActivityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 12 }}
                  stroke="#6b7280"
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  stroke="#6b7280"
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="active" 
                  stroke="#3B82F6" 
                  strokeWidth={3}
                  dot={{ fill: '#3B82F6', strokeWidth: 2, r: 6 }}
                  activeDot={{ r: 8, stroke: '#3B82F6', strokeWidth: 2 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="new" 
                  stroke="#10B981" 
                  strokeWidth={3}
                  dot={{ fill: '#10B981', strokeWidth: 2, r: 6 }}
                  activeDot={{ r: 8, stroke: '#10B981', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap justify-center gap-6 mt-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-xs md:text-sm text-gray-600">{t('active users') || 'Aktif'}</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-xs md:text-sm text-gray-600">{t('user registration trend') || 'Tren Pendaftaran Pengguna'}</span>
            </div>
          </div>
        </div>

        {/* Yearly Registration Chart */}
        <div className="bg-white/80 backdrop-blur-lg rounded-[8px] shadow-xl border border-white/20 p-4 md:p-6">
          <div className="mb-4 md:mb-6">
            <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2">{t('yearly registration growth') || 'Pertumbuhan Pendaftaran Tahunan'}</h3>
            <p className="text-sm md:text-base text-gray-600">{t('yearly registration growth desc') || 'Pendaftaran pengguna selama 5 tahun terakhir'}</p>
          </div>
          <div className="h-64 md:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={yearly}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="label" 
                  tick={{ fontSize: 12 }}
                  stroke="#6b7280"
                />
                <YAxis 
                  allowDecimals={false} 
                  tick={{ fontSize: 12 }}
                  stroke="#6b7280"
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                  }}
                />
                <Bar 
                  dataKey="count" 
                  fill="url(#greenGradient)" 
                  radius={[8, 8, 0, 0]}
                />
                <defs>
                  <linearGradient id="greenGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10B981" />
                    <stop offset="100%" stopColor="#059669" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}








