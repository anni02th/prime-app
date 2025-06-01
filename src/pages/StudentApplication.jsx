"use client"

import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { api } from "../services/api"
import { useAuth } from "../context/AuthContext"
import TabNavigation from "../components/TabNavigation"

const StudentApplication = () => {
  const navigate = useNavigate()
  const { currentUser } = useAuth()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [student, setStudent] = useState(null)
  const [applications, setApplications] = useState([])
  const [formData, setFormData] = useState({
    program: "",
    university: "",
    intake: "",
    year: new Date().getFullYear(),
    countryCode: "",
  })
  const [selectedApplicationId, setSelectedApplicationId] = useState(null)
  const [applicationChat, setApplicationChat] = useState(null)
  const [loadingChat, setLoadingChat] = useState(false)
  const [comment, setComment] = useState("")
  const [sendingMessage, setSendingMessage] = useState(false)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get student profile
        const studentResponse = await api.get("/api/students/profile")
        setStudent(studentResponse.data)

        // Get student applications
        const applicationsResponse = await api.get(`/api/students/${studentResponse.data._id}/applications`)
        setApplications(applicationsResponse.data)

        // Set the first application as selected by default
        if (applicationsResponse.data.length > 0) {
          setSelectedApplicationId(applicationsResponse.data[0]._id)
        }
      } catch (err) {
        console.error("Error fetching data:", err)
        setError("Failed to load your profile. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  useEffect(() => {
    if (selectedApplicationId) {
      fetchApplicationChat(selectedApplicationId)
    }
  }, [selectedApplicationId])

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

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (applications.length >= 5) {
      setError("You can only apply to a maximum of 5 universities.")
      return
    }

    setSubmitting(true)
    setError(null)
    setSuccess(null)

    try {
      const applicationData = {
        ...formData,
        studentId: student._id,
        applicationId: `${Math.floor(Math.random() * 900000) + 100000}/${formData.year}`,
        date: new Date().toISOString(),
        status: "Pending",
      }

      const response = await api.post("/api/applications", applicationData)
      setSuccess("Application submitted successfully!")

      // Add the new application to the list
      setApplications([...applications, response.data])

      // Select the new application
      setSelectedApplicationId(response.data._id)

      // Reset form
      setFormData({
        program: "",
        university: "",
        intake: "",
        year: new Date().getFullYear(),
        countryCode: "",
      })
    } catch (err) {
      console.error("Error submitting application:", err)
      setError(err.response?.data?.message || "Failed to submit application. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

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
  }

  const countries = [
    { code: "US", name: "United States" },
    { code: "GB", name: "United Kingdom" },
    { code: "CA", name: "Canada" },
    { code: "AU", name: "Australia" },
    { code: "NZ", name: "New Zealand" },
    { code: "DE", name: "Germany" },
    { code: "FR", name: "France" },
    { code: "IT", name: "Italy" },
    { code: "ES", name: "Spain" },
    { code: "UAE", name: "Dubai" },
    { code: "JP", name: "Japan" },
    { code: "SG", name: "Singapore" },
    { code: "NL", name: "Netherlands" },
    { code: "SE", name: "Sweden" },
    { code: "CH", name: "Switzerland" },
    { code: "IE", name: "Ireland" },
  ]

  const intakes = ["Fall", "Spring", "Summer", "Winter"]

  // Mock messages for demonstration
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
    {
      _id: "msg2",
      sender: {
        _id: "student1",
        name: "John Student",
        role: "student",
        avatar: "/placeholder.png?height=40&width=40",
      },
      senderName: "John Student",
      senderRole: "student",
      text: "Thank you! Do I need to submit any additional documents?",
      timestamp: new Date(Date.now() - 43200000).toISOString(), // 12 hours ago
      read: true,
    },
    {
      _id: "msg3",
      sender: {
        _id: "advisor1",
        name: "Advisor Smith",
        role: "advisor",
        avatar: "/placeholder.png?height=40&width=40",
      },
      senderName: "Advisor Smith",
      senderRole: "advisor",
      text: "Yes, please upload your updated statement of purpose and the financial documents we discussed.",
      timestamp: new Date(Date.now() - 21600000).toISOString(), // 6 hours ago
      read: false,
    },
  ]

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

  if (loading) {
    return (
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

  // Get the selected application
  const selectedApplication = applications.find((app) => app._id === selectedApplicationId)

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">University Applications</h1>
        <button
          onClick={() => navigate("/dashboard")}
          className="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-900 transition-colors"
        >
          Back to Dashboard
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {success && (
        <div
          className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4"
          role="alert"
        >
          <span className="block sm:inline">{success}</span>
        </div>
      )}

      <TabNavigation tabs={studentTabs} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">Your Applications ({applications.length}/5)</h2>

            {applications.length === 0 ? (
              <p className="text-gray-500">You haven't applied to any universities yet.</p>
            ) : (
              <div className="space-y-4">
                {applications.map((app) => (
                  <div
                    key={app._id}
                    className={`border rounded-lg p-4 cursor-pointer ${app._id === selectedApplicationId ? "border-blue-500 bg-blue-50" : ""}`}
                    onClick={() => handleSelectApplication(app._id)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <span className="text-2xl mr-2">{getCountryFlag(app.countryCode)}</span>
                        <h3 className="font-bold">{app.university}</h3>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">{app.program}</p>
                    <p className="text-sm text-gray-500">
                      {app.intake} {app.year}
                    </p>
                    <div className="mt-2">
                      <span
                        className={`inline-block px-2 py-1 text-xs rounded-full ${
                          app.status === "Approved"
                            ? "bg-green-100 text-green-800"
                            : app.status === "Rejected"
                              ? "bg-red-100 text-red-800"
                              : app.status === "Pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {app.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="md:col-span-2">
          {selectedApplication ? (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-4">{selectedApplication.university}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Program:</span> {selectedApplication.program}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Intake:</span> {selectedApplication.intake} {selectedApplication.year}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Application ID:</span> {selectedApplication.applicationId}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Status:</span> {selectedApplication.status}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Date Applied:</span>{" "}
                    {new Date(selectedApplication.date).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Application Chat */}
              <div className="border-t pt-4">
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
                                ? "bg-purple-100 text-gray-800"
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
                <div className="flex items-center">
                  <input
                    type="text"
                    placeholder="Write a message..."
                    className="flex-1 border border-gray-300 rounded-l-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSendComment()}
                  />
                  <button
                    className="bg-gray-800 text-white px-4 py-2 rounded-r-md hover:bg-gray-900 transition-colors disabled:opacity-50"
                    onClick={handleSendComment}
                    disabled={sendingMessage || !comment.trim()}
                  >
                    {sendingMessage ? "Sending..." : "Send"}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-4">Apply to a University</h2>

              {applications.length >= 5 ? (
                <div
                  className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative mb-4"
                  role="alert"
                >
                  <span className="block sm:inline">You have reached the maximum limit of 5 applications.</span>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Program *</label>
                      <input
                        type="text"
                        name="program"
                        value={formData.program}
                        onChange={handleChange}
                        placeholder="e.g. M.S. in Computer Science"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">University *</label>
                      <input
                        type="text"
                        name="university"
                        value={formData.university}
                        onChange={handleChange}
                        placeholder="e.g. Stanford University"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Country *</label>
                      <select
                        name="countryCode"
                        value={formData.countryCode}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select Country</option>
                        {countries.map((country) => (
                          <option key={country.code} value={country.code}>
                            {country.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Intake *</label>
                      <div className="grid grid-cols-2 gap-4">
                        <select
                          name="intake"
                          value={formData.intake}
                          onChange={handleChange}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Select Intake</option>
                          {intakes.map((intake) => (
                            <option key={intake} value={intake}>
                              {intake}
                            </option>
                          ))}
                        </select>
                        <select
                          name="year"
                          value={formData.year}
                          onChange={handleChange}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Select Year</option>
                          {[...Array(5)].map((_, i) => {
                            const year = new Date().getFullYear() + i
                            return (
                              <option key={year} value={year}>
                                {year}
                              </option>
                            )
                          })}
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6">
                    <button
                      type="submit"
                      disabled={submitting || applications.length >= 5}
                      className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                      {submitting ? "Submitting..." : "Submit Application"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default StudentApplication
