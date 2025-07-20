"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { FiArrowLeft, FiBarChart2, FiAward, FiClock } from "react-icons/fi"
import { studentDashboard } from "../services/assessmentService"
import { toast } from "react-toastify"
import { Line } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js"
import CustomRadarChart from "../components/ui/RadarChart"

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

const StudentPerformanceAnalyticsPage = () => {
  const [performanceData, setPerformanceData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [chartTimeframe, setChartTimeframe] = useState("30days") // State for chart timeframe

  useEffect(() => {
    document.title = "Performance Analytics"
    const loadPerformanceData = async () => {
      try {
        setLoading(true)
        const data = await studentDashboard() // Re-using dashboard endpoint for performance data
        setPerformanceData(data) // Set the entire data object
      } catch (err) {
        console.error("Error fetching performance analytics:", err)
        setError("Failed to load performance analytics. Please try again.")
        toast.error("Failed to load performance analytics.")
      } finally {
        setLoading(false)
      }
    }
    loadPerformanceData()
  }, [])

  const chartData = {
    labels: performanceData?.performanceData?.labels || ["Week 1", "Week 2", "Week 3", "Week 4", "Week 5", "Week 6"],
    datasets: [
      {
        label: "Your Score",
        data: performanceData?.performanceData?.scores || [65, 78, 80, 74, 85, 90],
        borderColor: "#00BFA5",
        backgroundColor: "rgba(0, 191, 165, 0.1)",
        tension: 0.4,
        fill: true,
      },
      {
        label: "Class Average",
        data: performanceData?.performanceData?.classAverage || [60, 65, 70, 68, 72, 75],
        borderColor: "#2A5C82",
        backgroundColor: "rgba(42, 92, 130, 0.1)",
        tension: 0.4,
        borderDash: [5, 5],
        fill: true,
      },
    ],
  }

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      tooltip: {
        mode: "index",
        intersect: false,
      },
    },
    scales: {
      y: {
        min: 0,
        max: 100,
        ticks: {
          callback: (value) => value + "%",
        },
      },
    },
    interaction: {
      mode: "nearest",
      axis: "x",
      intersect: false,
    },
  }

  // Mock topic mastery data for radar chart (replace with real data if available from backend)
  const topicMasteryData = [
    { topic: "SQL Queries", score: 85 },
    { topic: "Normalization", score: 70 },
    { topic: "Transactions", score: 90 },
    { topic: "Database Design", score: 75 },
    { topic: "Security", score: 60 },
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <p className="text-gray-700 dark:text-gray-300">Loading performance analytics...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center flex-col">
        <p className="text-red-500 mb-4">{error}</p>
        <Link
          to="/student-dashboard"
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-[#2A5C82] hover:bg-[#1e4460] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00BFA5]"
        >
          <FiArrowLeft className="mr-2" />
          Back to Dashboard
        </Link>
      </div>
    )
  }

  const averageScore =
    performanceData?.performanceData?.scores?.length > 0
      ? Math.round(
          performanceData.performanceData.scores.reduce((a, b) => a + b, 0) /
            performanceData.performanceData.scores.length,
        )
      : 0
  const highestScore =
    performanceData?.performanceData?.scores?.length > 0 ? Math.max(...performanceData.performanceData.scores) : 0

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 ">
      
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <Link to="/student-dashboard" className="text-gray-600 dark:text-gray-400 hover:text-[#00BFA5] mr-3">
              <FiArrowLeft className="h-6 w-6" />
            </Link>
            <h1 className="text-3xl font-bold">Performance Analytics</h1>
          </div>
            
        </div>
      </header>
      
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8" >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Performance Overview Chart */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Score Trends</h2>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setChartTimeframe("30days")}
                  className={`text-xs px-2 py-1 rounded ${
                    chartTimeframe === "30days"
                      ? "bg-[#2A5C82] text-white"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                  }`}
                >
                  Last 30 Days
                </button>
                <button
                  onClick={() => setChartTimeframe("alltime")}
                  className={`text-xs px-2 py-1 rounded ${
                    chartTimeframe === "alltime"
                      ? "bg-[#2A5C82] text-white"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                  }`}
                >
                  All Time
                </button>
              </div>
            </div>
            <div className="mb-6">
              <Line data={chartData} options={chartOptions} />
            </div>
          </div>

          {/* Key Metrics */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Key Metrics</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center text-green-600 dark:text-green-300 mr-3">
                      <FiBarChart2 />
                    </div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Average Score</span>
                  </div>
                  <span className="text-lg font-semibold text-green-600 dark:text-green-400">{averageScore}%</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-300 mr-3">
                      <FiBarChart2 />
                    </div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Highest Score</span>
                  </div>
                  <span className="text-lg font-semibold text-blue-600 dark:text-blue-400">{highestScore}%</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-orange-100 dark:bg-orange-800 rounded-full flex items-center justify-center text-orange-600 dark:text-orange-300 mr-3">
                      <FiClock />
                    </div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Assessments Pending</span>
                  </div>
                  <span className="text-lg font-semibold text-orange-600 dark:text-orange-400">
                    {performanceData?.assessmentsPending || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Topic Mastery */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mt-8">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Topic Mastery</h2>
          <CustomRadarChart
            data={topicMasteryData}
            dataKey="topic"
            valueKey="score"
            domain={[0, 100]}
            strokeColor="#00BFA5"
            fillColor="rgba(0, 191, 165, 0.6)"
          />
          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
            This chart visualizes your performance across different topics.
          </p>
        </div>

        {/* Achievements/Badges */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mt-8">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Your Achievements</h2>
          <div className="flex flex-wrap gap-4 justify-center">
            <div className="flex flex-col items-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg shadow-sm">
              <FiAward className="h-8 w-8 text-yellow-600 dark:text-yellow-300 mb-2" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Top Performer</span>
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-1">
                Achieved 90%+ in 3 assessments
              </p>
            </div>
            <div className="flex flex-col items-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg shadow-sm">
              <FiAward className="h-8 w-8 text-blue-600 dark:text-blue-300 mb-2" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Consistent Learner</span>
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-1">
                Completed all assignments on time
              </p>
            </div>
            <div className="flex flex-col items-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg shadow-sm">
              <FiAward className="h-8 w-8 text-green-600 dark:text-green-300 mb-2" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Plagiarism Free</span>
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-1">
                Maintained 0% plagiarism score
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link
            to="/student-dashboard"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            <FiArrowLeft className="mr-2" />
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}

export default StudentPerformanceAnalyticsPage
