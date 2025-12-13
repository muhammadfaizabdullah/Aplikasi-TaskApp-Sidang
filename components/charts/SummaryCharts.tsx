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
import { Line, Bar, Doughnut } from 'react-chartjs-2'

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

interface SummaryChartsProps {
  currentMonth: {
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
}

export const SummaryCharts: React.FC<SummaryChartsProps> = ({
  currentMonth,
  monthOverMonth
}) => {
  // Monthly Summary Bar Chart
  const monthlySummaryData = {
    labels: ['Projects', 'Tasks', 'Completed', 'Members'],
    datasets: [
      {
        label: 'Current Month',
        data: [
          currentMonth.totalProjects,
          currentMonth.totalTasks,
          currentMonth.completedTasks,
          currentMonth.totalMembers
        ],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(168, 85, 247, 0.8)',
          'rgba(245, 158, 11, 0.8)',
        ],
        borderColor: [
          'rgba(34, 197, 94, 1)',
          'rgba(59, 130, 246, 1)',
          'rgba(168, 85, 247, 1)',
          'rgba(245, 158, 11, 1)',
        ],
        borderWidth: 2,
        borderRadius: 8,
      },
      {
        label: 'Growth from Last Month',
        data: [
          monthOverMonth.projects,
          monthOverMonth.tasks,
          monthOverMonth.completedTasks,
          monthOverMonth.members
        ],
        backgroundColor: 'rgba(156, 163, 175, 0.8)',
        borderColor: 'rgba(156, 163, 175, 1)',
        borderWidth: 2,
        borderRadius: 8,
      },
    ],
  }

  const monthlySummaryOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Monthly Summary Overview',
        font: {
          size: 16,
          weight: 'bold' as const,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  }

  // Team Performance Doughnut Chart
  const teamPerformanceData = {
    labels: ['Excellent', 'Good', 'Average', 'Needs Improvement'],
    datasets: [
      {
        data: [
          Math.min((currentMonth.completedTasks / Math.max(currentMonth.totalTasks, 1)) * 100, 100) * 0.4,
          Math.min((currentMonth.totalProjects / 5) * 100, 100) * 0.3,
          Math.min((currentMonth.totalMembers / 8) * 100, 100) * 0.2,
          Math.max(100 - (currentMonth.completedTasks / Math.max(currentMonth.totalTasks, 1)) * 100 * 0.4 - (currentMonth.totalProjects / 5) * 100 * 0.3 - (currentMonth.totalMembers / 8) * 100 * 0.2, 10)
        ],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)',
        ],
        borderColor: [
          'rgba(34, 197, 94, 1)',
          'rgba(59, 130, 246, 1)',
          'rgba(245, 158, 11, 1)',
          'rgba(239, 68, 68, 1)',
        ],
        borderWidth: 2,
        hoverOffset: 4,
      },
    ],
  }

  const teamPerformanceOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          padding: 20,
          usePointStyle: true,
        },
      },
      title: {
        display: true,
        text: 'Team Performance Distribution',
        font: {
          size: 16,
          weight: 'bold' as const,
        },
      },
    },
  }

  // Productivity Trend Line Chart
  const productivityTrendData = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    datasets: [
      {
        label: 'Task Completion Rate (%)',
        data: [
          Math.min((currentMonth.completedTasks / Math.max(currentMonth.totalTasks, 1)) * 100, 100) * 0.8,
          Math.min((currentMonth.completedTasks / Math.max(currentMonth.totalTasks, 1)) * 100, 100) * 0.9,
          Math.min((currentMonth.completedTasks / Math.max(currentMonth.totalTasks, 1)) * 100, 100) * 0.95,
          Math.min((currentMonth.completedTasks / Math.max(currentMonth.totalTasks, 1)) * 100, 100)
        ],
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
        label: 'Project Progress (%)',
        data: [
          Math.min((currentMonth.totalProjects / 5) * 100, 100) * 0.7,
          Math.min((currentMonth.totalProjects / 5) * 100, 100) * 0.8,
          Math.min((currentMonth.totalProjects / 5) * 100, 100) * 0.9,
          Math.min((currentMonth.totalProjects / 5) * 100, 100)
        ],
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
    ],
  }

  const productivityTrendOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Weekly Productivity Trends',
        font: {
          size: 16,
          weight: 'bold' as const,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          callback: function(value: any) {
            return value + '%'
          }
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  }

  // Success Rate Gauge (using Doughnut)
  const successRate = currentMonth.totalTasks > 0 
    ? Math.round((currentMonth.completedTasks / currentMonth.totalTasks) * 100) 
    : 0

  const successRateData = {
    labels: ['Success', 'In Progress'],
    datasets: [
      {
        data: [successRate, 100 - successRate],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',
          'rgba(229, 231, 235, 0.8)',
        ],
        borderColor: [
          'rgba(34, 197, 94, 1)',
          'rgba(229, 231, 235, 1)',
        ],
        borderWidth: 3,
        cutout: '70%',
      },
    ],
  }

  const successRateOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Overall Success Rate',
        font: {
          size: 16,
          weight: 'bold' as const,
        },
      },
    },
  }

  return (
    <div className="space-y-8">
      {/* Top Row - Monthly Summary and Team Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Summary Bar Chart */}
        <div className="bg-white rounded-[8px] shadow-lg border border-gray-100 p-6">
          <div className="h-80">
            <Bar data={monthlySummaryData} options={monthlySummaryOptions} />
          </div>
        </div>

        {/* Team Performance Doughnut Chart */}
        <div className="bg-white rounded-[8px] shadow-lg border border-gray-100 p-6">
          <div className="h-80">
            <Doughnut data={teamPerformanceData} options={teamPerformanceOptions} />
          </div>
        </div>
      </div>

      {/* Middle Row - Productivity Trend and Success Rate */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Productivity Trend Line Chart */}
        <div className="bg-white rounded-[8px] shadow-lg border border-gray-100 p-6">
          <div className="h-80">
            <Line data={productivityTrendData} options={productivityTrendOptions} />
          </div>
        </div>

        {/* Success Rate Gauge */}
        <div className="bg-white rounded-[8px] shadow-lg border border-gray-100 p-6">
          <div className="h-80 relative">
            <Doughnut data={successRateData} options={successRateOptions} />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-4xl font-bold text-gray-900">{successRate}%</div>
                <div className="text-sm text-gray-600">Success Rate</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}



