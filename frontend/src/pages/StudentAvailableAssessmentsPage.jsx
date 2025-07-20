"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { FiArrowLeft, FiClock, FiFileText } from "react-icons/fi"
import { fetchStudentAvailableAssessments } from "../services/assessmentService" // Updated import
import { toast } from "react-toastify"
import { parseISO } from "date-fns"

const StudentAvailableAssessmentsPage = () => {
  const [assessments, setAssessments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    document.title = "Available Assessments"
    const loadAssessments = async () => {
      try {
        setLoading(true)
        const data = await fetchStudentAvailableAssessments() // Using the new service function
        setAssessments(data || []) // Data is now directly the array of assessments
      } catch (err) {
        console.error("Error fetching available assessments:", err)
        setError("Failed to load available assessments. Please try again.")
        toast.error("Failed to load available assessments.")
      } finally {
        setLoading(false)
      }
    }
    loadAssessments()
  }, [])

  const getStatusColorClass = (status, deadline) => {
    if (status === "submitted") return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
    if (status === "in_progress") return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
    if (new Date(deadline) < new Date()) return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
    return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
  }

  const getDaysRemaining = (deadline) => {
    const now = new Date()
    const deadlineDate = parseISO(deadline)
    const diffTime = deadlineDate.getTime() - now.getTime() // Use getTime() for consistent comparison
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays > 0 ? diffDays : 0 // Ensure it's not negative
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <p className="text-gray-700 dark:text-gray-300">Loading available assessments...</p>
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 ">
      
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <Link to="/student-dashboard" className="text-gray-600 dark:text-gray-400 hover:text-[#00BFA5] mr-3">
              <FiArrowLeft className="h-6 w-6" />
            </Link>
            <h1 className="text-3xl font-bold">Available Assessments</h1>
          </div>
            
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      
        {assessments.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 text-center">
            <p className="text-gray-500 dark:text-gray-400">No available assessments at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {assessments.map((assessment) => (
              <div
                key={assessment.id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white text-lg">
                        {assessment.courseCode}: {assessment.title}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{assessment.courseTitle}</p>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${getStatusColorClass(
                        assessment.status,
                        assessment.deadline,
                      )}`}
                    >
                      {/* Display status, capitalize first letter */}
                      {assessment.status.charAt(0).toUpperCase() + assessment.status.slice(1).replace("_", " ")}
                    </span>
                  </div>
                  <div className="flex items-center mb-3 text-gray-500 dark:text-gray-400">
                    <FiClock className="mr-2" />
                    <span className="text-sm">
                      Due: {new Date(assessment.deadline).toLocaleDateString()} (
                      {getDaysRemaining(assessment.deadline) === 0
                        ? "Due Today"
                        : `${getDaysRemaining(assessment.deadline)} days remaining`}
                      )
                    </span>
                  </div>
                  <div className="flex items-center mb-4 text-gray-500 dark:text-gray-400">
                    <FiFileText className="mr-2" />
                    <span className="text-sm">Type: {assessment.type}</span>
                  </div>
                  <div className="mb-4">
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div className="bg-[#00BFA5] h-2 rounded-full" style={{ width: `${assessment.progress}%` }}></div>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Progress: {assessment.progress}%</p>
                  </div>
                  <Link
                    to={`/student/assessments/${assessment.id}`}
                    className="block w-full text-center py-2 bg-[#2A5C82] hover:bg-[#1e4460] text-white rounded-md transition-colors"
                  >
                    {assessment.status === "in_progress" ? "Continue Assessment" : "Start Assessment"}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default StudentAvailableAssessmentsPage
