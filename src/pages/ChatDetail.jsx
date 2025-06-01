"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import { api } from "../services/api"
import { useAuth } from "../context/AuthContext"

const ChatDetail = () => {
  const { id } = useParams()
  const { currentUser } = useAuth()
  const [chat, setChat] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [users, setUsers] = useState([])
  const [selectedUsers, setSelectedUsers] = useState([])
  const [chatTitle, setChatTitle] = useState("")
  const messagesEndRef = useRef(null)
  const navigate = useNavigate()

  const isNewChat = id === "new"

  useEffect(() => {
    const fetchData = async () => {
      if (isNewChat) {
        // For new chat, fetch all users to select participants
        try {
          const usersResponse = await api.get("/api/users")
          // Filter out current user from the list
          setUsers(usersResponse.data.filter((user) => user._id !== currentUser.id))
        } catch (err) {
          console.error("Error fetching users:", err)
          setError("Failed to load users. Please try again later.")
        } finally {
          setLoading(false)
        }
        return
      }

      try {
        const chatResponse = await api.get(`/api/chats/${id}`)
        setChat(chatResponse.data)

        const messagesResponse = await api.get(`/api/chats/${id}/messages`)
        setMessages(messagesResponse.data)
      } catch (err) {
        console.error("Error fetching chat:", err)
        setError("Failed to load chat. Please try again later.")
        // Use mock data for demonstration if needed
        setChat(mockChat)
        setMessages(mockMessages)
      } finally {
        setLoading(false)
      }
    }

    fetchData()

    // Set up polling for new messages
    const interval = setInterval(() => {
      if (id && !isNewChat) {
        fetchNewMessages()
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [id, isNewChat, currentUser])

  const fetchNewMessages = async () => {
    if (!messages.length || isNewChat) return

    try {
      const lastMessageId = messages[messages.length - 1].id
      const response = await api.get(`/api/chats/${id}/messages?after=${lastMessageId}`)

      if (response.data.length > 0) {
        setMessages((prev) => [...prev, ...response.data])
      }
    } catch (err) {
      console.error("Error fetching new messages:", err)
    }
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleUserSelect = (userId) => {
    setSelectedUsers((prev) => {
      if (prev.includes(userId)) {
        return prev.filter((id) => id !== userId)
      } else {
        return [...prev, userId]
      }
    })
  }

  const handleCreateChat = async () => {
    if (selectedUsers.length === 0) {
      setError("Please select at least one user to chat with")
      return
    }

    try {
      const response = await api.post("/api/chats", {
        title: chatTitle || undefined,
        participantIds: selectedUsers,
      })

      navigate(`/chat/${response.data.id}`)
    } catch (err) {
      console.error("Error creating chat:", err)
      setError("Failed to create chat. Please try again.")
    }
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return

    // For new chat page, first create the chat
    if (isNewChat) {
      handleCreateChat()
      return
    }

    const messageData = {
      text: newMessage,
    }

    // Optimistically update UI
    const optimisticMessage = {
      id: `temp-${Date.now()}`,
      text: newMessage,
      sender: "user",
      senderName: currentUser?.name || "You",
      senderAvatar: currentUser?.avatar || "/placeholder.png?height=40&width=40",
      timestamp: new Date().toISOString(),
      pending: true,
    }

    setMessages((prev) => [...prev, optimisticMessage])
    setNewMessage("")

    try {
      const response = await api.post(`/api/chats/${id}/messages`, messageData)

      // Replace optimistic message with actual message from server
      setMessages((prev) => prev.map((msg) => (msg.id === optimisticMessage.id ? response.data : msg)))
    } catch (err) {
      console.error("Error sending message:", err)
      // Show error state for the optimistic message
      setMessages((prev) => prev.map((msg) => (msg.id === optimisticMessage.id ? { ...msg, error: true } : msg)))
    }
  }

  // Mock data for demonstration
  const mockChat = {
    id: 1,
    title: "Document Requirements",
    participants: [
      { id: 1, name: "Admin User", avatar: "/placeholder.png?height=40&width=40" },
      { id: 2, name: "John Doe", avatar: "/placeholder.png?height=40&width=40" },
    ],
    createdAt: "2023-06-15T10:30:00Z",
    updatedAt: "2023-06-15T10:36:00Z",
  }

  const mockMessages = [
    {
      id: 1,
      text: "Passport, Student Visa, University Acceptance Letter, Academic Transcripts, Letter of Recommendation (LOR), Statement of Purpose (SOP), IELTS/TOEFL Score Report, Bank Statement (Proof of Funds), Health Insurance, Police Clearance Certificate (PCC)",
      sender: "other",
      senderName: "Admin",
      senderAvatar: "/placeholder.png?height=40&width=40",
      timestamp: "2023-06-15T10:30:00Z",
    },
    {
      id: 2,
      text: "1. DOC.pdf\n2. DOC.pdf\n3. DOC.pdf\nSending rest in a few minutes.",
      sender: "user",
      senderName: "You",
      senderAvatar: "/placeholder.png?height=40&width=40",
      timestamp: "2023-06-15T10:35:00Z",
    },
    {
      id: 3,
      text: "Okay, waiting 👍",
      sender: "other",
      senderName: "Admin",
      senderAvatar: "/placeholder.png?height=40&width=40",
      timestamp: "2023-06-15T10:36:00Z",
    },
  ]

  // Function to get participant avatar
  const getParticipantAvatar = (participant) => {
    return participant?.avatar || "/placeholder.png?height=40&width=40"
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

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <Link to="/chat" className="mr-4 text-gray-500 hover:text-gray-700">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">{isNewChat ? "New Chat" : chat?.title || "Chat"}</h1>
        </div>
        {!isNewChat && chat?.participants && (
          <div className="flex items-center">
            {chat.participants.map((participant) => (
              <img
                key={participant.id || participant._id}
                src={getParticipantAvatar(participant) || "/placeholder.png"}
                alt={participant.name}
                title={participant.name}
                className="w-8 h-8 rounded-full border-2 border-white -ml-2 first:ml-0"
              />
            ))}
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md">
        {isNewChat ? (
          <div className="p-4">
            <h2 className="text-lg font-medium mb-4">Create a New Chat</h2>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Chat Title (Optional)</label>
              <input
                type="text"
                value={chatTitle}
                onChange={(e) => setChatTitle(e.target.value)}
                placeholder="Enter chat title"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Users to Chat With</label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mt-2">
                {users.map((user) => (
                  <div
                    key={user._id || user.id}
                    onClick={() => handleUserSelect(user._id || user.id)}
                    className={`flex items-center p-2 border rounded-md cursor-pointer ${
                      selectedUsers.includes(user._id || user.id)
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <img
                      src={user.avatar || "/placeholder.png?height=32&width=32"}
                      alt={user.name}
                      className="w-8 h-8 rounded-full mr-2"
                    />
                    <span className="text-sm truncate">{user.name}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleCreateChat}
                disabled={selectedUsers.length === 0}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                Create Chat
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="h-[calc(100vh-250px)] overflow-y-auto p-4">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                  <svg
                    className="w-16 h-16 mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    ></path>
                  </svg>
                  <p>No messages yet. Start the conversation!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                    >
                      {message.sender !== "user" && (
                        <div className="flex-shrink-0 mr-3">
                          <img
                            src={message.senderAvatar || "/placeholder.png?height=32&width=32"}
                            alt={message.senderName || "User"}
                            className="w-8 h-8 rounded-full"
                          />
                        </div>
                      )}

                      <div
                        className={`rounded-lg p-3 max-w-md ${
                          message.pending
                            ? "bg-gray-100 text-gray-600"
                            : message.error
                              ? "bg-red-100 text-red-800"
                              : message.sender === "user"
                                ? "bg-blue-100 text-gray-800"
                                : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {message.sender !== "user" && message.senderName && (
                          <div className="text-xs text-gray-500 mb-1">{message.senderName}</div>
                        )}
                        <p className="text-sm whitespace-pre-line">{message.text}</p>
                        {message.pending && <span className="text-xs text-gray-500 mt-1 block">Sending...</span>}
                        {message.error && (
                          <span className="text-xs text-red-600 mt-1 block">
                            Failed to send.
                            <button
                              className="ml-1 underline"
                              onClick={() => {
                                setNewMessage(message.text)
                                setMessages((prev) => prev.filter((m) => m.id !== message.id))
                              }}
                            >
                              Retry
                            </button>
                          </span>
                        )}
                      </div>

                      {message.sender === "user" && (
                        <div className="flex-shrink-0 ml-3">
                          <img
                            src={currentUser?.avatar || "/placeholder.png?height=32&width=32"}
                            alt="User"
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

            <div className="p-4 border-t">
              <div className="flex items-center">
                <button className="text-gray-500 hover:text-gray-700 mr-2">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                    ></path>
                  </svg>
                </button>
                <input
                  type="text"
                  placeholder="Type your message..."
                  className="flex-1 max-md:max-w-[70%] border border-gray-300 rounded-l-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                />
                <button
                  className="bg-blue-600 text-white px-4 py-2 rounded-r-md hover:bg-blue-700 transition-colors"
                  onClick={handleSendMessage}
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
                      d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                    ></path>
                  </svg>
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default ChatDetail
