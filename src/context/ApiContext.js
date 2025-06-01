"use client"

import { createContext, useContext } from "react"
import axios from "axios"

const ApiContext = createContext()

export const useApi = () => {
  const context = useContext(ApiContext)
  if (!context) {
    throw new Error("useApi must be used within an ApiProvider")
  }
  return context
}

// Replace with your actual API URL
const API_URL = "http://10.0.2.2:5000" // For Android emulator
// const API_URL = 'http://localhost:5000'; // For iOS simulator
// const API_URL = 'https://your-production-api.com'; // For production

export const ApiProvider = ({ children }) => {
  const api = axios.create({
    baseURL: API_URL,
    headers: {
      "Content-Type": "application/json",
    },
    timeout: 10000,
  })

  // Request interceptor
  api.interceptors.request.use(
    (config) => {
      console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`)
      return config
    },
    (error) => {
      console.error("API Request Error:", error)
      return Promise.reject(error)
    },
  )

  // Response interceptor
  api.interceptors.response.use(
    (response) => {
      console.log(`API Response: ${response.status} ${response.config.url}`)
      return response
    },
    (error) => {
      console.error("API Response Error:", error.response?.data || error.message)
      return Promise.reject(error)
    },
  )

  const value = {
    api,
    API_URL,
  }

  return <ApiContext.Provider value={value}>{children}</ApiContext.Provider>
}
