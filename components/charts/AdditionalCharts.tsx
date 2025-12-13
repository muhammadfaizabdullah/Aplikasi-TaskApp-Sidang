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
import { Doughnut, Radar, PolarArea } from 'react-chartjs-2'

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

interface AdditionalChartsProps {
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

export const AdditionalCharts: React.FC<AdditionalChartsProps> = ({
  currentMonth,
  monthOverMonth
}) => {
  // Team Performance Radar Chart
  const teamPerformanceData = {
    labels: [
      'Project Management',
      'Task Completion',
      'Team Collaboration',
      'Productivity',
      'Quality',
      'Innovation'
    ],
    datasets: [
      {
        label: 'Current Performance',
        data: [
          Math.min((currentMonth.totalProjects / 10) * 100, 100),
          Math.min((currentMonth.completedTasks / currentMonth.totalTasks) * 100, 100) || 0,
          Math.min((currentMonth.totalMembers / 10) * 100, 100),
          Math.min(((currentMonth.completedTasks + currentMonth.totalTasks) / 20) * 100, 100),
          Math.min((currentMonth.completedTasks / currentMonth.totalTasks) * 100, 100) || 0,
          Math.min((currentMonth.totalProjects / 5) * 100, 100)
        ],
        borderColor: 'rgba(34, 197, 94, 1)',
        backgroundColor: 'rgba(34, 197, 94, 0.2)',
        borderWidth: 2,
        pointBackgroundColor: 'rgba(34, 197, 94, 1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(34, 197, 94, 1)',
      },
      {
        label: 'Target Performance',
        data: [80, 85, 75, 90, 80, 70],
        borderColor: 'rgba(59, 130, 246, 1)',
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        borderWidth: 2,
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
        text: 'Team Performance Analysis',
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

  // Monthly Growth Polar Area Chart
  const monthlyGrowthData = {
    labels: ['Projects', 'Tasks', 'Completed', 'Members'],
    datasets: [
      {
        label: 'Growth Rate (%)',
        data: [
          monthOverMonth.projects > 0 ? Math.min(monthOverMonth.projects * 10, 100) : 0,
          monthOverMonth.tasks > 0 ? Math.min(monthOverMonth.tasks * 5, 100) : 0,
          monthOverMonth.completedTasks > 0 ? Math.min(monthOverMonth.completedTasks * 5, 100) : 0,
          monthOverMonth.members > 0 ? Math.min(monthOverMonth.members * 20, 100) : 0,
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
      },
    ],
  }

  const monthlyGrowthOptions = {
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
        text: 'Monthly Growth Indicators',
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

  // Productivity Distribution Doughnut
  const productivityData = {
    labels: ['High Productivity', 'Medium Productivity', 'Low Productivity'],
    datasets: [
      {
        data: [
          currentMonth.completedTasks > 0 ? Math.min(currentMonth.completedTasks * 2, 60) : 0,
          currentMonth.totalTasks > currentMonth.completedTasks ? Math.min((currentMonth.totalTasks - currentMonth.completedTasks) * 2, 30) : 0,
          currentMonth.totalTasks === 0 ? 100 : Math.max(100 - (currentMonth.completedTasks + (currentMonth.totalTasks - currentMonth.completedTasks)) * 2, 10)
        ],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)',
        ],
        borderColor: [
          'rgba(34, 197, 94, 1)',
          'rgba(245, 158, 11, 1)',
          'rgba(239, 68, 68, 1)',
        ],
        borderWidth: 2,
        hoverOffset: 4,
      },
    ],
  }

  const productivityOptions = {
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
        text: 'Productivity Distribution',
        font: {
          size: 16,
          weight: 'bold' as const,
        },
      },
    },
  }

  return (
    <div className="space-y-8">
      {/* Top Row - Team Performance and Monthly Growth */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Team Performance Radar Chart */}
        <div className="bg-white rounded-[8px] shadow-lg border border-gray-100 p-6">
          <div className="h-80">
            <Radar data={teamPerformanceData} options={teamPerformanceOptions} />
          </div>
        </div>

        {/* Monthly Growth Polar Area Chart */}
        <div className="bg-white rounded-[8px] shadow-lg border border-gray-100 p-6">
          <div className="h-80">
            <PolarArea data={monthlyGrowthData} options={monthlyGrowthOptions} />
          </div>
        </div>
      </div>

      {/* Bottom Row - Productivity Distribution */}
      <div className="grid grid-cols-1 gap-6">
        {/* Productivity Distribution Doughnut */}
        <div className="bg-white rounded-[8px] shadow-lg border border-gray-100 p-6">
          <div className="h-80">
            <Doughnut data={productivityData} options={productivityOptions} />
          </div>
        </div>
      </div>
    </div>
  )
}



