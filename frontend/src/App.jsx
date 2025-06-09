import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { AuthProvider } from "./contexts/AuthContext"
import Login from "./pages/Login"
import Register from "./pages/Register"
import PasswordReset from "./pages/PasswordReset"
import SetNewPassword from "./pages/SetNewPassword"
import ProtectedRoute from "./components/ProtectedRoute"
import Dashboard from "./pages/Dashboard"
import StudentDashboard from "./pages/StudentDashboard"
import LecturerDashboard from "./pages/LecturerDashboard"
import Profile from "./pages/Profile"
import StudentAssessment from "./pages/StudentAssessment"

// import AssessmentCreation from "./pages/AssessmentCreation";
// import AssessmentDrafts from "./pages/AssessmentDrafts"
// import AssessmentList from "./pages/AssessmentList"

import { ToastContainer } from "react-toastify";
import 'react-datepicker/dist/react-datepicker.css';
import 'react-toastify/dist/ReactToastify.css';

import AssessmentCreationPage from "./pages/AssessmentCreationPage"


function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/reset-password" element={<PasswordReset />} />
          <Route path="/reset-password/:token" element={<SetNewPassword />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student-dashboard"
            element={
              <ProtectedRoute>
                <StudentDashboard requiredRole='student'/>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/lecturer-dashboard"
            element={
              <ProtectedRoute>
                <LecturerDashboard requiredRole='lecturer'/>
              </ProtectedRoute>

            }
          />

          <Route
            path="/assessments/create"
            element={
              <ProtectedRoute>
                <AssessmentCreationPage requiredRole="lecturer" />
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

          {/* <Route
            path="/assessments/drafts"
            element={
              <ProtectedRoute>
                <AssessmentDrafts />
              </ProtectedRoute>
            }
          />

          <Route
            path="/assessments/"
            element={
              <ProtectedRoute>
                <AssessmentList />
              </ProtectedRoute>
            }
          />   */}


          <Route
            path="/assessment/:assessmentId"
            element={
              <ProtectedRoute>
                <StudentAssessment />
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>


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
      />

    </AuthProvider>
  )
}

export default App
