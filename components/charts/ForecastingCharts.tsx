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

interface ForecastingChartsProps {
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

export const ForecastingCharts: React.FC<ForecastingChartsProps> = ({
  currentMonth,
  monthOverMonth
}) => {
  // Future Projection Line Chart
  const futureProjectionData = {
    labels: ['Current', 'Next Month', '2 Months', '3 Months', '6 Months', '1 Year'],
    datasets: [
      {
        label: 'Projected Projects',
        data: [
          currentMonth.totalProjects,
          currentMonth.totalProjects + (monthOverMonth.projects > 0 ? monthOverMonth.projects : 1),
          currentMonth.totalProjects + (monthOverMonth.projects > 0 ? monthOverMonth.projects * 2 : 2),
          currentMonth.totalProjects + (monthOverMonth.projects > 0 ? monthOverMonth.projects * 3 : 3),
          currentMonth.totalProjects + (monthOverMonth.projects > 0 ? monthOverMonth.projects * 6 : 6),
          currentMonth.totalProjects + (monthOverMonth.projects > 0 ? monthOverMonth.projects * 12 : 12)
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
        label: 'Projected Tasks',
        data: [
          currentMonth.totalTasks,
          currentMonth.totalTasks + (monthOverMonth.tasks > 0 ? monthOverMonth.tasks : 2),
          currentMonth.totalTasks + (monthOverMonth.tasks > 0 ? monthOverMonth.tasks * 2 : 4),
          currentMonth.totalTasks + (monthOverMonth.tasks > 0 ? monthOverMonth.tasks * 3 : 6),
          currentMonth.totalTasks + (monthOverMonth.tasks > 0 ? monthOverMonth.tasks * 6 : 12),
          currentMonth.totalTasks + (monthOverMonth.tasks > 0 ? monthOverMonth.tasks * 12 : 24)
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

  const futureProjectionOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Future Projection Forecast',
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

  // Resource Planning Bar Chart
  const resourcePlanningData = {
    labels: ['Current', 'Next Month', '2 Months', '3 Months', '6 Months'],
    datasets: [
      {
        label: 'Required Team Size',
        data: [
          currentMonth.totalMembers,
          currentMonth.totalMembers + (monthOverMonth.members > 0 ? monthOverMonth.members : 1),
          currentMonth.totalMembers + (monthOverMonth.members > 0 ? monthOverMonth.members * 2 : 2),
          currentMonth.totalMembers + (monthOverMonth.members > 0 ? monthOverMonth.members * 3 : 3),
          currentMonth.totalMembers + (monthOverMonth.members > 0 ? monthOverMonth.members * 6 : 6)
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
        label: 'Current Team Size',
        data: [
          currentMonth.totalMembers,
          currentMonth.totalMembers,
          currentMonth.totalMembers,
          currentMonth.totalMembers,
          currentMonth.totalMembers
        ],
        backgroundColor: 'rgba(156, 163, 175, 0.8)',
        borderColor: 'rgba(156, 163, 175, 1)',
        borderWidth: 2,
        borderRadius: 8,
      },
    ],
  }

  const resourcePlanningOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Resource Planning Forecast',
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

  // Success Probability Doughnut Chart
  const successProbabilityData = {
    labels: ['High Success', 'Medium Success', 'Low Success', 'Risk'],
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

  const successProbabilityOptions = {
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
        text: 'Success Probability Distribution',
        font: {
          size: 16,
          weight: 'bold' as const,
        },
      },
    },
  }

  // Performance Prediction Line Chart
  const performancePredictionData = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6', 'Week 7', 'Week 8'],
    datasets: [
      {
        label: 'Predicted Performance (%)',
        data: [
          Math.min((currentMonth.completedTasks / Math.max(currentMonth.totalTasks, 1)) * 100, 100) * 0.8,
          Math.min((currentMonth.completedTasks / Math.max(currentMonth.totalTasks, 1)) * 100, 100) * 0.85,
          Math.min((currentMonth.completedTasks / Math.max(currentMonth.totalTasks, 1)) * 100, 100) * 0.9,
          Math.min((currentMonth.completedTasks / Math.max(currentMonth.totalTasks, 1)) * 100, 100) * 0.95,
          Math.min((currentMonth.completedTasks / Math.max(currentMonth.totalTasks, 1)) * 100, 100),
          Math.min((currentMonth.completedTasks / Math.max(currentMonth.totalTasks, 1)) * 100, 100) * 1.05,
          Math.min((currentMonth.completedTasks / Math.max(currentMonth.totalTasks, 1)) * 100, 100) * 1.1,
          Math.min((currentMonth.completedTasks / Math.max(currentMonth.totalTasks, 1)) * 100, 100) * 1.15
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
        label: 'Current Performance (%)',
        data: [
          Math.min((currentMonth.completedTasks / Math.max(currentMonth.totalTasks, 1)) * 100, 100) * 0.8,
          Math.min((currentMonth.completedTasks / Math.max(currentMonth.totalTasks, 1)) * 100, 100) * 0.85,
          Math.min((currentMonth.completedTasks / Math.max(currentMonth.totalTasks, 1)) * 100, 100) * 0.9,
          Math.min((currentMonth.completedTasks / Math.max(currentMonth.totalTasks, 1)) * 100, 100) * 0.95,
          Math.min((currentMonth.completedTasks / Math.max(currentMonth.totalTasks, 1)) * 100, 100),
          Math.min((currentMonth.completedTasks / Math.max(currentMonth.totalTasks, 1)) * 100, 100),
          Math.min((currentMonth.completedTasks / Math.max(currentMonth.totalTasks, 1)) * 100, 100),
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
    ],
  }

  const performancePredictionOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Performance Prediction Forecast',
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
      {/* Top Row - Future Projection and Resource Planning */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Future Projection Line Chart */}
        <div className="bg-white rounded-[8px] shadow-lg border border-gray-100 p-6">
          <div className="h-80">
            <Line data={futureProjectionData} options={futureProjectionOptions} />
          </div>
        </div>

        {/* Resource Planning Bar Chart */}
        <div className="bg-white rounded-[8px] shadow-lg border border-gray-100 p-6">
          <div className="h-80">
            <Bar data={resourcePlanningData} options={resourcePlanningOptions} />
          </div>
        </div>
      </div>

      {/* Middle Row - Success Probability and Performance Prediction */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Success Probability Doughnut Chart */}
        <div className="bg-white rounded-[8px] shadow-lg border border-gray-100 p-6">
          <div className="h-80">
            <Doughnut data={successProbabilityData} options={successProbabilityOptions} />
          </div>
        </div>

        {/* Performance Prediction Line Chart */}
        <div className="bg-white rounded-[8px] shadow-lg border border-gray-100 p-6">
          <div className="h-80">
            <Line data={performancePredictionData} options={performancePredictionOptions} />
          </div>
        </div>
      </div>
    </div>
  )
}



