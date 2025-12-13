'use client'

import React from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler,
} from 'chart.js'
import { Bar, Doughnut, Line } from 'react-chartjs-2'
import { useLanguage } from '@/components/providers/LanguageProvider'

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler
)

interface MonthlyComparisonChartsProps {
  currentMonth: {
    totalProjects: number
    totalTasks: number
    completedTasks: number
    totalMembers: number
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
}

export const MonthlyComparisonCharts: React.FC<MonthlyComparisonChartsProps> = ({
  currentMonth,
  lastMonth,
  lastYear
}) => {
  const { t } = useLanguage()
  // Comparison Bar Chart - Current Month vs Last Month vs Last Year
  const comparisonData = {
    labels: [
      t('projects'),
      t('tasks'),
      t('completed tasks'),
      t('team members')
    ],
    datasets: [
      {
        label: t('this month'),
        data: [
          currentMonth.totalProjects,
          currentMonth.totalTasks,
          currentMonth.completedTasks,
          currentMonth.totalMembers
        ],
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
        borderColor: 'rgba(34, 197, 94, 1)',
        borderWidth: 2,
        borderRadius: 8,
      },
      {
        label: t('last month'),
        data: [
          lastMonth.totalProjects,
          lastMonth.totalTasks,
          lastMonth.completedTasks,
          lastMonth.totalMembers
        ],
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 2,
        borderRadius: 8,
      },
      {
        label: t('last year'),
        data: [
          lastYear.totalProjects,
          lastYear.totalTasks,
          lastYear.completedTasks,
          lastYear.totalMembers
        ],
        backgroundColor: 'rgba(168, 85, 247, 0.8)',
        borderColor: 'rgba(168, 85, 247, 1)',
        borderWidth: 2,
        borderRadius: 8,
      },
    ],
  }

  const comparisonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          padding: 10,
          usePointStyle: true,
          font: {
            size: 12,
          },
        },
      },
      title: {
        display: true,
        text: t('comparison chart title'),
        font: {
          size: 14,
          weight: 'bold' as const,
        },
        padding: {
          bottom: 20,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          font: {
            size: 10,
          },
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: 10,
          },
          maxRotation: 45,
        },
      },
    },
  }

  // Task Completion Rate Doughnut Chart
  const currentCompletionRate = currentMonth.totalTasks > 0 
    ? Math.round((currentMonth.completedTasks / currentMonth.totalTasks) * 100) 
    : 0

  const lastMonthCompletionRate = lastMonth.totalTasks > 0 
    ? Math.round((lastMonth.completedTasks / lastMonth.totalTasks) * 100) 
    : 0

  const lastYearCompletionRate = lastYear.totalTasks > 0 
    ? Math.round((lastYear.completedTasks / lastYear.totalTasks) * 100) 
    : 0

  const completionRateData = {
    labels: [
      t('this month'),
      t('last month'),
      t('last year')
    ],
    datasets: [
      {
        data: [currentCompletionRate, lastMonthCompletionRate, lastYearCompletionRate],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(168, 85, 247, 0.8)',
        ],
        borderColor: [
          'rgba(34, 197, 94, 1)',
          'rgba(59, 130, 246, 1)',
          'rgba(168, 85, 247, 1)',
        ],
        borderWidth: 2,
        hoverOffset: 4,
      },
    ],
  }

  const completionRateOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          padding: 15,
          usePointStyle: true,
          font: {
            size: 11,
          },
        },
      },
      title: {
        display: true,
        text: t('completion rate title'),
        font: {
          size: 14,
          weight: 'bold' as const,
        },
        padding: {
          bottom: 20,
        },
      },
    },
  }

  // Monthly Trend Line Chart
  const monthlyTrendData = {
    labels: [
      t('last year'),
      t('last month'),
      t('this month')
    ],
    datasets: [
      {
        label: t('projects'),
        data: [lastYear.totalProjects, lastMonth.totalProjects, currentMonth.totalProjects],
        borderColor: 'rgba(34, 197, 94, 1)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: 'rgba(34, 197, 94, 1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(34, 197, 94, 1)',
      },
      {
        label: t('tasks'),
        data: [lastYear.totalTasks, lastMonth.totalTasks, currentMonth.totalTasks],
        borderColor: 'rgba(59, 130, 246, 1)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: 'rgba(59, 130, 246, 1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(59, 130, 246, 1)',
      },
      {
        label: t('completed_tasks'),
        data: [lastYear.completedTasks, lastMonth.completedTasks, currentMonth.completedTasks],
        borderColor: 'rgba(168, 85, 247, 1)',
        backgroundColor: 'rgba(168, 85, 247, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: 'rgba(168, 85, 247, 1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(168, 85, 247, 1)',
      },
    ],
  }

  const monthlyTrendOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          padding: 10,
          usePointStyle: true,
          font: {
            size: 12,
          },
        },
      },
      title: {
        display: true,
        text: t('trend chart title'),
        font: {
          size: 14,
          weight: 'bold' as const,
        },
        padding: {
          bottom: 20,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          font: {
            size: 10,
          },
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: 10,
          },
          maxRotation: 45,
        },
      },
    },
  }

  // Team Growth Doughnut Chart
  const teamGrowthData = {
    labels: [
      t('this month'),
      t('last month'),
      t('last year')
    ],
    datasets: [
      {
        data: [currentMonth.totalMembers, lastMonth.totalMembers, lastYear.totalMembers],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(168, 85, 247, 0.8)',
        ],
        borderColor: [
          'rgba(34, 197, 94, 1)',
          'rgba(59, 130, 246, 1)',
          'rgba(168, 85, 247, 1)',
        ],
        borderWidth: 2,
        hoverOffset: 4,
      },
    ],
  }

  const teamGrowthOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          padding: 15,
          usePointStyle: true,
          font: {
            size: 11,
          },
        },
      },
      title: {
        display: true,
        text: t('team growth title'),
        font: {
          size: 14,
          weight: 'bold' as const,
        },
        padding: {
          bottom: 20,
        },
      },
    },
  }

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8">
      {/* Top Row - Comparison Chart and Completion Rate */}
      <div className="grid grid-cols-2 gap-4 sm:gap-6">
        {/* Comparison Bar Chart */}
        <div className="bg-white rounded-[8px] sm:rounded-[8px] shadow-lg border border-gray-100 p-4 sm:p-6">
          <div className="h-96 sm:h-[28rem]">
            <Bar data={comparisonData} options={comparisonOptions} />
          </div>
        </div>

        {/* Completion Rate Doughnut Chart */}
        <div className="bg-white rounded-[8px] sm:rounded-[8px] shadow-lg border border-gray-100 p-4 sm:p-6">
          <div className="h-96 sm:h-[28rem]">
            <Doughnut data={completionRateData} options={completionRateOptions} />
          </div>
        </div>
      </div>

      {/* Bottom Row - Monthly Trend and Team Growth */}
      <div className="grid grid-cols-2 gap-4 sm:gap-6">
        {/* Monthly Trend Line Chart */}
        <div className="bg-white rounded-[8px] sm:rounded-[8px] shadow-lg border border-gray-100 p-4 sm:p-6">
          <div className="h-96 sm:h-[28rem]">
            <Line data={monthlyTrendData} options={monthlyTrendOptions} />
          </div>
        </div>

        {/* Team Growth Doughnut Chart */}
        <div className="bg-white rounded-[8px] sm:rounded-[8px] shadow-lg border border-gray-100 p-4 sm:p-6">
          <div className="h-96 sm:h-[28rem]">
            <Doughnut data={teamGrowthData} options={teamGrowthOptions} />
          </div>
        </div>
      </div>
    </div>
  )
}
