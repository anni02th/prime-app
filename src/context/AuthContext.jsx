"use client"

import { createContext, useState, useContext, useEffect } from "react"
import { api } from "../services/api"

const AuthContext = createContext()

export const useAuth = () => {
  return useContext(AuthContext)
}

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem("token")
    if (token) {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`
      fetchUserProfile()
    } else {
      setLoading(false)
    }
  }, [])

  const fetchUserProfile = async () => {
    try {
      setError(null)
      const response = await api.get("/api/users/profile")
      setCurrentUser(response.data)
    } catch (error) {
      console.error("Failed to fetch user profile:", error)
      setError("Failed to authenticate user. Please log in again.")
      logout()
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    try {
      setError(null)
      const response = await api.post("/api/auth/login", { email, password })
      const { token, user } = response.data

      localStorage.setItem("token", token)
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`

      setCurrentUser(user)
      return { success: true }
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Login failed"
      setError(errorMessage)
      return {
        success: false,
        message: errorMessage,
      }
    }
  }

  const signup = async (userData) => {
    try {
      setError(null)
      const response = await api.post("/api/auth/register", userData)
      const { token, user } = response.data

      localStorage.setItem("token", token)
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`

      setCurrentUser(user)
      return { success: true }
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Registration failed"
      setError(errorMessage)
      return {
        success: false,
        message: errorMessage,
      }
    }
  }

  const logout = () => {
    localStorage.removeItem("token")
    delete api.defaults.headers.common["Authorization"]
    setCurrentUser(null)
    setError(null)
  }

  const updateProfile = async (profileData) => {
    try {
      setError(null)
      // This function updates the currentUser state with new profile data
      // It can be called after a successful profile update API call
      setCurrentUser((prev) => ({
        ...prev,
        ...profileData,
      }))
      return { success: true }
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Profile update failed"
      setError(errorMessage)
      return {
        success: false,
        message: errorMessage,
      }
    }
  }

  // Check if user has admin or advisor role
  const isAdminOrAdvisor = () => {
    return currentUser && (currentUser.role === "admin" || currentUser.role === "advisor")
  }

  // Check if user is a student
  const isStudent = () => {
    return currentUser && currentUser.role === "student"
  }

  // Check if user is an admin
  const isAdmin = () => {
    return currentUser && currentUser.role === "admin"
  }

  const value = {
    currentUser,
    login,
    signup,
    logout,
    updateProfile,
    loading,
    error,
    isAdminOrAdvisor,
    isStudent,
    isAdmin,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
