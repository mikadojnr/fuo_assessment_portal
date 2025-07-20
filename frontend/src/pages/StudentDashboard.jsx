"use client"

import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { motion } from "framer-motion"
import {
  FiHome,
  FiFileText,
  FiBarChart2,
  FiList,
  FiUser,
  FiSettings,
  FiLogOut,
  FiMenu,
  FiX,
  FiCalendar,
  FiDownload,
  FiSearch,
  FiBell,
  FiSun,
  FiMoon,
  FiClock,
  FiEye,
} from "react-icons/fi"
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

import { formatDistance, parseISO } from "date-fns"
import { fetchAssessment, studentDashboard } from "../services/assessmentService"
import { toast } from "react-toastify"

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

const StudentDashboard = () => {
  useEffect(() => {
    document.title = "Student Dashboard"
  }, [])

  const navigate = useNavigate()

  const { currentUser, logout } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [darkMode, setDarkMode] = useState(false)
  const [timeOfDay, setTimeOfDay] = useState("")
  const [loading, setLoading] = useState(true)
  const [dashboardData, setDashboardData] = useState({
    upcomingAssessments: [],
    performanceData: {},
    recentResults: [],
    notifications: [],
    totalAssessments: 0,
  })
  const [chartTimeframe, setChartTimeframe] = useState("30days")

  // Add loading states for different data sections
  const [assessmentsLoading, setAssessmentsLoading] = useState(true)

  // Function to format the deadline relative to now
  const formatDeadline = (deadline) => {
    try {
      const deadlineDate = parseISO(deadline)
      return formatDistance(deadlineDate, new Date(), { addSuffix: true })
    } catch (e) {
      console.error("Error formatting date:", e)
      return "Date unavailable"
    }
  }

  // Function to get status color class
  const getStatusColorClass = (status, deadline) => {
    if (status === "Completed") return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
    if (status === "In Progress") return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
    if (new Date(deadline) < new Date()) return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
    return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
  }

  const handleAssessmentAction = async (assessmentId, status, currentUser, navigate ) => {
      if (!currentUser) {
        console.error("No authenticated user found");
        toast.error("Please log in to access assessments");
        navigate("/login");
        return;
      }

      if (currentUser.role !== "student") {
        console.error(`User role ${currentUser.role} is not authorized for assessments`);
        toast.error("You are not authorized to access assessments");
        navigate("/login");
        return;
      }

      console.log(`Fetching assessment ${assessmentId} with status ${status}`);

      console.log(`Navigating to assessment ${assessmentId}`);
      navigate(`/student/assessments/${assessmentId}`);
      
  };

  // Toggle sidebar
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  // Toggle dark/light mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
    if (!darkMode) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }

  // Get time of day for greeting
  useEffect(() => {
    const hour = new Date().getHours()
    if (hour < 12) setTimeOfDay("morning")
    else if (hour < 18) setTimeOfDay("afternoon")
    else setTimeOfDay("evening")
  }, [])

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        const data = await studentDashboard()

        if (data) {
          setDashboardData({
            upcomingAssessments: data.upcomingAssessments || [],
            performanceData: data.performanceData || {},
            recentResults: data.recentResults || [],
            notifications: data.notifications || [],
            totalAssessments: data.totalAssessments || 0,
          })
        }

      } catch (error) {
        console.error("Error fetching dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  // Performance chart data
  const chartData = {
    labels: dashboardData.performanceData?.labels || ["Week 1", "Week 2", "Week 3", "Week 4", "Week 5", "Week 6"],
    datasets: [
      {
        label: "Your Score",
        data: dashboardData.performanceData?.scores || [65, 78, 80, 74, 85, 90],
        borderColor: "#00BFA5",
        backgroundColor: "rgba(0, 191, 165, 0.1)",
        tension: 0.4,
        fill: true,
      },
      {
        label: "Class Average",
        data: dashboardData.performanceData?.classAverage || [60, 65, 70, 68, 72, 75],
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

  // Mock data for recent results
  const mockRecentResults = [
    {
      id: 1,
      assessment: "Midterm Exam",
      course: "CSC 401",
      dateSubmitted: "2023-11-15",
      score: 85,
      plagiarismCheck: 5,
      feedback: "Excellent work on database normalization concepts.",
    },
    {
      id: 2,
      assessment: "Assignment 3",
      course: "CSC 405",
      dateSubmitted: "2023-11-10",
      score: 65,
      plagiarismCheck: 15,
      feedback: "Good attempt, but needs improvement in UML diagrams.",
    },
    {
      id: 3,
      assessment: "Quiz 2",
      course: "MTH 302",
      dateSubmitted: "2023-11-05",
      score: 45,
      plagiarismCheck: 0,
      feedback: "Review matrix operations and transformations.",
    },
  ]

  const recentResultsToShow = dashboardData?.recentResults?.length > 0 ? dashboardData.recentResults : mockRecentResults;


  // Calculate days remaining
  const getDaysRemaining = (deadline) => {
    const now = new Date()
    const deadlineDate = new Date(deadline)
    const diffTime = deadlineDate - now
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  // Get score color class
  const getScoreColorClass = (score) => {
    if (score >= 70) return "text-green-600"
    if (score >= 50) return "text-orange-500"
    return "text-red-500"
  }

  // Loading skeleton
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
        {/* Sidebar skeleton */}
        <div className="hidden md:flex md:flex-col md:w-64 md:fixed md:inset-y-0 bg-gray-200 dark:bg-gray-800 animate-pulse">
          <div className="h-full w-full"></div>
        </div>

        {/* Main content skeleton */}
        <div className="md:ml-64 flex-1 p-8">
          <div className="h-40 bg-gray-200 dark:bg-gray-800 rounded-lg mb-8 animate-pulse"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div className="h-64 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse"></div>
            <div className="h-64 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse"></div>
            <div className="h-64 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse"></div>
          </div>
          <div className="h-80 bg-gray-200 dark:bg-gray-800 rounded-lg mb-8 animate-pulse"></div>
          <div className="h-96 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse"></div>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen bg-gray-50 ${darkMode ? "dark" : ""}`}>
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
        {/* Sidebar for desktop */}
        <div
          className={`hidden md:flex md:flex-col md:w-64 md:fixed md:inset-y-0 bg-white dark:bg-gray-800 shadow-lg transition-all duration-300 ease-in-out z-20`}
        >
          <div className="flex items-center justify-center h-16 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-[#2A5C82] dark:text-white">University LMS</h2>
          </div>

          {/* Profile summary */}
          <div className="flex flex-col items-center py-6 border-b border-gray-200 dark:border-gray-700">
            <div className="w-20 h-20 bg-[#2A5C82] rounded-full flex items-center justify-center text-white text-2xl font-bold">
              {currentUser?.firstName?.charAt(0) || "S"}
              {currentUser?.lastName?.charAt(0) || "D"}
            </div>
            <h3 className="mt-3 text-sm font-medium text-gray-900 dark:text-white">
              {currentUser?.firstName} {currentUser?.lastName}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {currentUser?.department?.name || "Computer Science"}
            </p>
          </div>

          {/* Navigation menu */}
          <div className="flex-1 flex flex-col overflow-y-auto">
            <nav className="flex-1 px-2 py-4 space-y-1">
              <Link
                to="/student-dashboard"
                className="flex items-center px-4 py-3 text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 rounded-md group"
              >
                <FiHome className="mr-3 h-5 w-5 text-[#00BFA5]" />
                Dashboard
              </Link>
              <Link
                to="/student/assessments/available"
                className="flex items-center px-4 py-3 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md group"
              >
                <FiFileText className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" />
                Available Assessments
              </Link>
              <Link
                to="/student/performance-analytics"
                className="flex items-center px-4 py-3 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md group"
              >
                <FiBarChart2 className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" />
                Performance Analytics
              </Link>
              <Link
                to="/student/submissions"
                className="flex items-center px-4 py-3 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md group"
              >
                <FiList className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" />
                Results
              </Link>
              <Link
                to="/profile"
                className="flex items-center px-4 py-3 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md group"
              >
                <FiUser className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" />
                Profile
              </Link>
              <Link
                to="/student/settings"
                className="flex items-center px-4 py-3 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md group"
              >
                <FiSettings className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" />
                Settings
              </Link>
            </nav>
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={logout}
                className="flex items-center w-full px-4 py-3 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
              >
                <FiLogOut className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" />
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Mobile sidebar overlay */}
        <div
          className={`fixed inset-0 bg-gray-600 bg-opacity-75 z-40 md:hidden transition-opacity duration-300 ${
            sidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
          onClick={toggleSidebar}
        ></div>

        {/* Mobile sidebar */}
        <div
          className={`fixed inset-y-0 left-0 flex flex-col w-64 bg-white dark:bg-gray-800 shadow-lg z-50 md:hidden transform transition-transform duration-300 ease-in-out ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between h-16 border-b border-gray-200 dark:border-gray-700 px-4">
            <h2 className="text-xl font-bold text-[#2A5C82] dark:text-white">University LMS</h2>
            <button onClick={toggleSidebar} className="text-gray-500 dark:text-gray-400">
              <FiX className="h-6 w-6" />
            </button>
          </div>

          {/* Profile summary (mobile) */}
          <div className="flex flex-col items-center py-6 border-b border-gray-200 dark:border-gray-700">
            <div className="w-20 h-20 bg-[#2A5C82] rounded-full flex items-center justify-center text-white text-2xl font-bold">
              {currentUser?.firstName?.charAt(0) || "S"}
              {currentUser?.lastName?.charAt(0) || "D"}
            </div>
            <h3 className="mt-3 text-sm font-medium text-gray-900 dark:text-white">
              {currentUser?.firstName} {currentUser?.lastName}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {currentUser?.department?.name || "Computer Science"}
            </p>
          </div>

          {/* Navigation menu (mobile) */}
          <div className="flex-1 flex flex-col overflow-y-auto">
            <nav className="flex-1 px-2 py-4 space-y-1">
              <Link
                to="/student-dashboard"
                className="flex items-center px-4 py-3 text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 rounded-md group"
              >
                <FiHome className="mr-3 h-5 w-5 text-[#00BFA5]" />
                Dashboard
              </Link>
              <Link
                to="/student/assessments/available"
                className="flex items-center px-4 py-3 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md group"
              >
                <FiFileText className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" />
                Available Assessments
              </Link>
              <Link
                to="/student/performance-analytics"
                className="flex items-center px-4 py-3 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md group"
              >
                <FiBarChart2 className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" />
                Performance Analytics
              </Link>
              <Link
                to="/student/submissions"
                className="flex items-center px-4 py-3 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md group"
              >
                <FiList className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" />
                Results
              </Link>
              <Link
                to="/profile"
                className="flex items-center px-4 py-3 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md group"
              >
                <FiUser className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" />
                Profile
              </Link>
              <Link
                to="/student/settings"
                className="flex items-center px-4 py-3 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md group"
              >
                <FiSettings className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" />
                Settings
              </Link>
            </nav>
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={logout}
                className="flex items-center w-full px-4 py-3 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
              >
                <FiLogOut className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" />
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="md:ml-64 flex-1">
          {/* Top header */}
          <header className="bg-white dark:bg-gray-800 shadow-sm">
            <div className="px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
              <div className="flex items-center">
                <button onClick={toggleSidebar} className="mr-4 md:hidden text-gray-500 dark:text-gray-400">
                  <FiMenu className="h-6 w-6" />
                </button>
                <div className="relative">
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search assessments, courses, or results..."
                    className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#00BFA5] w-64"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={toggleDarkMode}
                  className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
                >
                  {darkMode ? <FiSun className="h-5 w-5" /> : <FiMoon className="h-5 w-5" />}
                </button>
                <div className="relative">
                  <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400">
                    <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                      3
                    </div>
                    <FiBell className="h-5 w-5" />
                  </button>
                </div>
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-[#2A5C82] rounded-full flex items-center justify-center text-white font-medium">
                    {currentUser?.firstName?.charAt(0) || "S"}
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* Dashboard content */}
          <main className="p-4 sm:p-6 lg:p-8">
            {/* Welcome Banner */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-gradient-to-r from-[#2A5C82] to-[#00BFA5] rounded-xl shadow-lg mb-8 overflow-hidden"
            >
              <div className="p-6 sm:p-8 text-white">
                <h1 className="text-2xl sm:text-3xl font-bold mb-2">
                  Good {timeOfDay}, {currentUser?.firstName || "Student"}! 🎉
                </h1>

                {dashboardData.upcomingAssessments.length > 0 ? (
                  <p className="text-lg opacity-90 mb-6">
                    You have {dashboardData.upcomingAssessments.length} upcoming assessments.
                  </p>
                ) : (
                  <p className="text-lg opacity-90 mb-6">No upcoming assessments.</p>
                )}

                <div className="flex flex-wrap gap-4">
                  <button className="flex items-center bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-md transition-all">
                    <FiCalendar className="mr-2" />
                    View Calendar
                  </button>
                  <button className="flex items-center bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-md transition-all">
                    <FiDownload className="mr-2" />
                    Download Course Materials
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Main grid layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left column - Upcoming Assessments */}
              <div className="lg:col-span-2">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-8">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Upcoming Assessments</h2>
                    <Link to="#" className="text-sm font-medium text-[#2A5C82] dark:text-[#00BFA5] hover:underline">
                      View All
                    </Link>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {dashboardData.upcomingAssessments.length > 0 ? (
                      dashboardData.upcomingAssessments.map((assessment) => (
                        <div
                          key={assessment.id}
                          className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden hover:shadow-md transition-shadow duration-300"
                        >
                          <div className="p-5">
                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <h3 className="font-medium text-gray-900 dark:text-white">{assessment.courseCode}</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{assessment.courseTitle}</p>
                              </div>
                              <span
                                className={`px-2 py-1 text-xs rounded-full ${
                                  assessment.status === "In Progress"
                                    ? "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
                                    : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                                }`}
                              >
                                {assessment.status}
                              </span>
                            </div>

                            <div className="flex items-center mb-3">
                              <FiClock className="text-gray-400 mr-2" />
                              <span className="text-sm text-gray-500 dark:text-gray-400">
                                Due in {getDaysRemaining(assessment.deadline)} days
                              </span>
                            </div>

                            <div className="mb-4">
                              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                <div
                                  className="bg-[#00BFA5] h-2 rounded-full"
                                  style={{ width: `${assessment.progress}%` }}
                                ></div>
                              </div>
                            </div>

                            <button
                              className="w-full py-2 bg-[#2A5C82] hover:bg-[#1e4460] text-white rounded-md transition-colors"
                              onClick={() => handleAssessmentAction(assessment.id, assessment.status, currentUser, navigate)}
                            >
                              {assessment.status === "In Progress" ? "Continue" : "Start Now"}
                            </button>

                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center text-gray-500 dark:text-gray-400 col-span-full">
                        No upcoming assessments.
                      </div>
                    )}
                  </div>
                </div>

                {/* Recent Results */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Recent Results</h2>
                    <Link to="#" className="text-sm font-medium text-[#2A5C82] dark:text-[#00BFA5] hover:underline">
                      View All
                    </Link>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead>
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Assessment
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Date Submitted
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Score
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Plagiarism
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Action
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {recentResultsToShow.map((result) => (
                          <tr key={result.id}>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <div>
                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                  {result.assessment}
                                </div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">{result.course}</div>
                              </div>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              {result.dateSubmitted}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <span
                                className={`text-sm font-medium ${getScoreColorClass(result.score)} dark:text-opacity-90`}
                              >
                                {result.score}%
                              </span>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <span
                                  className={`inline-block w-3 h-3 rounded-full mr-2 ${
                                    result.plagiarismCheck > 20 ? "bg-red-500" : "bg-green-500"
                                  }`}
                                ></span>
                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                  {result.plagiarismCheck}%
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <button className="flex items-center text-sm text-[#2A5C82] dark:text-[#00BFA5] hover:underline">
                                <FiEye className="mr-1" />
                                View Details
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Right column - Performance Overview */}
              <div className="lg:col-span-1">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-8">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Performance Overview</h2>
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

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center text-green-600 dark:text-green-300 mr-3">
                          <FiBarChart2 />
                        </div>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Average Score</span>
                      </div>
                      <span className="text-lg font-semibold text-green-600 dark:text-green-400">78%</span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-300 mr-3">
                          <FiBarChart2 />
                        </div>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Highest Score</span>
                      </div>
                      <span className="text-lg font-semibold text-blue-600 dark:text-blue-400">95%</span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-orange-100 dark:bg-orange-800 rounded-full flex items-center justify-center text-orange-600 dark:text-orange-300 mr-3">
                          <FiClock />
                        </div>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Assignments Pending
                        </span>
                      </div>
                      <span className="text-lg font-semibold text-orange-600 dark:text-orange-400">3</span>
                    </div>
                  </div>
                </div>

                {/* Notifications */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Notifications</h2>
                    <Link to="#" className="text-sm font-medium text-[#2A5C82] dark:text-[#00BFA5] hover:underline">
                      Mark All as Read
                    </Link>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-start p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                      <div className="w-8 h-8 bg-yellow-100 dark:bg-yellow-800 rounded-full flex items-center justify-center text-yellow-600 dark:text-yellow-300 mr-3 flex-shrink-0">
                        <FiBell />
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-800 dark:text-white">
                          Assignment Deadline Extended
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          The deadline for CSC 405 has been extended to December 15th.
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">2 hours ago</p>
                      </div>
                    </div>

                    <div className="flex items-start p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-300 mr-3 flex-shrink-0">
                        <FiBell />
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-800 dark:text-white">New Course Materials</h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          New lecture notes have been uploaded for MTH 302.
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">1 day ago</p>
                      </div>
                    </div>

                    <div className="flex items-start p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <div className="w-8 h-8 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center text-green-600 dark:text-green-300 mr-3 flex-shrink-0">
                        <FiBell />
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-800 dark:text-white">Grade Released</h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Your grade for CSC 401 Midterm Exam has been released.
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">2 days ago</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}

export default StudentDashboard
