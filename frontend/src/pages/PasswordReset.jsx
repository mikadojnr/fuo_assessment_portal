"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { motion } from "framer-motion"
import { FiArrowLeft, FiMail, FiLock, FiCheckCircle } from "react-icons/fi"
import UniversityLogo from "../components/UniversityLogo"

const PasswordReset = () => {
  useEffect(() => {
      document.title = 'Reset Password';
    }, []);

  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [resetSuccess, setResetSuccess] = useState(false)
  const [validationError, setValidationError] = useState("")

  const { resetPassword, error } = useAuth()

  const validateForm = () => {
    if (!email) {
      setValidationError("Email is required")
      return false
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setValidationError("Email is invalid")
      return false
    }

    setValidationError("")
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsSubmitting(true)

    try {
      const result = await resetPassword(email)

      if (result.success) {
        setResetSuccess(true)
      }
    } finally {
      setIsSubmitting(false)
    }
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
          <h1 className="text-3xl font-bold text-gray-800">Reset Password</h1>
          <p className="text-gray-600 mt-2">We'll send you a link to reset your password</p>
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
              <h3 className="text-xl font-bold text-gray-800 mb-2">Check Your Email</h3>
              <p className="text-gray-600 mb-6">
                We've sent a password reset link to <strong>{email}</strong>
              </p>
              <p className="text-sm text-gray-500 mb-4">
                Didn't receive the email? Check your spam folder or request another link.
              </p>
              <Link to="/login" className="text-[#2A5C82] font-medium hover:underline">
                Return to Login
              </Link>
            </div>
          ) : (
            <>
              {error && <div className="mb-6 p-3 bg-red-50 text-red-700 rounded-md text-sm">{error}</div>}

              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <FiLock className="text-[#2A5C82] text-2xl" />
                </div>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="mb-6">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <FiMail size={18} />
                    </div>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value)
                        setValidationError("")
                      }}
                      className={`w-full pl-10 pr-3 py-3 rounded-lg border ${
                        validationError ? "border-red-500" : "border-gray-300"
                      } focus:outline-none focus:ring-2 focus:ring-[#00BFA5] focus:border-transparent transition`}
                      placeholder="Enter your registered email"
                    />
                  </div>
                  {validationError && <p className="text-red-500 text-xs mt-1">{validationError}</p>}
                  <p className="text-sm text-gray-500 mt-2">Enter your registered email to receive a reset link.</p>
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
                      Sending...
                    </div>
                  ) : (
                    "Send Reset Link"
                  )}
                </button>
              </form>

              <div className="mt-6 text-center">
                <Link to="/login" className="text-[#2A5C82] text-sm font-medium hover:underline">
                  Remembered your password? Login here
                </Link>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </div>
  )
}

export default PasswordReset
