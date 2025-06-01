// Update the StudentCard component to handle avatar paths correctly
"use client"

import { Link } from "react-router-dom"
import { useState } from "react"
import { api } from "../services/api"

// Helper function to get proper image URL
const getImageUrl = (path) => {
  if (!path) return "/placeholder.png?height=100&width=100"

  // If it's already a full URL (S3)
  if (path.startsWith("http")) return path

  // If it's a base64 string
  if (path.startsWith("data:image")) return path

  // If it's a local path
  // Make sure it starts with a slash
  const localPath = path.startsWith("/") ? path : `/${path}`

  // For local paths, prepend the API base URL if it's not a placeholder
  if (!localPath.includes("placeholder")) {
    return `${api.defaults.baseURL}${localPath}`
  }

  return localPath
}

// Update StudentCard to be larger and show more details
const StudentCard = ({ student }) => {
  const [sortingApplications, setSortingApplications] = useState(false)

  const handleToggleStar = async (e, appId) => {
    e.stopPropagation()

    try {
      setSortingApplications(true)
      const response = await api.patch(`/api/applications/${appId}/toggle-star`)

      // Update the student's applications with the updated starred status
      const updatedApplications = student.applications.map((app) =>
        app._id === appId || app.id === appId ? { ...app, starred: response.data.starred } : app,
      )

      // Sort applications to show starred first
      const sortedApplications = [...updatedApplications].sort((a, b) => {
        if (a.starred && !b.starred) return -1
        if (!a.starred && b.starred) return 1
        return 0
      })

      // Update the student object with sorted applications
      student.applications = sortedApplications
    } catch (err) {
      console.error("Error toggling star status:", err)
    } finally {
      setSortingApplications(false)
    }
  }

  // Get avatar URL with proper handling for both S3 and local storage
  const avatarUrl = getImageUrl(student.avatar || (student.userId && student.userId.avatar))

  // Get advisor avatar URL
  const getAdvisorAvatar = (advisor) => {
    return getImageUrl(advisor?.avatar)
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow">
      <div className="p-5">
        <div className="flex flex-col sm:flex-row items-center sm:items-start">
          <img
            src={avatarUrl || "/placeholder.svg"}
            alt={student.name}
            className="w-24 h-24 rounded-full mb-4 sm:mb-0 sm:mr-5 object-cover"
            onError={(e) => {
              e.target.onerror = null
              e.target.src = "/placeholder.png?height=100&width=100"
            }}
          />
          <div className="text-center sm:text-left flex-1">
            <h3 className="text-xl font-bold mb-1">{student.name}</h3>
            <p className="text-gray-600 mb-1">
              {student.degree} in {student.major}
            </p>
            <p className="text-gray-500 mb-2">GPA: {student.gpa}/10</p>

            {/* Show advisor information - updated to show first advisor from the array */}
            {student.advisors && student.advisors.length > 0 && (
              <div className="flex items-center justify-center sm:justify-start mb-2">
                <span className="text-sm text-gray-600 mr-2">Advisor:</span>
                <div className="flex items-center">
                  <img
                    src={getAdvisorAvatar(student.advisors[0]) || "/placeholder.svg"}
                    alt={student.advisors[0].name}
                    className="w-5 h-5 rounded-full mr-1"
                    onError={(e) => {
                      e.target.onerror = null
                      e.target.src = "/placeholder.png?height=20&width=20"
                    }}
                  />
                  <span className="text-sm font-medium">{student.advisors[0].name}</span>
                  {student.advisors.length > 1 && (
                    <span className="text-xs text-gray-500 ml-1">+{student.advisors.length - 1} more</span>
                  )}
                </div>
              </div>
            )}

            {/* Contact information */}
            <div className="flex flex-wrap justify-center sm:justify-start gap-3 mb-2">
              {student.email && (
                <div className="flex items-center text-sm text-gray-600">
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    ></path>
                  </svg>
                  <span className="truncate max-w-[150px]">{student.email}</span>
                </div>
              )}
              {student.contact && (
                <div className="flex items-center text-sm text-gray-600">
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    ></path>
                  </svg>
                  <span>{student.contact}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-5 border-t pt-4">
          <h4 className="font-semibold mb-3">Applications</h4>
          {student.applications && student.applications.length > 0 ? (
            <ul className="space-y-3">
              {student.applications.slice(0, 3).map((app, index) => (
                <li key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded-md">
                  <div className="flex items-center">
                    <button
                      onClick={(e) => handleToggleStar(e, app._id || app.id)}
                      className="mr-2 text-gray-400 hover:text-yellow-500 focus:outline-none"
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
                          d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-.181h4.914a1 1 0 00.951-.69l1.519-4.674z"
                          className={app.starred ? "fill-current" : ""}
                        ></path>
                      </svg>
                    </button>
                    {app.countryCode && <span className="text-xl mr-2">{getCountryFlag(app.countryCode)}</span>}
                    <div>
                      <span className="font-medium">{app.university || app.name}</span>
                      {app.program && <p className="text-xs text-gray-500">{app.program}</p>}
                    </div>
                  </div>
                  <div className="flex items-center">
                    <span
                      className={`text-xs px-2 py-1 rounded-full mr-2 ${
                        app.status === "Approved"
                          ? "bg-green-100 text-green-800"
                          : app.status === "Rejected"
                            ? "bg-red-100 text-red-800"
                            : app.status === "Pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {app.status || "Pending"}
                    </span>
                    <Link
                      to={`/applications/${app.id || app._id}`}
                      className="text-gray-500 hover:text-gray-700"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                      </svg>
                    </Link>
                  </div>
                </li>
              ))}
              {student.applications.length > 3 && (
                <li className="text-sm text-gray-500 italic text-center">
                  +{student.applications.length - 3} more applications
                </li>
              )}
            </ul>
          ) : (
            <p className="text-sm text-gray-500 text-center py-2">No applications yet</p>
          )}
        </div>
      </div>

      <div className="bg-gray-50 px-5 py-3 flex justify-between">
        <Link
          to={`/student/${student._id}`}
          className="text-blue-600 hover:text-blue-800 font-medium flex items-center"
          onClick={(e) => e.stopPropagation()}
        >
          <svg
            className="w-4 h-4 mr-1"
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
          View Profile
        </Link>
        <div className="flex">
          <Link
            to={`/application-form/${student._id}`}
            className="text-green-600 hover:text-green-800 font-medium mr-4 flex items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <svg
              className="w-4 h-4 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
            </svg>
            New Application
          </Link>
        </div>
      </div>
    </div>
  )
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

export default StudentCard
