"use client"

import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { api } from "../services/api"

const ChatList = () => {
  const [chats, setChats] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const navigate = useNavigate()

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        // Fetch all users for the quick chat section
        try {
          const usersResponse = await api.get("/api/users")
          setUsers(usersResponse.data)
        } catch (userErr) {
          console.error("Error fetching users:", userErr)
          // Continue with empty users array
        }

        // Then fetch chats
        try {
          const chatsResponse = await api.get("/api/chats")
          setChats(chatsResponse.data)
        } catch (chatErr) {
          console.error("Error fetching chats:", chatErr)
          setError("Failed to load chats. Please try again later.")
          // Use mock data for demonstration
          setChats(mockChats)
        }
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Filter chats based on search term
  const filteredChats = chats.filter(
    (chat) =>
      chat.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      chat.lastMessage?.text?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      chat.participants.some((p) => p.name?.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  // Handle starting a new chat with a specific user
  const handleStartChat = async (userId) => {
    try {
      // Create a new chat or get existing chat with this user
      const response = await api.post("/api/chats", {
        participantIds: [userId],
      })

      // Navigate to the chat detail page
      navigate(`/chat/${response.data.id}`)
    } catch (err) {
      console.error("Error creating chat:", err)
      alert("Failed to start chat. Please try again.")
    }
  }

  // Mock data for demonstration
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
    {
      id: 2,
      title: "Application Status",
      participants: [
        { id: 1, name: "Admin User", avatar: "/placeholder.png?height=40&width=40" },
        { id: 3, name: "Jane Smith", avatar: "/placeholder.png?height=40&width=40" },
      ],
      lastMessage: {
        text: "Your application has been approved!",
        sender: "advisor",
        timestamp: "2023-06-14T15:20:00Z",
      },
      unreadCount: 2,
    },
    {
      id: 3,
      title: "Visa Interview Preparation",
      participants: [
        { id: 1, name: "Admin User", avatar: "/placeholder.png?height=40&width=40" },
        { id: 4, name: "Mike Johnson", avatar: "/placeholder.png?height=40&width=40" },
      ],
      lastMessage: {
        text: "I have scheduled a mock interview for tomorrow at 10 AM.",
        sender: "advisor",
        timestamp: "2023-06-13T09:45:00Z",
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

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Chats</h1>
      </div>

      {/* User circles section for quick chat access */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <h2 className="text-lg font-medium text-gray-700 mb-3">Quick Chat</h2>
        <div className="flex space-x-4 overflow-x-auto pb-2">
          {loading ? (
            Array(5)
              .fill(0)
              .map((_, i) => (
                <div key={i} className="flex-shrink-0 w-16 animate-pulse">
                  <div className="w-12 h-12 bg-gray-300 rounded-full mx-auto"></div>
                  <div className="h-3 bg-gray-300 rounded mt-2 mx-auto w-10"></div>
                </div>
              ))
          ) : users.length === 0 ? (
            <p className="text-gray-500">No users available for chat</p>
          ) : (
            users.map((user) => (
              <div
                key={user._id || user.id}
                className="flex-shrink-0 w-16 flex flex-col items-center cursor-pointer"
                onClick={() => handleStartChat(user._id || user.id)}
              >
                <div className="relative">
                  <img
                    src={user.avatar || "/placeholder.png?height=48&width=48"}
                    alt={user.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                  />
                  <span
                    className={`absolute bottom-0 right-0 h-3 w-3 rounded-full ${
                      Math.random() > 0.5 ? "bg-green-500" : "bg-gray-300"
                    } border-2 border-white`}
                  ></span>
                </div>
                <span className="text-xs font-medium text-gray-700 mt-1 truncate w-full text-center">{user.name}</span>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search chats..."
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-lg shadow-md">
          {Array(3)
            .fill(0)
            .map((_, i) => (
              <div key={i} className="p-4 border-b last:border-b-0 animate-pulse">
                <div className="flex items-start">
                  <div className="flex-shrink-0 mr-4">
                    <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-baseline">
                      <div className="h-5 bg-gray-300 rounded w-1/3"></div>
                      <div className="h-4 bg-gray-300 rounded w-16"></div>
                    </div>
                    <div className="h-4 bg-gray-300 rounded w-2/3 mt-2"></div>
                  </div>
                </div>
              </div>
            ))}
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      ) : filteredChats.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
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
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            ></path>
          </svg>
          <h2 className="text-xl font-bold text-gray-700 mb-2">No chats found</h2>
          <p className="text-gray-500">Start a new conversation or try a different search term.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {filteredChats.map((chat) => (
            <Link
              key={chat.id}
              to={`/chat/${chat.id}`}
              className="block border-b last:border-b-0 hover:bg-gray-50 transition-colors"
            >
              <div className="p-4 flex items-start">
                <div className="flex-shrink-0 mr-4 relative">
                  {chat.participants && chat.participants.length > 0 ? (
                    <div className="relative">
                      <img
                        src={chat.participants[0]?.avatar || "/placeholder.png?height=48&width=48"}
                        alt={chat.participants[0]?.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      {chat.participants.length > 1 && (
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-xs font-medium border-2 border-white">
                          +{chat.participants.length - 1}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gray-300"></div>
                  )}
                  {chat.unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                      {chat.unreadCount}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline">
                    <h3 className="text-lg font-medium text-gray-900 truncate">{chat.title}</h3>
                    <span className="text-sm text-gray-500">{formatTimestamp(chat.lastMessage?.timestamp)}</span>
                  </div>
                  <p
                    className={`text-sm truncate ${chat.unreadCount > 0 ? "font-semibold text-gray-900" : "text-gray-500"}`}
                  >
                    {chat.lastMessage?.sender === "user" ? "You: " : ""}
                    {chat.lastMessage?.text || "No messages yet"}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

export default ChatList
