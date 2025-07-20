"use client"

import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import {
  FiMenu,
  FiX,
  FiSearch,
  FiBell,
  FiSun,
  FiMoon,
  FiFilter,
  FiHome,
  FiTarget,
  FiBarChart2,
  FiBook,
  FiUsers,
  FiAlertTriangle,
  FiSettings,
  FiLogOut,
  FiArrowLeft,
  FiEye,
} from "react-icons/fi"
import { getPlagiarismAlerts } from "../services/assessmentService"
import { toast } from "react-toastify"

const LecturerPlagiarismAlertsPage = () => {
  useEffect(() => {
    document.title = "Plagiarism Alerts"
  }, [])

  const { currentUser, logout } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [darkMode, setDarkMode] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterOpen, setFilterOpen] = useState(false)
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedRisk, setSelectedRisk] = useState("all")
  const [selectedCourse, setSelectedCourse] = useState("all")

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen)
  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
    if (!darkMode) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }

  const fetchAlertsData = async () => {
    setLoading(true)
    setError(null)
    try {
      const alertsData = await getPlagiarismAlerts()
      setAlerts(alertsData)
    } catch (err) {
      console.error("Error fetching plagiarism alerts:", err)
      setError("Failed to load plagiarism alerts. Please try again later.")
      toast.error("Failed to load plagiarism alerts.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAlertsData()
  }, [])

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const filteredAlerts = alerts.filter((alert) => {
    const matchesSearch =
      alert.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alert.assessmentTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alert.courseCode.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesRisk = selectedRisk === "all" || alert.risk === selectedRisk
    const matchesCourse = selectedCourse === "all" || alert.courseCode === selectedCourse

    return matchesSearch && matchesRisk && matchesCourse
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
        <div className="hidden md:flex md:flex-col md:w-64 md:fixed md:inset-y-0 bg-gray-200 dark:bg-gray-800 animate-pulse">
          <div className="h-full w-full"></div>
        </div>
        <div className="md:ml-64 flex-1 p-8">
          <div className="h-16 bg-gray-200 dark:bg-gray-800 rounded-lg mb-8 animate-pulse"></div>
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
            <div className="flex-1 flex flex-col overflow-y-auto">
              <nav className="flex-1 px-2 py-4 space-y-1">
                <Link
                  to="/lecturer-dashboard"
                  className="flex items-center px-4 py-3 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md group"
                >
                  <FiHome className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" /> Dashboard
                </Link>
                <Link
                  to="/lecturer/assessments/active"
                  className="flex items-center px-4 py-3 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md group"
                >
                  <FiTarget className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" /> Active Assessments
                </Link>
                <Link
                  to="/lecturer/analytics"
                  className="flex items-center px-4 py-3 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md group"
                >
                  <FiBarChart2 className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" /> Analytics
                </Link>
                <Link
                  to="/lecturer/question-bank"
                  className="flex items-center px-4 py-3 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md group"
                >
                  <FiBook className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" /> Question Bank
                </Link>
                <Link
                  to="/lecturer/student-management"
                  className="flex items-center px-4 py-3 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md group"
                >
                  <FiUsers className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" /> Student Management
                </Link>
                <Link
                  to="/lecturer/plagiarism-alerts"
                  className="flex items-center px-4 py-3 text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 rounded-md group"
                >
                  <FiAlertTriangle className="mr-3 h-5 w-5 text-[#00BFA5]" /> Plagiarism Alerts
                  <span className="ml-auto bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {alerts.filter((alert) => alert.risk === "high").length}
                  </span>
                </Link>
                <Link
                  to="/profile"
                  className="flex items-center px-4 py-3 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md group"
                >
                  <FiUsers className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" /> Profile
                </Link>
                <Link
                  to="/lecturer/settings"
                  className="flex items-center px-4 py-3 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md group"
                >
                  <FiSettings className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" /> Settings
                </Link>
              </nav>
              <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={logout}
                  className="flex items-center w-full px-4 py-3 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                >
                  <FiLogOut className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" /> Logout
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
            <div className="flex-1 flex flex-col overflow-y-auto">
              <nav className="flex-1 px-2 py-4 space-y-1">
                <Link
                  to="/lecturer-dashboard"
                  className="flex items-center px-4 py-3 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md group"
                >
                  <FiHome className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" /> Dashboard
                </Link>
                <Link
                  to="/lecturer/assessments/active"
                  className="flex items-center px-4 py-3 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md group"
                >
                  <FiTarget className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" /> Active Assessments
                </Link>
                <Link
                  to="/lecturer/analytics"
                  className="flex items-center px-4 py-3 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md group"
                >
                  <FiBarChart2 className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" /> Analytics
                </Link>
                <Link
                  to="/lecturer/question-bank"
                  className="flex items-center px-4 py-3 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md group"
                >
                  <FiBook className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" /> Question Bank
                </Link>
                <Link
                  to="/lecturer/student-management"
                  className="flex items-center px-4 py-3 text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 rounded-md group"
                >
                  <FiUsers className="mr-3 h-5 w-5 text-[#00BFA5]" /> Student Management
                </Link>
                <Link
                  to="/lecturer/plagiarism-alerts"
                  className="flex items-center px-4 py-3 text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 rounded-md group"
                >
                  <FiAlertTriangle className="mr-3 h-5 w-5 text-[#00BFA5]" /> Plagiarism Alerts
                  <span className="ml-auto bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {alerts.filter((alert) => alert.risk === "high").length}
                  </span>
                </Link>
                <Link
                  to="/profile"
                  className="flex items-center px-4 py-3 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md group"
                >
                  <FiUsers className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" /> Profile
                </Link>
                <Link
                  to="/lecturer/settings"
                  className="flex items-center px-4 py-3 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md group"
                >
                  <FiSettings className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" /> Settings
                </Link>
              </nav>
              <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={logout}
                  className="flex items-center w-full px-4 py-3 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                >
                  <FiLogOut className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" /> Logout
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
                      placeholder="Search alerts..."
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
                        {alerts.filter((alert) => alert.risk === "high").length}
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
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Risk</label>
                      <select
                        value={selectedRisk}
                        onChange={(e) => setSelectedRisk(e.target.value)}
                        className="w-40 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#00BFA5]"
                      >
                        <option value="all">All Risks</option>
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Course</label>
                      <select
                        value={selectedCourse}
                        onChange={(e) => setSelectedCourse(e.target.value)}
                        className="w-40 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#00BFA5]"
                      >
                        <option value="all">All Courses</option>
                        <option value="CSC 401">CSC 401</option>
                        <option value="CSC 405">CSC 405</option>
                        <option value="MTH 302">MTH 302</option>
                      </select>
                    </div>
                    <div className="flex items-end">
                      <button
                        onClick={fetchAlertsData} // Re-fetch or apply filters
                        className="px-4 py-2 bg-[#2A5C82] hover:bg-[#1e4460] text-white rounded-md transition-colors"
                      >
                        Apply Filters
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </header>

            {/* Plagiarism Alerts Content */}
            <main className="p-4 sm:p-6 lg:p-8">
              <div className="max-w-4xl mx-auto">
                <Link
                  to="/lecturer-dashboard"
                  className="inline-flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200 mb-6"
                >
                  <FiArrowLeft className="mr-2" /> Back to Dashboard
                </Link>
                <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Plagiarism Alerts</h1>

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-8">
                  {error ? (
                    <div className="text-red-600 dark:text-red-400 text-center py-4">{error}</div>
                  ) : filteredAlerts.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead>
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Student Name
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Assessment
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Course
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Similarity Score
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Risk
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Submission Date
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                          {filteredAlerts.map((alert) => (
                            <tr key={alert.id}>
                              <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                {alert.studentName}
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                {alert.assessmentTitle}
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                {alert.courseCode}
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                {alert.similarityScore}%
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap">
                                <span
                                  className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                    alert.risk === "high"
                                      ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                                      : alert.risk === "medium"
                                        ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
                                        : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                                  }`}
                                >
                                  {alert.risk}
                                </span>
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                {formatDate(alert.submissionDate)}
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                                <Link
                                  to={`/lecturer/assessments/grade/${alert.submissionId}`}
                                  className="text-[#2A5C82] hover:text-[#00BFA5] dark:text-[#00BFA5] dark:hover:text-[#2A5C82]"
                                >
                                  <FiEye className="inline-block mr-1" /> View Submission
                                </Link>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                      No plagiarism alerts found matching your criteria.
                    </div>
                  )}
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LecturerPlagiarismAlertsPage
