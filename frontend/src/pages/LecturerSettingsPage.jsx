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
} from "react-icons/fi"

const LecturerSettingsPage = () => {
  useEffect(() => {
    document.title = "Settings"
  }, [])

  const { currentUser, logout } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [darkMode, setDarkMode] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterOpen, setFilterOpen] = useState(false)

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
  ]

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen)
  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
    if (!darkMode) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
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
                  className="flex items-center px-4 py-3 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md group"
                >
                  <FiAlertTriangle className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" /> Plagiarism Alerts
                  <span className="ml-auto bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {mockPlagiarismAlerts.filter((alert) => alert.risk === "high").length}
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
                  className="flex items-center px-4 py-3 text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 rounded-md group"
                >
                  <FiSettings className="mr-3 h-5 w-5 text-[#00BFA5]" /> Settings
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
                  className="flex items-center px-4 py-3 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md group"
                >
                  <FiUsers className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" /> Student Management
                </Link>
                <Link
                  to="/lecturer/plagiarism-alerts"
                  className="flex items-center px-4 py-3 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md group"
                >
                  <FiAlertTriangle className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" /> Plagiarism Alerts
                  <span className="ml-auto bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {mockPlagiarismAlerts.filter((alert) => alert.risk === "high").length}
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
                  className="flex items-center px-4 py-3 text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 rounded-md group"
                >
                  <FiSettings className="mr-3 h-5 w-5 text-[#00BFA5]" /> Settings
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
                      placeholder="Search settings..."
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
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Category
                      </label>
                      <select className="w-40 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#00BFA5]">
                        <option value="all">All Categories</option>
                        <option value="profile">Profile</option>
                        <option value="notifications">Notifications</option>
                        <option value="security">Security</option>
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
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-8">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">General Settings</h2>

                <div className="space-y-6">
                  {/* Profile Settings */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Profile Settings</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label
                          htmlFor="firstName"
                          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                        >
                          First Name
                        </label>
                        <input
                          type="text"
                          id="firstName"
                          defaultValue={currentUser?.firstName || "Mikado"}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-[#00BFA5] focus:border-[#00BFA5]"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="lastName"
                          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                        >
                          Last Name
                        </label>
                        <input
                          type="text"
                          id="lastName"
                          defaultValue={currentUser?.lastName || "Junior"}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-[#00BFA5] focus:border-[#00BFA5]"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Email Address
                        </label>
                        <input
                          type="email"
                          id="email"
                          defaultValue={currentUser?.email || "mikado.junior@example.com"}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-[#00BFA5] focus:border-[#00BFA5]"
                        />
                      </div>
                    </div>
                    <button className="mt-4 px-4 py-2 bg-[#00BFA5] hover:bg-[#009e8f] text-white rounded-md transition-colors">
                      Save Profile
                    </button>
                  </div>

                  {/* Notification Settings */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Notification Settings</h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label
                          htmlFor="emailNotifications"
                          className="text-sm font-medium text-gray-700 dark:text-gray-300"
                        >
                          Email Notifications
                        </label>
                        <input
                          type="checkbox"
                          id="emailNotifications"
                          defaultChecked
                          className="h-4 w-4 text-[#00BFA5] focus:ring-[#00BFA5] border-gray-300 rounded"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <label
                          htmlFor="plagiarismAlerts"
                          className="text-sm font-medium text-gray-700 dark:text-gray-300"
                        >
                          Plagiarism Alerts
                        </label>
                        <input
                          type="checkbox"
                          id="plagiarismAlerts"
                          defaultChecked
                          className="h-4 w-4 text-[#00BFA5] focus:ring-[#00BFA5] border-gray-300 rounded"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <label
                          htmlFor="newSubmissionAlerts"
                          className="text-sm font-medium text-gray-700 dark:text-gray-300"
                        >
                          New Submission Alerts
                        </label>
                        <input
                          type="checkbox"
                          id="newSubmissionAlerts"
                          defaultChecked={false}
                          className="h-4 w-4 text-[#00BFA5] focus:ring-[#00BFA5] border-gray-300 rounded"
                        />
                      </div>
                    </div>
                    <button className="mt-4 px-4 py-2 bg-[#00BFA5] hover:bg-[#009e8f] text-white rounded-md transition-colors">
                      Save Notifications
                    </button>
                  </div>

                  {/* Security Settings */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Security</h3>
                    <div className="space-y-2">
                      <button className="w-full text-left px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors">
                        Change Password
                      </button>
                      <button className="w-full text-left px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors">
                        Two-Factor Authentication
                      </button>
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

export default LecturerSettingsPage
