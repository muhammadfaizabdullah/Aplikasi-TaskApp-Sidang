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
  PointElement,
  LineElement,
  Filler,
} from 'chart.js'
import { Line, Bar } from 'react-chartjs-2'

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  Filler
)

interface TimelineChartsProps {
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

export const TimelineCharts: React.FC<TimelineChartsProps> = ({
  currentMonth,
  lastMonth,
  lastYear
}) => {
  // Monthly Timeline Comparison
  const monthlyTimelineData = {
    labels: ['Last Year', 'Last Month', 'Current Month'],
    datasets: [
      {
        label: 'Projects',
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
        label: 'Tasks',
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
        label: 'Completed Tasks',
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
      {
        label: 'Team Members',
        data: [lastYear.totalMembers, lastMonth.totalMembers, currentMonth.totalMembers],
        borderColor: 'rgba(245, 158, 11, 1)',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: 'rgba(245, 158, 11, 1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(245, 158, 11, 1)',
      },
    ],
  }

  const monthlyTimelineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Timeline Comparison',
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

  // Weekly Activity Simulation (based on current data)
  const weeklyActivityData = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    datasets: [
      {
        label: 'Tasks Created',
        data: [
          Math.ceil(currentMonth.totalTasks * 0.2),
          Math.ceil(currentMonth.totalTasks * 0.3),
          Math.ceil(currentMonth.totalTasks * 0.25),
          Math.ceil(currentMonth.totalTasks * 0.25)
        ],
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 2,
        borderRadius: 8,
      },
      {
        label: 'Tasks Completed',
        data: [
          Math.ceil(currentMonth.completedTasks * 0.2),
          Math.ceil(currentMonth.completedTasks * 0.3),
          Math.ceil(currentMonth.completedTasks * 0.25),
          Math.ceil(currentMonth.completedTasks * 0.25)
        ],
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
        borderColor: 'rgba(34, 197, 94, 1)',
        borderWidth: 2,
        borderRadius: 8,
      },
    ],
  }

  const weeklyActivityOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Weekly Activity Breakdown',
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

  // Efficiency Trend Line Chart
  const efficiencyData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'Task Completion Rate (%)',
        data: [
          65, 70, 75, 80, 85, 90, 88, 92, 89, 95, 90, 
          currentMonth.totalTasks > 0 ? Math.round((currentMonth.completedTasks / currentMonth.totalTasks) * 100) : 0
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
        label: 'Project Success Rate (%)',
        data: [
          70, 75, 80, 85, 90, 95, 92, 98, 95, 100, 95,
          currentMonth.totalProjects > 0 ? Math.min(95, 100) : 0
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

  const efficiencyOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Yearly Efficiency Trends',
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
      {/* Top Row - Timeline Comparison */}
      <div className="grid grid-cols-1 gap-6">
        {/* Monthly Timeline Comparison */}
        <div className="bg-white rounded-[8px] shadow-lg border border-gray-100 p-6">
          <div className="h-80">
            <Line data={monthlyTimelineData} options={monthlyTimelineOptions} />
          </div>
        </div>
      </div>

      {/* Middle Row - Weekly Activity and Efficiency */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Activity Bar Chart */}
        <div className="bg-white rounded-[8px] shadow-lg border border-gray-100 p-6">
          <div className="h-80">
            <Bar data={weeklyActivityData} options={weeklyActivityOptions} />
          </div>
        </div>

        {/* Efficiency Trend Line Chart */}
        <div className="bg-white rounded-[8px] shadow-lg border border-gray-100 p-6">
          <div className="h-80">
            <Line data={efficiencyData} options={efficiencyOptions} />
          </div>
        </div>
      </div>
    </div>
  )
}



