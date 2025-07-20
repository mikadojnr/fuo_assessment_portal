// src/services/assessmentService.js
import axios from "axios"
import { toast } from "react-toastify"
import { API_URL } from "../config"

const formatUTCDate = (date) => {
  return date.toISOString().slice(0, 19).replace("T", " ")
}

const api = axios.create({
  baseURL: `${API_URL}/api`,
})

// Request interceptor to attach token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken") // or use cookies/sessionStorage/etc.
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Response interceptor to handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 500) {
      console.error("Server error:", error.response.data)
      toast.error("Server error occurred. Please try again.")
    } else if (error.response?.status === 403 && error.response?.data?.error === "Assessment already submitted") {
      // Let the frontend handle this specific error
      return Promise.reject(error)
    }
    return Promise.reject(error)
  },
)

// Get courses taught by the current lecturer
export const getCourses = async () => {
  try {
    const response = await api.get("/assessments/courses")
    return response.data
  } catch (error) {
    console.error("Error fetching courses:", error)
    toast.error("Failed to load courses. Please try again.")
    return []
  }
}

// Create and publish an assessment
export const createAssessment = async (assessmentData) => {
  try {
    const response = await api.post("/assessments", {
      ...assessmentData,
      questions: assessmentData.questions.map((question) => ({
        ...question,
        // Transform data for backend
        options: question.type === "mcq" ? question.options : undefined,
        modelAnswer: question.type === "essay" ? question.modelAnswer : undefined,
        keywords: question.type === "essay" ? question.keywords : undefined,
        fileTypes: question.type === "file" ? question.fileTypes : undefined,
        maxFileSize: question.type === "file" ? question.maxFileSize : undefined,
      })),
    })

    return response.data
  } catch (error) {
    throw new Error(error.response?.data?.error || "Failed to publish assessment")
  }
}

export const getCompletedAssessments = async () => {
  try {
    const response = await api.get("/lecturer/assessments/completed")
    console.log("Completed Assessments: ", response.data.completed)

    return response.data.completed || []
  } catch (error) {
    console.error("Error fetching completed assessments:", error)
    toast.error("Failed to fetch completed assessments")
    return []
  }
}

export const getActiveAssessments = async () => {
  try {
    const response = await api.get("/lecturer/assessments/active")
    console.log("Active Assessments: ", response.data.active)

    return response.data.active || []
  } catch (error) {
    console.error("Error fetching active assessments:", error)
    toast.error("Failed to fetch active assessments")
    return []
  }
}

export const getAllAssessmentsForLecturer = async () => {
  try {
    const response = await api.get("/lecturer/assessments")
    console.log("All Assessments ", response.data);
    return Array.isArray(response.data.assessments) ? response.data.assessments : [];
  } catch (error) {
    console.error("Error fetching all assessments for lecturer:", error)
    toast.error("Failed to load all assessments.")
    return []
  }
}

// export const getAllAssessmentsForLecturer = async () => {
//   try {
//     const response = await api.get("/lecturer/assessments")
//     return Array.isArray(response.data.assessments) ? response.data.assessments : [];
//   } catch (error) {
//     console.error("Error fetching assessments:", error);
//     toast.error("Failed to load all assessments.")
//     return [];
//   }
// };

// Save assessment draft
export const saveAssessmentDraft = async (draftData) => {
  try {
    const response = await api.post("/assessments/drafts", {
      ...draftData,
      created: formatUTCDate(new Date()),
      lastModified: formatUTCDate(new Date()),
    })

    return response.data
  } catch (error) {
    console.error("Error saving draft:", error)
    toast.error("Failed to save draft. Please try again.")
    throw error
  }
}

export const getDrafts = async () => {
  try {
    const response = await api.get("/lecturer/assessments/drafts")
    return response.data.drafts || []
  } catch (error) {
    console.error("Error fetching drafts:", error)
    toast.error("Failed to fetch drafts")
    return []
  }
}

export const loadDraftForEditing = async (draftId) => {
  try {
    const response = await api.get(`/assessments/drafts/${draftId}`)

    if (!response.data) {
      throw new Error("No draft data received")
    }

    // Transform the response data to match the form structure
    const draftData = {
      ...response.data,
      // Ensure these fields exist even if they're null/undefined
      title: response.data.title || "",
      description: response.data.description || "",
      courseId: response.data.courseId || "",
      questions: response.data.content?.questions || [], // Access questions from 'content'
      startDate: response.data.content?.startDate || "",
      endDate: response.data.content?.endDate || "",
      shuffleQuestions: response.data.content?.shuffleQuestions || false,
      shuffleOptions: response.data.content?.shuffleOptions || true,
      enablePlagiarismCheck: response.data.content?.enablePlagiarismCheck || true,
      similarityThreshold: response.data.content?.similarityThreshold || 30,
      cosineSimilarityThreshold: response.data.content?.cosineSimilarityThreshold || 0.7,
    }

    return draftData
  } catch (error) {
    console.error("Error loading draft:", error)
    toast.error(error.response?.data?.error || "Could not load the draft. Please try again.")
    throw error
  }
}

