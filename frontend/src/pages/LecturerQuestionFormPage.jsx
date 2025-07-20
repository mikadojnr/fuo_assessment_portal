"use client"

import { useEffect, useState } from "react"
import { Link, useParams, useNavigate } from "react-router-dom"
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
  FiArrowLeft,
  FiSave,
} from "react-icons/fi"
import { getQuestions, createQuestion, updateQuestion, getPlagiarismAlerts } from "../services/assessmentService"
import { toast } from "react-toastify"
import RichTextEditor from "../components/ui/RichTextEditor"

const LecturerQuestionFormPage = () => {
  const { id } = useParams() // Get question ID from URL for editing
  const navigate = useNavigate()

  useEffect(() => {
    document.title = id ? "Edit Question" : "Create New Question"
  }, [id])

  const { currentUser, logout } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [darkMode, setDarkMode] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterOpen, setFilterOpen] = useState(false)
  const [plagiarismAlerts, setPlagiarismAlerts] = useState([])

  const [questionData, setQuestionData] = useState({
    text: "",
    type: "mcq", // Default to multiple choice
    difficulty: "medium",
    marks: 5,
    options: [{ text: "", isCorrect: false }], // For MCQ
    modelAnswer: "", // For Essay
    keywords: [], // For Essay
    fileTypes: [], // For File Upload
    maxFileSize: 5 * 1024 * 1024, // For File Upload (5MB default)
  })
  const [loading, setLoading] = useState(true)
  const [formError, setFormError] = useState(null)

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen)
  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
    if (!darkMode) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }

  useEffect(() => {
    const fetchQuestion = async () => {
      if (id) {
        try {
          const questionsList = await getQuestions() // Fetch all questions
          const questionToEdit = questionsList.find((q) => q.id === Number.parseInt(id))
          if (questionToEdit) {
            setQuestionData({
              text: questionToEdit.text || "",
              type: questionToEdit.type || "mcq",
              difficulty: questionToEdit.difficulty || "medium",
              marks: questionToEdit.marks || 5,
              options: questionToEdit.options || [{ text: "", isCorrect: false }],
              modelAnswer: questionToEdit.modelAnswer || "",
              keywords: questionToEdit.keywords || [],
              fileTypes: questionToEdit.fileTypes || [],
              maxFileSize: questionToEdit.maxFileSize || 5 * 1024 * 1024,
            })
          } else {
            toast.error("Question not found.")
            navigate("/lecturer/question-bank")
          }
        } catch (err) {
          toast.error("Failed to load question for editing.")
          navigate("/lecturer/question-bank")
        } finally {
          setLoading(false)
        }
      } else {
        setLoading(false)
      }
    }

    const fetchAlerts = async () => {
      try {
        const alertsData = await getPlagiarismAlerts()
        setPlagiarismAlerts(alertsData)
      } catch (err) {
        console.error("Error fetching plagiarism alerts:", err)
      }
    }

    fetchQuestion()
    fetchAlerts()
  }, [id, navigate])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setQuestionData((prev) => ({ ...prev, [name]: value }))
  }

  const handleOptionChange = (index, e) => {
    const newOptions = [...questionData.options]
    newOptions[index].text = e.target.value
    setQuestionData((prev) => ({ ...prev, options: newOptions }))
  }

  const handleCorrectOptionChange = (index) => {
    const newOptions = questionData.options.map((opt, i) => ({
      ...opt,
      isCorrect: i === index,
    }))
    setQuestionData((prev) => ({ ...prev, options: newOptions }))
  }

  const addOption = () => {
    setQuestionData((prev) => ({
      ...prev,
      options: [...prev.options, { text: "", isCorrect: false }],
    }))
  }

  const removeOption = (index) => {
    const newOptions = questionData.options.filter((_, i) => i !== index)
    setQuestionData((prev) => ({ ...prev, options: newOptions }))
  }

  const handleKeywordsChange = (e) => {
    setQuestionData((prev) => ({
      ...prev,
      keywords: e.target.value.split(",").map((k) => k.trim()),
    }))
  }

  const handleFileTypesChange = (e) => {
    setQuestionData((prev) => ({
      ...prev,
      fileTypes: e.target.value.split(",").map((t) => t.trim()),
    }))
  }

  const handleRichTextChange = (content) => {
    setQuestionData((prev) => ({ ...prev, modelAnswer: content }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError(null)

    // Basic validation
    if (!questionData.text || !questionData.type || !questionData.difficulty || !questionData.marks) {
      setFormError("Please fill in all required fields.")
      return
    }

    if (questionData.type === "mcq" && questionData.options.length < 2) {
      setFormError("Multiple choice questions require at least two options.")
      return
    }
    if (questionData.type === "mcq" && !questionData.options.some((opt) => opt.isCorrect)) {
      setFormError("Multiple choice questions must have at least one correct option.")
      return
    }

    try {
      if (id) {
        await updateQuestion(id, questionData)
        toast.success("Question updated successfully!")
      } else {
        await createQuestion(questionData)
        toast.success("Question created successfully!")
      }
      navigate("/lecturer/question-bank") // Redirect back to question bank
    } catch (err) {
      setFormError(err.message || "An error occurred. Please try again.")
    }
  }

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
                      placeholder="Search..."
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
                      <select className="w-40 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#00BFA5]">
                        <option value="all">All Courses</option>
                        <option value="CSC401">CSC 401</option>
                        <option value="CSC405">CSC 405</option>
                        <option value="MTH302">MTH 302</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
                      <select className="w-40 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#00BFA5]">
                        <option value="all">All Types</option>
                        <option value="MCQ">Multiple Choice</option>
                        <option value="Essay">Essay</option>
                        <option value="FileUpload">File Upload</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Difficulty
                      </label>
                      <select className="w-40 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#00BFA5]">
                        <option value="all">All Difficulties</option>
                        <option value="Easy">Easy</option>
                        <option value="Medium">Medium</option>
                        <option value="Hard">Hard</option>
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

            {/* Main content */}
            <main className="p-4 sm:p-6 lg:p-8">
              <div className="max-w-4xl mx-auto">
                <Link
                  to="/lecturer/question-bank"
                  className="inline-flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200 mb-6"
                >
                  <FiArrowLeft className="mr-2" /> Back to Question Bank
                </Link>
                <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
                  {id ? "Edit Question" : "Create New Question"}
                </h1>
                <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-8">
                  {formError && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
                      {formError}
                    </div>
                  )}

                  <div className="mb-4">
                    <label htmlFor="text" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Question Text
                    </label>
                    <textarea
                      id="text"
                      name="text"
                      rows="4"
                      value={questionData.text}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#00BFA5]"
                      required
                    ></textarea>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <label htmlFor="type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Question Type
                      </label>
                      <select
                        id="type"
                        name="type"
                        value={questionData.type}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#00BFA5]"
                        required
                      >
                        <option value="mcq">Multiple Choice</option>
                        <option value="essay">Essay</option>
                        <option value="file">File Upload</option>
                      </select>
                    </div>
                    <div>
                      <label
                        htmlFor="difficulty"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                      >
                        Difficulty
                      </label>
                      <select
                        id="difficulty"
                        name="difficulty"
                        value={questionData.difficulty}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#00BFA5]"
                        required
                      >
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                      </select>
                    </div>
                    <div>
                      <label
                        htmlFor="marks"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                      >
                        Marks
                      </label>
                      <input
                        type="number"
                        id="marks"
                        name="marks"
                        value={questionData.marks}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#00BFA5]"
                        min="1"
                        required
                      />
                    </div>
                  </div>

                  {questionData.type === "mcq" && (
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Options</label>
                      {questionData.options.map((option, index) => (
                        <div key={index} className="flex items-center mb-2">
                          <input
                            type="radio"
                            name="correctOption"
                            checked={option.isCorrect}
                            onChange={() => handleCorrectOptionChange(index)}
                            className="mr-2 text-[#00BFA5] focus:ring-[#00BFA5]"
                          />
                          <input
                            type="text"
                            value={option.text}
                            onChange={(e) => handleOptionChange(index, e)}
                            placeholder={`Option ${index + 1}`}
                            className="flex-grow px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#00BFA5]"
                            required
                          />
                          {questionData.options.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeOption(index)}
                              className="ml-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-600"
                            >
                              <FiX />
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={addOption}
                        className="mt-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                      >
                        Add Option
                      </button>
                    </div>
                  )}

                  {questionData.type === "essay" && (
                    <div className="mb-4">
                      <label
                        htmlFor="modelAnswer"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                      >
                        Model Answer
                      </label>
                      <RichTextEditor
                        value={questionData.modelAnswer}
                        onChange={handleRichTextChange}
                        darkMode={darkMode}
                      />
                      <label
                        htmlFor="keywords"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 mt-4"
                      >
                        Keywords (comma-separated)
                      </label>
                      <input
                        type="text"
                        id="keywords"
                        name="keywords"
                        value={questionData.keywords.join(", ")}
                        onChange={handleKeywordsChange}
                        placeholder="e.g., normalization, database, SQL"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#00BFA5]"
                      />
                    </div>
                  )}

                  {questionData.type === "file" && (
                    <div className="mb-4">
                      <label
                        htmlFor="fileTypes"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                      >
                        Allowed File Types (comma-separated, e.g., .pdf, .docx)
                      </label>
                      <input
                        type="text"
                        id="fileTypes"
                        name="fileTypes"
                        value={questionData.fileTypes.join(", ")}
                        onChange={handleFileTypesChange}
                        placeholder="e.g., application/pdf, image/jpeg"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#00BFA5]"
                      />
                      <label
                        htmlFor="maxFileSize"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 mt-4"
                      >
                        Max File Size (bytes)
                      </label>
                      <input
                        type="number"
                        id="maxFileSize"
                        name="maxFileSize"
                        value={questionData.maxFileSize}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#00BFA5]"
                        min="1"
                      />
                    </div>
                  )}

                  <div className="flex justify-end space-x-2">
                    <button
                      type="button"
                      onClick={() => navigate("/lecturer/question-bank")}
                      className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex items-center px-4 py-2 bg-[#00BFA5] hover:bg-[#009e8f] text-white rounded-md transition-colors"
                    >
                      <FiSave className="mr-2" /> {id ? "Update Question" : "Create Question"}
                    </button>
                  </div>
                </form>
              </div>
            </main>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LecturerQuestionFormPage
