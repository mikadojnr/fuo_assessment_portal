"use client"

import { FiFlag, FiCheckCircle, FiXCircle, FiClock } from "react-icons/fi"

const SubmissionCard = ({ submission, onSelect, isSelected }) => {
  const getPlagiarismColor = (score) => {
    if (score <= 20) return "bg-green-500"
    if (score <= 40) return "bg-yellow-500"
    return "bg-red-500"
  }

  const getStatusBadge = (status, grade) => {
    if (status === "graded") {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
          <FiCheckCircle className="mr-1" size={12} /> Graded ({grade !== null ? `${grade}%` : "N/A"})
        </span>
      )
    } else if (submission.flaggedForReview) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
          <FiFlag className="mr-1" size={12} /> Flagged
        </span>
      )
    } else {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
          <FiXCircle className="mr-1" size={12} /> Ungraded
        </span>
      )
    }
  }

  return (
    <div
      className={`p-4 rounded-lg shadow-sm cursor-pointer transition-all duration-200 
            ${isSelected ? "bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500" : "bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"}
          `}
      onClick={() => onSelect(submission.id)}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-blue-200 dark:bg-blue-700 flex items-center justify-center text-blue-800 dark:text-blue-200 font-semibold text-sm mr-3">
            {submission.studentName.charAt(0)}
          </div>
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white">{submission.studentName}</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">ID: {submission.studentId}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {submission.plagiarismScore !== undefined && (
            <div
              className={`w-3 h-3 rounded-full ${getPlagiarismColor(submission.plagiarismScore)}`}
              title={`Plagiarism: ${submission.plagiarismScore}%`}
            ></div>
          )}
          {getStatusBadge(submission.status, submission.grade)}
        </div>
      </div>
      <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
        <FiClock className="mr-1" size={12} />
        Submitted: {new Date(submission.submittedAt).toLocaleString()}
      </div>
    </div>
  )
}

export default SubmissionCard
