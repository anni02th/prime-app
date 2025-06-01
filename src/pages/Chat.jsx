"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { chatApi } from "../services/api"

const Chat = () => {
  const [chats, setChats] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const response = await chatApi.getAll()
        setChats(response.data)
      } catch (err) {
        console.error("Error fetching chats:", err)
        setError("Failed to load chats. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchChats()
  }, [])

  // Filter chats based on search term
  const filteredChats = chats.filter(
    (chat) =>
      chat.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      chat.lastMessage?.text.toLowerCase().includes(searchTerm.toLowerCase()),
  )

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

  const handleCreateChat = async () => {
    try {
      // In a real app, you would show a form to select participants and enter a title
      const response = await chatApi.create({
        title: "New Chat",
        participants: [], // Add other participants here
      })

      // Navigate to the new chat
      window.location.href = `/chat/${response.data._id}`
    } catch (err) {
      console.error("Error creating chat:", err)
      alert("Failed to create chat. Please try again later.")
    }
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Chats</h1>
        <button
          onClick={handleCreateChat}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
        >
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
          </svg>
          New Chat
        </button>
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
              key={chat._id}
              to={`/chat/${chat._id}`}
              className="block border-b last:border-b-0 hover:bg-gray-50 transition-colors"
            >
              <div className="p-4 flex items-start">
                <div className="flex-shrink-0 mr-4 relative">
                  {chat.participants.slice(0, 1).map((participant) => (
                    <img
                      key={participant._id}
                      src={participant.avatar || "/placeholder.png?height=40&width=40"}
                      alt={participant.name}
                      className="w-12 h-12 rounded-full"
                    />
                  ))}
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

export default Chat
