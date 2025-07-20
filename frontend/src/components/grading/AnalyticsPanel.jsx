import { Bar, Doughnut, Scatter } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js"
import { FiAward, FiAlertTriangle, FiTrendingUp, FiCloud } from "react-icons/fi"

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend)

const AnalyticsPanel = ({ analyticsData, darkMode }) => {
  if (!analyticsData) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
        No analytics data available.
      </div>
    )
  }

  // Provide default empty objects to prevent undefined errors
  const {
    classAverage,
    scoreDistribution = { labels: [], data: [] },
    plagiarismSummary = { lowRisk: 0, mediumRisk: 0, highRisk: 0 },
    nlpInsights = { wordCloudMissingKeywords: [], wordCloudExtraKeywords: [], similarityCorrelation: [] },
  } = analyticsData

  const scoreDistributionChartData = {
    labels: scoreDistribution.labels,
    datasets: [
      {
        label: "Number of Students",
        data: scoreDistribution.data,
        backgroundColor: darkMode ? "rgba(0, 191, 165, 0.6)" : "rgba(42, 92, 130, 0.6)",
        borderColor: darkMode ? "rgba(0, 191, 165, 1)" : "rgba(42, 92, 130, 1)",
        borderWidth: 1,
      },
    ],
  }

  const plagiarismSummaryChartData = {
    labels: ["Low Risk", "Medium Risk", "High Risk"],
    datasets: [
      {
        data: [plagiarismSummary.lowRisk, plagiarismSummary.mediumRisk, plagiarismSummary.highRisk],
        backgroundColor: ["#6BCB77", "#FFD93D", "#FF6B6B"],
        borderColor: ["#6BCB77", "#FFD93D", "#FF6B6B"],
        borderWidth: 1,
      },
    ],
  }

  const similarityCorrelationChartData = {
    datasets: [
      {
        label: "Plagiarism vs. Score",
        data: nlpInsights.similarityCorrelation.map((item) => ({ x: item.plagiarism, y: item.score })),
        backgroundColor: darkMode ? "rgba(0, 191, 165, 0.8)" : "rgba(42, 92, 130, 0.8)",
        borderColor: darkMode ? "rgba(0, 191, 165, 1)" : "rgba(42, 92, 130, 1)",
        pointRadius: 5,
      },
    ],
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: darkMode ? "#E0E0E0" : "#333",
        },
      },
      tooltip: {
        callbacks: {
          labelTextColor: (context) => (darkMode ? "#E0E0E0" : "#333"),
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: darkMode ? "#B0B0B0" : "#666",
        },
        grid: {
          color: darkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
        },
      },
      y: {
        ticks: {
          color: darkMode ? "#B0B0B0" : "#666",
        },
        grid: {
          color: darkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
        },
        beginAtZero: true, // Ensure y-axis starts at zero for bar/doughnut charts
      },
    },
  }

  return (
    <div className={`p-4 h-full overflow-y-auto ${darkMode ? "bg-gray-900" : "bg-gray-50"}`}>
      <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Analytics & Insights</h2>

      {/* Performance Summary */}
      <div className={`p-4 rounded-lg shadow-md mb-6 ${darkMode ? "bg-gray-800" : "bg-white"}`}>
        <h3 className="font-semibold text-gray-800 dark:text-white mb-3 flex items-center">
          <FiAward className="mr-2 text-blue-500" /> Performance Summary
        </h3>
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-gray-700 dark:text-gray-300">Class Average Score:</p>
          <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {classAverage?.toFixed(2) || "N/A"}%
          </span>
        </div>
        <div className="h-48">
          <Bar data={scoreDistributionChartData} options={chartOptions} />
        </div>
      </div>

      {/* Plagiarism Summary */}
      <div className={`p-4 rounded-lg shadow-md mb-6 ${darkMode ? "bg-gray-800" : "bg-white"}`}>
        <h3 className="font-semibold text-gray-800 dark:text-white mb-3 flex items-center">
          <FiAlertTriangle className="mr-2 text-red-500" /> Plagiarism Summary
        </h3>
        <div className="h-48">
          <Doughnut data={plagiarismSummaryChartData} options={chartOptions} />
        </div>
      </div>

      {/* NLP Insights */}
      <div className={`p-4 rounded-lg shadow-md mb-6 ${darkMode ? "bg-gray-800" : "bg-white"}`}>
        <h3 className="font-semibold text-gray-800 dark:text-white mb-3 flex items-center">
          <FiCloud className="mr-2 text-purple-500" /> NLP Insights
        </h3>
        <div className="mb-4">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Missing Keywords:</p>
          <div className="flex flex-wrap gap-2">
            {nlpInsights.wordCloudMissingKeywords.map((keyword, index) => (
              <span
                key={index}
                className="px-2 py-1 rounded-full bg-red-100 text-red-800 text-xs dark:bg-red-900/30 dark:text-red-300"
              >
                {keyword}
              </span>
            ))}
          </div>
        </div>
        <div className="mb-4">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Extra Keywords:</p>
          <div className="flex flex-wrap gap-2">
            {nlpInsights.wordCloudExtraKeywords.map((keyword, index) => (
              <span
                key={index}
                className="px-2 py-1 rounded-full bg-yellow-100 text-yellow-800 text-xs dark:bg-yellow-900/30 dark:text-yellow-300"
              >
                {keyword}
              </span>
            ))}
          </div>
        </div>
        <div className="h-48">
          <Scatter data={similarityCorrelationChartData} options={chartOptions} />
        </div>
      </div>

      {/* Action Tools */}
      <div className={`p-4 rounded-lg shadow-md ${darkMode ? "bg-gray-800" : "bg-white"}`}>
        <h3 className="font-semibold text-gray-800 dark:text-white mb-3 flex items-center">
          <FiTrendingUp className="mr-2 text-green-500" /> Action Tools
        </h3>
        <div className="space-y-3">
          <button className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors">
            Bulk Apply Feedback (Mock)
          </button>
          <button className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors">
            Export Grades (CSV/Excel) (Mock)
          </button>
        </div>
      </div>
    </div>
  )
}

export default AnalyticsPanel
