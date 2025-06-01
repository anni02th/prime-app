"use client"

import { useState, useEffect, useContext } from "react"
import { api } from "../services/api"
import { Link } from "react-router-dom"
import { AuthContext } from "../context/AuthContext"

const AvatarGallery = () => {
  const [avatars, setAvatars] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 1,
  })
  const { user } = useContext(AuthContext)
  const isAdmin = user?.role === "admin"

  // Helper function to get image URL
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

  const fetchAvatars = async (page = 1) => {
    setLoading(true)
    setError(null)

    try {
      const response = await api.get(`/api/avatars?page=${page}&limit=${pagination.limit}`)
      setAvatars(response.data.users)
      setPagination(response.data.pagination)
    } catch (err) {
      console.error("Error fetching avatars:", err)
      setError(err.response?.data?.message || "Failed to load avatars. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAvatars(pagination.page)
  }, [pagination.page])

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.pages) {
      setPagination((prev) => ({ ...prev, page: newPage }))
    }
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Avatar Gallery</h1>
        <div className="flex gap-2">
          <Link
            to="/avatar-search"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Search Avatars
          </Link>
          {isAdmin && (
            <Link
              to="/avatar-upload"
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              Upload Avatar
            </Link>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <svg
            className="animate-spin h-10 w-10 text-gray-500"
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
      ) : (
        <>
          {avatars.length === 0 ? (
            <div className="text-center py-10 text-gray-500">No avatars found</div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
              {avatars.map((user) => (
                <div
                  key={user._id}
                  className="flex flex-col items-center p-4 border rounded-lg hover:shadow-md transition-shadow"
                >
                  <Link to={`/profile/${user._id}`} className="block text-center">
                    <img
                      src={getImageUrl(user.avatar) || "/placeholder.svg"}
                      alt={user.name}
                      className="w-24 h-24 rounded-full object-cover mb-3"
                      onError={(e) => {
                        e.target.onerror = null
                        e.target.src = "/placeholder.png?height=120&width=120"
                      }}
                    />
                    <h3 className="font-medium text-lg truncate max-w-full" title={user.name}>
                      {user.name}
                    </h3>
                    <p className="text-gray-600 text-sm capitalize">{user.role}</p>
                    {user.avatarPath && (
                      <p className="text-xs text-gray-500 mt-1 truncate max-w-full" title={user.avatarPath}>
                        {user.avatarPath}
                      </p>
                    )}
                  </Link>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex justify-center mt-8">
              <nav className="flex items-center space-x-2">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="px-3 py-1 rounded border disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>

                {[...Array(pagination.pages)].map((_, index) => {
                  const pageNumber = index + 1
                  // Show first page, last page, current page, and pages around current page
                  if (
                    pageNumber === 1 ||
                    pageNumber === pagination.pages ||
                    (pageNumber >= pagination.page - 1 && pageNumber <= pagination.page + 1)
                  ) {
                    return (
                      <button
                        key={pageNumber}
                        onClick={() => handlePageChange(pageNumber)}
                        className={`px-3 py-1 rounded border ${
                          pagination.page === pageNumber ? "bg-blue-600 text-white" : "hover:bg-gray-100"
                        }`}
                      >
                        {pageNumber}
                      </button>
                    )
                  } else if (
                    (pageNumber === 2 && pagination.page > 3) ||
                    (pageNumber === pagination.pages - 1 && pagination.page < pagination.pages - 2)
                  ) {
                    return <span key={pageNumber}>...</span>
                  } else {
                    return null
                  }
                })}

                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.pages}
                  className="px-3 py-1 rounded border disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </nav>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default AvatarGallery