// Update an existing draft
export const updateAssessmentDraft = async (draftId, draftData) => {
  try {
    const response = await api.put(`/assessments/drafts/${draftId}`, draftData)
    return response.data
  } catch (error) {
    console.error("Error updating draft:", error)
    toast.error("Could not update the draft. Please try again.")
    throw error
  }
}

// Delete a draft
export const deleteDraft = async (draftId) => {
  try {
    await api.delete(`/assessments/drafts/${draftId}`)
    return true
  } catch (error) {
    console.error("Error deleting draft:", error)
    toast.error("Failed to delete draft. Please try again.")
    throw error
  }
}

// Assessment API functions

// Fetch a specific assessment for student to take
export const fetchAssessment = async (assessmentId) => {
  try {
    const response = await api.get(`/student/assessments/${assessmentId}`)
    console.log("Fetch Assessment Data ",response.data);
    
    return response.data // Returns { isSubmitted: true, submittedAt, message } or { isSubmitted: false, assessment, progress }
  } catch (error) {
    console.error("Error fetching assessment:", error)
    if (error.response?.status !== 403) {
      // Only show toast for non-403 errors (403 is handled by StudentAssessment.jsx for course enrollment issues)
      toast.error(error.response?.data?.error || "Failed to fetch assessment. Please try again.")
    }
    throw error
  }
}

// Student assessment API functions

// Get data for student dashboard
export const studentDashboard = async () => {
  try {
    const response = await api.get("/student/dashboard")

    console.log("Student Dashboard Data ", response.data);
    
    console.log(response.data.upcomingAssessments);
    
    return {
      upcomingAssessments: response.data.upcomingAssessments.map((assessment) => ({
        ...assessment,
        submitted: assessment.submitted || false, // Ensure submitted field is included
      })),
      performanceData: response.data.performanceData || {
        labels: ["Week 1", "Week 2", "Week 3", "Week 4", "Week 5", "Week 6"],
        scores: [65, 78, 80, 74, 85, 90],
        classAverage: [60, 65, 70, 68, 72, 75],
      },
      recentResults: response.data.recentResults || [],
      notifications: response.data.notifications || [],
      totalAssessments: response.data.totalAssessments || 0,
    }
  } catch (error) {
    console.error("Error fetching dashboard data:", error)
    toast.error("Failed to fetch dashboard data")
    return {
      upcomingAssessments: [],
      performanceData: {
        labels: ["Week 1", "Week 2", "Week 3", "Week 4", "Week 5", "Week 6"],
        scores: [65, 78, 80, 74, 85, 90],
        classAverage: [60, 65, 70, 68, 72, 75],
      },
      recentResults: [],
      notifications: [],
      totalAssessments: 0,
    }
  }
}

// Save student assessment progress
export const saveAssessmentProgress = async (assessmentId, data) => {
  try {
    const response = await api.post(`/student/assessments/${assessmentId}/attempt`, data)
    return response.data
  } catch (error) {
    console.error("Error saving assessment progress:", error)
    toast.error("Failed to save progress. Please try again.")
    throw error
  }
}

// Submit completed assessment
export const submitAssessment = async (assessmentId, data) => {

  console.log('Submission Data ', data);
  
  try {
    const response = await api.post(`/assessments/submit`, { assessmentId, ...data }) // Send assessmentId in body
    toast.success("Assessment submitted successfully!");
    return response.data
  } catch (error) {
    console.error("Error submitting assessment:", error)
    toast.error("Failed to submit assessment. Please try again.")
    throw error
  }
}

export const fetchSubmissionsByAssessment = async (assessmentId) => {
  try {
    
    const response = await api.get(`/assessments/${assessmentId}/submissions`)
    return response.data
  } catch (error) {
    console.error("Error fetching submissions by assessment:", error)
    throw error
  }
}

export const fetchSubmissionsForAssessment = async (assessmentId) => {
  try {
    const response = await api.get(`/lecturer/assessments/${assessmentId}/submissions`)
    return response.data
  } catch (error) {
    console.error("Error fetching submissions for assessment:", error)
    toast.error("Failed to load submissions.")
    throw error
  }
}

// Updated to use the new general submission blueprint
export const fetchSubmissionDetails = async (submissionId) => {
  try {
    const response = await api.get(`/submissions/${submissionId}`)
    console.log('Submission Details', response.data);
    
    return response.data
  } catch (error) {
    console.error("Error fetching submission details:", error)
    toast.error("Failed to load submission details.")
    throw error
  }
}

export const updateSubmissionGrade = async (submissionId, gradeData) => {
  try {
    const response = await api.put(`/submissions/grade/${submissionId}`, gradeData) // Changed to PUT
    toast.success("Grade updated successfully!")
    return response.data
  } catch (error) {
    console.error("Error updating submission grade:", error)
    toast.error("Failed to update grade.")
    throw error
  }
}

