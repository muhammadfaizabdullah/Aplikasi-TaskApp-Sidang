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
import { Bar, Line, Doughnut } from 'react-chartjs-2'

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

interface HeatmapChartsProps {
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

export const HeatmapCharts: React.FC<HeatmapChartsProps> = ({
  currentMonth,
  monthOverMonth
}) => {
  // Activity Heatmap (simulated daily data)
  const activityHeatmapData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Tasks Created',
        data: [
          Math.ceil(currentMonth.totalTasks * 0.2),
          Math.ceil(currentMonth.totalTasks * 0.25),
          Math.ceil(currentMonth.totalTasks * 0.2),
          Math.ceil(currentMonth.totalTasks * 0.15),
          Math.ceil(currentMonth.totalTasks * 0.1),
          Math.ceil(currentMonth.totalTasks * 0.05),
          Math.ceil(currentMonth.totalTasks * 0.05)
        ],
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
        borderColor: 'rgba(34, 197, 94, 1)',
        borderWidth: 2,
        borderRadius: 8,
      },
      {
        label: 'Tasks Completed',
        data: [
          Math.ceil(currentMonth.completedTasks * 0.2),
          Math.ceil(currentMonth.completedTasks * 0.25),
          Math.ceil(currentMonth.completedTasks * 0.2),
          Math.ceil(currentMonth.completedTasks * 0.15),
          Math.ceil(currentMonth.completedTasks * 0.1),
          Math.ceil(currentMonth.completedTasks * 0.05),
          Math.ceil(currentMonth.completedTasks * 0.05)
        ],
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 2,
        borderRadius: 8,
      },
    ],
  }

  const activityHeatmapOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Weekly Activity Heatmap',
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

  // Resource Utilization Bar Chart
  const resourceUtilizationData = {
    labels: ['Project Planning', 'Development', 'Testing', 'Review', 'Documentation', 'Meetings'],
    datasets: [
      {
        label: 'Time Spent (%)',
        data: [
          Math.min((currentMonth.totalProjects * 15), 25),
          Math.min((currentMonth.totalTasks * 8), 35),
          Math.min((currentMonth.completedTasks * 5), 15),
          Math.min((currentMonth.completedTasks * 3), 10),
          Math.min((currentMonth.totalProjects * 2), 8),
          Math.min((currentMonth.totalMembers * 2), 7)
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
    ],
  }

  const resourceUtilizationOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Resource Utilization',
        font: {
          size: 16,
          weight: 'bold' as const,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 40,
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

  // Team Collaboration Doughnut Chart
  const teamCollaborationData = {
    labels: ['Direct Collaboration', 'Async Communication', 'Code Reviews', 'Planning Meetings', 'Other'],
    datasets: [
      {
        data: [
          Math.min((currentMonth.totalMembers * 8), 30),
          Math.min((currentMonth.totalMembers * 6), 25),
          Math.min((currentMonth.completedTasks * 2), 20),
          Math.min((currentMonth.totalProjects * 3), 15),
          Math.min((currentMonth.totalMembers * 2), 10)
        ],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(168, 85, 247, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(156, 163, 175, 0.8)',
        ],
        borderColor: [
          'rgba(34, 197, 94, 1)',
          'rgba(59, 130, 246, 1)',
          'rgba(168, 85, 247, 1)',
          'rgba(245, 158, 11, 1)',
          'rgba(156, 163, 175, 1)',
        ],
        borderWidth: 2,
        hoverOffset: 4,
      },
    ],
  }

  const teamCollaborationOptions = {
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
        text: 'Team Collaboration Distribution',
        font: {
          size: 16,
          weight: 'bold' as const,
        },
      },
    },
  }

  // Performance Metrics Line Chart
  const performanceMetricsData = {
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
      {
        label: 'Team Efficiency (%)',
        data: [
          Math.min((currentMonth.totalMembers * 10), 100) * 0.8,
          Math.min((currentMonth.totalMembers * 10), 100) * 0.85,
          Math.min((currentMonth.totalMembers * 10), 100) * 0.9,
          Math.min((currentMonth.totalMembers * 10), 100)
        ],
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

  const performanceMetricsOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Weekly Performance Metrics',
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
      {/* Top Row - Activity Heatmap and Resource Utilization */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activity Heatmap Bar Chart */}
        <div className="bg-white rounded-[8px] shadow-lg border border-gray-100 p-6">
          <div className="h-80">
            <Bar data={activityHeatmapData} options={activityHeatmapOptions} />
          </div>
        </div>

        {/* Resource Utilization Bar Chart */}
        <div className="bg-white rounded-[8px] shadow-lg border border-gray-100 p-6">
          <div className="h-80">
            <Bar data={resourceUtilizationData} options={resourceUtilizationOptions} />
          </div>
        </div>
      </div>

      {/* Middle Row - Team Collaboration and Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Team Collaboration Doughnut Chart */}
        <div className="bg-white rounded-[8px] shadow-lg border border-gray-100 p-6">
          <div className="h-80">
            <Doughnut data={teamCollaborationData} options={teamCollaborationOptions} />
          </div>
        </div>

        {/* Performance Metrics Line Chart */}
        <div className="bg-white rounded-[8px] shadow-lg border border-gray-100 p-6">
          <div className="h-80">
            <Line data={performanceMetricsData} options={performanceMetricsOptions} />
          </div>
        </div>
      </div>
    </div>
  )
}



