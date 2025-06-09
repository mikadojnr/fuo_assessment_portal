"use client"

import { useState, useEffect } from "react"
import { Link, useParams, useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { motion } from "framer-motion"
import { FiArrowLeft, FiLock, FiCheckCircle, FiEye, FiEyeOff, FiAlertTriangle } from "react-icons/fi"
import UniversityLogo from "../components/UniversityLogo"
import { API_URL } from "../config"

const SetNewPassword = () => {

    useEffect(() => {
        document.title = 'New Password';
      }, []);

  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [resetSuccess, setResetSuccess] = useState(false)
  const [validationErrors, setValidationErrors] = useState({})
  const [tokenValid, setTokenValid] = useState(true)
  const [tokenChecked, setTokenChecked] = useState(false)
  const [tokenError, setTokenError] = useState("")

  const { error } = useAuth()
  const { token } = useParams()
  const navigate = useNavigate()

  // Verify token validity when component mounts
  useEffect(() => {
    const verifyToken = async () => {
      try {
        console.log("Verifying token:", token)
        const response = await fetch(`${API_URL}/api/auth/reset-password/${token}/verify`)
        const data = await response.json()

        if (!response.ok) {
          setTokenValid(false)
          setTokenError(data.message || "Invalid or expired reset link")
          console.error("Token verification failed:", data)
        } else {
          console.log("Token verified successfully")
          setTokenValid(true)
        }
      } catch (error) {
        console.error("Error verifying token:", error)
        setTokenValid(false)
        setTokenError("Error verifying reset link. Please try again.")
      } finally {
        setTokenChecked(true)
      }
    }

    if (token) {
      verifyToken()
    } else {
      setTokenValid(false)
      setTokenError("No reset token provided")
      setTokenChecked(true)
    }
  }, [token])

  const validateForm = () => {
    const errors = {}

    if (!password) {
      errors.password = "Password is required"
    } else if (password.length < 8) {
      errors.password = "Password must be at least 8 characters"
    }

    if (!confirmPassword) {
      errors.confirmPassword = "Please confirm your password"
    } else if (password !== confirmPassword) {
      errors.confirmPassword = "Passwords do not match"
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const getPasswordStrength = () => {
    if (!password) return { strength: "", color: "" }

    if (password.length < 8) {
      return { strength: "Weak", color: "bg-red-500" }
    } else if (
      password.length >= 8 &&
      /[A-Z]/.test(password) &&
      /[0-9]/.test(password) &&
      /[^A-Za-z0-9]/.test(password)
    ) {
      return { strength: "Strong", color: "bg-green-500" }
    } else {
      return { strength: "Medium", color: "bg-yellow-500" }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsSubmitting(true)

    try {
      console.log("Submitting new password for token:", token)
      const response = await fetch(`${API_URL}/api/auth/reset-password/${token}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      })

      const data = await response.json()

      if (response.ok) {
        console.log("Password reset successful")
        setResetSuccess(true)
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate("/login")
        }, 3000)
      } else {
        console.error("Password reset failed:", data)
        setValidationErrors({ form: data.message || "Failed to reset password" })
      }
    } catch (error) {
      console.error("Error resetting password:", error)
      setValidationErrors({ form: "An error occurred. Please try again." })
    } finally {
      setIsSubmitting(false)
    }
  }

  const passwordStrength = getPasswordStrength()

  if (!tokenChecked) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#2A5C82]"></div>
      </div>
    )
  }

  if (!tokenValid) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <UniversityLogo className="w-20 h-20 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-800">Invalid Reset Link</h1>
            <p className="text-gray-600 mt-2">This password reset link is invalid or has expired.</p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-xl shadow-lg p-8 text-center"
          >
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiAlertTriangle className="text-red-500 text-2xl" />
            </div>
            <p className="text-red-600 font-medium mb-2">{tokenError}</p>
            <p className="text-gray-600 mb-6">Please request a new password reset link from the login page.</p>
            <Link
              to="/reset-password"
              className="px-6 py-2 bg-gradient-to-r from-[#2A5C82] to-[#00BFA5] text-white rounded-lg hover:shadow-md transition-all inline-block"
            >
              Request New Link
            </Link>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <Link to="/login" className="absolute top-6 left-6 flex items-center text-gray-600 hover:text-gray-900">
        <FiArrowLeft className="mr-2" />
        Back to Login
      </Link>

      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <UniversityLogo className="w-20 h-20 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-800">Set New Password</h1>
          <p className="text-gray-600 mt-2">Create a new secure password for your account</p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-xl shadow-lg p-8"
        >
          {resetSuccess ? (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiCheckCircle className="text-green-500 text-3xl" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Password Reset Successful</h3>
              <p className="text-gray-600 mb-6">Your password has been reset successfully.</p>
              <p className="text-sm text-gray-500 mb-4">You will be redirected to the login page shortly.</p>
            </div>
          ) : (
            <>
              {error && <div className="mb-6 p-3 bg-red-50 text-red-700 rounded-md text-sm">{error}</div>}
              {validationErrors.form && (
                <div className="mb-6 p-3 bg-red-50 text-red-700 rounded-md text-sm">{validationErrors.form}</div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                    New Password
                  </label>
                  <div className="relative">
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
                      placeholder="Enter new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                    </button>
                  </div>
                  {validationErrors.password && (
                    <p className="text-red-500 text-xs mt-1">{validationErrors.password}</p>
                  )}

                  {password && (
                    <div className="mt-2">
                      <div className="flex items-center">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${passwordStrength.color}`}
                            style={{
                              width: `${password.length > 12 ? 100 : password.length * 8}%`,
                            }}
                          ></div>
                        </div>
                        <span className="ml-2 text-xs">{passwordStrength.strength}</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mb-6">
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <FiLock size={18} />
                    </div>
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      id="confirmPassword"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={`w-full pl-10 pr-10 py-3 rounded-lg border ${
                        validationErrors.confirmPassword ? "border-red-500" : "border-gray-300"
                      } focus:outline-none focus:ring-2 focus:ring-[#00BFA5] focus:border-transparent transition`}
                      placeholder="Confirm new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                    </button>
                  </div>
                  {validationErrors.confirmPassword && (
                    <p className="text-red-500 text-xs mt-1">{validationErrors.confirmPassword}</p>
                  )}
                </div>

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
                      Setting Password...
                    </div>
                  ) : (
                    "Set New Password"
                  )}
                </button>
              </form>
            </>
          )}
        </motion.div>
      </div>
    </div>
  )
}

export default SetNewPassword