export const fetchAssessmentAnalytics = async (assessmentId) => {
  try {
    const response = await api.get(`/lecturer/assessments/${assessmentId}/analytics`)
    return response.data
  } catch (error) {
    console.error("Error fetching assessment analytics:", error)
    toast.error("Failed to load analytics data.")
    throw error
  }
}

// New function to fetch all results for a student
export const fetchStudentResultsList = async () => {
  try {
    const response = await api.get("/student/results/list")
    console.log("Submission List: ", response.data);
    
    return response.data
  } catch (error) {
    console.error("Error fetching student results list:", error)
    toast.error("Failed to load your results. Please try again.")
    return []
  }
}


export const getPlagiarismAlerts = async () => {
  try {
    const response = await api.get("/lecturer/plagiarism-alerts")
    // Ensure the response data is an array; default to empty array if not
    return Array.isArray(response.data.plagiarismAlerts) ? response.data.plagiarismAlerts : [];
  } catch (error) {
    console.error("Error fetching plagiarism alerts:", error)
    toast.error("Failed to load plagiarism alerts.")
    return []
  }
}

// New API calls for Question Bank, Student Management, Plagiarism Alerts
export const getQuestions = async () => {
  try {
    const response = await api.get("/lecturer/questions")
    return response.data
  } catch (error) {
    console.error("Error fetching questions:", error)
    toast.error("Failed to load questions.")
    return []
  }
}

export const createQuestion = async (questionData) => {
  try {
    const response = await api.post("/lecturer/questions", questionData)
    toast.success("Question created successfully!")
    return response.data
  } catch (error) {
    console.error("Error creating question:", error)
    toast.error(error.response?.data?.message || "Failed to create question.")
    throw error
  }
}

export const updateQuestion = async (questionId, questionData) => {
  try {
    const response = await api.put(`/lecturer/questions/${questionId}`, questionData)
    toast.success("Question updated successfully!")
    return response.data
  } catch (error) {
    console.error("Error updating question:", error)
    toast.error(error.response?.data?.message || "Failed to update question.")
    throw error
  }
}

export const deleteQuestion = async (questionId) => {
  try {
    await api.delete(`/lecturer/questions/${questionId}`)
    toast.success("Question deleted successfully!")
    return true
  } catch (error) {
    console.error("Error deleting question:", error)
    toast.error(error.response?.data?.message || "Failed to delete question.")
    throw error
  }
}

export const getStudents = async () => {
  try {
    const response = await api.get("/lecturer/students")
    return response.data
  } catch (error) {
    console.error("Error fetching students:", error)
    toast.error("Failed to load students.")
    return []
  }
}

export const getStudentDetails = async (studentId) => {
  try {
    const response = await api.get(`/lecturer/students/${studentId}`)
    return response.data
  } catch (error) {
    console.error("Error fetching student details:", error)
    toast.error("Failed to load student details.")
    throw error
  }
}

export const removeStudent = async (studentId) => {
  try {
    const response = await axios.delete(`lecturer/students/${studentId}`)
    return response.data
  } catch (error) {
    toast.error(`Failed to delete student with ID: ${studentId}.`)
    console.error('Error removing student:', error)
    throw error
  }
}

// New function to fetch available assessments for students
export const fetchStudentAvailableAssessments = async () => {
  try {
    const response = await api.get("/student/available-assessments")
    return response.data.assessments || [] // Backend now returns { assessments: [...] }
  } catch (error) {
    console.error("Error fetching available assessments:", error)
    toast.error("Failed to load available assessments. Please try again.")
    return []
  }
}

// New function to fetch student profile
export const fetchStudentProfile = async () => {
  try {
    const response = await api.get("/student/profile")
    return response.data
  } catch (error) {
    console.error("Error fetching student profile:", error)
    toast.error("Failed to load profile data.")
    throw error
  }
}

// New function to update student profile
export const updateStudentProfile = async (profileData) => {
  try {
    const response = await api.put("/student/profile", profileData)
    toast.success("Profile updated successfully!")
    return response.data
  } catch (error) {
    console.error("Error updating student profile:", error)
    toast.error(error.response?.data?.error || "Failed to update profile.")
    throw error
  }
}

// New function to change student password
export const changeStudentPassword = async (passwordData) => {
  try {
    const response = await api.put("/auth/change-password", passwordData)
    toast.success("Password changed successfully!")
    return response.data
  } catch (error) {
    console.error("Error changing password:", error)
    toast.error(error.response?.data?.error || "Failed to change password.")
    throw error
  }
}

// New function to fetch notification settings
export const fetchNotificationSettings = async () => {
  try {
    const response = await api.get("/student/settings/notifications")
    return response.data
  } catch (error) {
    console.error("Error fetching notification settings:", error)
    toast.error("Failed to load notification settings.")
    throw error
  }
}

// New function to update notification settings
export const updateNotificationSettings = async (settingsData) => {
  try {
    const response = await api.put("/student/settings/notifications", settingsData)
    toast.success("Notification settings updated!")
    return response.data
  } catch (error) {
    console.error("Error updating notification settings:", error)
    toast.error("Failed to update notification settings.")
    throw error
  }
}


