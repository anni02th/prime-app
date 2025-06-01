"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../context/AuthContext"
import { api } from "../services/api"

const Profile = () => {
  const { currentUser, updateProfile, isAdminOrAdvisor } = useAuth()
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    role: "",
    avatar: "",
    phone: "",
    address: "",
    bio: "",
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [avatarFile, setAvatarFile] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState(null)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)

  // Add this helper function to the Profile component
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

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // First try to get profile from the API
        const response = await api.get("/api/users/profile")
        setProfile({
          ...response.data,
          avatar: response.data.avatar || "/placeholder.png?height=120&width=120",
        })
      } catch (err) {
        console.error("Error fetching profile:", err)
        setError("Failed to load profile. Please try again later.")

        // Use current user data as fallback
        if (currentUser) {
          setProfile({
            name: currentUser.name || "",
            email: currentUser.email || "",
            role: currentUser.role || "",
            avatar: currentUser.avatar || "/placeholder.png?height=120&width=120",
            phone: currentUser.phone || "",
            address: currentUser.address || "",
            bio: currentUser.bio || "",
          })
          setError(null) // Clear error if we have fallback data
        }
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [currentUser])

  const handleChange = (e) => {
    const { name, value } = e.target
    setProfile((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await api.put("/api/users/profile", profile)
      setProfile(response.data)

      // Also update the currentUser in AuthContext
      updateProfile(response.data)

      setSuccess("Profile updated successfully!")
      setIsEditing(false)
    } catch (err) {
      console.error("Error updating profile:", err)
      setError("Failed to update profile. Please try again later.")
    } finally {
      setLoading(false)
    }
  }

  const handleAvatarChange = (e) => {
    const file = e.target.files[0]
    if (!file) return

    // Preview the selected image
    const reader = new FileReader()
    reader.onloadend = () => {
      setAvatarPreview(reader.result)
    }
    reader.readAsDataURL(file)

    setAvatarFile(file)
  }

  const handleAvatarUpload = async () => {
    if (!avatarFile) return

    const formData = new FormData()
    formData.append("avatar", avatarFile)

    try {
      setUploadingAvatar(true)
      setError(null)

      const response = await api.post("/api/users/avatar", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })

      // Make sure we're using the correct avatar path from the response
      const avatarPath = response.data.avatar

      setProfile((prev) => ({
        ...prev,
        avatar: avatarPath,
      }))

      // Also update the currentUser in AuthContext
      updateProfile({ avatar: avatarPath })

      setSuccess("Avatar updated successfully!")
      setAvatarFile(null)
      setAvatarPreview(null)
    } catch (err) {
      console.error("Error updating avatar:", err)
      setError("Failed to update avatar. Please try again later.")
    } finally {
      setUploadingAvatar(false)
    }
  }

  const cancelAvatarUpload = () => {
    setAvatarFile(null)
    setAvatarPreview(null)
  }

  if (loading && !profile.name) {
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
        <h1 className="text-3xl font-bold text-gray-800">My Profile</h1>
        {isAdminOrAdvisor() && (
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-900 transition-colors flex items-center"
          >
            {isEditing ? "Cancel" : "Edit Profile"}
            {!isEditing && (
              <svg
                className="ml-2 w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                ></path>
              </svg>
            )}
          </button>
        )}
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

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col md:flex-row">
          <div className="md:w-1/3 flex flex-col items-center mb-6 md:mb-0">
            <div className="relative">
              <img
                src={getImageUrl(avatarPreview || profile.avatar)}
                alt={profile.name}
                className="w-40 h-40 rounded-full object-cover mb-4"
                onError={(e) => {
                  e.target.onerror = null
                  e.target.src = "/placeholder.png?height=120&width=120"
                }}
              />
              {isEditing && !avatarFile && (
                <label
                  htmlFor="avatar-upload"
                  className="absolute bottom-0 right-0 bg-gray-800 text-white p-2 rounded-full cursor-pointer hover:bg-gray-700 transition-colors"
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
                      d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                    ></path>
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                    ></path>
                  </svg>
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                </label>
              )}
            </div>
            <h2 className="text-2xl font-bold mt-4">{profile.name}</h2>
            <p className="text-gray-600 capitalize">{profile.role}</p>

            {avatarFile && (
              <div className="mt-4 flex flex-col items-center">
                <p className="text-sm text-gray-600 mb-2">Upload this new profile photo?</p>
                <div className="flex space-x-2">
                  <button
                    onClick={handleAvatarUpload}
                    disabled={uploadingAvatar}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {uploadingAvatar ? "Uploading..." : "Save"}
                  </button>
                  <button
                    onClick={cancelAvatarUpload}
                    disabled={uploadingAvatar}
                    className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {isEditing && !avatarFile && (
              <div className="mt-3 text-center">
                <p className="text-sm text-gray-600 mb-2">Upload a new profile photo</p>
                <label
                  htmlFor="avatar-upload-btn"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors cursor-pointer inline-block"
                >
                  Choose File
                  <input
                    id="avatar-upload-btn"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                </label>
              </div>
            )}
          </div>

          <div className="md:w-2/3 md:pl-8">
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="name"
                      value={profile.name}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="text-gray-800">{profile.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  {isEditing ? (
                    <input
                      type="email"
                      name="email"
                      value={profile.email}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="text-gray-800">{profile.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  {isEditing ? (
                    <input
                      type="tel"
                      name="phone"
                      value={profile.phone}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="text-gray-800">{profile.phone || "Not provided"}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <p className="text-gray-800 capitalize">{profile.role}</p>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="address"
                      value={profile.address}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="text-gray-800">{profile.address || "Not provided"}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                  {isEditing ? (
                    <textarea
                      name="bio"
                      value={profile.bio}
                      onChange={handleChange}
                      rows="4"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    ></textarea>
                  ) : (
                    <p className="text-gray-800">{profile.bio || "No bio provided"}</p>
                  )}
                </div>
              </div>

              {isEditing && (
                <div className="mt-6 flex justify-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {loading ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile
