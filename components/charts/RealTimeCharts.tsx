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

interface RealTimeChartsProps {
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

export const RealTimeCharts: React.FC<RealTimeChartsProps> = ({
  currentMonth,
  monthOverMonth
}) => {
  // Real-time Activity Line Chart (simulated hourly data)
  const realTimeActivityData = {
    labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'],
    datasets: [
      {
        label: 'Active Users',
        data: [2, 1, 3, 4, 3, 2],
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
        label: 'Tasks Completed',
        data: [0, 0, 1, 2, 1, 0],
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

  const realTimeActivityOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Real-time Activity (Last 24 Hours)',
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

  // System Performance Bar Chart
  const systemPerformanceData = {
    labels: ['CPU Usage', 'Memory Usage', 'Disk Usage', 'Network I/O', 'Database', 'Cache'],
    datasets: [
      {
        label: 'Current Usage (%)',
        data: [
          Math.min((currentMonth.totalTasks * 2), 80),
          Math.min((currentMonth.totalProjects * 5), 70),
          Math.min((currentMonth.totalMembers * 3), 60),
          Math.min((currentMonth.completedTasks * 2), 50),
          Math.min((currentMonth.totalTasks * 1.5), 40),
          Math.min((currentMonth.totalProjects * 2), 30)
        ],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(168, 85, 247, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(156, 163, 175, 0.8)',
        ],
        borderColor: [
          'rgba(34, 197, 94, 1)',
          'rgba(59, 130, 246, 1)',
          'rgba(168, 85, 247, 1)',
          'rgba(245, 158, 11, 1)',
          'rgba(239, 68, 68, 1)',
          'rgba(156, 163, 175, 1)',
        ],
        borderWidth: 2,
        borderRadius: 8,
      },
      {
        label: 'Threshold (%)',
        data: [80, 85, 90, 75, 70, 60],
        backgroundColor: 'rgba(156, 163, 175, 0.8)',
        borderColor: 'rgba(156, 163, 175, 1)',
        borderWidth: 2,
        borderRadius: 8,
      },
    ],
  }

  const systemPerformanceOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'System Performance Metrics',
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

  // User Engagement Doughnut Chart
  const userEngagementData = {
    labels: ['Highly Engaged', 'Moderately Engaged', 'Low Engagement', 'Inactive'],
    datasets: [
      {
        data: [
          Math.min((currentMonth.completedTasks * 2), 40),
          Math.min((currentMonth.totalTasks * 1.5), 35),
          Math.min((currentMonth.totalMembers * 2), 20),
          Math.max(100 - (currentMonth.completedTasks * 2 + currentMonth.totalTasks * 1.5 + currentMonth.totalMembers * 2), 5)
        ],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(156, 163, 175, 0.8)',
        ],
        borderColor: [
          'rgba(34, 197, 94, 1)',
          'rgba(59, 130, 246, 1)',
          'rgba(245, 158, 11, 1)',
          'rgba(156, 163, 175, 1)',
        ],
        borderWidth: 2,
        hoverOffset: 4,
      },
    ],
  }

  const userEngagementOptions = {
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
        text: 'User Engagement Levels',
        font: {
          size: 16,
          weight: 'bold' as const,
        },
      },
    },
  }

  // Error Rate Trend Line Chart
  const errorRateData = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    datasets: [
      {
        label: 'Error Rate (%)',
        data: [2.5, 2.0, 1.8, 1.5],
        borderColor: 'rgba(239, 68, 68, 1)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: 'rgba(239, 68, 68, 1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(239, 68, 68, 1)',
      },
      {
        label: 'Success Rate (%)',
        data: [97.5, 98.0, 98.2, 98.5],
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
    ],
  }

  const errorRateOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Error Rate vs Success Rate Trend',
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

  return (
    <div className="space-y-8">
      {/* Top Row - Real-time Activity and System Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Real-time Activity Line Chart */}
        <div className="bg-white rounded-[8px] shadow-lg border border-gray-100 p-6">
          <div className="h-80">
            <Line data={realTimeActivityData} options={realTimeActivityOptions} />
          </div>
        </div>

        {/* System Performance Bar Chart */}
        <div className="bg-white rounded-[8px] shadow-lg border border-gray-100 p-6">
          <div className="h-80">
            <Bar data={systemPerformanceData} options={systemPerformanceOptions} />
          </div>
        </div>
      </div>

      {/* Middle Row - User Engagement and Error Rate */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Engagement Doughnut Chart */}
        <div className="bg-white rounded-[8px] shadow-lg border border-gray-100 p-6">
          <div className="h-80">
            <Doughnut data={userEngagementData} options={userEngagementOptions} />
          </div>
        </div>

        {/* Error Rate Trend Line Chart */}
        <div className="bg-white rounded-[8px] shadow-lg border border-gray-100 p-6">
          <div className="h-80">
            <Line data={errorRateData} options={errorRateOptions} />
          </div>
        </div>
      </div>
    </div>
  )
}



