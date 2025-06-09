/* eslint-disable react-refresh/only-export-components */
"use client"
import { toast } from 'react-toastify';
import { createContext, useState, useContext, useEffect } from "react"
import { API_URL } from "../config"

const AuthContext = createContext()

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem("authToken")
    if (token) {
      fetchUserData(token)
    } else {
      setLoading(false)
    }
  }, [])

  const fetchUserData = async (token) => {
    try {
      // This would be replaced with an actual API call to your Flask backend
      const response = await fetch(`${API_URL}/api/user`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const userData = await response.json()
        setCurrentUser(userData)
      } else {
        // Token invalid or expired
        localStorage.removeItem("authToken")
      }
    } catch (error) {
      console.error("Error fetching user data:", error)
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password, role) => {
    setError("")
    try {
      // This would be replaced with an actual API call to your Flask backend
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, role }),
      })

      const data = await response.json()

      if (response.ok) {
        localStorage.setItem("authToken", data.token)
        setCurrentUser(data.user)
        return true
      } else {
        setError(data.message || "Login failed")
        return false
      }
    } catch (error) {
      setError("Network error. Please try again.")
      return false
    }
  }

  const register = async (userData) => {
    setError("")
    try {
      // This would be replaced with an actual API call to your Flask backend
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      })

      const data = await response.json()

      if (response.ok) {
        return { success: true }
      } else {
        setError(data.message || "Registration failed")
        return { success: false, error: data.message }
      }
    } catch (error) {
      setError("Network error. Please try again.")
      return { success: false, error: "Network error" }
    }
  }

  const resetPassword = async (email) => {
    setError("")
    try {
      // This would be replaced with an actual API call to your Flask backend
      const response = await fetch(`${API_URL}/api/auth/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        toast.success("Password reset link sent to your email.");
        return { success: true };
      } else {
        toast.error(data.message || "Password reset request failed");
        return { success: false, error: data.message };
      }
    } catch (error) {
      setError("Network error. Please try again.")
      return { success: false, error: "Network error" }
    }
  }

  const logout = () => {
    localStorage.removeItem("authToken")
    setCurrentUser(null)
  }

  const value = {
    currentUser,
    login,
    register,
    resetPassword,
    logout,
    loading,
    error,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
