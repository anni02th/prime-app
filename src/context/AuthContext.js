"use client"

import { createContext, useContext, useState, useEffect } from "react"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { useApi } from "./ApiContext"

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const { api } = useApi()

  useEffect(() => {
    checkAuthState()
  }, [])

  const checkAuthState = async () => {
    try {
      const token = await AsyncStorage.getItem("token")
      const userData = await AsyncStorage.getItem("userData")

      if (token && userData) {
        const user = JSON.parse(userData)
        setCurrentUser(user)
        // Set token in API headers
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`
      }
    } catch (error) {
      console.error("Error checking auth state:", error)
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    try {
      setLoading(true)
      const response = await api.post("/api/auth/login", { email, password })

      const { token, user } = response.data

      // Store token and user data
      await AsyncStorage.setItem("token", token)
      await AsyncStorage.setItem("userData", JSON.stringify(user))

      // Set token in API headers
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`

      setCurrentUser(user)
      return { success: true }
    } catch (error) {
      console.error("Login error:", error)
      return {
        success: false,
        message: error.response?.data?.message || "Login failed",
      }
    } finally {
      setLoading(false)
    }
  }

  const signup = async (userData) => {
    try {
      setLoading(true)
      const response = await api.post("/api/auth/register", userData)

      const { token, user } = response.data

      // Store token and user data
      await AsyncStorage.setItem("token", token)
      await AsyncStorage.setItem("userData", JSON.stringify(user))

      // Set token in API headers
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`

      setCurrentUser(user)
      return { success: true }
    } catch (error) {
      console.error("Signup error:", error)
      return {
        success: false,
        message: error.response?.data?.message || "Signup failed",
      }
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      await AsyncStorage.removeItem("token")
      await AsyncStorage.removeItem("userData")
      delete api.defaults.headers.common["Authorization"]
      setCurrentUser(null)
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  const updateProfile = (updatedUser) => {
    setCurrentUser(updatedUser)
    AsyncStorage.setItem("userData", JSON.stringify(updatedUser))
  }

  const isAdminOrAdvisor = () => {
    return currentUser?.role === "admin" || currentUser?.role === "advisor"
  }

  const isStudent = () => {
    return currentUser?.role === "student"
  }

  const value = {
    currentUser,
    loading,
    login,
    signup,
    logout,
    updateProfile,
    isAdminOrAdvisor,
    isStudent,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
