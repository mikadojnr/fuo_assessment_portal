"use client"

import { useState } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { FiHome, FiUser, FiSettings, FiLogOut, FiMenu, FiX, FiBook, FiCalendar, FiMessageSquare } from "react-icons/fi"

const Dashboard = () => {
  const { currentUser, logout } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar for desktop */}
      <div className="hidden md:flex md:flex-col md:w-64 md:fixed md:inset-y-0 bg-[#2A5C82] text-white">
        <div className="flex items-center justify-center h-16 border-b border-[#1e4460]">
          <h2 className="text-xl font-bold">Learning Platform</h2>
        </div>
        <div className="flex-1 flex flex-col overflow-y-auto">
          <nav className="flex-1 px-2 py-4 space-y-1">
            <Link to="/dashboard" className="flex items-center px-4 py-2 text-white bg-[#1e4460] rounded-md group">
              <FiHome className="mr-3 h-5 w-5" />
              Dashboard
            </Link>
            <Link to="/profile" className="flex items-center px-4 py-2 text-white hover:bg-[#1e4460] rounded-md group">
              <FiUser className="mr-3 h-5 w-5" />
              Profile
            </Link>
            <Link to="#" className="flex items-center px-4 py-2 text-white hover:bg-[#1e4460] rounded-md group">
              <FiBook className="mr-3 h-5 w-5" />
              Courses
            </Link>
            <Link to="#" className="flex items-center px-4 py-2 text-white hover:bg-[#1e4460] rounded-md group">
              <FiCalendar className="mr-3 h-5 w-5" />
              Schedule
            </Link>
            <Link to="#" className="flex items-center px-4 py-2 text-white hover:bg-[#1e4460] rounded-md group">
              <FiMessageSquare className="mr-3 h-5 w-5" />
              Messages
            </Link>
            <Link to="#" className="flex items-center px-4 py-2 text-white hover:bg-[#1e4460] rounded-md group">
              <FiSettings className="mr-3 h-5 w-5" />
              Settings
            </Link>
          </nav>
          <div className="p-4 border-t border-[#1e4460]">
            <button
              onClick={logout}
              className="flex items-center w-full px-4 py-2 text-white hover:bg-[#1e4460] rounded-md"
            >
              <FiLogOut className="mr-3 h-5 w-5" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Mobile sidebar */}
      <div
        className={`fixed inset-0 bg-gray-600 bg-opacity-75 z-40 md:hidden transition-opacity duration-300 ${
          sidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={toggleSidebar}
      ></div>

      <div
        className={`fixed inset-y-0 left-0 flex flex-col w-64 bg-[#2A5C82] text-white z-50 md:hidden transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between h-16 border-b border-[#1e4460] px-4">
          <h2 className="text-xl font-bold">Learning Platform</h2>
          <button onClick={toggleSidebar} className="text-white">
            <FiX className="h-6 w-6" />
          </button>
        </div>
        <div className="flex-1 flex flex-col overflow-y-auto">
          <nav className="flex-1 px-2 py-4 space-y-1">
            <Link to="/dashboard" className="flex items-center px-4 py-2 text-white bg-[#1e4460] rounded-md group">
              <FiHome className="mr-3 h-5 w-5" />
              Dashboard
            </Link>
            <Link to="/profile" className="flex items-center px-4 py-2 text-white hover:bg-[#1e4460] rounded-md group">
              <FiUser className="mr-3 h-5 w-5" />
              Profile
            </Link>
            <Link to="#" className="flex items-center px-4 py-2 text-white hover:bg-[#1e4460] rounded-md group">
              <FiBook className="mr-3 h-5 w-5" />
              Courses
            </Link>
            <Link to="#" className="flex items-center px-4 py-2 text-white hover:bg-[#1e4460] rounded-md group">
              <FiCalendar className="mr-3 h-5 w-5" />
              Schedule
            </Link>
            <Link to="#" className="flex items-center px-4 py-2 text-white hover:bg-[#1e4460] rounded-md group">
              <FiMessageSquare className="mr-3 h-5 w-5" />
              Messages
            </Link>
            <Link to="#" className="flex items-center px-4 py-2 text-white hover:bg-[#1e4460] rounded-md group">
              <FiSettings className="mr-3 h-5 w-5" />
              Settings
            </Link>
          </nav>
          <div className="p-4 border-t border-[#1e4460]">
            <button
              onClick={logout}
              className="flex items-center w-full px-4 py-2 text-white hover:bg-[#1e4460] rounded-md"
            >
              <FiLogOut className="mr-3 h-5 w-5" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="md:ml-64 flex-1">
        <header className="bg-white shadow">
          <div className="px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            <div className="flex items-center">
              <button onClick={toggleSidebar} className="mr-4 md:hidden">
                <FiMenu className="h-6 w-6" />
              </button>
              <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
            </div>
            <div className="flex items-center">
              <Link to="/profile" className="flex items-center">
                <div className="w-8 h-8 bg-[#2A5C82] rounded-full flex items-center justify-center text-white font-medium mr-2">
                  {currentUser?.firstName?.charAt(0) || "U"}
                </div>
                <span className="hidden md:block text-sm font-medium text-gray-700">
                  {currentUser?.firstName || "User"}
                </span>
              </Link>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Welcome Card */}
            <div className="col-span-1 md:col-span-2 lg:col-span-3 bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium mb-4">Welcome, {currentUser?.firstName || "User"}!</h2>
              <p className="text-gray-600">
                This is your learning dashboard. Access your courses, assignments, and resources from here.
              </p>
            </div>

            {/* Quick Stats */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-md font-medium mb-4 flex items-center">
                <FiBook className="mr-2 text-[#00BFA5]" /> My Courses
              </h3>
              <div className="text-3xl font-bold text-gray-800">5</div>
              <p className="text-sm text-gray-500 mt-1">Active courses</p>
              <div className="mt-4">
                <Link to="#" className="text-sm text-[#2A5C82] hover:text-[#1e4460] font-medium flex items-center">
                  View all courses
                </Link>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-md font-medium mb-4 flex items-center">
                <FiCalendar className="mr-2 text-[#00BFA5]" /> Upcoming
              </h3>
              <div className="text-3xl font-bold text-gray-800">3</div>
              <p className="text-sm text-gray-500 mt-1">Due assignments</p>
              <div className="mt-4">
                <Link to="#" className="text-sm text-[#2A5C82] hover:text-[#1e4460] font-medium flex items-center">
                  View calendar
                </Link>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-md font-medium mb-4 flex items-center">
                <FiMessageSquare className="mr-2 text-[#00BFA5]" /> Messages
              </h3>
              <div className="text-3xl font-bold text-gray-800">2</div>
              <p className="text-sm text-gray-500 mt-1">Unread messages</p>
              <div className="mt-4">
                <Link to="#" className="text-sm text-[#2A5C82] hover:text-[#1e4460] font-medium flex items-center">
                  Open inbox
                </Link>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="col-span-1 md:col-span-2 lg:col-span-3 bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium mb-4">Recent Activity</h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0 bg-blue-100 rounded-full p-2">
                    <FiBook className="text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-900">New lecture materials uploaded</p>
                    <p className="text-sm text-gray-500">Introduction to Computer Science - 2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 bg-green-100 rounded-full p-2">
                    <FiCalendar className="text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-900">Assignment deadline extended</p>
                    <p className="text-sm text-gray-500">Data Structures - 1 day ago</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 bg-purple-100 rounded-full p-2">
                    <FiMessageSquare className="text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-900">New announcement from lecturer</p>
                    <p className="text-sm text-gray-500">Software Engineering - 2 days ago</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default Dashboard
