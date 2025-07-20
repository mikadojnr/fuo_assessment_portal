"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { fetchStudentResultsList } from "../services/assessmentService"
import { toast } from "react-toastify"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FiArrowLeft } from "react-icons/fi"
import ProgressRing from "../components/ui/ProgressRing" // Corrected import

const StudentSubmissionsListPage = () => {
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    document.title = "My Assessment Results"
    const loadSubmissions = async () => {
      try {
        setLoading(true)
        const data = await fetchStudentResultsList()
        setSubmissions(data)
      } catch (err) {
        console.error("Error loading student submissions list:", err)
        setError("Failed to load your assessment results. Please try again.")
        toast.error("Failed to load your assessment results.")
      } finally {
        setLoading(false)
      }
    }
    loadSubmissions()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <p className="text-gray-700 dark:text-gray-300">Loading your submissions...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center flex-col">
        <p className="text-red-500 text-lg">{error}</p>
        <Link to="/student-dashboard" className="mt-4 text-[#2A5C82] dark:text-[#00BFA5] hover:underline">
          Go to Dashboard
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 relative">

      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <Link to="/student-dashboard" className="text-gray-600 dark:text-gray-400 hover:text-[#00BFA5] mr-3">
              <FiArrowLeft className="h-6 w-6" />
            </Link>
            <h1 className="text-3xl font-bold">My Submissions</h1>
          </div>
            
        </div>
      </header>

      <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        {submissions.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-600 dark:text-gray-400 text-lg">No assessments submitted yet.</p>
            <Link
              to="/student-dashboard"
              className="mt-4 inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              <FiArrowLeft className="mr-2" /> Back to Dashboard
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {submissions.map((submission) => {
              const scorePercentage = (submission.grade / submission.totalMarks) * 100
              const passed = scorePercentage >= 50
              const plagiarismClean = (submission.plagiarismScore || 0) < 20

              return (
                <Card key={submission.id} className="shadow-md hover:shadow-lg transition-shadow duration-200">
                  <CardHeader className="pb-3">
                    <CardDescription className="text-sm text-gray-500 dark:text-gray-400">
                      {submission.courseCode} - {new Date(submission.submittedAt).toLocaleDateString()}
                    </CardDescription>
                    <CardTitle className="text-xl font-semibold text-[#2A5C82] dark:text-[#00BFA5]">
                      {submission.assessmentTitle}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <div className="relative w-20 h-20">
                        <ProgressRing
                          radius={35}
                          stroke={7}
                          progress={scorePercentage}
                          color={passed ? "#6BCB77" : "#FF6B6B"}
                          backgroundColor="rgba(100,100,100,0.2)"
                        />
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-xl font-bold">{Math.round(scorePercentage)}%</span>
                          <span className="text-xs text-gray-600 dark:text-gray-300">Score</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <div
                          className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                            passed
                              ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300"
                              : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300"
                          }`}
                        >
                          {passed ? "Passed" : "Failed"}
                        </div>
                        <div
                          className={`px-2 py-0.5 rounded-full text-xs font-semibold mt-1 ${
                            plagiarismClean
                              ? "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300"
                              : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300"
                          }`}
                        >
                          Plagiarism: {plagiarismClean ? "Clean" : "High"}
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
                      {submission.feedbackSummary}
                    </p>
                    <Link to={`/student/results/${submission.id}`} className="w-full">
                      <Button className="w-full bg-[#00BFA5] hover:bg-[#009a82] text-white mt-2">View Details</Button>
                    </Link>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        {submissions.length > 0 && (
          <div className="mt-8 text-center">
            <Link
              to="/student-dashboard"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              <FiArrowLeft className="mr-2" />
              Back to Dashboard
            </Link>
          </div>
        )}
      </main>
    </div>
  )
}

export default StudentSubmissionsListPage
