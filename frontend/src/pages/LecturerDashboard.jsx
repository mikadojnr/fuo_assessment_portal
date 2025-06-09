import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { API_URL } from "../config"
import KanbanBoard from "../components/KanbanBoard"
import { getDrafts, getActiveAssessments, getCompletedAssessments } from "../services/assessmentService"
import {
  FiHome,
  FiTarget,
  FiBarChart2,
  FiBook,
  FiUsers,
  FiAlertTriangle,
  FiSettings,
  FiLogOut,
  FiMenu,
  FiX,
  FiSearch,
  FiBell,
  FiSun,
  FiMoon,
  FiPlus,
  FiUpload,
  FiDownload,
  FiEdit2,
  FiEye,
  FiTrash2,
  FiClock,
  FiCalendar,
  FiMoreVertical,
  FiFilter,
} from "react-icons/fi"
import { Bar, Line, Doughnut } from "react-chartjs-2"
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

import { toast } from "react-toastify";

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend)

const LecturerDashboard = () => {
  useEffect(() => {
    document.title = 'Lecturer Dashboard'
  }, [])

  const { currentUser, logout } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [darkMode, setDarkMode] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterOpen, setFilterOpen] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState("all")
  const [selectedTimeframe, setSelectedTimeframe] = useState("week")

  // Add loading states for each data type
  const [loadingDrafts, setLoadingDrafts] = useState(true)
  const [loadingActive, setLoadingActive] = useState(true)
  const [loadingCompleted, setLoadingCompleted] = useState(true)
  const [assessments, setAssessments] = useState({
    drafts: [],
    active: [],
    completed: [],
  })
  const [error, setError] = useState(null)

  const handleDraftDeleted = (draftId) => {
    setAssessments(prev => ({
      ...prev,
      drafts: prev.drafts.filter(draft => draft.id == draftId)
    }))
  }



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

  // Fetch assessment data
  useEffect(() => {
    const fetchAssessments = async () => {
      setError(null)
      try {
        const [draftsData, activeData, completedData] = await Promise.all([
          getDrafts().finally(() => setLoadingDrafts(false)),
          getActiveAssessments().finally(() => setLoadingActive(false)),
          getCompletedAssessments().finally(() => setLoadingCompleted(false))
        ])

        setAssessments({
          drafts: draftsData,
          active: activeData,
          completed: completedData
        })
      } catch (err) {
        console.error("Error fetching assessments:", err);
        setError("Failed to load assessments. Please try again later.");
        toast.error("Failed to load assessments");
      }
    }

    fetchAssessments();
  }, [])

  // Handle drag and drop
  const handleDragEnd = (result) => {
    if (!result.destination) return

    const { source, destination } = result
    const sourceList = source.droppableId
    const destList = destination.droppableId

    if (sourceList === destList) {
      // Reordering within the same list
      const items = Array.from(assessments[sourceList])
      const [reorderedItem] = items.splice(source.index, 1)
      items.splice(destination.index, 0, reorderedItem)

      setAssessments({
        ...assessments,
        [sourceList]: items,
      })
    } else {
      // Moving between lists
      const sourceItems = Array.from(assessments[sourceList])
      const destItems = Array.from(assessments[destList])
      const [movedItem] = sourceItems.splice(source.index, 1)

      // Update the status of the moved item
      movedItem.status = destList

      destItems.splice(destination.index, 0, movedItem)

      setAssessments({
        ...assessments,
        [sourceList]: sourceItems,
        [destList]: destItems,
      })

      // API call to update status
      updateAssessmentStatus(movedItem.id, destList)
    }
  }

  // Update assessment status
  const updateAssessmentStatus = async (assessmentId, newStatus) => {
    try {
      const token = localStorage.getItem("authToken")
      await fetch(`${API_URL}/api/lecturer/assessments/${assessmentId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      })
    } catch (error) {
      console.error("Error updating assessment status:", error)
    }
  }

  // Mock data for charts
  const scoreDistributionData = {
    labels: ["0-20", "21-40", "41-60", "61-80", "81-100"],
    datasets: [
      {
        label: "Number of Students",
        data: [2, 5, 12, 18, 8],
        backgroundColor: "rgba(0, 191, 165, 0.6)",
        borderColor: "rgba(0, 191, 165, 1)",
        borderWidth: 1,
      },
    ],
  }

  const trendAnalysisData = {
    labels: ["Week 1", "Week 2", "Week 3", "Week 4", "Week 5", "Week 6"],
    datasets: [
      {
        label: "Current Term",
        data: [65, 72, 68, 75, 82, 78],
        borderColor: "#00BFA5",
        backgroundColor: "rgba(0, 191, 165, 0.1)",
        tension: 0.4,
        fill: true,
      },
      {
        label: "Previous Term",
        data: [60, 65, 63, 70, 75, 72],
        borderColor: "#2A5C82",
        backgroundColor: "rgba(42, 92, 130, 0.1)",
        tension: 0.4,
        borderDash: [5, 5],
        fill: true,
      },
    ],
  }

  const submissionStatusData = {
    labels: ["On Time", "Late", "Not Submitted"],
    datasets: [
      {
        data: [65, 20, 15],
        backgroundColor: ["#6BCB77", "#FFD93D", "#FF6B6B"],
        borderColor: ["#6BCB77", "#FFD93D", "#FF6B6B"],
        borderWidth: 1,
      },
    ],
  }


  // Mock data for plagiarism alerts
  const mockPlagiarismAlerts = [
    {
      id: 1,
      student: "John Smith",
      assessment: "Assignment 2",
      course: "CSC 405",
      similarityScore: 65,
      submissionDate: "2023-11-29",
      risk: "high",
    },
    {
      id: 2,
      student: "Emily Johnson",
      assessment: "Assignment 2",
      course: "CSC 405",
      similarityScore: 35,
      submissionDate: "2023-11-30",
      risk: "medium",
    },
    {
      id: 3,
      student: "Michael Brown",
      assessment: "Quiz 1",
      course: "MTH 302",
      similarityScore: 15,
      submissionDate: "2023-11-20",
      risk: "low",
    },
  ]

  // Mock data for student engagement
  const mockStudentEngagement = [
    {
      id: 1,
      name: "John Smith",
      course: "CSC 405",
      engagementScore: 85,
      lastActive: "2023-12-01",
      submissionRate: 100,
    },
    {
      id: 2,
      name: "Emily Johnson",
      course: "CSC 405",
      engagementScore: 72,
      lastActive: "2023-11-29",
      submissionRate: 90,
    },
    {
      id: 3,
      name: "Michael Brown",
      course: "MTH 302",
      engagementScore: 65,
      lastActive: "2023-11-28",
      submissionRate: 80,
    },
    {
      id: 4,
      name: "Sarah Davis",
      course: "CSC 401",
      engagementScore: 92,
      lastActive: "2023-12-01",
      submissionRate: 100,
    },
    {
      id: 5,
      name: "David Wilson",
      course: "MTH 302",
      engagementScore: 45,
      lastActive: "2023-11-25",
      submissionRate: 60,
    },
  ]

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  // Get risk color class
  const getRiskColorClass = (risk) => {
    switch (risk) {
      case "high":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
      case "low":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
    }
  }

  // Get engagement score color class
  const getEngagementColorClass = (score) => {
    if (score >= 80) return "text-green-600 dark:text-green-400"
    if (score >= 60) return "text-yellow-600 dark:text-yellow-400"
    return "text-red-600 dark:text-red-400"
  }

  // Loading skeleton
  if (loadingDrafts || loadingActive || loadingCompleted) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
        {/* Loading skeleton layout */}
        <div className="hidden md:flex md:flex-col md:w-64 md:fixed md:inset-y-0 bg-gray-200 dark:bg-gray-800 animate-pulse">
          <div className="h-full w-full"></div>
        </div>

        <div className="md:ml-64 flex-1 p-8">
          <div className="h-16 bg-gray-200 dark:bg-gray-800 rounded-lg mb-8 animate-pulse"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
    <div className={darkMode ? "dark" : ""}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
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
                {currentUser?.firstName?.charAt(0) || "M"}
                {currentUser?.lastName?.charAt(0) || "J"}
              </div>
              <h3 className="mt-3 text-sm font-medium text-gray-900 dark:text-white">
                {currentUser?.firstName || "Mikado"} {currentUser?.lastName || "Junior"}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {currentUser?.department?.name || "Computer Science"}
              </p>
            </div>

            {/* Navigation menu */}
            <div className="flex-1 flex flex-col overflow-y-auto">
              <nav className="flex-1 px-2 py-4 space-y-1">
                <Link
                  to="/lecturer-dashboard"
                  className="flex items-center px-4 py-3 text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 rounded-md group"
                >
                  <FiHome className="mr-3 h-5 w-5 text-[#00BFA5]" />
                  Dashboard
                </Link>
                
                <Link
                  to="#"
                  className="flex items-center px-4 py-3 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md group"
                >
                  <FiTarget className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" />
                  Active Assessments
                </Link>
                <Link
                  to="#"
                  className="flex items-center px-4 py-3 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md group"
                >
                  <FiBarChart2 className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" />
                  Analytics
                </Link>
                <Link
                  to="#"
                  className="flex items-center px-4 py-3 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md group"
                >
                  <FiBook className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" />
                  Question Bank
                </Link>
                <Link
                  to="#"
                  className="flex items-center px-4 py-3 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md group"
                >
                  <FiUsers className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" />
                  Student Management
                </Link>
                <Link
                  to="#"
                  className="flex items-center px-4 py-3 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md group"
                >
                  <FiAlertTriangle className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" />
                  Plagiarism Alerts
                  <span className="ml-auto bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {mockPlagiarismAlerts.filter((alert) => alert.risk === "high").length}
                  </span>
                </Link>
                <Link
                  to="#"
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
                {currentUser?.firstName?.charAt(0) || "L"}
                {currentUser?.lastName?.charAt(0) || "D"}
              </div>
              <h3 className="mt-3 text-sm font-medium text-gray-900 dark:text-white">
                Dr. {currentUser?.firstName} {currentUser?.lastName}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {currentUser?.department?.name || "Computer Science"}
              </p>
            </div>

            {/* Navigation menu (mobile) */}
            <div className="flex-1 flex flex-col overflow-y-auto">
              <nav className="flex-1 px-2 py-4 space-y-1">
                <Link
                  to="/lecturer-dashboard"
                  className="flex items-center px-4 py-3 text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 rounded-md group"
                >
                  <FiHome className="mr-3 h-5 w-5 text-[#00BFA5]" />
                  Dashboard
                </Link>
                <Link
                  to="#"
                  className="flex items-center px-4 py-3 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md group"
                >
                  <FiTarget className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" />
                  Active Assessments
                </Link>
                <Link
                  to="#"
                  className="flex items-center px-4 py-3 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md group"
                >
                  <FiBarChart2 className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" />
                  Analytics
                </Link>
                <Link
                  to="#"
                  className="flex items-center px-4 py-3 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md group"
                >
                  <FiBook className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" />
                  Question Bank
                </Link>
                <Link
                  to="#"
                  className="flex items-center px-4 py-3 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md group"
                >
                  <FiUsers className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" />
                  Student Management
                </Link>
                <Link
                  to="#"
                  className="flex items-center px-4 py-3 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md group"
                >
                  <FiAlertTriangle className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" />
                  Plagiarism Alerts
                  <span className="ml-auto bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {mockPlagiarismAlerts.filter((alert) => alert.risk === "high").length}
                  </span>
                </Link>
                <Link
                  to="#"
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
                      placeholder="Search assessments, students, or questions..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#00BFA5] w-64"
                    />
                  </div>
                  <button
                    onClick={() => setFilterOpen(!filterOpen)}
                    className="ml-2 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
                  >
                    <FiFilter className="h-5 w-5" />
                  </button>
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
                        {mockPlagiarismAlerts.filter((alert) => alert.risk === "high").length}
                      </div>
                      <FiBell className="h-5 w-5" />
                    </button>
                  </div>
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-[#2A5C82] rounded-full flex items-center justify-center text-white font-medium">
                      {currentUser?.firstName?.charAt(0) || "L"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Filter dropdown */}
              {filterOpen && (
                <div className="px-4 sm:px-6 lg:px-8 py-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex flex-wrap gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Course</label>
                      <select
                        value={selectedCourse}
                        onChange={(e) => setSelectedCourse(e.target.value)}
                        className="w-40 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#00BFA5]"
                      >
                        <option value="all">All Courses</option>
                        <option value="CSC401">CSC 401</option>
                        <option value="CSC405">CSC 405</option>
                        <option value="MTH302">MTH 302</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Timeframe</label>
                      <select
                        value={selectedTimeframe}
                        onChange={(e) => setSelectedTimeframe(e.target.value)}
                        className="w-40 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#00BFA5]"
                      >
                        <option value="week">This Week</option>
                        <option value="month">This Month</option>
                        <option value="semester">This Semester</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                      <select className="w-40 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#00BFA5]">
                        <option value="all">All Statuses</option>
                        <option value="draft">Draft</option>
                        <option value="active">Active</option>
                        <option value="completed">Completed</option>
                      </select>
                    </div>
                    <div className="flex items-end">
                      <button className="px-4 py-2 bg-[#2A5C82] hover:bg-[#1e4460] text-white rounded-md transition-colors">
                        Apply Filters
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </header>

            {/* Dashboard content */}
            <main className="p-4 sm:p-6 lg:p-8">
              {/* Quick Actions Bar */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 mb-8">
                <div className="flex flex-wrap gap-4">
                <Link
                    to="/assessments/create"
                    className="flex items-center px-4 py-2 bg-[#00BFA5] hover:bg-[#009e8f] text-white rounded-md transition-colors"
                  >
                    <FiPlus className="mr-2" />
                    Create Assessment
                  </Link>
                  <button className="flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors">
                    <FiUpload className="mr-2" />
                    Import Questions
                  </button>
                  <button className="flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors">
                    <FiDownload className="mr-2" />
                    Export Grades
                  </button>
                </div>
              </div>

              {/* Main grid layout */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left column - Active Assessments */}
                <div className="lg:col-span-2">
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-8">
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Active Assessments</h2>
                      <Link to="#" className="text-sm font-medium text-[#2A5C82] dark:text-[#00BFA5] hover:underline">
                        View All
                      </Link>
                    </div>

                    {/* Kanban Board */}
                    {error ? (
                      <div className="text-red-600 dark:text-red-400 text-center py-4">
                        {error}
                      </div>
                    ) : (
                      <KanbanBoard
                        assessments={assessments}
                        onDragEnd={handleDragEnd}
                        limit={3}
                        onUpdateAssessments={setAssessments}
                      />
                    )}
                  </div>

                  {/* Performance Analytics */}
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-8">
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Performance Analytics</h2>
                      <div className="flex items-center space-x-2">
                        <button
                          className={`text-xs px-2 py-1 rounded ${
                            selectedTimeframe === "week"
                              ? "bg-[#2A5C82] text-white"
                              : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                          }`}
                          onClick={() => setSelectedTimeframe("week")}
                        >
                          Week
                        </button>
                        <button
                          className={`text-xs px-2 py-1 rounded ${
                            selectedTimeframe === "month"
                              ? "bg-[#2A5C82] text-white"
                              : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                          }`}
                          onClick={() => setSelectedTimeframe("month")}
                        >
                          Month
                        </button>
                        <button
                          className={`text-xs px-2 py-1 rounded ${
                            selectedTimeframe === "semester"
                              ? "bg-[#2A5C82] text-white"
                              : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                          }`}
                          onClick={() => setSelectedTimeframe("semester")}
                        >
                          Semester
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Score Distribution */}
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4">Score Distribution</h3>
                        <div className="h-64">
                          <Bar data={scoreDistributionData} />
                        </div>
                      </div>

                      {/* Trend Analysis */}
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4">Trend Analysis</h3>
                        <div className="h-64">
                          <Line data={trendAnalysisData} />
                        </div>
                      </div>
                    </div>

                    {/* Top/Bottom Performers */}
                    <div className="mt-8">
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4">Top/Bottom Performers</h3>
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                          <thead>
                            <tr>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Student
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Course
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Average Score
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Trend
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {mockStudentEngagement
                              .sort((a, b) => b.engagementScore - a.engagementScore)
                              .slice(0, 3)
                              .map((student) => (
                                <tr key={student.id}>
                                  <td className="px-4 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 font-medium mr-3">
                                        {student.name.charAt(0)}
                                      </div>
                                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                                        {student.name}
                                      </div>
                                    </div>
                                  </td>
                                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                    {student.course}
                                  </td>
                                  <td className="px-4 py-4 whitespace-nowrap">
                                    <span className="text-sm font-medium text-green-600 dark:text-green-400">
                                      {student.engagementScore}%
                                    </span>
                                  </td>
                                  <td className="px-4 py-4 whitespace-nowrap">
                                    <div className="w-16 h-6 bg-gray-100 dark:bg-gray-700 rounded">
                                      <div className="h-full flex items-center justify-center text-xs text-green-600 dark:text-green-400">
                                        +5.2%
                                      </div>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            {mockStudentEngagement
                              .sort((a, b) => a.engagementScore - b.engagementScore)
                              .slice(0, 2)
                              .map((student) => (
                                <tr key={`bottom-${student.id}`}>
                                  <td className="px-4 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                      <div className="w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center text-red-600 dark:text-red-400 font-medium mr-3">
                                        {student.name.charAt(0)}
                                      </div>
                                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                                        {student.name}
                                      </div>
                                    </div>
                                  </td>
                                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                    {student.course}
                                  </td>
                                  <td className="px-4 py-4 whitespace-nowrap">
                                    <span className="text-sm font-medium text-red-600 dark:text-red-400">
                                      {student.engagementScore}%
                                    </span>
                                  </td>
                                  <td className="px-4 py-4 whitespace-nowrap">
                                    <div className="w-16 h-6 bg-gray-100 dark:bg-gray-700 rounded">
                                      <div className="h-full flex items-center justify-center text-xs text-red-600 dark:text-red-400">
                                        -3.8%
                                      </div>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right column - Plagiarism Alerts & Student Engagement */}
                <div className="lg:col-span-1">
                  {/* Plagiarism Alerts */}
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-8">
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Plagiarism Alerts</h2>
                      <Link to="#" className="text-sm font-medium text-[#2A5C82] dark:text-[#00BFA5] hover:underline">
                        View All
                      </Link>
                    </div>

                    <div className="space-y-4">
                      {mockPlagiarismAlerts.map((alert) => (
                        <div
                          key={alert.id}
                          className={`p-4 rounded-lg border-l-4 ${
                            alert.risk === "high"
                              ? "border-red-500 bg-red-50 dark:bg-red-900/10"
                              : alert.risk === "medium"
                                ? "border-yellow-500 bg-yellow-50 dark:bg-yellow-900/10"
                                : "border-green-500 bg-green-50 dark:bg-green-900/10"
                          }`}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h4 className="font-medium text-gray-900 dark:text-white">{alert.student}</h4>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {alert.assessment} - {alert.course}
                              </p>
                            </div>
                            <span className={`text-xs px-2 py-1 rounded-full ${getRiskColorClass(alert.risk)}`}>
                              {alert.similarityScore}% Match
                            </span>
                          </div>
                          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-3">
                            <FiClock className="mr-1" />
                            <span>Submitted: {formatDate(alert.submissionDate)}</span>
                          </div>
                          <div className="flex justify-between">
                            <button className="text-sm text-[#2A5C82] dark:text-[#00BFA5] hover:underline">
                              View Report
                            </button>
                            <button className="text-sm text-red-600 dark:text-red-400 hover:underline">
                              Flag for Review
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Student Engagement */}
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-8">
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Student Engagement</h2>
                      <Link to="#" className="text-sm font-medium text-[#2A5C82] dark:text-[#00BFA5] hover:underline">
                        View All
                      </Link>
                    </div>

                    <div className="mb-6">
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4">Submission Status</h3>
                      <div className="h-48">
                        <Doughnut data={submissionStatusData} />
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4">Top Engaged Students</h3>
                      <div className="space-y-3">
                        {mockStudentEngagement
                          .sort((a, b) => b.engagementScore - a.engagementScore)
                          .slice(0, 5)
                          .map((student) => (
                            <div
                              key={student.id}
                              className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                            >
                              <div className="flex items-center">
                                <div className="w-8 h-8 bg-[#2A5C82] rounded-full flex items-center justify-center text-white font-medium mr-3">
                                  {student.name.charAt(0)}
                                </div>
                                <div>
                                  <div className="text-sm font-medium text-gray-900 dark:text-white">{student.name}</div>
                                  <div className="text-xs text-gray-500 dark:text-gray-400">{student.course}</div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div
                                  className={`text-sm font-medium ${getEngagementColorClass(student.engagementScore)}`}
                                >
                                  {student.engagementScore}%
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                  Last active: {formatDate(student.lastActive)}
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </main>
            
          </div>
        </div>
      </div>
    </div>
  )
}

export default LecturerDashboard