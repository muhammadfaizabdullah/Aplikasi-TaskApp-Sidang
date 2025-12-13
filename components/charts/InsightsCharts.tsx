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

interface InsightsChartsProps {
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

export const InsightsCharts: React.FC<InsightsChartsProps> = ({
  currentMonth,
  monthOverMonth
}) => {
  // Key Insights Bar Chart
  const keyInsightsData = {
    labels: ['Productivity', 'Efficiency', 'Quality', 'Innovation', 'Collaboration'],
    datasets: [
      {
        label: 'Current Score',
        data: [
          Math.min((currentMonth.completedTasks / Math.max(currentMonth.totalTasks, 1)) * 100, 100),
          Math.min((currentMonth.totalProjects / 5) * 100, 100),
          Math.min((currentMonth.completedTasks / Math.max(currentMonth.totalTasks, 1)) * 100, 100),
          Math.min((currentMonth.totalProjects / 3) * 100, 100),
          Math.min((currentMonth.totalMembers / 8) * 100, 100)
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
        label: 'Target Score',
        data: [90, 85, 95, 80, 88],
        backgroundColor: 'rgba(156, 163, 175, 0.8)',
        borderColor: 'rgba(156, 163, 175, 1)',
        borderWidth: 2,
        borderRadius: 8,
      },
    ],
  }

  const keyInsightsOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Key Performance Insights',
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

  // Improvement Areas Doughnut Chart
  const improvementAreasData = {
    labels: ['Task Management', 'Project Planning', 'Team Communication', 'Quality Control', 'Resource Allocation'],
    datasets: [
      {
        data: [
          Math.min((currentMonth.totalTasks / 10) * 100, 100) * 0.3,
          Math.min((currentMonth.totalProjects / 5) * 100, 100) * 0.25,
          Math.min((currentMonth.totalMembers / 8) * 100, 100) * 0.2,
          Math.min((currentMonth.completedTasks / Math.max(currentMonth.totalTasks, 1)) * 100, 100) * 0.15,
          Math.min((currentMonth.totalMembers / 6) * 100, 100) * 0.1
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
        hoverOffset: 4,
      },
    ],
  }

  const improvementAreasOptions = {
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
        text: 'Improvement Areas Focus',
        font: {
          size: 16,
          weight: 'bold' as const,
        },
      },
    },
  }

  // Trend Analysis Line Chart
  const trendAnalysisData = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    datasets: [
      {
        label: 'Productivity Trend (%)',
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
        label: 'Quality Trend (%)',
        data: [
          Math.min((currentMonth.completedTasks / Math.max(currentMonth.totalTasks, 1)) * 100, 100) * 0.85,
          Math.min((currentMonth.completedTasks / Math.max(currentMonth.totalTasks, 1)) * 100, 100) * 0.9,
          Math.min((currentMonth.completedTasks / Math.max(currentMonth.totalTasks, 1)) * 100, 100) * 0.95,
          Math.min((currentMonth.completedTasks / Math.max(currentMonth.totalTasks, 1)) * 100, 100)
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
        label: 'Innovation Trend (%)',
        data: [
          Math.min((currentMonth.totalProjects / 3) * 100, 100) * 0.7,
          Math.min((currentMonth.totalProjects / 3) * 100, 100) * 0.8,
          Math.min((currentMonth.totalProjects / 3) * 100, 100) * 0.9,
          Math.min((currentMonth.totalProjects / 3) * 100, 100)
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

  const trendAnalysisOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Weekly Trend Analysis',
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

  // Recommendations Priority Bar Chart
  const recommendationsPriorityData = {
    labels: ['High Priority', 'Medium Priority', 'Low Priority', 'Future Consideration'],
    datasets: [
      {
        label: 'Recommendation Count',
        data: [
          Math.min((currentMonth.totalTasks / 5), 8),
          Math.min((currentMonth.totalProjects / 3), 6),
          Math.min((currentMonth.totalMembers / 4), 4),
          Math.min((currentMonth.completedTasks / 10), 2)
        ],
        backgroundColor: [
          'rgba(239, 68, 68, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(156, 163, 175, 0.8)',
        ],
        borderColor: [
          'rgba(239, 68, 68, 1)',
          'rgba(245, 158, 11, 1)',
          'rgba(59, 130, 246, 1)',
          'rgba(156, 163, 175, 1)',
        ],
        borderWidth: 2,
        borderRadius: 8,
      },
    ],
  }

  const recommendationsPriorityOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Recommendations Priority Level',
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
      {/* Top Row - Key Insights and Improvement Areas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Key Insights Bar Chart */}
        <div className="bg-white rounded-[8px] shadow-lg border border-gray-100 p-6">
          <div className="h-80">
            <Bar data={keyInsightsData} options={keyInsightsOptions} />
          </div>
        </div>

        {/* Improvement Areas Doughnut Chart */}
        <div className="bg-white rounded-[8px] shadow-lg border border-gray-100 p-6">
          <div className="h-80">
            <Doughnut data={improvementAreasData} options={improvementAreasOptions} />
          </div>
        </div>
      </div>

      {/* Middle Row - Trend Analysis and Recommendations Priority */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trend Analysis Line Chart */}
        <div className="bg-white rounded-[8px] shadow-lg border border-gray-100 p-6">
          <div className="h-80">
            <Line data={trendAnalysisData} options={trendAnalysisOptions} />
          </div>
        </div>

        {/* Recommendations Priority Bar Chart */}
        <div className="bg-white rounded-[8px] shadow-lg border border-gray-100 p-6">
          <div className="h-80">
            <Bar data={recommendationsPriorityData} options={recommendationsPriorityOptions} />
          </div>
        </div>
      </div>
    </div>
  )
}



