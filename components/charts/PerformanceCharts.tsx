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
  RadialLinearScale,
} from 'chart.js'
import { Doughnut, Radar, PolarArea, Bar } from 'react-chartjs-2'

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
  Filler,
  RadialLinearScale
)

interface PerformanceChartsProps {
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

export const PerformanceCharts: React.FC<PerformanceChartsProps> = ({
  currentMonth,
  monthOverMonth
}) => {
  // Team Performance Score Radar Chart
  const teamPerformanceData = {
    labels: [
      'Project Management',
      'Task Efficiency',
      'Team Collaboration',
      'Quality Control',
      'Innovation',
      'Deadline Adherence'
    ],
    datasets: [
      {
        label: 'Current Score',
        data: [
          Math.min((currentMonth.totalProjects / 5) * 100, 100),
          Math.min((currentMonth.completedTasks / Math.max(currentMonth.totalTasks, 1)) * 100, 100),
          Math.min((currentMonth.totalMembers / 8) * 100, 100),
          Math.min((currentMonth.completedTasks / Math.max(currentMonth.totalTasks, 1)) * 100, 100),
          Math.min((currentMonth.totalProjects / 3) * 100, 100),
          Math.min((currentMonth.completedTasks / Math.max(currentMonth.totalTasks, 1)) * 100, 100)
        ],
        borderColor: 'rgba(34, 197, 94, 1)',
        backgroundColor: 'rgba(34, 197, 94, 0.2)',
        borderWidth: 3,
        pointBackgroundColor: 'rgba(34, 197, 94, 1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(34, 197, 94, 1)',
      },
      {
        label: 'Target Score',
        data: [85, 90, 80, 95, 75, 88],
        borderColor: 'rgba(59, 130, 246, 1)',
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        borderWidth: 3,
        pointBackgroundColor: 'rgba(59, 130, 246, 1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(59, 130, 246, 1)',
      },
    ],
  }

  const teamPerformanceOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Team Performance Score',
        font: {
          size: 16,
          weight: 'bold' as const,
        },
      },
    },
    scales: {
      r: {
        beginAtZero: true,
        max: 100,
        ticks: {
          stepSize: 20,
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
      },
    },
  }

  // Workload Distribution Polar Area Chart
  const workloadData = {
    labels: ['Project Planning', 'Task Execution', 'Code Review', 'Testing', 'Documentation', 'Meetings'],
    datasets: [
      {
        label: 'Time Allocation (%)',
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
      },
    ],
  }

  const workloadOptions = {
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
        text: 'Workload Distribution',
        font: {
          size: 16,
          weight: 'bold' as const,
        },
      },
    },
    scales: {
      r: {
        beginAtZero: true,
        max: 40,
        ticks: {
          stepSize: 10,
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
      },
    },
  }

  // Productivity Metrics Bar Chart
  const productivityMetricsData = {
    labels: ['Tasks/Hour', 'Projects/Week', 'Completion Rate', 'Team Efficiency', 'Quality Score'],
    datasets: [
      {
        label: 'Current Performance',
        data: [
          Math.min((currentMonth.totalTasks / 160), 5), // Assuming 160 working hours per month
          Math.min((currentMonth.totalProjects / 4), 3), // Assuming 4 weeks per month
          Math.min((currentMonth.completedTasks / Math.max(currentMonth.totalTasks, 1)) * 100, 100),
          Math.min((currentMonth.totalMembers * 10), 100),
          Math.min((currentMonth.completedTasks / Math.max(currentMonth.totalTasks, 1)) * 100, 100)
        ],
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
      },
      {
        label: 'Industry Average',
        data: [2.5, 1.8, 75, 80, 85],
        backgroundColor: 'rgba(156, 163, 175, 0.8)',
        borderColor: 'rgba(156, 163, 175, 1)',
        borderWidth: 2,
        borderRadius: 8,
      },
    ],
  }

  const productivityMetricsOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Productivity Metrics vs Industry Average',
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
        cutout: '75%',
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
      {/* Top Row - Team Performance and Workload */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Team Performance Radar Chart */}
        <div className="bg-white rounded-[8px] shadow-lg border border-gray-100 p-6">
          <div className="h-80">
            <Radar data={teamPerformanceData} options={teamPerformanceOptions} />
          </div>
        </div>

        {/* Workload Distribution Polar Area Chart */}
        <div className="bg-white rounded-[8px] shadow-lg border border-gray-100 p-6">
          <div className="h-80">
            <PolarArea data={workloadData} options={workloadOptions} />
          </div>
        </div>
      </div>

      {/* Middle Row - Productivity Metrics and Success Rate */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Productivity Metrics Bar Chart */}
        <div className="bg-white rounded-[8px] shadow-lg border border-gray-100 p-6">
          <div className="h-80">
            <Bar data={productivityMetricsData} options={productivityMetricsOptions} />
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



