"use client"

import { useState, useEffect } from "react"
import { FiFlag, FiAlertCircle, FiFileText, FiDownload } from "react-icons/fi"
import RichTextEditor from "../ui/RichTextEditor"
import { Button } from "../ui/button"
import { Slider } from "../ui/slider" // Assuming shadcn/ui Slider is available or similar

const GradingInterface = ({ submissionDetails, onGradeChange, onFlagToggle, onSaveGrade, isSaving, darkMode }) => {
  const [currentGrade, setCurrentGrade] = useState(submissionDetails?.submission?.grade || 0)
  const [comments, setComments] = useState(submissionDetails?.submission?.lecturerComments || "")
  const [flagged, setFlagged] = useState(submissionDetails?.submission?.flaggedForReview || false)

  useEffect(() => {
    if (submissionDetails) {
      setCurrentGrade(submissionDetails.submission.grade !== null ? submissionDetails.submission.grade : 0)
      setComments(submissionDetails.submission.lecturerComments || "")
      setFlagged(submissionDetails.submission.flaggedForReview || false)
    }
  }, [submissionDetails])

  if (!submissionDetails) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
        Select a submission to view details and grade.
      </div>
    )
  }

  const { submission, studentAnswers, assessmentDetails, plagiarismReport } = submissionDetails
  const totalMaxMark = assessmentDetails?.totalMarks || 100 // Default to 100 if not set

  const handleSliderChange = (value) => {
    setCurrentGrade(value[0])
  }

  const handleFlagClick = () => {
    setFlagged((prev) => !prev)
    onFlagToggle(submission.id, !flagged)
  }

  const handleSaveClick = () => {
    onSaveGrade(submission.id, currentGrade, comments, flagged)
  }

  const getPlagiarismColorClass = (score) => {
    if (score <= 20) return "text-green-500"
    if (score <= 40) return "text-yellow-500"
    return "text-red-500"
  }

  return (
    <div className={`p-6 h-full overflow-y-auto ${darkMode ? "bg-gray-900" : "bg-gray-50"}`}>
      <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
        Grading: {submission.studentName} - {submission.assessmentTitle}
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Student Submission Panel */}
        <div className={`p-4 rounded-lg shadow-md ${darkMode ? "bg-gray-800" : "bg-white"}`}>
          <h3 className="font-semibold text-lg mb-3 text-gray-900 dark:text-white">Student Submission</h3>
          {studentAnswers.map((answer, index) => (
            <div key={index} className="mb-4 p-3 border border-gray-200 dark:border-gray-700 rounded-md">
              <p className="font-medium text-gray-800 dark:text-gray-200 mb-2">
                Question {index + 1}: {answer.questionText} ({answer.maxMark} pts)
              </p>
              {answer.type === "mcq" && (
                <p className="text-gray-700 dark:text-gray-300">
                  Selected: {answer.studentAnswer?.selectedOptionText || "No answer"}
                </p>
              )}
              {answer.type === "essay" && (
                <div
                  className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300"
                  dangerouslySetInnerHTML={{ __html: answer.studentAnswer?.content || "<p>No answer provided.</p>" }}
                />
              )}
              {answer.type === "file" && (
                <div className="flex items-center text-gray-700 dark:text-gray-300">
                  <FiFileText className="mr-2" />
                  {answer.studentAnswer?.fileName || "No file uploaded."}
                  {answer.studentAnswer?.fileName && (
                    <Button variant="link" size="sm" className="ml-2">
                      <FiDownload className="mr-1" /> Download
                    </Button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Model Answer + NLP Analysis Panel */}
        <div className={`p-4 rounded-lg shadow-md ${darkMode ? "bg-gray-800" : "bg-white"}`}>
          <h3 className="font-semibold text-lg mb-3 text-gray-900 dark:text-white">Model Answer & Analysis</h3>
          {studentAnswers.map((answer, index) => (
            <div key={index} className="mb-4 p-3 border border-gray-200 dark:border-gray-700 rounded-md">
              <p className="font-medium text-gray-800 dark:text-gray-200 mb-2">Question {index + 1}: Model Answer</p>
              {answer.type === "essay" && (
                <>
                  <div
                    className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300"
                    dangerouslySetInnerHTML={{ __html: answer.modelAnswer || "<p>No model answer provided.</p>" }}
                  />
                  {answer.keywords && answer.keywords.length > 0 && (
                    <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
                      <span className="font-semibold">Keywords:</span> {answer.keywords.join(", ")}
                    </div>
                  )}
                </>
              )}
              {answer.type === "mcq" && (
                <p className="text-gray-700 dark:text-gray-300">
                  Correct Option: {answer.options?.find((opt) => opt.isCorrect)?.text || "N/A"}
                </p>
              )}
            </div>
          ))}

          {plagiarismReport && (
            <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
              <h4 className="font-semibold text-gray-800 dark:text-white mb-2">Plagiarism Analysis</h4>
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-1">
                Similarity Score:{" "}
                <span className={`font-bold ${getPlagiarismColorClass(plagiarismReport.similarityScore)}`}>
                  {plagiarismReport.similarityScore}%
                </span>
              </p>
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-1">
                Cosine Similarity: <span className="font-bold text-blue-500">{plagiarismReport.cosineSimilarity}</span>
              </p>
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-1">
                Matched Sources:
                {plagiarismReport.matchedSources && plagiarismReport.matchedSources.length > 0 ? (
                  <ul className="list-disc list-inside ml-2">
                    {plagiarismReport.matchedSources.map((source, idx) => (
                      <li key={idx}>
                        <a
                          href={source.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:underline"
                        >
                          {source.source} ({source.percentage}%)
                        </a>
                      </li>
                    ))}
                  </ul>
                ) : (
                  " None"
                )}
              </p>
              {plagiarismReport.nlpInsights && (
                <div className="mt-3">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Missing Keywords:{" "}
                    <span className="font-semibold text-red-500">
                      {plagiarismReport.nlpInsights.missingKeywords.join(", ") || "None"}
                    </span>
                  </p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Extra Keywords:{" "}
                    <span className="font-semibold text-yellow-500">
                      {plagiarismReport.nlpInsights.extraKeywords.join(", ") || "None"}
                    </span>
                  </p>
                </div>
              )}
              <Button variant="link" size="sm" className="mt-2">
                View Full Plagiarism Report
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Grading Controls */}
      <div className={`p-6 rounded-lg shadow-md ${darkMode ? "bg-gray-800" : "bg-white"}`}>
        <h3 className="font-semibold text-lg mb-4 text-gray-900 dark:text-white">Grade Submission</h3>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Score: {currentGrade} / {totalMaxMark}
          </label>
          <Slider
            defaultValue={[currentGrade]}
            max={totalMaxMark}
            step={1}
            onValueChange={handleSliderChange}
            className="w-full"
          >
            <div className="relative flex items-center select-none touch-none w-full h-2 rounded-full bg-gray-200 dark:bg-gray-700">
              <Slider.Track className="relative grow rounded-full h-full">
                <Slider.Range className="absolute bg-blue-500 rounded-full h-full" />
              </Slider.Track>
              <Slider.Thumb className="block w-5 h-5 rounded-full bg-blue-500 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2" />
            </div>
          </Slider>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Lecturer Comments:</label>
          <RichTextEditor value={comments} onChange={setComments} placeholder="Add feedback for the student..." />
        </div>

        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={handleFlagClick}
            className={`${
              flagged
                ? "bg-yellow-100 text-yellow-800 border-yellow-500 dark:bg-yellow-900/30 dark:text-yellow-300"
                : "text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600"
            }`}
          >
            <FiFlag className="mr-2" /> {flagged ? "Unflag for Review" : "Flag for Review"}
          </Button>
          <div className="flex space-x-2">
            <Button variant="secondary">
              <FiAlertCircle className="mr-2" /> Apply NLP Suggestions (Mock)
            </Button>
            <Button onClick={handleSaveClick} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Grade"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default GradingInterface
