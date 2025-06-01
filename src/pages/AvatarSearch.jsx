"use client"

import { useState, useEffect } from "react"
import { api } from "../services/api"
import { Link } from "react-router-dom"

const AvatarSearch = () => {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [selectedUser, setSelectedUser] = useState(null)

  // Helper function to get image URL (copied from Profile.jsx for consistency)
  const getImageUrl = (path) => {
    if (!path) return "/placeholder.png?height=120&width=120"

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

  const handleSearch = async () => {
    if (!searchQuery.trim()) return

    setLoading(true)
    setError(null)
    setSelectedUser(null)

    try {
      const response = await api.get(`/api/avatars/search?username=${encodeURIComponent(searchQuery)}`)
      setSearchResults(response.data)
    } catch (err) {
      console.error("Error searching avatars:", err)
      setError(err.response?.data?.message || "Failed to search avatars. Please try again.")
      setSearchResults([])
    } finally {
      setLoading(false)
    }
  }

  const handleViewUser = (user) => {
    setSelectedUser(user)
  }

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  useEffect(() => {
    // Reset selected user when search query changes
    setSelectedUser(null)
  }, [searchQuery])

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Avatar Search</h1>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
              Search by Username
            </label>
            <div className="flex">
              <input
                type="text"
                id="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter username to search..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleSearch}
                disabled={loading || !searchQuery.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <svg
                    className="animate-spin h-5 w-5 text-white"
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
                ) : (
                  "Search"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Search Results */}
        <div className={`bg-white rounded-lg shadow-md p-6 ${selectedUser ? "md:col-span-2" : "md:col-span-3"}`}>
          <h2 className="text-xl font-semibold mb-4">Search Results</h2>

          {loading && (
            <div className="flex justify-center items-center h-40">
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
          )}

          {!loading && searchResults.length === 0 && searchQuery && (
            <div className="text-center py-8 text-gray-500">No users found matching "{searchQuery}"</div>
          )}

          {!loading && searchResults.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {searchResults.map((user) => (
                <div
                  key={user._id}
                  className={`flex flex-col items-center p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer ${selectedUser?._id === user._id ? "bg-blue-50 border-blue-300" : ""}`}
                  onClick={() => handleViewUser(user)}
                >
                  <img
                    src={getImageUrl(user.avatar) || "/placeholder.svg"}
                    alt={user.name}
                    className="w-24 h-24 rounded-full object-cover mb-3"
                    onError={(e) => {
                      e.target.onerror = null
                      e.target.src = "/placeholder.png?height=120&width=120"
                    }}
                  />
                  <h3 className="font-medium text-lg text-center">{user.name}</h3>
                  <p className="text-gray-600 text-sm capitalize">{user.role}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Selected User Preview */}
        {selectedUser && (
          <div className="bg-white rounded-lg shadow-md p-6 md:col-span-1">
            <h2 className="text-xl font-semibold mb-4">User Preview</h2>
            <div className="flex flex-col items-center">
              <img
                src={getImageUrl(selectedUser.avatar) || "/placeholder.svg"}
                alt={selectedUser.name}
                className="w-40 h-40 rounded-full object-cover mb-4"
                onError={(e) => {
                  e.target.onerror = null
                  e.target.src = "/placeholder.png?height=120&width=120"
                }}
              />
              <h3 className="text-2xl font-bold mb-1">{selectedUser.name}</h3>
              <p className="text-gray-600 capitalize mb-4">{selectedUser.role}</p>

              <div className="mt-4 space-y-2 w-full">
                <Link
                  to={`/profile/${selectedUser._id}`}
                  className="block w-full px-4 py-2 bg-blue-600 text-white text-center rounded-md hover:bg-blue-700 transition-colors"
                >
                  View Profile
                </Link>

                <button
                  onClick={() => setSelectedUser(null)}
                  className="block w-full px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Close Preview
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AvatarSearch
