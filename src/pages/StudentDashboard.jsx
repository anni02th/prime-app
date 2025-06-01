"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { api } from "../services/api"
import { useAuth } from "../context/AuthContext"
import TabNavigation from "../components/TabNavigation"

const StudentDashboard = () => {
  const { currentUser } = useAuth()
  const [studentProfile, setStudentProfile] = useState(null)
  const [studentDocuments, setStudentDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [loadingDocuments, setLoadingDocuments] = useState(true)
  const [loadingChats, setLoadingChats] = useState(true)
  const [chats, setChats] = useState([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Fetch student profile
        console.log("Fetching student profile...")
        const response = await api.get("/api/students/profile")
        console.log("Student profile received:", response.data)
        setStudentProfile(response.data)

        // Fetch applications for the student
        if (response.data && response.data._id) {
          try {
            console.log("Fetching applications for student:", response.data._id)
            const appResponse = await api.get(`/api/students/${response.data._id}/applications`)
            console.log("Applications received:", appResponse.data)

            // Update student profile with applications
            setStudentProfile((prev) => ({
              ...prev,
              applications: appResponse.data,
            }))
          } catch (appErr) {
            console.error("Error fetching student applications:", appErr)
          }

          // Fetch documents for the student
          try {
            setLoadingDocuments(true)
            const docsResponse = await api.get(`/api/documents/student/${response.data._id}`)
            setStudentDocuments(docsResponse.data)
          } catch (docsErr) {
            console.error("Error fetching student documents:", docsErr)
            setStudentDocuments([])
          } finally {
            setLoadingDocuments(false)
          }
        }
      } catch (err) {
        console.error("Error fetching data:", err)
        setError("Failed to load data. Please try again later.")
        // Use mock data as fallback
        setStudentProfile(mockStudentProfile)
        setStudentDocuments(mockDocuments)
      } finally {
        setLoading(false)
      }

      // Fetch chats
      try {
        setLoadingChats(true)
        const chatsResponse = await api.get("/api/chats")
        setChats(chatsResponse.data)
      } catch (err) {
        console.error("Error fetching chats:", err)
        setChats(mockChats)
      } finally {
        setLoadingChats(false)
      }
    }

    fetchData()
  }, [])

  const studentTabs = [
    {
      label: "My Profile",
      path: "/dashboard",
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
      label: "My Applications",
      path: "/student-application",
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
      label: "My Documents",
      path: "/my-documents",
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
  ]

  // Mock data for demonstration
  const mockStudentProfile = {
    _id: "student123",
    name: "Test Student",
    degree: "NA",
    major: "NA",
    gpa: "NA",
    avatar: "/placeholder.png?height=120&width=120",
    passportNumber: "S12345678",
    nationality: "NA",
    email: "john.student@example.com",
    contact: "NA",
    advisor: {
      _id: "NA",
      name: "TEST Smith",
      email: "advisor@primestudy.com",
      avatar: "/placeholder.png?height=40&width=40",
    },
    applications: [
      {
        id: 201,
        name: "NA",
        fullName: "University Name",
        countryCode: "US",
        status: "In Progress",
        intake: "",
        statusColor: "#dbeafe", // Light blue
      },
    ],
  }

  const mockDocuments = [
    {
      _id: "doc1",
      name: "Document Name",
      type: "Template",
      size: 0,
      createdAt: "210:30:00Z",
      path: "",
    },
  ]

  const mockChats = [
    {
      id: 1,
      title: "Document Requirements",
      participants: [
        { id: 1, name: "Admin User", avatar: "/placeholder.png?height=40&width=40" },
        { id: 2, name: "John Doe", avatar: "/placeholder.png?height=40&width=40" },
      ],
      lastMessage: {
        text: "Okay, waiting 👍",
        sender: "advisor",
        timestamp: "2023-06-15T10:36:00Z",
      },
      unreadCount: 0,
    },
  ]

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return ""

    const date = new Date(timestamp)
    const now = new Date()
    const diffInDays = Math.floor((now - date) / (1000 * 60 * 60 * 24))

    if (diffInDays === 0) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    } else if (diffInDays === 1) {
      return "Yesterday"
    } else if (diffInDays < 7) {
      return date.toLocaleDateString([], { weekday: "short" })
    } else {
      return date.toLocaleDateString([], { month: "short", day: "numeric" })
    }
  }

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  // Get file icon based on file type
  const getFileIcon = (fileName) => {
    const extension = fileName.split(".").pop().toLowerCase()

    if (["pdf"].includes(extension)) {
      return (
        <svg
          className="w-6 h-6 text-red-500"
          fill="currentColor"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
            clipRule="evenodd"
          />
        </svg>
      )
    } else if (["doc", "docx"].includes(extension)) {
      return (
        <svg
          className="w-6 h-6 text-blue-500"
          fill="currentColor"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
            clipRule="evenodd"
          />
        </svg>
      )
    } else if (["jpg", "jpeg", "png", "gif"].includes(extension)) {
      return (
        <svg
          className="w-6 h-6 text-green-500"
          fill="currentColor"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
            clipRule="evenodd"
          />
        </svg>
      )
    } else {
      return (
        <svg
          className="w-6 h-6 text-gray-500"
          fill="currentColor"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
            clipRule="evenodd"
          />
        </svg>
      )
    }
  }

  // Get contrast color for text based on background color
  const getContrastColor = (hexColor) => {
    // If no color or invalid format, return dark text
    if (!hexColor || !hexColor.startsWith("#")) return "#1f2937"

    // Convert hex to RGB
    const r = Number.parseInt(hexColor.substr(1, 2), 16)
    const g = Number.parseInt(hexColor.substr(3, 2), 16)
    const b = Number.parseInt(hexColor.substr(5, 2), 16)

    // Calculate luminance - simplified formula
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255

    // Return white for dark backgrounds, dark gray for light backgrounds
    return luminance > 0.5 ? "#1f2937" : "#ffffff"
  }

  // Helper function to get country flag emoji
  const getCountryFlag = (countryCode) => {
    if (!countryCode) return ""

    const codePoints = countryCode
      .toUpperCase()
      .split("")
      .map((char) => 127397 + char.charCodeAt())
    return String.fromCodePoint(...codePoints)
  }

  // Update the getImageUrl function (around line 50) to handle base64 images
  const getImageUrl = (path) => {
    if (!path) return "/placeholder.png?height=100&width=100"

    // If it's already a full URL (S3)
    if (path.startsWith("http")) return path

    // If it's a base64 string
    if (path.startsWith("data:image")) return path

    // If it's a local path
    // Make sure it starts with a slash
    return path.startsWith("/") ? path : `/${path}`
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Student Dashboard</h1>
      </div>

      <TabNavigation tabs={studentTabs} />

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
          <button
            className="mt-2 bg-red-200 hover:bg-red-300 text-red-800 font-bold py-1 px-3 rounded"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Student Profile Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex flex-col md:flex-row md:items-center md:space-x-6">
              <div className="flex-shrink-0 mb-4 md:mb-0">
                {/* Update the avatar image src (around line 290) to use the api base URL for local paths */}
                <img
                  src={getImageUrl(studentProfile?.avatar || "/placeholder.png?height=120&width=120")}
                  alt={studentProfile?.name}
                  className="w-24 h-24 rounded-full object-cover mx-auto md:mx-0"
                  onError={(e) => {
                    e.target.onerror = null
                    e.target.src = "/placeholder.png?height=120&width=120"
                  }}
                />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-center md:text-left">{studentProfile?.name}</h2>
                <p className="text-gray-600 text-center md:text-left">
                  {studentProfile?.degree} in {studentProfile?.major}
                </p>
                <p className="text-gray-500 text-center md:text-left">GPA: {studentProfile?.gpa}/10</p>

                <div className="mt-3 flex flex-wrap gap-2 justify-center md:justify-start">
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                    {studentProfile?.nationality}
                  </span>
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                    Passport: {studentProfile?.passportNumber}
                  </span>
                </div>

                {studentProfile?.advisor && (
                  <div className="mt-4 flex items-center justify-center md:justify-start">
                    <span className="text-sm text-gray-600 mr-2">Advisor:</span>
                    <div className="flex items-center">
                      <img
                        src={studentProfile.advisor.avatar || "/placeholder.png?height=24&width=24"}
                        alt={studentProfile.advisor.name}
                        className="w-6 h-6 rounded-full mr-2"
                      />
                      <span className="text-sm font-medium">{studentProfile.advisor.name}</span>
                    </div>
                  </div>
                )}
              </div>
              <div className="hidden md:block">
                <Link
                  to="/student-application"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
                >
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    ></path>
                  </svg>
                  Apply to Universities
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div className="bg-gray-50 p-4 rounded-md">
                <h3 className="font-medium mb-3 text-lg">Personal Information</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-600">Email:</span>
                    <span>{studentProfile?.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-600">Contact:</span>
                    <span>{studentProfile?.contact}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-600">Nationality:</span>
                    <span>{studentProfile?.nationality}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-600">Passport:</span>
                    <span>{studentProfile?.passportNumber}</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-md">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-medium text-lg">My Applications</h3>
                  <Link to="/student-application" className="text-blue-600 hover:text-blue-800 text-sm">
                    View All
                  </Link>
                </div>

                {(studentProfile?.applications || []).length > 0 ? (
                  <div className="space-y-3 max-h-40 overflow-y-auto">
                    {(studentProfile?.applications || []).map((app) => (
                      <div
                        key={app.id || app._id}
                        className="flex justify-between items-center p-2 hover:bg-gray-100 rounded-md"
                      >
                        <div className="flex items-center">
                          <span className="text-lg mr-2">{getCountryFlag(app.countryCode)}</span>
                          <div>
                            <span className="font-medium">{app.name || app.university}</span>
                            <p className="text-xs text-gray-500">{app.intake || "Fall 2025"}</p>
                          </div>
                        </div>
                        <span
                          className="text-xs px-2 py-1 rounded-full"
                          style={{
                            backgroundColor: app.statusColor || "#f3f4f6",
                            color: getContrastColor(app.statusColor || "#f3f4f6"),
                          }}
                        >
                          {app.status}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    <p>No applications yet</p>
                    <Link
                      to="/student-application"
                      className="text-blue-600 hover:text-blue-800 text-sm mt-2 inline-block"
                    >
                      Apply Now
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Documents Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">My Documents</h3>
              <Link to="/my-documents" className="text-blue-600 hover:text-blue-800 text-sm">
                Manage Documents
              </Link>
            </div>

            {loadingDocuments ? (
              <div className="flex justify-center items-center h-32">
                <svg
                  className="animate-spin h-6 w-6 text-gray-500"
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
            ) : studentDocuments.length === 0 ? (
              <div className="text-center py-6 text-gray-500">
                <svg
                  className="w-16 h-16 mx-auto text-gray-400 mb-4"
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
                <p>No documents uploaded yet</p>
                <Link to="/my-documents" className="mt-2 inline-block text-blue-600 hover:text-blue-800">
                  Upload Documents
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {studentDocuments.slice(0, 3).map((doc) => (
                  <div key={doc._id} className="border rounded-md p-3 hover:bg-gray-50">
                    <div className="flex items-center">
                      <div className="mr-3">{getFileIcon(doc.name)}</div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm truncate" title={doc.name}>
                          {doc.name}
                        </h4>
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>{doc.type}</span>
                          <span>{doc.size ? formatFileSize(doc.size) : ""}</span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-2 flex justify-end space-x-2">
                      <a
                        href={`${api.defaults.baseURL}/${doc.path}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800"
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
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          ></path>
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          ></path>
                        </svg>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Mobile Apply Button */}
          <div className="md:hidden">
            <Link
              to="/student-application"
              className="w-full px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                ></path>
              </svg>
              Apply to Universities
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}

export default StudentDashboard
