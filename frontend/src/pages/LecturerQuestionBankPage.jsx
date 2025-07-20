"use client"

import { useEffect, useState, Component } from "react"
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
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiArrowLeft,
} from "react-icons/fi"
import { getQuestions, deleteQuestion, getPlagiarismAlerts, getAllAssessmentsForLecturer } from "../services/assessmentService"
import { toast } from "react-toastify"

// Error Boundary Component
class ErrorBoundary extends Component {
  state = { hasError: false, errorMessage: "" }

  static getDerivedStateFromError(error) {
    return { hasError: true, errorMessage: error.message }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="text-red-600 dark:text-red-400 text-center py-8">
          Something went wrong: {this.state.errorMessage}. Please refresh the page or try again later.
        </div>
      )
    }
    return this.props.children
  }
}

const LecturerQuestionBankPage = () => {
  useEffect(() => {
    document.title = "Question Bank"
  }, [])

  const { currentUser, logout } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [darkMode, setDarkMode] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterOpen, setFilterOpen] = useState(false)
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedCourse, setSelectedCourse] = useState("all")
  const [selectedAssessment, setSelectedAssessment] = useState("all")
  const [selectedType, setSelectedType] = useState("all")
  const [selectedDifficulty, setSelectedDifficulty] = useState("all")
  const [plagiarismAlerts, setPlagiarismAlerts] = useState([])
  const [courses, setCourses] = useState([])
  const [assessments, setAssessments] = useState([])

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen)
  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
    if (!darkMode) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [questionsData, alertsData, assessmentsData] = await Promise.all([
        getQuestions({ assessmentId: selectedAssessment === "all" ? null : selectedAssessment }),
        getPlagiarismAlerts(),
        getAllAssessmentsForLecturer(),
      ])
      setQuestions(Array.isArray(questionsData) ? questionsData : questionsData.questions || [])
      setPlagiarismAlerts(Array.isArray(alertsData) ? alertsData : alertsData.plagiarismAlerts || [])
      setAssessments(Array.isArray(assessmentsData) ? assessmentsData : [])
      // Extract unique courses from assessments
      const uniqueCourses = [
        ...new Map(assessmentsData.map((item) => [item.courseId, { id: item.courseId, code: item.courseCode }])).values(),
      ]
      setCourses(uniqueCourses)
    } catch (err) {
      console.error("Error fetching data:", err)
      setError("Failed to load data. Please try again later.")
      toast.error("Failed to load data.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [selectedAssessment])

  const handleDeleteQuestion = async (questionId) => {
    if (window.confirm("Are you sure you want to delete this question?")) {
      try {
        await deleteQuestion(questionId)
        setQuestions(questions.filter((q) => q.id !== questionId))
        toast.success("Question deleted successfully.")
      } catch (err) {
        toast.error("Failed to delete question.")
      }
    }
  }

  const filteredQuestions = questions.filter((question) => {
    const matchesSearch =
      (question.text || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (question.type || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (question.difficulty || "").toLowerCase().includes(searchQuery.toLowerCase())

    const matchesCourse = selectedCourse === "all" || question.courseCode === selectedCourse
    const matchesAssessment = selectedAssessment === "all" || question.assessmentId === parseInt(selectedAssessment)
    const matchesType = selectedType === "all" || question.type === selectedType
    const matchesDifficulty = selectedDifficulty === "all" || question.difficulty === selectedDifficulty

    return matchesSearch && matchesCourse && matchesAssessment && matchesType && matchesDifficulty
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
    <ErrorBoundary>
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
                    className="flex items-center px-4 py-3 text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 rounded-md group"
                  >
                    <FiBook className="mr-3 h-5 w-5 text-[#00BFA5]" /> Question Bank
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
                      {plagiarismAlerts.filter((alert) => alert.risk === "high").length}
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
                    className="flex items-center px-4 py-3 text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 rounded-md group"
                  >
                    <FiBook className="mr-3 h-5 w-5 text-[#00BFA5]" /> Question Bank
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
                      {plagiarismAlerts.filter((alert) => alert.risk === "high").length}
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
                        placeholder="Search questions..."
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
                          {plagiarismAlerts.filter((alert) => alert.risk === "high").length}
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
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Course</label>
                        <select
                          value={selectedCourse}
                          onChange={(e) => setSelectedCourse(e.target.value)}
                          className="w-40 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#00BFA5]"
                        >
                          <option value="all">All Courses</option>
                          {courses.map((course) => (
                            <option key={course.id} value={course.code}>
                              {course.code}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Assessment</label>
                        <select
                          value={selectedAssessment}
                          onChange={(e) => setSelectedAssessment(e.target.value)}
                          className="w-40 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#00BFA5]"
                        >
                          <option value="all">All Assessments</option>
                          {assessments.map((assessment) => (
                            <option key={assessment.id} value={assessment.id}>
                              {assessment.title}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
                        <select
                          value={selectedType}
                          onChange={(e) => setSelectedType(e.target.value)}
                          className="w-40 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#00BFA5]"
                        >
                          <option value="all">All Types</option>
                          <option value="mcq">Multiple Choice</option>
                          <option value="essay">Essay</option>
                          <option value="short_answer">Short Answer</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Difficulty</label>
                        <select
                          value={selectedDifficulty}
                          onChange={(e) => setSelectedDifficulty(e.target.value)}
                          className="w-40 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#00BFA5]"
                        >
                          <option value="all">All Difficulties</option>
                          <option value="easy">Easy</option>
                          <option value="medium">Medium</option>
                          <option value="hard">Hard</option>
                        </select>
                      </div>
                      <div className="flex items-end">
                        <button
                          onClick={fetchData}
                          className="px-4 py-2 bg-[#2A5C82] hover:bg-[#1e4460] text-white rounded-md transition-colors"
                        >
                          Apply Filters
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </header>

              {/* Dashboard content */}
              <main className="p-4 sm:p-6 lg:p-8">
                <div className="max-w-4xl mx-auto">
                  <Link
                    to="/lecturer-dashboard"
                    className="inline-flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200 mb-6"
                  >
                    <FiArrowLeft className="mr-2" /> Back to Dashboard
                  </Link>
                  <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Question Bank</h1>
                    {/* <Link
                      to="/lecturer/question-bank/new"
                      className="flex items-center px-4 py-2 bg-[#00BFA5] hover:bg-[#009e8f] text-white rounded-md transition-colors"
                    >
                      <FiPlus className="mr-2" />
                      Add New Question
                    </Link> */}
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-8">
                    {error ? (
                      <div className="text-red-600 dark:text-red-400 text-center py-4">{error}</div>
                    ) : filteredQuestions.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                          <thead>
                            <tr>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Question
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Type
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Difficulty
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Marks
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Course
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Assessment
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {filteredQuestions.map((question) => (
                              <tr key={question.id}>
                                <td className="px-4 py-4 max-w-xs truncate text-sm font-medium text-gray-900 dark:text-white">
                                  {question.text}
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                  {question.type}
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                  {question.difficulty}
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                  {question.marks}
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                  {question.courseCode}
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                  {question.assessmentTitle}
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                                  <Link
                                    to={`/lecturer/question-bank/${question.id}/edit`}
                                    className="text-[#2A5C82] hover:text-[#00BFA5] dark:text-[#00BFA5] dark:hover:text-[#2A5C82] mr-3"
                                  >
                                    <FiEdit2 className="inline-block mr-1" /> Edit
                                  </Link>
                                  <button
                                    onClick={() => handleDeleteQuestion(question.id)}
                                    className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-600"
                                  >
                                    <FiTrash2 className="inline-block mr-1" /> Delete
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                        No questions found in the bank matching your criteria.
                        <Link to="/lecturer/question-bank/new" className="ml-2 text-[#00BFA5] hover:underline">
                          Add your first question!
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </main>
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  )
}

export default LecturerQuestionBankPage
