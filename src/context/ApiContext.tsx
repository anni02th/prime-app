"use client"

import type React from "react"
import { createContext, useContext, type ReactNode } from "react"
import axios, { type AxiosInstance } from "axios"
import AsyncStorage from "@react-native-async-storage/async-storage"

// Change this to your backend URL
const API_BASE_URL = "http://10.0.2.2:5000" // For Android Emulator
// const API_BASE_URL = 'http://YOUR_COMPUTER_IP:5000'; // For Physical Device

interface ApiContextType {
  api: AxiosInstance
}

const ApiContext = createContext<ApiContextType | undefined>(undefined)

export const useApi = () => {
  const context = useContext(ApiContext)
  if (!context) {
    throw new Error("useApi must be used within an ApiProvider")
  }
  return context
}

export const ApiProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      "Content-Type": "application/json",
    },
  })

  // Request interceptor to add auth token
  api.interceptors.request.use(
    async (config) => {
      const token = await AsyncStorage.getItem("token")
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    },
    (error) => {
      return Promise.reject(error)
    },
  )

  // Response interceptor for error handling
  api.interceptors.response.use(
    (response) => response,
    async (error) => {
      if (error.response?.status === 401) {
        await AsyncStorage.removeItem("token")
        await AsyncStorage.removeItem("user")
      }
      return Promise.reject(error)
    },
  )

  return <ApiContext.Provider value={{ api }}>{children}</ApiContext.Provider>
}
