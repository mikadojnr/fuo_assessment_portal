"use client"

import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { motion } from "framer-motion"
import { FiMail, FiLock, FiEye, FiEyeOff } from "react-icons/fi"
import { FcGoogle } from "react-icons/fc"
import { BsMicrosoft } from "react-icons/bs"
import UniversityLogo from "../components/UniversityLogo"
import ParticlesBackground from "../components/ParticlesBackground"



const Login = () => {
  useEffect(() => {
    document.title = 'Login';
  }, []);

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [role, setRole] = useState("student")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [validationErrors, setValidationErrors] = useState({})

  const { login, error } = useAuth()
  const navigate = useNavigate()

  const validateForm = () => {
    const errors = {}

    if (!email) {
      errors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = "Email is invalid"
    }

    if (!password) {
      errors.password = "Password is required"
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsSubmitting(true)

    try {
      const success = await login(email, password, role)
      if (success) {
        // Redirect based on role
        if (role === "student") {
          navigate("/student-dashboard")
        } else if (role === "lecturer") {
          navigate("/lecturer-dashboard") 
        } else {
          navigate("/dashboard")
        }
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const toggleRole = (newRole) => {
    setRole(newRole)
  }

  return (
    <div className="flex min-h-screen w-full">
      {/* Left Side - Branded Background */}
      <div className="hidden md:flex md:w-3/5 relative bg-gradient-to-br from-[#2A5C82] to-[#00BFA5] items-center justify-center">
        <ParticlesBackground />
        <div className="z-10 text-center p-8">
          <UniversityLogo className="w-32 h-32 mx-auto mb-6" />
          <h1 className="text-4xl font-bold text-white mb-4">Excellence in Digital Learning</h1>
          <p className="text-white text-xl max-w-md mx-auto">
            Access your personalized learning environment and resources
          </p>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full md:w-2/5 flex items-center justify-center p-6 bg-gray-50">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="mb-8 text-center">
              <h2 className="text-3xl font-bold text-gray-800">Welcome Back</h2>
              <p className="text-gray-600 mt-2">Sign in to continue to your account</p>
            </div>

            {/* Role Toggle */}
            <div className="flex rounded-lg bg-gray-100 p-1 mb-6">
              <button
                onClick={() => toggleRole("student")}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                  role === "student" ? "bg-white text-[#2A5C82] shadow-sm" : "text-gray-600 hover:text-gray-800"
                }`}
              >
                Student
              </button>
              <button
                onClick={() => toggleRole("lecturer")}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                  role === "lecturer" ? "bg-white text-[#2A5C82] shadow-sm" : "text-gray-600 hover:text-gray-800"
                }`}
              >
                Lecturer
              </button>
            </div>

            {error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">{error}</div>}

            <form onSubmit={handleSubmit}>
              {/* Email Field */}
              <div className="mb-4 relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <FiMail size={18} />
                </div>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full pl-10 pr-3 py-3 rounded-lg border ${
                    validationErrors.email ? "border-red-500" : "border-gray-300"
                  } focus:outline-none focus:ring-2 focus:ring-[#00BFA5] focus:border-transparent transition`}
                  placeholder="Email Address"
                />
                {validationErrors.email && <p className="text-red-500 text-xs mt-1">{validationErrors.email}</p>}
              </div>

              {/* Password Field */}
              <div className="mb-2 relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <FiLock size={18} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full pl-10 pr-10 py-3 rounded-lg border ${
                    validationErrors.password ? "border-red-500" : "border-gray-300"
                  } focus:outline-none focus:ring-2 focus:ring-[#00BFA5] focus:border-transparent transition`}
                  placeholder="Password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </button>
                {validationErrors.password && <p className="text-red-500 text-xs mt-1">{validationErrors.password}</p>}
              </div>

              {/* Forgot Password Link */}
              <div className="mb-6 text-center">
                <Link to="/reset-password" className="text-sm text-[#2A5C82] hover:underline">
                  Forgot Password?
                </Link>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-lg bg-gradient-to-r from-[#2A5C82] to-[#00BFA5] text-white font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-150"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Signing In...
                  </div>
                ) : (
                  "Sign In"
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="my-6 flex items-center">
              <div className="flex-grow border-t border-gray-200"></div>
              <span className="mx-4 text-sm text-gray-400">Or continue with</span>
              <div className="flex-grow border-t border-gray-200"></div>
            </div>

            {/* Social Login */}
            <div className="flex space-x-4">
              <button className="flex-1 py-2 px-4 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50 transition">
                <FcGoogle size={20} className="mr-2" />
                <span className="text-sm font-medium">Google</span>
              </button>
              <button className="flex-1 py-2 px-4 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50 transition">
                <BsMicrosoft size={18} className="mr-2 text-blue-500" />
                <span className="text-sm font-medium">Microsoft</span>
              </button>
            </div>

            {/* Registration Prompt */}
            <div className="mt-8 text-center">
              <p className="text-gray-600">
                New user?{" "}
                <Link to="/register" className="text-[#2A5C82] font-medium hover:underline">
                  Create Account
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default Login
