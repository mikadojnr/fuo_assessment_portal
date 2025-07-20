"use client"

import { useState } from "react"
import { FiSearch, FiCheckCircle, FiXCircle, FiFlag } from "react-icons/fi"
import SubmissionCard from "./SubmissionCard"

const SubmissionList = ({ submissions, onSelectSubmission, selectedSubmissionId }) => {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all") // 'all', 'ungraded', 'graded', 'flagged'

  const filteredSubmissions = submissions.filter((sub) => {
    const matchesSearch =
      sub.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.studentId.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "ungraded" && sub.status === "ungraded") ||
      (filterStatus === "graded" && sub.status === "graded") ||
      (filterStatus === "flagged" && sub.flaggedForReview)

    return matchesSearch && matchesStatus
  })

  return (
    <div className="p-4 border-r border-gray-200 dark:border-gray-700 h-full overflow-y-auto">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">Submissions</h2>
        <div className="relative mb-3">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search student..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex space-x-2 text-sm">
          <button
            className={`px-3 py-1 rounded-full flex items-center ${
              filterStatus === "all"
                ? "bg-blue-500 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            }`}
            onClick={() => setFilterStatus("all")}
          >
            All
          </button>
          <button
            className={`px-3 py-1 rounded-full flex items-center ${
              filterStatus === "ungraded"
                ? "bg-blue-500 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            }`}
            onClick={() => setFilterStatus("ungraded")}
          >
            <FiXCircle className="mr-1" size={12} /> Ungraded
          </button>
          <button
            className={`px-3 py-1 rounded-full flex items-center ${
              filterStatus === "graded"
                ? "bg-blue-500 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            }`}
            onClick={() => setFilterStatus("graded")}
          >
            <FiCheckCircle className="mr-1" size={12} /> Graded
          </button>
          <button
            className={`px-3 py-1 rounded-full flex items-center ${
              filterStatus === "flagged"
                ? "bg-blue-500 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            }`}
            onClick={() => setFilterStatus("flagged")}
          >
            <FiFlag className="mr-1" size={12} /> Flagged
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {filteredSubmissions.length > 0 ? (
          filteredSubmissions.map((sub) => (
            <SubmissionCard
              key={sub.id}
              submission={sub}
              onSelect={onSelectSubmission}
              isSelected={sub.id === selectedSubmissionId}
            />
          ))
        ) : (
          <p className="text-center text-gray-500 dark:text-gray-400 mt-8">No submissions found.</p>
        )}
      </div>
    </div>
  )
}

export default SubmissionList
