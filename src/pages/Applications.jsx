"use client"

import { useState, useEffect, useRef } from "react"
import { useSearchParams, useNavigate } from "react-router-dom"
import TabNavigation from "../components/TabNavigation"
import { api } from "../services/api"
import { useAuth } from "../context/AuthContext"

const Applications = () => {
  const [searchParams] = useSearchParams()
  const studentId = searchParams.get("student")
  const { currentUser, isAdminOrAdvisor } = useAuth()
  const navigate = useNavigate()

  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [comment, setComment] = useState("")
  const [selectedApplicationId, setSelectedApplicationId] = useState(null)
  const [applicationChat, setApplicationChat] = useState(null)
  const [loadingChat, setLoadingChat] = useState(false)
  const [sendingMessage, setSendingMessage] = useState(false)
  const [statusInput, setStatusInput] = useState("")
  const [savingStatus, setSavingStatus] = useState(false)
  const messagesEndRef = useRef(null)
  const [sortingApplications, setSortingApplications] = useState(false)
  // Add color picker for status
  const [statusColorInput, setStatusColorInput] = useState("#f3f4f6")
  const [showColorPicker, setShowColorPicker] = useState(false)
  // Add state for delete confirmation
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const endpoint = studentId ? `/api/students/${studentId}/applications` : "/api/applications"

        const response = await api.get(endpoint)
        setApplications(response.data)

        // Set the first application as selected by default
        if (response.data.length > 0 && !selectedApplicationId) {
          setSelectedApplicationId(response.data[0]._id)
          setStatusInput(response.data[0].status || "")
        }
      } catch (err) {
        console.error("Error fetching applications:", err)
        setError("Failed to load applications. Please try again later.")
        // Use mock data for demonstration
        setApplications(mockApplications)

        // Set the first mock application as selected by default
        if (mockApplications.length > 0 && !selectedApplicationId) {
          setSelectedApplicationId(mockApplications[0].id)
          setStatusInput(mockApplications[0].status || "")
        }
      } finally {
        setLoading(false)
      }
    }

    fetchApplications()
  }, [studentId])

  useEffect(() => {
    if (selectedApplicationId) {
      fetchApplicationChat(selectedApplicationId)

      // Set the status color input when selecting an application
      const selectedApp = applications.find(
        (app) => app._id === selectedApplicationId || app.id === selectedApplicationId,
      )
      if (selectedApp) {
        setStatusInput(selectedApp.status || "")
        setStatusColorInput(selectedApp.statusColor || "#f3f4f6")
      }
    }
  }, [selectedApplicationId])

  useEffect(() => {
    scrollToBottom()
  }, [applicationChat])

  const fetchApplicationChat = async (appId) => {
    setLoadingChat(true)
    try {
      const response = await api.get(`/api/application-chats/${appId}`)
      setApplicationChat(response.data)

      // Mark messages as read
      await api.put(`/api/application-chats/${appId}/read`)

      // Update status input
      const selectedApp = applications.find((app) => app._id === appId || app.id === appId)
      if (selectedApp) {
        setStatusInput(selectedApp.status || "")
      }
    } catch (err) {
      console.error("Error fetching application chat:", err)
      // Use mock data for demonstration
      setApplicationChat({
        _id: "mock-chat-" + appId,
        applicationId: appId,
        messages: mockMessages,
      })
    } finally {
      setLoadingChat(false)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const tabs = [
    {
      label: "Student Profile",
      path: studentId ? `/student/${studentId}` : "/dashboard",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          ></path>
        </svg>
      ),
    },
    {
      label: "Application",
      path: studentId ? `/applications?student=${studentId}` : "/applications",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          ></path>
        </svg>
      ),
    },
    {
      label: "Documents",
      path: studentId ? `/documents?student=${studentId}` : "/documents",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"
          ></path>
        </svg>
      ),
    },
  ]

  const handleSendComment = async () => {
    if (!comment.trim() || !selectedApplicationId) return

    setSendingMessage(true)
    try {
      const response = await api.post(`/api/application-chats/${selectedApplicationId}/messages`, {
        text: comment,
      })

      // Update chat with new message
      setApplicationChat((prev) => {
        if (!prev)
          return {
            _id: "new-chat",
            applicationId: selectedApplicationId,
            messages: [response.data],
          }

        return {
          ...prev,
          messages: [...prev.messages, response.data],
        }
      })

      setComment("")
    } catch (err) {
      console.error("Error sending message:", err)
      alert("Failed to send message. Please try again.")
    } finally {
      setSendingMessage(false)
    }
  }

  const handleSelectApplication = (appId) => {
    setSelectedApplicationId(appId)
    // Reset delete confirmation when switching applications
    setShowDeleteConfirm(false)
  }

  // Update the handleStatusChange function
  const handleStatusChange = async () => {
    if (!selectedApplicationId || !isAdminOrAdvisor()) return

    setSavingStatus(true)
    try {
      const response = await api.put(`/api/applications/${selectedApplicationId}`, {
        status: statusInput,
        statusColor: statusColorInput,
      })

      // Update application in the list
      setApplications((prev) =>
        prev.map((app) =>
          app._id === selectedApplicationId || app.id === selectedApplicationId
            ? { ...app, status: statusInput, statusColor: statusColorInput }
            : app,
        ),
      )

      // Send a system message about status change
      await api.post(`/api/application-chats/${selectedApplicationId}/messages`, {
        text: `Application status updated to: ${statusInput}`,
      })

      // Refresh chat
      fetchApplicationChat(selectedApplicationId)
    } catch (err) {
      console.error("Error updating status:", err)
      alert("Failed to update status. Please try again.")
    } finally {
      setSavingStatus(false)
    }
  }

  // Add this function to handle toggling the star status
  const handleToggleStar = async (appId) => {
    try {
      setSortingApplications(true)
      const response = await api.patch(`/api/applications/${appId}/toggle-star`)

      // Update applications list with the updated application
      setApplications(applications.map((app) => (app._id === appId ? { ...app, starred: response.data.starred } : app)))

      // Re-sort applications to move starred to top
      setApplications((prev) =>
        [...prev].sort((a, b) => {
          if (a.starred && !b.starred) return -1
          if (!a.starred && b.starred) return 1
          return 0
        }),
      )
    } catch (err) {
      console.error("Error toggling star status:", err)
    } finally {
      setSortingApplications(false)
    }
  }

  // Add function to handle application deletion
  const handleDeleteApplication = async () => {
    if (!selectedApplicationId || !isAdminOrAdvisor()) return

    setDeleting(true)
    try {
      await api.delete(`/api/applications/${selectedApplicationId}`)

      // Remove the deleted application from the list
      const updatedApplications = applications.filter(
        (app) => app._id !== selectedApplicationId && app.id !== selectedApplicationId,
      )
      setApplications(updatedApplications)

      // Select another application if available, otherwise clear selection
      if (updatedApplications.length > 0) {
        setSelectedApplicationId(updatedApplications[0]._id || updatedApplications[0].id)
      } else {
        setSelectedApplicationId(null)
      }

      // Show success message
      alert("Application deleted successfully")

      // If we're viewing a specific student's applications and there are none left,
      // redirect to the student profile
      if (studentId && updatedApplications.length === 0) {
        navigate(`/student/${studentId}`)
      }
    } catch (err) {
      console.error("Error deleting application:", err)
      alert("Failed to delete application. Please try again.")
    } finally {
      setDeleting(false)
      setShowDeleteConfirm(false)
    }
  }

  // Mock data for demonstration
  const mockApplications = [
    {
      id: 1,
      applicationId: "Basic Template",
      program: "Prgram Name",
      university: "University Name",
      status: "Status",
      portalName: "Basic Template",
      personalbarotalId: "",
    },
  ]

  const mockMessages = [
    {
      _id: "msg1",
      sender: {
        _id: "advisor1",
        name: "Advisor Smith",
        role: "advisor",
        avatar: "/placeholder.png?height=40&width=40",
      },
      senderName: "Advisor Smith",
      senderRole: "advisor",
      text: "Hello! I've reviewed your application for Texas A&M University.",
      timestamp: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
      read: true,
    },
  ]

  // Get the selected application
  const selectedApplication =
    applications.find((app) => app._id === selectedApplicationId) ||
    applications.find((app) => app.id === selectedApplicationId) ||
    (applications.length > 0 ? applications[0] : null) ||
    mockApplications.find((app) => app.id === 5)

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return ""
    const date = new Date(dateString)
    return date.toLocaleString()
  }

  // Format message timestamp
  const formatMessageTime = (timestamp) => {
    if (!timestamp) return ""

    const date = new Date(timestamp)
    const now = new Date()
    const diffInDays = Math.floor((now - date) / (1000 * 60 * 60 * 24))

    if (diffInDays === 0) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    } else if (diffInDays === 1) {
      return "Yesterday " + date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    } else {
      return date.toLocaleDateString() + " " + date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    }
  }

  // Add this helper function to determine text color based on background color
  const getContrastColor = (hexColor) => {
    // If no color or invalid format, return dark text
    if (!hexColor || !hexColor.startsWith("#")) return "#1f2937"

    // Convert hex to RGB
    const r = Number.parseInt(hexColor.substr(1, 2), 16)
    const g = Number.parseInt(hexColor.substr(3, 2), 16)
    const b = Number.parseInt(hexColor.substr(5, 2), 16)

    // Calculate luminance using the relative luminance formula
    // This gives better results than the simple average
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255

    // Return white for dark backgrounds, dark gray for light backgrounds
    return luminance > 0.5 ? "#1f2937" : "#ffffff"
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Applications</h1>
        <button
          onClick={() => navigate(`/application-form/${studentId}`)}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center"
        >
          <svg
            className="mr-2 w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
          </svg>
          New Application
        </button>
      </div>

      <TabNavigation tabs={tabs} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 bg-white rounded-lg shadow-md overflow-y-auto max-h-[calc(100vh-200px)]">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <svg
                className="animate-spin h-8 w-8 text-gray-500"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            </div>
          ) : error ? (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
              <strong className="font-bold">Error!</strong>
              <span className="block sm:inline"> {error}</span>
            </div>
          ) : (
            <div>
              {(applications.length > 0 ? applications : mockApplications).map((app) => (
                <div
                  key={app._id || app.id}
                  className={`p-4 border-b hover:bg-gray-50 cursor-pointer ${
                    (app._id || app.id) === selectedApplicationId ? "bg-gray-100" : ""
                  }`}
                >
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-gray-500 flex gap-4">
                      {app.portalName && (
                        <p className="text-sm font-medium text-gray-700">
                          <span className="font-medium">Portal:</span> {app.portalName}
                        </p>
                      )}
                      {app.potalId && (
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">ID:</span> {app.potalId}
                        </p>
                      )}
                    </span>
                    <div className="flex items-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleToggleStar(app._id || app.id)
                        }}
                        className="text-gray-400 hover:text-yellow-500 focus:outline-none"
                        title={app.starred ? "Remove from priority" : "Mark as priority"}
                        disabled={sortingApplications}
                      >
                        <svg
                          className={`w-5 h-5 ${app.starred ? "text-yellow-500 fill-current" : "text-gray-400"}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                            className={app.starred ? "fill-current" : ""}
                          ></path>
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div className="cursor-pointer" onClick={() => handleSelectApplication(app._id || app.id)}>
                    <h3 className="font-medium">{app.program}</h3>
                    <p className="text-sm text-gray-600">{app.university}</p>

                    <div className="mt-2">
                      <span
                        className="text-sm px-2 py-1 rounded-full"
                        style={{
                          backgroundColor: app.statusColor || "#f3f4f6",
                          color: getContrastColor(app.statusColor || "#f3f4f6"),
                        }}
                      >
                        Status: {app.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="md:col-span-2">
          {selectedApplication && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-bold text-lg">{selectedApplication.program}</h3>
                    <p className="text-gray-600">{selectedApplication.university}</p>

                    {/* Display Portal Name and Total ID */}
                    {selectedApplication.portalName && (
                      <p className="text-gray-600 ">
                        <span className="font-medium">Application Portal:</span> {selectedApplication.portalName}
                      </p>
                    )}
                    {selectedApplication.potalId && (
                      <p className="text-gray-600">
                        <span className="font-medium">Total ID:</span> {selectedApplication.potalId}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="flex justify-end items-end ">
                      {/* Delete Application Button - Only visible to admin/advisor */}
                      {isAdminOrAdvisor() && (
                        <div className="relative">
                          {!showDeleteConfirm ? (
                            <button
                              onClick={() => setShowDeleteConfirm(true)}
                              className="text-red-600 hover:text-red-800 focus:outline-none"
                              title="Delete Application"
                            >
                              <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                ></path>
                              </svg>
                            </button>
                          ) : (
                            <div className="bg-white border border-gray-200 rounded-md shadow-md p-3 absolute right-0 z-10 w-64">
                              <p className="text-sm text-gray-700 mb-3">
                                Are you sure you want to delete this application? This action cannot be undone.
                              </p>
                              <div className="flex justify-end space-x-2">
                                <button
                                  onClick={() => setShowDeleteConfirm(false)}
                                  className="px-3 py-1 text-sm bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                                  disabled={deleting}
                                >
                                  Cancel
                                </button>
                                <button
                                  onClick={handleDeleteApplication}
                                  className="px-3 py-1 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                                  disabled={deleting}
                                >
                                  {deleting ? "Deleting..." : "Delete"}
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                      {selectedApplication.details?.courseDetails || "Fall - 2025"}
                    </span>
                  </div>
                </div>

                {/* Status input field - only editable by admin/advisor */}
                <div className="mt-4 border-t pt-4">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-0">Status:</label>
                    <div className="flex-1 flex flex-wrap sm:flex-nowrap gap-2">
                      <input
                        type="text"
                        value={statusInput}
                        onChange={(e) => setStatusInput(e.target.value)}
                        disabled={!isAdminOrAdvisor() || savingStatus}
                        className={`min-w-0 flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          !isAdminOrAdvisor() ? "bg-gray-100" : ""
                        }`}
                      />
                      {isAdminOrAdvisor() && (
                        <>
                          <div className="relative">
                            <button
                              type="button"
                              onClick={() => setShowColorPicker(!showColorPicker)}
                              className="h-full px-2 border border-gray-300 flex items-center justify-center rounded-md"
                              style={{ backgroundColor: statusColorInput }}
                            >
                              <span className="sr-only">Pick color</span>
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                                style={{ color: getContrastColor(statusColorInput) }}
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M4 2a2 2 0 00-2 2v11a3 3 0 106 0V4a2 2 0 00-2-2H4zm1 14a1 1 0 100-2 1 1 0 000 2zm5-1.757l4.9-4.9a2 2 0 000-2.828L13.485 5.1a2 2 0 00-2.828 0L10 5.757v8.486zM16 18H9.071l6-6H16a2 2 0 012 2v2a2 2 0 01-2 2z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </button>
                            {showColorPicker && (
                              <div className="absolute right-0 mt-2 z-10 bg-white p-3 rounded-md shadow-lg border border-gray-200 w-64 sm:w-80 max-w-[90vw]">
                                <h4 className="text-sm font-medium mb-2">Status Colors</h4>
                                <div className="grid grid-cols-5 gap-2">
                                  {[
                                    { color: "#f3f4f6", label: "Default" },
                                    { color: "#fee2e2", label: "Red" },
                                    { color: "#fef3c7", label: "Yellow" },
                                    { color: "#d1fae5", label: "Green" },
                                    { color: "#dbeafe", label: "Blue" },
                                    { color: "#e5e7eb", label: "Gray" },
                                    { color: "#fecaca", label: "Red" },
                                    { color: "#fde68a", label: "Yellow" },
                                    { color: "#a7f3d0", label: "Green" },
                                    { color: "#bfdbfe", label: "Blue" },
                                    { color: "#9ca3af", label: "Gray" },
                                    { color: "#ef4444", label: "Red" },
                                    { color: "#f59e0b", label: "Yellow" },
                                    { color: "#10b981", label: "Green" },
                                    { color: "#3b82f6", label: "Blue" },
                                  ].map((colorOption) => (
                                    <button
                                      key={colorOption.color}
                                      type="button"
                                      className="w-8 h-8 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-center"
                                      style={{ backgroundColor: colorOption.color }}
                                      onClick={() => {
                                        setStatusColorInput(colorOption.color)
                                        setShowColorPicker(false)
                                      }}
                                      title={colorOption.label}
                                    >
                                      {statusColorInput === colorOption.color && (
                                        <svg
                                          xmlns="http://www.w3.org/2000/svg"
                                          className="h-4 w-4"
                                          viewBox="0 0 20 20"
                                          fill="currentColor"
                                          style={{ color: getContrastColor(colorOption.color) }}
                                        >
                                          <path
                                            fillRule="evenodd"
                                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                            clipRule="evenodd"
                                          />
                                        </svg>
                                      )}
                                    </button>
                                  ))}
                                </div>
                                <div className="mt-2 pt-2 border-t border-gray-200">
                                  <h4 className="text-sm font-medium mb-1">Preset Statuses</h4>
                                  <div className="grid grid-cols-1 gap-1">
                                    {[
                                      { status: "Pending", color: "#fef3c7" },
                                      { status: "In Progress", color: "#dbeafe" },
                                      { status: "Approved", color: "#d1fae5" },
                                      { status: "Rejected", color: "#fee2e2" },
                                      { status: "Waitlisted", color: "#e5e7eb" },
                                      { status: "Application Fee Pending", color: "#fde68a" },
                                      { status: "Case Closed", color: "#9ca3af" },
                                    ].map((preset) => (
                                      <button
                                        key={preset.status}
                                        type="button"
                                        className="text-left px-2 py-1 rounded text-sm hover:bg-gray-100"
                                        onClick={() => {
                                          setStatusInput(preset.status)
                                          setStatusColorInput(preset.color)
                                          setShowColorPicker(false)
                                        }}
                                      >
                                        <span
                                          className="inline-block w-3 h-3 rounded-full mr-2"
                                          style={{ backgroundColor: preset.color }}
                                        ></span>
                                        {preset.status}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                          <button
                            onClick={handleStatusChange}
                            disabled={savingStatus}
                            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                          >
                            {savingStatus ? "Saving..." : "Update"}
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="font-medium mb-2">Application Chat</h3>

                {/* Chat messages */}
                <div className="bg-gray-50 rounded-lg p-4 h-64 overflow-y-auto mb-4">
                  {loadingChat ? (
                    <div className="flex justify-center items-center h-full">
                      <svg
                        className="animate-spin h-6 w-6 text-gray-500"
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
                    </div>
                  ) : !applicationChat || applicationChat.messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500">
                      <p>No messages yet. Start the conversation!</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {applicationChat.messages.map((message) => (
                        <div
                          key={message._id}
                          className={`flex ${message.sender._id === currentUser.id ? "justify-end" : "justify-start"}`}
                        >
                          {message.sender._id !== currentUser.id && (
                            <div className="flex-shrink-0 mr-2">
                              <img
                                src={message.sender.avatar || "/placeholder.png?height=32&width=32"}
                                alt={message.senderName}
                                className="w-8 h-8 rounded-full"
                              />
                            </div>
                          )}

                          <div
                            className={`rounded-lg p-3 max-w-xs ${
                              message.sender._id === currentUser.id
                                ? "bg-blue-100 text-gray-800"
                                : message.senderRole === "admin" || message.senderRole === "advisor"
                                  ? "bg-green-100 text-gray-800"
                                  : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            <div className="text-xs text-gray-500 mb-1">
                              {message.senderName} • {formatMessageTime(message.timestamp)}
                            </div>
                            <p className="text-sm">{message.text}</p>
                          </div>

                          {message.sender._id === currentUser.id && (
                            <div className="flex-shrink-0 ml-2">
                              <img
                                src={currentUser.avatar || "/placeholder.png?height=32&width=32"}
                                alt="You"
                                className="w-8 h-8 rounded-full"
                              />
                            </div>
                          )}
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>
                  )}
                </div>

                {/* Message input */}
                <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-0">
                  <input
                    type="text"
                    placeholder="Write a message..."
                    className="w-full flex-1 border border-gray-300 rounded-md sm:rounded-l-md sm:rounded-r-none px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSendComment()}
                  />
                  <button
                    className="w-full sm:w-auto bg-gray-800 text-white px-4 py-2 rounded-md sm:rounded-l-none sm:rounded-r-md hover:bg-gray-900 transition-colors disabled:opacity-50"
                    onClick={handleSendComment}
                    disabled={sendingMessage || !comment.trim()}
                  >
                    {sendingMessage ? "Sending..." : "Send"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Applications
