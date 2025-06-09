"use client"

import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { motion, AnimatePresence } from "framer-motion"
import { FiArrowLeft, FiUser, FiMail, FiLock, FiCheckCircle } from "react-icons/fi"
import UniversityLogo from "../components/UniversityLogo"



const Register = () => {

  const [departments, setDepartments] = useState([])
  const [loadingDepartments, setLoadingDepartments] = useState(true)

  useEffect(() => {
    document.title = 'Register'
    const fetchDepartments = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/departments") // Adjust to match your API base URL
        const data = await response.json()
        setDepartments(data)
      } catch (error) {
        console.error("Error fetching departments:", error)
      } finally {
        setLoadingDepartments(false)
      }
    }

    fetchDepartments()
  }, [])


  useEffect(() => {
    document.title = 'Register';
  }, []);

  const [step, setStep] = useState(1)
  const [role, setRole] = useState("")
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    universityId: "",
    email: "",
    password: "",
    department: "",
  })
  const [validationErrors, setValidationErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [registrationSuccess, setRegistrationSuccess] = useState(false)

  const { register, error } = useAuth()
  const navigate = useNavigate()

  const updateFormData = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))

    // Clear validation error when field is updated
    if (validationErrors[field]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const validateStep = (currentStep) => {
    const errors = {}

    if (currentStep === 1) {
      if (!role) {
        errors.role = "Please select a role"
      }
    } else if (currentStep === 2) {
      if (!formData.firstName.trim()) {
        errors.firstName = "First name is required"
      }

      if (!formData.lastName.trim()) {
        errors.lastName = "Last name is required"
      }

      if (!formData.universityId.trim()) {
        errors.universityId = "University ID is required"
      }

      if (!formData.email.trim()) {
        errors.email = "Email is required"
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        errors.email = "Email is invalid"
      }

      if (!formData.password.trim()) {
        errors.password = "Password is required"
      } else if (formData.password.length < 8) {
        errors.password = "Password must be at least 8 characters"
      }

      if (!formData.department) {
        errors.department = "Please select a department"
      }
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const nextStep = () => {
    if (validateStep(step)) {
      setStep(step + 1)
    }
  }

  const prevStep = () => {
    setStep(step - 1)
  }

  const getPasswordStrength = () => {
    const { password } = formData
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

    if (!validateStep(step)) return

    setIsSubmitting(true)

    try {
      const userData = {
        ...formData,
        role,
      }

      const result = await register(userData)

      if (result.success) {
        setRegistrationSuccess(true)
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate("/login")
        }, 3000)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const passwordStrength = getPasswordStrength()

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <Link to="/login" className="absolute top-6 left-6 flex items-center text-gray-600 hover:text-gray-900">
        <FiArrowLeft className="mr-2" />
        Back to Login
      </Link>

      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <UniversityLogo className="w-20 h-20 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-800">Create Your Account</h1>
          <p className="text-gray-600 mt-2">Join our digital learning platform</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step >= 1 ? "bg-[#2A5C82] text-white" : "bg-gray-200 text-gray-500"
                }`}
              >
                1
              </div>
              <span className="ml-2 text-sm font-medium">Role</span>
            </div>
            <div className={`flex-1 h-1 mx-4 ${step >= 2 ? "bg-[#2A5C82]" : "bg-gray-200"}`}></div>
            <div className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step >= 2 ? "bg-[#2A5C82] text-white" : "bg-gray-200 text-gray-500"
                }`}
              >
                2
              </div>
              <span className="ml-2 text-sm font-medium">Details</span>
            </div>
            <div className={`flex-1 h-1 mx-4 ${step >= 3 ? "bg-[#2A5C82]" : "bg-gray-200"}`}></div>
            <div className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step >= 3 ? "bg-[#2A5C82] text-white" : "bg-gray-200 text-gray-500"
                }`}
              >
                3
              </div>
              <span className="ml-2 text-sm font-medium">Verification</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8">
          {error && <div className="mb-6 p-3 bg-red-50 text-red-700 rounded-md text-sm">{error}</div>}

          <AnimatePresence mode="wait">
            {registrationSuccess ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-8"
              >
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiCheckCircle className="text-green-500 text-3xl" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Registration Successful!</h3>
                <p className="text-gray-600 mb-6">Your account has been created successfully.</p>
                <p className="text-sm text-gray-500">Redirecting to login page...</p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit}>
                {step === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <h2 className="text-xl font-semibold mb-6">Select your role</h2>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <button
                        type="button"
                        onClick={() => setRole("student")}
                        className={`p-6 rounded-lg border-2 ${
                          role === "student" ? "border-[#2A5C82] bg-blue-50" : "border-gray-200 hover:border-gray-300"
                        } flex flex-col items-center justify-center transition-all`}
                      >
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                          <span className="text-2xl">👨‍🎓</span>
                        </div>
                        <h3 className="font-medium">Student</h3>
                        <p className="text-sm text-gray-500 mt-2">Access courses and learning materials</p>
                      </button>

                      <button
                        type="button"
                        onClick={() => setRole("lecturer")}
                        className={`p-6 rounded-lg border-2 ${
                          role === "lecturer" ? "border-[#2A5C82] bg-blue-50" : "border-gray-200 hover:border-gray-300"
                        } flex flex-col items-center justify-center transition-all`}
                      >
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                          <span className="text-2xl">👨‍🏫</span>
                        </div>
                        <h3 className="font-medium">Lecturer</h3>
                        <p className="text-sm text-gray-500 mt-2">Create courses and manage students</p>
                      </button>
                    </div>

                    {validationErrors.role && <p className="text-red-500 text-sm mb-4">{validationErrors.role}</p>}

                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={nextStep}
                        className="px-6 py-2 bg-gradient-to-r from-[#2A5C82] to-[#00BFA5] text-white rounded-lg hover:shadow-md transition-all"
                      >
                        Continue
                      </button>
                    </div>
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <h2 className="text-xl font-semibold mb-6">Personal Information</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                          First Name
                        </label>
                        <div className="relative">
                          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                            <FiUser size={16} />
                          </div>
                          <input
                            type="text"
                            id="firstName"
                            value={formData.firstName}
                            onChange={(e) => updateFormData("firstName", e.target.value)}
                            className={`w-full pl-10 pr-3 py-2 rounded-lg border ${
                              validationErrors.firstName ? "border-red-500" : "border-gray-300"
                            } focus:outline-none focus:ring-2 focus:ring-[#00BFA5] focus:border-transparent`}
                            placeholder="John"
                          />
                        </div>
                        {validationErrors.firstName && (
                          <p className="text-red-500 text-xs mt-1">{validationErrors.firstName}</p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                          Last Name
                        </label>
                        <div className="relative">
                          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                            <FiUser size={16} />
                          </div>
                          <input
                            type="text"
                            id="lastName"
                            value={formData.lastName}
                            onChange={(e) => updateFormData("lastName", e.target.value)}
                            className={`w-full pl-10 pr-3 py-2 rounded-lg border ${
                              validationErrors.lastName ? "border-red-500" : "border-gray-300"
                            } focus:outline-none focus:ring-2 focus:ring-[#00BFA5] focus:border-transparent`}
                            placeholder="Doe"
                          />
                        </div>
                        {validationErrors.lastName && (
                          <p className="text-red-500 text-xs mt-1">{validationErrors.lastName}</p>
                        )}
                      </div>
                    </div>

                    <div className="mb-4">
                      <label htmlFor="universityId" className="block text-sm font-medium text-gray-700 mb-1">
                        University ID
                      </label>
                      <input
                        type="text"
                        id="universityId"
                        value={formData.universityId}
                        onChange={(e) => updateFormData("universityId", e.target.value)}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          validationErrors.universityId ? "border-red-500" : "border-gray-300"
                        } focus:outline-none focus:ring-2 focus:ring-[#00BFA5] focus:border-transparent`}
                        placeholder="Enter your FUO student/lecturer ID"
                      />
                      {validationErrors.universityId && (
                        <p className="text-red-500 text-xs mt-1">{validationErrors.universityId}</p>
                      )}
                    </div>

                    <div className="mb-4">
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address
                      </label>
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                          <FiMail size={16} />
                        </div>
                        <input
                          type="email"
                          id="email"
                          value={formData.email}
                          onChange={(e) => updateFormData("email", e.target.value)}
                          className={`w-full pl-10 pr-3 py-2 rounded-lg border ${
                            validationErrors.email ? "border-red-500" : "border-gray-300"
                          } focus:outline-none focus:ring-2 focus:ring-[#00BFA5] focus:border-transparent`}
                          placeholder="john.doe@example.com"
                        />
                      </div>
                      {validationErrors.email && <p className="text-red-500 text-xs mt-1">{validationErrors.email}</p>}
                    </div>

                    <div className="mb-4">
                      <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                        Password
                      </label>
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                          <FiLock size={16} />
                        </div>
                        <input
                          type="password"
                          id="password"
                          value={formData.password}
                          onChange={(e) => updateFormData("password", e.target.value)}
                          className={`w-full pl-10 pr-3 py-2 rounded-lg border ${
                            validationErrors.password ? "border-red-500" : "border-gray-300"
                          } focus:outline-none focus:ring-2 focus:ring-[#00BFA5] focus:border-transparent`}
                          placeholder="Create a strong password"
                        />
                      </div>

                      {formData.password && (
                        <div className="mt-2">
                          <div className="flex items-center">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full ${passwordStrength.color}`}
                                style={{
                                  width: `${formData.password.length > 12 ? 100 : formData.password.length * 8}%`,
                                }}
                              ></div>
                            </div>
                            <span className="ml-2 text-xs">{passwordStrength.strength}</span>
                          </div>
                        </div>
                      )}

                      {validationErrors.password && (
                        <p className="text-red-500 text-xs mt-1">{validationErrors.password}</p>
                      )}
                    </div>

                    <div className="mb-6">
                      <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">
                        Department
                      </label>
                      <select
                        id="department"
                        value={formData.department}
                        onChange={(e) => updateFormData("department", e.target.value)}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          validationErrors.department ? "border-red-500" : "border-gray-300"
                        } focus:outline-none focus:ring-2 focus:ring-[#00BFA5] focus:border-transparent`}
                      >
                        <option value="">Select Department</option>
                        {loadingDepartments ? (
                          <option disabled>Loading departments...</option>
                        ) : (
                          departments.map((dept) => (
                            <option key={dept.id} value={dept.id}>
                              {dept.icon} {dept.name}
                            </option>
                          ))
                        )}
                      </select>

                      {validationErrors.department && (
                        <p className="text-red-500 text-xs mt-1">{validationErrors.department}</p>
                      )}
                    </div>

                    <div className="flex justify-between">
                      <button
                        type="button"
                        onClick={prevStep}
                        className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all"
                      >
                        Back
                      </button>
                      <button
                        type="button"
                        onClick={nextStep}
                        className="px-6 py-2 bg-gradient-to-r from-[#2A5C82] to-[#00BFA5] text-white rounded-lg hover:shadow-md transition-all"
                      >
                        Continue
                      </button>
                    </div>
                  </motion.div>
                )}

                {step === 3 && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <h2 className="text-xl font-semibold mb-6">Verification</h2>

                    <div className="bg-green-50 p-4 rounded-lg mb-6 flex items-start">
                      <div className="mr-3 mt-0.5">
                        <FiCheckCircle className="text-green-500" size={20} />
                      </div>
                      <div>
                        <h3 className="font-medium text-green-800">Email Verification</h3>
                        <p className="text-sm text-green-700">
                          After registration, we'll send a verification link to your email address.
                        </p>
                      </div>
                    </div>

                    <div className="mb-6">
                      <div className="border border-gray-300 rounded-lg p-4">
                        <h3 className="font-medium mb-2">Review your information</h3>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="text-gray-600">Role:</div>
                          <div className="font-medium">{role === "student" ? "Student" : "Lecturer"}</div>

                          <div className="text-gray-600">Name:</div>
                          <div className="font-medium">
                            {formData.firstName} {formData.lastName}
                          </div>

                          <div className="text-gray-600">University ID:</div>
                          <div className="font-medium">{formData.universityId}</div>

                          <div className="text-gray-600">Email:</div>
                          <div className="font-medium">{formData.email}</div>

                          <div className="text-gray-600">Department:</div>
                          <div className="font-medium">
                            {departments.find((d) => d.id === formData.department)?.name || ""}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mb-6">
                      <div className="flex items-center">
                        <input
                          id="terms"
                          type="checkbox"
                          className="h-4 w-4 text-[#00BFA5] focus:ring-[#00BFA5] border-gray-300 rounded"
                        />
                        <label htmlFor="terms" className="ml-2 block text-sm text-gray-700">
                          I agree to the{" "}
                          <a href="#" className="text-[#2A5C82] hover:underline">
                            Terms of Service
                          </a>{" "}
                          and{" "}
                          <a href="#" className="text-[#2A5C82] hover:underline">
                            Privacy Policy
                          </a>
                        </label>
                      </div>
                    </div>

                    <div className="flex justify-between">
                      <button
                        type="button"
                        onClick={prevStep}
                        className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all"
                      >
                        Back
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-6 py-2 bg-gradient-to-r from-[#2A5C82] to-[#00BFA5] text-white rounded-lg hover:shadow-md transition-all flex items-center"
                      >
                        {isSubmitting ? (
                          <>
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
                            Creating Account...
                          </>
                        ) : (
                          "Create Account"
                        )}
                      </button>
                    </div>
                  </motion.div>
                )}
              </form>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

export default Register
