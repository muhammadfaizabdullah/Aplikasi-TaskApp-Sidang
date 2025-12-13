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

interface SupremeAnalyticsChartsProps {
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

export const SupremeAnalyticsCharts: React.FC<SupremeAnalyticsChartsProps> = ({
  currentMonth,
  monthOverMonth
}) => {
  // Supreme Analytics Summary Bar Chart
  const supremeAnalyticsSummaryData = {
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

  const supremeAnalyticsSummaryOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Supreme Analytics Summary',
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

  // Supreme Performance Distribution Doughnut Chart
  const supremePerformanceDistributionData = {
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

  const supremePerformanceDistributionOptions = {
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
        text: 'Supreme Performance Distribution',
        font: {
          size: 16,
          weight: 'bold' as const,
        },
      },
    },
  }

  // Supreme Trend Analysis Line Chart
  const supremeTrendAnalysisData = {
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

  const supremeTrendAnalysisOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Supreme Trend Analysis',
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

  // Supreme Success Rate Gauge (using Doughnut)
  const supremeSuccessRate = currentMonth.totalTasks > 0 
    ? Math.round((currentMonth.completedTasks / currentMonth.totalTasks) * 100) 
    : 0

  const supremeSuccessRateData = {
    labels: ['Success', 'In Progress'],
    datasets: [
      {
        data: [supremeSuccessRate, 100 - supremeSuccessRate],
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

  const supremeSuccessRateOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Supreme Success Rate',
        font: {
          size: 16,
          weight: 'bold' as const,
        },
      },
    },
  }

  return (
    <div className="space-y-8">
      {/* Top Row - Supreme Analytics Summary and Supreme Performance Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Supreme Analytics Summary Bar Chart */}
        <div className="bg-white rounded-[8px] shadow-lg border border-gray-100 p-6">
          <div className="h-80">
            <Bar data={supremeAnalyticsSummaryData} options={supremeAnalyticsSummaryOptions} />
          </div>
        </div>

        {/* Supreme Performance Distribution Doughnut Chart */}
        <div className="bg-white rounded-[8px] shadow-lg border border-gray-100 p-6">
          <div className="h-80">
            <Doughnut data={supremePerformanceDistributionData} options={supremePerformanceDistributionOptions} />
          </div>
        </div>
      </div>

      {/* Middle Row - Supreme Trend Analysis and Supreme Success Rate */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Supreme Trend Analysis Line Chart */}
        <div className="bg-white rounded-[8px] shadow-lg border border-gray-100 p-6">
          <div className="h-80">
            <Line data={supremeTrendAnalysisData} options={supremeTrendAnalysisOptions} />
          </div>
        </div>

        {/* Supreme Success Rate Gauge */}
        <div className="bg-white rounded-[8px] shadow-lg border border-gray-100 p-6">
          <div className="h-80 relative">
            <Doughnut data={supremeSuccessRateData} options={supremeSuccessRateOptions} />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-4xl font-bold text-gray-900">{supremeSuccessRate}%</div>
                <div className="text-sm text-gray-600">Supreme Success Rate</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}



