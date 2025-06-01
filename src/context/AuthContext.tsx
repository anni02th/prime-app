"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { useApi } from "./ApiContext"

interface User {
  id: string
  email: string
  name: string
  role: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<boolean>
  logout: () => Promise<void>
  signup: (userData: any) => Promise<boolean>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const { api } = useApi()

  useEffect(() => {
    checkAuthState()
  }, [])

  const checkAuthState = async () => {
    try {
      const token = await AsyncStorage.getItem("token")
      const userData = await AsyncStorage.getItem("user")

      if (token && userData) {
        setUser(JSON.parse(userData))
      }
    } catch (error) {
      console.error("Error checking auth state:", error)
    } finally {
      setLoading(false)
    }
  }

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await api.post("/api/auth/login", { email, password })
      const { token, user: userData } = response.data

      await AsyncStorage.setItem("token", token)
      await AsyncStorage.setItem("user", JSON.stringify(userData))
      setUser(userData)

      return true
    } catch (error) {
      console.error("Login error:", error)
      return false
    }
  }

  const signup = async (userData: any): Promise<boolean> => {
    try {
      const response = await api.post("/api/auth/signup", userData)
      const { token, user: newUser } = response.data

      await AsyncStorage.setItem("token", token)
      await AsyncStorage.setItem("user", JSON.stringify(newUser))
      setUser(newUser)

      return true
    } catch (error) {
      console.error("Signup error:", error)
      return false
    }
  }

  const logout = async (): Promise<void> => {
    try {
      await AsyncStorage.removeItem("token")
      await AsyncStorage.removeItem("user")
      setUser(null)
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  return <AuthContext.Provider value={{ user, loading, login, logout, signup }}>{children}</AuthContext.Provider>
}
