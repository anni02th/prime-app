"use client"

import { useState, useEffect } from "react"
import { api } from "../services/api"
import { useAuth } from "../context/AuthContext"

const ManageUsers = () => {
  const { isAdmin } = useAuth()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showAddUserForm, setShowAddUserForm] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "student",
    phone: "",
    address: "",
    avatar: "", // Added for image URL
  })
  const [formError, setFormError] = useState(null)
  const [formSuccess, setFormSuccess] = useState(null)
  const [formLoading, setFormLoading] = useState(false)

  const [editingUser, setEditingUser] = useState(null)
  const [editFormData, setEditFormData] = useState({
    name: "",
    email: "",
    role: "",
    phone: "",
    address: "",
    avatar: "",
  })

  // Add these state variables inside the ManageUsers component
  const [students, setStudents] = useState([])
  const [advisors, setAdvisors] = useState([])
  const [loadingStudents, setLoadingStudents] = useState(true)
  const [loadingAdvisors, setLoadingAdvisors] = useState(true)
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [selectedAdvisor, setSelectedAdvisor] = useState("")
  const [assigningAdvisor, setAssigningAdvisor] = useState(false)
  const [assignmentSuccess, setAssignmentSuccess] = useState(null)
  const [assignmentError, setAssignmentError] = useState(null)

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await api.get("/api/users")
        setUsers(response.data)
      } catch (err) {
        console.error("Error fetching users:", err)
        setError("Failed to load users. Please try again later.")
        // Use mock data for demonstration
        setUsers(mockUsers)
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [])

  // Add this useEffect to fetch students and advisors
  useEffect(() => {
    const fetchStudentsAndAdvisors = async () => {
      try {
        setLoadingStudents(true)
        setLoadingAdvisors(true)

        // Fetch students
        const studentsResponse = await api.get("/api/students")
        setStudents(studentsResponse.data)

        // Fetch advisors (users with role 'advisor')
        const usersResponse = await api.get("/api/users?role=advisor")
        setAdvisors(usersResponse.data)
      } catch (err) {
        console.error("Error fetching data:", err)
      } finally {
        setLoadingStudents(false)
        setLoadingAdvisors(false)
      }
    }

    fetchStudentsAndAdvisors()
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormLoading(true)
    setFormError(null)
    setFormSuccess(null)

    // Validate form
    if (formData.password !== formData.confirmPassword) {
      setFormError("Passwords do not match")
      setFormLoading(false)
      return
    }

    try {
      const response = await api.post("/api/users", formData)
      setUsers([...users, response.data])
      setFormSuccess("User created successfully!")

      // Reset form
      setFormData({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: "student",
        phone: "",
        address: "",
        avatar: "",
      })

      // Close form after successful submission
      setTimeout(() => {
        setShowAddUserForm(false)
        setFormSuccess(null)
      }, 2000)
    } catch (err) {
      console.error("Error creating user:", err)
      setFormError(err.response?.data?.message || "Failed to create user. Please try again.")
    } finally {
      setFormLoading(false)
    }
  }

  const handleEdit = (user) => {
    setEditingUser(user)
    setEditFormData({
      name: user.name || "",
      email: user.email || "",
      role: user.role || "student",
      phone: user.phone || "",
      address: user.address || "",
      avatar: user.avatar || "",
    })
  }

  const handleSaveEdit = async (e) => {
    e.preventDefault()
    setFormLoading(true)
    setFormError(null)
    setFormSuccess(null)

    try {
      const response = await api.put(`/api/users/${editingUser._id}`, editFormData)

      // Update the users list with the edited user
      setUsers(users.map((user) => (user._id === editingUser._id ? response.data : user)))

      setFormSuccess("User updated successfully!")

      // Reset editing state
      setTimeout(() => {
        setEditingUser(null)
        setFormSuccess(null)
      }, 2000)
    } catch (err) {
      console.error("Error updating user:", err)
      setFormError(err.response?.data?.message || "Failed to update user. Please try again.")
    } finally {
      setFormLoading(false)
    }
  }

  const handleEditChange = (e) => {
    const { name, value } = e.target
    setEditFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) {
      return
    }

    try {
      await api.delete(`/api/users/${userId}`)
      setUsers(users.filter((user) => user._id !== userId))
    } catch (err) {
      console.error("Error deleting user:", err)
      alert("Failed to delete user. Please try again.")
    }
  }

  // Update the advisor assignment section to handle multiple advisors
  const handleAssignAdvisor = async () => {
    if (!selectedStudent || !selectedAdvisor) {
      setAssignmentError("Please select both a student and an advisor")
      return
    }

    setAssigningAdvisor(true)
    setAssignmentError(null)
    setAssignmentSuccess(null)

    try {
      // Check if the advisor is already assigned to the student
      const isAlreadyAssigned =
        selectedStudent.advisors && selectedStudent.advisors.some((advisor) => advisor._id === selectedAdvisor)

      if (isAlreadyAssigned) {
        setAssignmentError("This advisor is already assigned to the student")
        setAssigningAdvisor(false)
        return
      }

      const response = await api.patch(`/api/students/${selectedStudent._id}/advisors`, {
        action: "add",
        advisorId: selectedAdvisor,
      })

      // Update the students list
      setStudents(students.map((student) => (student._id === selectedStudent._id ? response.data : student)))

      setAssignmentSuccess("Advisor assigned successfully!")

      // Reset selection
      setSelectedAdvisor("")
      // Don't reset the student selection to allow adding multiple advisors

      // Clear success message after 3 seconds
      setTimeout(() => {
        setAssignmentSuccess(null)
      }, 3000)
    } catch (err) {
      console.error("Error assigning advisor:", err)
      setAssignmentError(err.response?.data?.message || "Failed to assign advisor. Please try again.")
    } finally {
      setAssigningAdvisor(false)
    }
  }

  // Add this function after handleAssignAdvisor
  const handleRemoveAdvisor = async (studentId, advisorId) => {
    if (!window.confirm("Are you sure you want to remove this advisor from the student?")) {
      return
    }

    try {
      const response = await api.patch(`/api/students/${studentId}/advisors`, {
        action: "remove",
        advisorId: advisorId,
      })

      // Update the students list
      setStudents(students.map((student) => (student._id === studentId ? response.data : student)))

      // If this is the currently selected student, update it
      if (selectedStudent && selectedStudent._id === studentId) {
        setSelectedStudent(response.data)
      }

      setAssignmentSuccess("Advisor removed successfully!")

      // Clear success message after 3 seconds
      setTimeout(() => {
        setAssignmentSuccess(null)
      }, 3000)
    } catch (err) {
      console.error("Error removing advisor:", err)
      setAssignmentError(err.response?.data?.message || "Failed to remove advisor. Please try again.")
    }
  }

  // Mock data for demonstration
  const mockUsers = [
    {
      _id: 1,
      name: "Admin User",
      email: "admin@primestudy.com",
      role: "admin",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      _id: 2,
      name: "Advisor Smith",
      email: "advisor@primestudy.com",
      role: "advisor",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      _id: 3,
      name: "John Student",
      email: "student@primestudy.com",
      role: "student",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      _id: 4,
      name: "Jane Student",
      email: "jane@primestudy.com",
      role: "student",
      avatar: "/placeholder.svg?height=40&width=40",
    },
  ]

  if (!isAdmin()) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Access Denied!</strong>
          <span className="block sm:inline"> You don't have permission to access this page.</span>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Manage Users</h1>
        <button
          onClick={() => setShowAddUserForm(!showAddUserForm)}
          className="px-3 py-1.5 sm:px-4 sm:py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
        >
          <svg
            className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
          </svg>
          {showAddUserForm ? "Cancel" : "Add New User"}
        </button>
      </div>

      {showAddUserForm && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Add New User</h2>

          {formError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
              <span className="block sm:inline">{formError}</span>
            </div>
          )}

          {formSuccess && (
            <div
              className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4"
              role="alert"
            >
              <span className="block sm:inline">{formSuccess}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password *</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="student">Student</option>
                  <option value="advisor">Advisor</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Profile Image Upload</label>
                <input
                  type="file"
                  name="avatarFile"
                  accept="image/*"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="mt-1 text-xs text-gray-500">Upload an image for the user's profile picture</p>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setShowAddUserForm(false)}
                className="px-4 py-2 border border-gray-300 rounded-md mr-2 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={formLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {formLoading ? "Creating..." : "Create User"}
              </button>
            </div>
          </form>
        </div>
      )}

      {editingUser && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Edit User: {editingUser.name}</h2>

          {formError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
              <span className="block sm:inline">{formError}</span>
            </div>
          )}

          {formSuccess && (
            <div
              className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4"
              role="alert"
            >
              <span className="block sm:inline">{formSuccess}</span>
            </div>
          )}

          <form onSubmit={handleSaveEdit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  name="name"
                  value={editFormData.name}
                  onChange={handleEditChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  name="email"
                  value={editFormData.email}
                  onChange={handleEditChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
                <select
                  name="role"
                  value={editFormData.role}
                  onChange={handleEditChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="student">Student</option>
                  <option value="advisor">Advisor</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={editFormData.phone}
                  onChange={handleEditChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <input
                  type="text"
                  name="address"
                  value={editFormData.address}
                  onChange={handleEditChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Profile Image Upload</label>
                <input
                  type="file"
                  name="avatarFile"
                  accept="image/*"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="mt-1 text-xs text-gray-500">Upload a new profile picture</p>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="px-4 py-2 border border-gray-300 rounded-md mr-2 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={formLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {formLoading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 table-fixed sm:table-auto">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/3 sm:w-auto"
                >
                  User
                </th>
                <th
                  scope="col"
                  className="hidden sm:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Email
                </th>
                <th
                  scope="col"
                  className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Role
                </th>
                <th
                  scope="col"
                  className="hidden sm:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Phone
                </th>
                <th
                  scope="col"
                  className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center">
                    <svg
                      className="animate-spin h-6 w-6 text-gray-500 mx-auto"
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
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="5" className="px-6 py-4">
                    <div
                      className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
                      role="alert"
                    >
                      <strong className="font-bold">Error!</strong>
                      <span className="block sm:inline"> {error}</span>
                    </div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                    No users found
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user._id}>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8 sm:h-10 sm:w-10">
                          <img
                            className="h-8 w-8 sm:h-10 sm:w-10 rounded-full object-cover"
                            src={user.avatar || "/placeholder.svg?height=40&width=40"}
                            alt=""
                            onError={(e) => {
                              e.target.onerror = null
                              e.target.src = "/placeholder.svg?height=40&width=40"
                            }}
                          />
                        </div>
                        <div className="ml-3 sm:ml-4">
                          <div className="text-xs sm:text-sm font-medium text-gray-900">{user.name}</div>
                          <div className="sm:hidden text-xs text-gray-500 truncate max-w-[100px]">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 truncate max-w-[150px]">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.role === "admin"
                            ? "bg-red-100 text-red-800"
                            : user.role === "advisor"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-green-100 text-green-800"
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{user.phone || "N/A"}</div>
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm font-medium">
                      <button onClick={() => handleEdit(user)} className="text-indigo-600 hover:text-indigo-900 mr-3">
                        Edit
                      </button>
                      <button onClick={() => handleDeleteUser(user._id)} className="text-red-600 hover:text-red-900">
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      {isAdmin() && (
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">Assign Advisors to Students</h2>

          {assignmentError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
              <span className="block sm:inline">{assignmentError}</span>
            </div>
          )}

          {assignmentSuccess && (
            <div
              className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4"
              role="alert"
            >
              <span className="block sm:inline">{assignmentSuccess}</span>
            </div>
          )}

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Student</label>
                {loadingStudents ? (
                  <div className="flex items-center">
                    <svg
                      className="animate-spin h-5 w-5 mr-3 text-gray-500"
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
                    <span>Loading students...</span>
                  </div>
                ) : (
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={selectedStudent ? selectedStudent._id : ""}
                    onChange={(e) => {
                      const student = students.find((s) => s._id === e.target.value)
                      setSelectedStudent(student || null)
                    }}
                  >
                    <option value="">Select a student</option>
                    {students.map((student) => (
                      <option key={student._id} value={student._id}>
                        {student.name} ({student.email})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Advisor</label>
                {loadingAdvisors ? (
                  <div className="flex items-center">
                    <svg
                      className="animate-spin h-5 w-5 mr-3 text-gray-500"
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
                    <span>Loading advisors...</span>
                  </div>
                ) : (
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={selectedAdvisor}
                    onChange={(e) => setSelectedAdvisor(e.target.value)}
                  >
                    <option value="">Select an advisor</option>
                    {advisors.map((advisor) => (
                      <option key={advisor._id} value={advisor._id}>
                        {advisor.name} ({advisor.email})
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            {selectedStudent && (
              <div className="mt-4 p-4 bg-gray-50 rounded-md">
                <h3 className="font-medium mb-2">Student Information</h3>
                <div className="flex items-center mb-2">
                  <img
                    src={
                      selectedStudent.avatar || selectedStudent.userId?.avatar || "/placeholder.svg?height=40&width=40"
                    }
                    alt={selectedStudent.name}
                    className="w-10 h-10 rounded-full mr-3 object-cover"
                    onError={(e) => {
                      e.target.onerror = null
                      e.target.src = "/placeholder.svg?height=40&width=40"
                    }}
                  />
                  <div>
                    <p className="font-medium">{selectedStudent.name}</p>
                    <p className="text-sm text-gray-600">{selectedStudent.email}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <p>
                    <span className="font-medium">Degree:</span> {selectedStudent.degree || "N/A"}
                  </p>
                  <p>
                    <span className="font-medium">Major:</span> {selectedStudent.major || "N/A"}
                  </p>
                  <div className="col-span-2">
                    <span className="font-medium">Current Advisors:</span>
                    {selectedStudent.advisors && selectedStudent.advisors.length > 0 ? (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {selectedStudent.advisors.map((advisor) => (
                          <div key={advisor._id} className="flex items-center bg-blue-50 px-2 py-1 rounded-md">
                            <img
                              src={advisor.avatar || "/placeholder.svg?height=20&width=20"}
                              alt={advisor.name}
                              className="w-5 h-5 rounded-full mr-1 object-cover"
                              onError={(e) => {
                                e.target.onerror = null
                                e.target.src = "/placeholder.svg?height=20&width=20"
                              }}
                            />
                            <span className="text-xs mr-1">{advisor.name}</span>
                            <button
                              onClick={() => handleRemoveAdvisor(selectedStudent._id, advisor._id)}
                              className="text-red-500 hover:text-red-700 ml-1"
                              title="Remove advisor"
                            >
                              <svg
                                className="w-3 h-3"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                  clipRule="evenodd"
                                ></path>
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="ml-2 text-gray-500">None</span>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="mt-6 flex justify-end">
              <button
                onClick={handleAssignAdvisor}
                disabled={!selectedStudent || !selectedAdvisor || assigningAdvisor}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {assigningAdvisor ? "Assigning..." : "Add Advisor to Student"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ManageUsers
