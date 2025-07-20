import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { AuthProvider } from "./contexts/AuthContext"
import Login from "./pages/Login"
import Register from "./pages/Register"
import PasswordReset from "./pages/PasswordReset"
import SetNewPassword from "./pages/SetNewPassword"
import Dashboard from "./pages/Dashboard"
import StudentDashboard from "./pages/StudentDashboard"
import AssessmentCreationPage from "./pages/AssessmentCreationPage"
import StudentAssessment from "./pages/StudentAssessment"
import ProtectedRoute from "./components/ProtectedRoute"
import LecturerDashboard from "./pages/LecturerDashboard"
import LecturerGradingAnalyticsPage from "./pages/LecturerGradingAnalyticsPage"
import LecturerActiveAssessmentsPage from "./pages/LecturerActiveAssessmentsPage"
import LecturerAnalyticsOverviewPage from "./pages/LecturerAnalyticsOverviewPage"
import LecturerQuestionBankPage from "./pages/LecturerQuestionBankPage"
import LecturerQuestionFormPage from "./pages/LecturerQuestionFormPage"
import LecturerStudentManagementPage from "./pages/LecturerStudentManagementPage"
import LecturerStudentDetailsPage from "./pages/LecturerStudentDetailsPage"
import LecturerPlagiarismAlertsPage from "./pages/LecturerPlagiarismAlertsPage"
import LecturerSettingsPage from "./pages/LecturerSettingsPage"

import StudentAvailableAssessmentsPage from "./pages/StudentAvailableAssessmentsPage"
import StudentPerformanceAnalyticsPage from "./pages/StudentPerformanceAnalyticsPage"
import StudentResultsPage from "./pages/StudentResultsPage"
import StudentSettingsPage from "./pages/StudentSettingsPage"

import Profile from "./pages/Profile"
import { ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import Home from "./pages/Home"
import StudentSubmissionsListPage from "./pages/StudentSubmissionsListPage"

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/password-reset" element={<PasswordReset />} />
          <Route path="/set-new-password/:token" element={<SetNewPassword />} />

          {/* Protected Routes */}
          
          <Route
            path="/profile"
            element={
              <ProtectedRoute allowedRoles={["student", "lecturer"]}>
                <Profile />
              </ProtectedRoute>
            }
          />

          
          {/* Lecturer Routes */}
          <Route
            path="/lecturer-dashboard"
            element={
              <ProtectedRoute allowedRoles={["lecturer"]}>
                <LecturerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/assessments/create"
            element={
              <ProtectedRoute allowedRoles={["lecturer"]}>
                <AssessmentCreationPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/assessments/edit/:draftId"
            element={
              <ProtectedRoute>
                <AssessmentCreationPage requiredRole="lecturer" />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/lecturer/assessments/:assessmentId/grade"
            element={
              <ProtectedRoute allowedRoles={["lecturer"]}>
                <LecturerGradingAnalyticsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/lecturer/assessments/:assessmentId/grade-analytics"
            element={
              <ProtectedRoute allowedRoles={["lecturer"]}>
                <LecturerGradingAnalyticsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/lecturer/assessments/active"
            element={
              <ProtectedRoute allowedRoles={["lecturer"]}>
                <LecturerActiveAssessmentsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/lecturer/analytics"
            element={
              <ProtectedRoute allowedRoles={["lecturer"]}>
                <LecturerAnalyticsOverviewPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/lecturer/question-bank"
            element={
              <ProtectedRoute allowedRoles={["lecturer"]}>
                <LecturerQuestionBankPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/lecturer/question-bank/new"
            element={
              <ProtectedRoute allowedRoles={["lecturer"]}>
                <LecturerQuestionFormPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/lecturer/question-bank/:id/edit"
            element={
              <ProtectedRoute allowedRoles={["lecturer"]}>
                <LecturerQuestionFormPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/lecturer/student-management"
            element={
              <ProtectedRoute allowedRoles={["lecturer"]}>
                <LecturerStudentManagementPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/lecturer/student-management/:id"
            element={
              <ProtectedRoute allowedRoles={["lecturer"]}>
                <LecturerStudentDetailsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/lecturer/plagiarism-alerts"
            element={
              <ProtectedRoute allowedRoles={["lecturer"]}>
                <LecturerPlagiarismAlertsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/lecturer/settings"
            element={
              <ProtectedRoute allowedRoles={["lecturer"]}>
                <LecturerSettingsPage />
              </ProtectedRoute>
            }
          />


          {/* Student Routes */}
          <Route
            path="/student-dashboard"
            element={
              <ProtectedRoute allowedRoles={["student"]}>
                <StudentDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/student/assessments/available"
            element={
              <ProtectedRoute allowedRoles={["student"]}>
                <StudentAvailableAssessmentsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/student/assessments/:assessmentId"
            element={
              <ProtectedRoute allowedRoles={["student"]}>
                <StudentAssessment />
              </ProtectedRoute>
            }
          />

          <Route
            path="/student/submissions"
            element={
              <ProtectedRoute allowedRoles={["student"]}>
                <StudentSubmissionsListPage />
              </ProtectedRoute>
            }
          />{" "}

          <Route
            path="/student/results/:submissionId"
            element={
              <ProtectedRoute allowedRoles={["student"]}>
                <StudentResultsPage />
              </ProtectedRoute>
            }
          />

           <Route
            path="/student/performance-analytics"
            element={
              <ProtectedRoute allowedRoles={["student"]}>
                <StudentPerformanceAnalyticsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/student/settings"
            element={
              <ProtectedRoute allowedRoles={["student"]}>
                <StudentSettingsPage />
              </ProtectedRoute>
            }
          />

          

          

        {/* Catch-all for unknown routes */}
        <Route path="*" element={<Navigate to="/" />} />
        </Routes>
          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
          />
      </Router>
    </AuthProvider>
  )
}

export default App
