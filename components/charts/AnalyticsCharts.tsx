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
import { Bar, Doughnut, Line, Pie } from 'react-chartjs-2'

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

interface ProjectProgress {
  projectName: string
  progress: number
}

interface TaskStatusDistribution {
  status: string
  count: number
}

interface AnalyticsChartsProps {
  projectProgress: ProjectProgress[]
  taskStatusDistribution: TaskStatusDistribution[]
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

export const AnalyticsCharts: React.FC<AnalyticsChartsProps> = ({
  projectProgress,
  taskStatusDistribution,
  currentMonth,
  monthOverMonth
}) => {
  // Project Progress Bar Chart
  const projectProgressData = {
    labels: projectProgress.map(p => p.projectName),
    datasets: [
      {
        label: 'Progress (%)',
        data: projectProgress.map(p => p.progress),
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(168, 85, 247, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)',
        ],
        borderColor: [
          'rgba(34, 197, 94, 1)',
          'rgba(59, 130, 246, 1)',
          'rgba(168, 85, 247, 1)',
          'rgba(245, 158, 11, 1)',
          'rgba(239, 68, 68, 1)',
        ],
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false,
      },
    ],
  }

  const projectProgressOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Project Progress Overview',
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

  // Task Status Doughnut Chart
  const taskStatusData = {
    labels: taskStatusDistribution.map(t => {
      switch(t.status) {
        case 'COMPLETED': return 'Completed'
        case 'IN_PROGRESS': return 'In Progress'
        case 'PENDING': return 'Pending'
        case 'TODO': return 'To Do'
        default: return t.status
      }
    }),
    datasets: [
      {
        data: taskStatusDistribution.map(t => t.count),
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(156, 163, 175, 0.8)',
          'rgba(245, 158, 11, 0.8)',
        ],
        borderColor: [
          'rgba(34, 197, 94, 1)',
          'rgba(59, 130, 246, 1)',
          'rgba(156, 163, 175, 1)',
          'rgba(245, 158, 11, 1)',
        ],
        borderWidth: 2,
        hoverOffset: 4,
      },
    ],
  }

  const taskStatusOptions = {
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
        text: 'Task Status Distribution',
        font: {
          size: 16,
          weight: 'bold' as const,
        },
      },
    },
  }

  // Monthly Comparison Bar Chart
  const monthlyComparisonData = {
    labels: ['Projects', 'Tasks', 'Completed Tasks', 'Members'],
    datasets: [
      {
        label: 'Current Month',
        data: [
          currentMonth.totalProjects,
          currentMonth.totalTasks,
          currentMonth.completedTasks,
          currentMonth.totalMembers,
        ],
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
        borderColor: 'rgba(34, 197, 94, 1)',
        borderWidth: 2,
        borderRadius: 8,
      },
      {
        label: 'Change from Last Month',
        data: [
          monthOverMonth.projects,
          monthOverMonth.tasks,
          monthOverMonth.completedTasks,
          monthOverMonth.members,
        ],
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 2,
        borderRadius: 8,
      },
    ],
  }

  const monthlyComparisonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Monthly Performance Comparison',
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

  // Completion Rate Gauge (using Doughnut)
  const completionRate = currentMonth.totalTasks > 0 
    ? Math.round((currentMonth.completedTasks / currentMonth.totalTasks) * 100) 
    : 0

  const completionRateData = {
    labels: ['Completed', 'Remaining'],
    datasets: [
      {
        data: [completionRate, 100 - completionRate],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',
          'rgba(229, 231, 235, 0.8)',
        ],
        borderColor: [
          'rgba(34, 197, 94, 1)',
          'rgba(229, 231, 235, 1)',
        ],
        borderWidth: 2,
        cutout: '70%',
      },
    ],
  }

  const completionRateOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Task Completion Rate',
        font: {
          size: 16,
          weight: 'bold' as const,
        },
      },
    },
  }

  // Team Productivity Line Chart (simulated data)
  const productivityData = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    datasets: [
      {
        label: 'Tasks Completed',
        data: [2, 4, 3, 5],
        borderColor: 'rgba(34, 197, 94, 1)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Tasks Created',
        data: [3, 5, 4, 6],
        borderColor: 'rgba(59, 130, 246, 1)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
      },
    ],
  }

  const productivityOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Weekly Productivity Trend',
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

  return (
    <div className="space-y-8">
      {/* Top Row - Project Progress and Task Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Project Progress Bar Chart */}
        <div className="bg-white rounded-[8px] shadow-lg border border-gray-100 p-6">
          <div className="h-80">
            <Bar data={projectProgressData} options={projectProgressOptions} />
          </div>
        </div>

        {/* Task Status Doughnut Chart */}
        <div className="bg-white rounded-[8px] shadow-lg border border-gray-100 p-6">
          <div className="h-80">
            <Doughnut data={taskStatusData} options={taskStatusOptions} />
          </div>
        </div>
      </div>

      {/* Middle Row - Completion Rate and Monthly Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Completion Rate Gauge */}
        <div className="bg-white rounded-[8px] shadow-lg border border-gray-100 p-6">
          <div className="h-80 relative">
            <Doughnut data={completionRateData} options={completionRateOptions} />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-4xl font-bold text-gray-900">{completionRate}%</div>
                <div className="text-sm text-gray-600">Completion Rate</div>
              </div>
            </div>
          </div>
        </div>

        {/* Monthly Comparison Bar Chart */}
        <div className="bg-white rounded-[8px] shadow-lg border border-gray-100 p-6">
          <div className="h-80">
            <Bar data={monthlyComparisonData} options={monthlyComparisonOptions} />
          </div>
        </div>
      </div>

      {/* Bottom Row - Productivity Trend */}
      <div className="grid grid-cols-1 gap-6">
        {/* Weekly Productivity Line Chart */}
        <div className="bg-white rounded-[8px] shadow-lg border border-gray-100 p-6">
          <div className="h-80">
            <Line data={productivityData} options={productivityOptions} />
          </div>
        </div>
      </div>
    </div>
  )
}



