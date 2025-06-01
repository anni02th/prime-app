"use client"

import { useState, useEffect, useContext } from "react"
import { api } from "../services/api"
import { useNavigate } from "react-router-dom"
import { AuthContext } from "../context/AuthContext"

const AvatarUpload = () => {
  const [users, setUsers] = useState([])
  const [selectedUser, setSelectedUser] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredUsers, setFilteredUsers] = useState([])
  const [selectedFile, setSelectedFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [loading, setLoading] = useState(false)
  const [userLoading, setUserLoading] = useState(true)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const navigate = useNavigate()
  const { user } = useContext(AuthContext)

  // Check if user is admin
  useEffect(() => {
    if (user?.role !== "admin") {
      navigate("/")
    }
  }, [user, navigate])

  // Fetch all users
  useEffect(() => {
    const fetchUsers = async () => {
      setUserLoading(true)
      try {
        const response = await api.get("/api/users")
        setUsers(response.data)
        setFilteredUsers(response.data)
      } catch (err) {
        console.error("Error fetching users:", err)
        setError("Failed to load users. Please try again.")
      } finally {
        setUserLoading(false)
      }
    }

    fetchUsers()
  }, [])

  // Filter users based on search query
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredUsers(users)
    } else {
      const filtered = users.filter((user) => user.name.toLowerCase().includes(searchQuery.toLowerCase()))
      setFilteredUsers(filtered)
    }
  }, [searchQuery, users])

  // Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setSelectedFile(file)

      // Create preview URL
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewUrl(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!selectedUser) {
      setError("Please select a user")
      return
    }

    if (!selectedFile) {
      setError("Please select an image file")
      return
    }

    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const formData = new FormData()
      formData.append("avatar", selectedFile)

      const response = await api.post(`/api/avatars/upload/${selectedUser}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })

      setSuccess(`Avatar successfully uploaded for ${response.data.name}`)
      setSelectedUser("")
      setSelectedFile(null)
      setPreviewUrl(null)

      // Reset file input
      const fileInput = document.getElementById("avatar-file")
      if (fileInput) {
        fileInput.value = ""
      }
    } catch (err) {
      console.error("Error uploading avatar:", err)
      setError(err.response?.data?.message || "Failed to upload avatar. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Upload Avatar for User</h1>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
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

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="search-user" className="block text-sm font-medium text-gray-700 mb-1">
              Search User
            </label>
            <input
              type="text"
              id="search-user"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Type to search users..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="select-user" className="block text-sm font-medium text-gray-700 mb-1">
              Select User
            </label>
            <select
              id="select-user"
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={userLoading}
            >
              <option value="">-- Select a user --</option>
              {filteredUsers.map((user) => (
                <option key={user._id} value={user._id}>
                  {user.name} ({user.role})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="avatar-file" className="block text-sm font-medium text-gray-700 mb-1">
              Upload Avatar Image
            </label>
            <input
              type="file"
              id="avatar-file"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="mt-1 text-sm text-gray-500">Accepted formats: JPG, PNG, GIF. Max size: 5MB.</p>
          </div>

          {previewUrl && (
            <div className="flex justify-center">
              <div className="relative">
                <img
                  src={previewUrl || "/placeholder.svg"}
                  alt="Avatar Preview"
                  className="w-32 h-32 rounded-full object-cover border-2 border-gray-300"
                />
                <button
                  type="button"
                  onClick={() => {
                    setSelectedFile(null)
                    setPreviewUrl(null)
                    const fileInput = document.getElementById("avatar-file")
                    if (fileInput) {
                      fileInput.value = ""
                    }
                  }}
                  className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                >
                  ×
                </button>
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => navigate("/avatar-gallery")}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !selectedUser || !selectedFile}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <svg
                  className="animate-spin h-5 w-5 text-white mx-auto"
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
              ) : (
                "Upload Avatar"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AvatarUpload
