"use client"

import { Navigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

const AdminRoute = ({ children }) => {
  const { currentUser, loading, isAdmin } = useAuth()

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>
  }

  if (!currentUser || !isAdmin()) {
    return <Navigate to="/dashboard" />
  }

  return children
}

export default AdminRoute
