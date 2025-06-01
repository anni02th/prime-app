"use client"

import { Navigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

const AdvisorRoute = ({ children }) => {
  const { currentUser, loading, isAdminOrAdvisor } = useAuth()

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>
  }

  if (!currentUser || !isAdminOrAdvisor()) {
    return <Navigate to="/dashboard" />
  }

  return children
}

export default AdvisorRoute
