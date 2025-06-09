"use client"

import { useState, useEffect } from "react"

const AssessmentPreview = ({ formData = {}, courses }) => {
  const [previewMode, setPreviewMode] = useState("summary")
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState({})
  const [essayAnswers, setEssayAnswers] = useState({})
  const [timeRemaining, setTimeRemaining] = useState(null)

  const getCourseTitle = (courseId) => {
    const course = courses.find((c) => c.id.toString() === courseId?.toString())
    return course ? `${course.code} - ${course.title}` : "Unknown Course"
  }

  const formatDate = (dateString) => {
    if (!dateString) return "Not set"
    const date = new Date(dateString)
    return date.toLocaleString()
  }

  const getTotalMarks = () => {
    return formData.questions?.reduce((sum, q) => sum + (q.maxMark || 0), 0) || 0
  }

  const handleMCQSelection = (questionIndex, optionIndex) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionIndex]: optionIndex,
    }))
  }

  const handleEssayInput = (questionIndex, value) => {
    setEssayAnswers((prev) => ({
      ...prev,
      [questionIndex]: value,
    }))
  }

  const goToPreviousQuestion = () => {
    setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))
  }

  const goToNextQuestion = () => {
    setCurrentQuestionIndex((prev) => Math.min(formData.questions.length - 1, prev + 1))
  }

  const countWords = (text) => {
    return text ? text.trim().split(/\s+/).filter(Boolean).length : 0
  }

  const getWordCountClass = (count, limit) => {
    if (!limit) return "text-gray-500"
    if (count > limit) return "text-red-500"
    if (count > limit * 0.8) return "text-yellow-500"
    return "text-green-500"
  }

  useEffect(() => {
    if (formData.startDate && formData.endDate) {
      const calculateTime = () => {
        const start = new Date(formData.startDate)
        const end = new Date(formData.endDate)
        const now = new Date()

        if (now > end) {
          setTimeRemaining("Time expired")
          return
        }

        const diff = Math.floor((end - now) / 1000)
        const hours = Math.floor(diff / 3600)
        const minutes = Math.floor((diff % 3600) / 60)

        setTimeRemaining(`${hours}h ${minutes}m remaining`)
      }

      calculateTime()
      const interval = setInterval(calculateTime, 60000)
      return () => clearInterval(interval)
    }
  }, [formData.startDate, formData.endDate])

  const getQuestionTypeCounts = () => {
    const counts = { mcq: 0, essay: 0, file: 0 }
    formData.questions?.forEach((q) => {
      if (counts[q.type] !== undefined) {
        counts[q.type]++
      }
    })
    return counts
  }

  const getQuestionTypeText = (type) => {
    switch (type) {
      case "mcq":
        return "Multiple Choice"
      case "essay":
        return "Essay"
      case "file":
        return "File Upload"
      default:
        return type
    }
  }

  const renderStudentView = () => {
    if (!formData.questions?.length) {
      return (
        <div className="text-center p-8 bg-gray-50 rounded-lg">
          <h3 className="mt-4 text-lg font-medium text-gray-900">No Questions Added</h3>
          <p className="mt-2 text-sm text-gray-500">
            Add questions in the creation flow to preview the student experience
          </p>
        </div>
      )
    }

    const currentQuestion = formData.questions[currentQuestionIndex]
    const progressPercentage = ((currentQuestionIndex + 1) / formData.questions.length) * 100

    return (
      <div className="bg-white rounded-lg border shadow-sm flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">{formData.title || "Untitled Assessment"}</h2>
          <div className="mt-1 flex justify-between items-center text-sm text-gray-600">
            <span>{getCourseTitle(formData.courseId)}</span>
            {timeRemaining && (
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full">⌛ {timeRemaining}</span>
            )}
          </div>
        </div>

        {/* Progress */}
        <div className="px-6 py-2">
          <div className="flex justify-between text-xs text-gray-600 mb-1">
            <span>
              Question {currentQuestionIndex + 1} of {formData.questions.length}
            </span>
            <span>{Math.round(progressPercentage)}% Complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-teal-600 h-2 rounded-full" style={{ width: `${progressPercentage}%` }} />
          </div>
        </div>

        {/* Question */}
        <div className="p-6 flex-1 overflow-y-auto">
          <h3 className="text-lg font-medium mb-4 text-gray-800">
            Q{currentQuestionIndex + 1}: {currentQuestion.text || "No question text"}
          </h3>

          {currentQuestion.type === "mcq" && (
            <div className="space-y-3">
              {currentQuestion.options?.map((option, index) => (
                <label
                  key={index}
                  className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:border-teal-500"
                >
                  <input
                    type="radio"
                    name={`question-${currentQuestionIndex}`}
                    checked={selectedAnswers[currentQuestionIndex] === index}
                    onChange={() => handleMCQSelection(currentQuestionIndex, index)}
                    className="h-4 w-4 text-teal-600 border-gray-300 mr-3"
                  />
                  <span>{option.text || `Option ${index + 1}`}</span>
                </label>
              ))}
            </div>
          )}

          {currentQuestion.type === "essay" && (
            <div className="space-y-4 mt-4">
              <textarea
                value={essayAnswers[currentQuestionIndex] || ""}
                onChange={(e) => handleEssayInput(currentQuestionIndex, e.target.value)}
                rows={5}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500"
              />
              {currentQuestion.wordLimit > 0 && (
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Word limit: {currentQuestion.wordLimit}</span>
                  <span
                    className={getWordCountClass(
                      countWords(essayAnswers[currentQuestionIndex]),
                      currentQuestion.wordLimit,
                    )}
                  >
                    {countWords(essayAnswers[currentQuestionIndex] || "")} words
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="px-6 py-4 bg-gray-50 border-t flex justify-between">
          <button
            onClick={goToPreviousQuestion}
            disabled={currentQuestionIndex === 0}
            className={`px-5 py-2 text-sm font-medium rounded-md ${
              currentQuestionIndex === 0
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-100"
            }`}
          >
            ← Previous
          </button>
          {currentQuestionIndex < formData.questions.length - 1 ? (
            <button
              onClick={goToNextQuestion}
              className="px-5 py-2 bg-teal-600 text-white font-medium rounded-md hover:bg-teal-700"
            >
              Next →
            </button>
          ) : (
            <button className="px-5 py-2 bg-green-600 text-white font-medium rounded-md hover:bg-green-700">
              Submit Assessment
            </button>
          )}
        </div>

        <div className="px-5 py-2 mt-6 pt-4 border-t border-gray-200 text-sm text-gray-500 italic">
          This is a preview only. The actual assessment may appear differently to students.
        </div>
      </div>
    )
  }

  const renderSummaryView = () => {
    return (
      <div className="space-y-4">
        <div className="p-4 bg-gray-50 rounded-md border">
          <h3 className="font-medium mb-3">{formData.title || "Untitled Assessment"}</h3>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Course:</span>
              <span className="font-medium">
                {formData.courseId ? getCourseTitle(formData.courseId) : "Not selected"}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">Total Questions:</span>
              <span className="font-medium">{formData.questions?.length || 0}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">Total Marks:</span>
              <span className="font-medium">{getTotalMarks()}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">Start Date:</span>
              <span className="font-medium">{formatDate(formData.startDate)}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">End Date:</span>
              <span className="font-medium">{formatDate(formData.endDate)}</span>
            </div>
          </div>
        </div>

        {formData.questions?.length > 0 && (
          <div className="p-4 bg-gray-50 rounded-md border">
            <h3 className="font-medium mb-3">Question Types</h3>

            <div className="space-y-2">
              {Object.entries(getQuestionTypeCounts()).map(([type, count]) => (
                <div key={type} className="flex justify-between">
                  <span className="text-gray-600">{getQuestionTypeText(type)}:</span>
                  <span className="font-medium">{count}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {formData.enablePlagiarismCheck && (
          <div className="p-4 bg-gray-50 rounded-md border">
            <h3 className="font-medium mb-2">Plagiarism Detection</h3>
            <div className="text-sm text-gray-600">Enabled with {formData.similarityThreshold || 30}% threshold</div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="bg-white shadow-md rounded-lg p-6 sticky top-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Preview</h2>
        <div className="flex rounded-md overflow-hidden">
          <button
            className={`px-3 py-1 text-sm ${previewMode === "summary" ? "bg-teal-600 text-white" : "bg-gray-200"}`}
            onClick={() => setPreviewMode("summary")}
          >
            Summary
          </button>
          <button
            className={`px-3 py-1 text-sm ${previewMode === "student" ? "bg-teal-600 text-white" : "bg-gray-200"}`}
            onClick={() => setPreviewMode("student")}
          >
            Assessment View
          </button>
        </div>
      </div>
      <div className="mt-4">{previewMode === "summary" ? renderSummaryView() : renderStudentView()}</div>
    </div>
  )
}

export default AssessmentPreview
