"use client"

import { useState, useEffect, useRef } from "react"
import { useParams } from "react-router-dom"
import {
  fetchSubmissionsForAssessment,
  fetchSubmissionDetails,
  updateSubmissionGrade,
  fetchAssessmentAnalytics,
} from "../services/assessmentService"
import SubmissionList from "../components/grading/SubmissionList"
import GradingInterface from "../components/grading/GradingInterface"
import AnalyticsPanel from "../components/grading/AnalyticsPanel"
import { FiSun, FiMoon, FiMenu, FiX, FiArrowLeft, FiArrowRight, FiAlertCircle } from "react-icons/fi"
import { toast } from "react-toastify"

const LecturerGradingAnalyticsPage = () => {
  const { assessmentId } = useParams()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [submissions, setSubmissions] = useState([])
  const [selectedSubmissionId, setSelectedSubmissionId] = useState(null)
  const [selectedSubmissionDetails, setSelectedSubmissionDetails] = useState(null)
  const [analyticsData, setAnalyticsData] = useState(null)
  const [darkMode, setDarkMode] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true) // For mobile/tablet sidebar
  const [isSavingGrade, setIsSavingGrade] = useState(false)

  const autoSaveTimeoutRef = useRef(null)

  useEffect(() => {
    document.title = "Grading & Analytics"
    const fetchAllData = async () => {
      setLoading(true)
      try {
        const [submissionsData, analyticsData] = await Promise.all([
          fetchSubmissionsForAssessment(assessmentId),
          fetchAssessmentAnalytics(assessmentId),
        ])
        setSubmissions(submissionsData)
        setAnalyticsData(analyticsData)

        if (submissionsData.length > 0) {
          // Select the first ungraded or flagged submission by default
          const firstUngraded = submissionsData.find((s) => s.status === "ungraded")
          const firstFlagged = submissionsData.find((s) => s.flaggedForReview)
          const initialSelectionId = firstUngraded?.id || firstFlagged?.id || submissionsData[0].id
          setSelectedSubmissionId(initialSelectionId)
          await loadSubmissionDetails(initialSelectionId)
        }
      } catch (err) {
        console.error("Error fetching initial data:", err)
        setError("Failed to load grading data. Please try again.")
        toast.error("Failed to load grading data.")
      } finally {
        setLoading(false)
      }
    }

    fetchAllData()
  }, [assessmentId])

  useEffect(() => {
    if (selectedSubmissionId) {
      loadSubmissionDetails(selectedSubmissionId)
    }
  }, [selectedSubmissionId])

  const loadSubmissionDetails = async (submissionId) => {
    try {
      const details = await fetchSubmissionDetails(submissionId)
      setSelectedSubmissionDetails(details)
    } catch (err) {
      console.error("Error loading submission details:", err)
      toast.error("Failed to load submission details.")
      setSelectedSubmissionDetails(null)
    }
  }

  const handleSelectSubmission = (submissionId) => {
    setSelectedSubmissionId(submissionId)
  }

  const handleSaveGrade = async (submissionId, grade, comments, flaggedForReview) => {
    setIsSavingGrade(true)
    try {
      const updatedSubmission = await updateSubmissionGrade(submissionId, {
        grade,
        lecturerComments: comments,
        flaggedForReview,
      })

      // Update the submissions list with the new status/grade
      setSubmissions((prev) =>
        prev.map((sub) =>
          sub.id === submissionId
            ? {
                ...sub,
                status: updatedSubmission.submission.grade !== null ? "graded" : "ungraded",
                grade: updatedSubmission.submission.grade,
                flaggedForReview: updatedSubmission.submission.flaggedForReview,
              }
            : sub,
        ),
      )
      // Reload analytics data as grades might have changed
      const updatedAnalytics = await fetchAssessmentAnalytics(assessmentId)
      setAnalyticsData(updatedAnalytics)
      toast.success("Submission graded and saved!")
    } catch (err) {
      console.error("Error saving grade:", err)
      toast.error("Failed to save grade.")
    } finally {
      setIsSavingGrade(false)
    }
  }

  const handleFlagToggle = async (submissionId, newFlagStatus) => {
    try {
      await updateSubmissionGrade(submissionId, { flaggedForReview: newFlagStatus })
      setSubmissions((prev) =>
        prev.map((sub) => (sub.id === submissionId ? { ...sub, flaggedForReview: newFlagStatus } : sub)),
      )
      setSelectedSubmissionDetails((prev) => ({
        ...prev,
        submission: { ...prev.submission, flaggedForReview: newFlagStatus },
      }))
      toast.success(`Submission ${newFlagStatus ? "flagged" : "unflagged"} for review.`)
    } catch (err) {
      console.error("Error toggling flag:", err)
      toast.error("Failed to update flag status.")
    }
  }

  const navigateSubmission = (direction) => {
    const currentIndex = submissions.findIndex((sub) => sub.id === selectedSubmissionId)
    let nextIndex = currentIndex

    if (direction === "next") {
      nextIndex = (currentIndex + 1) % submissions.length
    } else if (direction === "prev") {
      nextIndex = (currentIndex - 1 + submissions.length) % submissions.length
    }

    if (submissions[nextIndex]) {
      setSelectedSubmissionId(submissions[nextIndex].id)
    }
  }

  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
    document.documentElement.classList.toggle("dark", !darkMode)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-lg font-medium text-gray-700 dark:text-gray-300">Loading grading dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-md p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md text-center">
          <FiAlertCircle size={48} className="text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Error</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen flex flex-col ${darkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"}`}>
      {/* Header */}
      <header
        className={`sticky top-0 z-20 px-6 py-3 flex items-center justify-between border-b ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} shadow-sm`}
      >
        <div className="flex items-center">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="mr-4 p-2 rounded-md md:hidden text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
          >
            {sidebarOpen ? <FiX size={20} /> : <FiMenu size={20} />}
          </button>
          <h1 className="font-bold text-2xl text-gray-900 dark:text-white">
            Grading & Analytics: {selectedSubmissionDetails?.assessmentDetails?.title || "Assessment"}
          </h1>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={toggleDarkMode}
            className={`p-2 rounded-full ${darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"} transition-colors`}
            aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            {darkMode ? (
              <FiSun size={20} className="text-yellow-400" />
            ) : (
              <FiMoon size={20} className="text-gray-600" />
            )}
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel - Submission List */}
        <aside
          className={`${
            sidebarOpen ? "w-full md:w-1/4 lg:w-1/5" : "w-0"
          } flex-shrink-0 transition-all duration-300 overflow-hidden ${
            darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-800"
          } border-r ${darkMode ? "border-gray-700" : "border-gray-200"} h-full shadow-md md:shadow-none`}
        >
          <SubmissionList
            submissions={submissions}
            onSelectSubmission={handleSelectSubmission}
            selectedSubmissionId={selectedSubmissionId}
          />
        </aside>

        {/* Center Panel - Grading Interface */}
        <main className="flex-1 flex flex-col overflow-y-auto">
          <div className="flex-1 p-6">
            {" "}
            {/* Added padding here for content */}
            <GradingInterface
              submissionDetails={selectedSubmissionDetails}
              onGradeChange={handleSaveGrade} // This will trigger auto-save
              onFlagToggle={handleFlagToggle}
              onSaveGrade={handleSaveGrade}
              isSaving={isSavingGrade}
              darkMode={darkMode}
            />
          </div>
          {/* Navigation for grading interface */}
          <div
            className={`flex justify-between p-4 border-t ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} shadow-inner`}
          >
            <button
              onClick={() => navigateSubmission("prev")}
              disabled={!selectedSubmissionId || submissions.findIndex((s) => s.id === selectedSubmissionId) === 0}
              className="flex items-center px-4 py-2 rounded-md text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiArrowLeft className="mr-2" /> Previous
            </button>
            <button
              onClick={() => navigateSubmission("next")}
              disabled={
                !selectedSubmissionId ||
                submissions.findIndex((s) => s.id === selectedSubmissionId) === submissions.length - 1
              }
              className="flex items-center px-4 py-2 rounded-md text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next <FiArrowRight className="ml-2" />
            </button>
          </div>
        </main>

        {/* Right Panel - Analytics */}
        <aside
          className={`hidden lg:block w-1/4 flex-shrink-0 ${darkMode ? "bg-gray-800" : "bg-white"} border-l ${darkMode ? "border-gray-700" : "border-gray-200"} h-full overflow-y-auto shadow-md lg:shadow-none`}
        >
          <AnalyticsPanel analyticsData={analyticsData} darkMode={darkMode} />
        </aside>
      </div>
    </div>
  )
}

export default LecturerGradingAnalyticsPage
