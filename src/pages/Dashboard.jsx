"use client"

import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import StudentCard from "../components/StudentCard"
import { api } from "../services/api"
import { useAuth } from "../context/AuthContext"

const mockStudents = [
  {
    _id: "1",
    name: "John Doe",
    major: "Computer Science",
    applications: [
      {
        countryCode: "US",
        intake: "Fall - 2024",
        status: "Applied",
        createdAt: new Date(),
      },
    ],
  },
  {
    _id: "2",
    name: "Jane Smith",
    major: "Engineering",
    applications: [
      {
        countryCode: "CA",
        intake: "Winter - 2024",
        status: "Accepted",
        createdAt: new Date(),
      },
    ],
  },
]

const mockChats = [
  {
    _id: "1",
    messages: [{ sender: "user1", text: "Hello!" }],
  },
  {
    _id: "2",
    messages: [{ sender: "user2", text: "Hi there!" }],
  },
]

const Dashboard = () => {
  const { currentUser, isAdminOrAdvisor, isStudent } = useAuth()
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [chats, setChats] = useState([])
  const [loadingChats, setLoadingChats] = useState(true)
  const navigate = useNavigate()

  // Filter states
  const [dateFilter, setDateFilter] = useState("all")
  const [countryFilter, setCountryFilter] = useState("all")
  const [intakeFilter, setIntakeFilter] = useState("all")
  const [yearFilter, setYearFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")

  // Available filter options
  const [availableCountries, setAvailableCountries] = useState([])
  const [availableIntakes, setAvailableIntakes] = useState([])
  const [availableYears, setAvailableYears] = useState([])
  const [availableStatuses, setAvailableStatuses] = useState([])

  useEffect(() => {
    // Redirect students to the student dashboard
    if (isStudent()) {
      navigate("/student-dashboard")
      return
    }

    fetchData()
  }, [isStudent, navigate])

  // Update the fetchData function to handle advisors array
  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Admin/Advisor view - fetch all students
      // For advisors, this will only return students assigned to them
      const response = await api.get("/api/students")

      // For each student, fetch their applications
      const studentsWithApplications = await Promise.all(
        response.data.map(async (student) => {
          try {
            const appResponse = await api.get(`/api/students/${student._id}/applications`)
            // Sort applications to show starred first
            const sortedApplications = appResponse.data.sort((a, b) => {
              if (a.starred && !b.starred) return -1
              if (!a.starred && b.starred) return 1
              return 0
            })

            return {
              ...student,
              applications: sortedApplications,
              avatar: getImageUrl(student.avatar || (student.userId ? student.userId.avatar : null)),
            }
          } catch (err) {
            console.error(`Error fetching applications for student ${student._id}:`, err)
            return {
              ...student,
              applications: [],
              avatar: getImageUrl(student.avatar || (student.userId ? student.userId.avatar : null)),
            }
          }
        }),
      )

      setStudents(studentsWithApplications)

      // Extract filter options from data
      extractFilterOptions(studentsWithApplications)
    } catch (err) {
      console.error("Error fetching data:", err)
      setError("Failed to load data. Please try again later.")

      // Use mock data as fallback
      setStudents(mockStudents)
      extractFilterOptions(mockStudents)
    } finally {
      setLoading(false)
    }

    // Fetch chats for all users
    try {
      setLoadingChats(true)
      const chatsResponse = await api.get("/api/chats")
      setChats(chatsResponse.data)
    } catch (err) {
      console.error("Error fetching chats:", err)
      // Use mock data as fallback
      setChats(mockChats)
    } finally {
      setLoadingChats(false)
    }
  }

  // Extract filter options from student data
  const extractFilterOptions = (studentsData) => {
    const countries = new Set()
    const intakes = new Set()
    const years = new Set()
    const statuses = new Set()

    studentsData.forEach((student) => {
      if (student.applications && student.applications.length > 0) {
        student.applications.forEach((app) => {
          if (app.countryCode) countries.add(app.countryCode)

          // Extract intake and year
          if (app.intake) {
            intakes.add(app.intake.split(" - ")[0]) // e.g., "Fall" from "Fall - 2025"
            const year = app.intake.split(" - ")[1]
            if (year) years.add(year)
          }

          if (app.status) statuses.add(app.status)
        })
      }
    })

    setAvailableCountries(Array.from(countries))
    setAvailableIntakes(Array.from(intakes))
    setAvailableYears(Array.from(years))
    setAvailableStatuses(Array.from(statuses))
  }

  // Apply filters to students
  const applyFilters = (students) => {
    return students.filter((student) => {
      // If no applications, include only if no filters are applied
      if (!student.applications || student.applications.length === 0) {
        return countryFilter === "all" && intakeFilter === "all" && yearFilter === "all" && statusFilter === "all"
      }

      // Check if any application matches all filters
      return student.applications.some((app) => {
        // Country filter
        if (countryFilter !== "all" && app.countryCode !== countryFilter) {
          return false
        }

        // Intake filter (e.g., Fall, Spring)
        if (intakeFilter !== "all") {
          const appIntake = app.intake ? app.intake.split(" - ")[0] : ""
          if (appIntake !== intakeFilter) {
            return false
          }
        }

        // Year filter
        if (yearFilter !== "all") {
          const appYear = app.intake ? app.intake.split(" - ")[1] : ""
          if (appYear !== yearFilter) {
            return false
          }
        }

        // Status filter
        if (statusFilter !== "all" && app.status !== statusFilter) {
          return false
        }

        // Date filter
        if (dateFilter !== "all") {
          const appDate = new Date(app.createdAt || app.date)
          const now = new Date()

          if (dateFilter === "today") {
            // Check if date is today
            return appDate.toDateString() === now.toDateString()
          } else if (dateFilter === "thisWeek") {
            // Check if date is within the last 7 days
            const weekAgo = new Date(now)
            weekAgo.setDate(now.getDate() - 7)
            return appDate >= weekAgo
          } else if (dateFilter === "thisMonth") {
            // Check if date is within the current month
            return appDate.getMonth() === now.getMonth() && appDate.getFullYear() === now.getFullYear()
          }
        }

        // If we get here, the application passed all filters
        return true
      })
    })
  }

  // Filter students based on search term and other filters
  const filteredStudents = students.filter(
    (student) =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.major?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Apply additional filters
  const finalFilteredStudents = applyFilters(filteredStudents)

  const handleStudentClick = (studentId) => {
    navigate(`/student/${studentId}`)
  }

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

  // Add this helper function to the Dashboard component
  const getImageUrl = (path) => {
    if (!path) return "/placeholder.png?height=100&width=100"

    // If it's already a full URL (S3)
    if (path.startsWith("http")) return path

    // If it's a local path
    // Make sure it starts with a slash
    return path.startsWith("/") ? path : `/${path}`
  }

  // Render admin/advisor dashboard view
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Manage Students</h1>
        <div className="flex flex-wrap gap-2">
          <Link
            to="/register-student"
            className="px-3 py-1.5 sm:px-4 sm:py-2 text-sm bg-gray-700 text-white rounded-md hover:bg-gray-800 transition-colors flex items-center"
          >
            <span className="mr-1">+</span> Register Student
          </Link>
        </div>
      </div>

      {/* <TabNavigation tabs={tabs} /> */}

      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-3 md:space-y-0 md:space-x-4">
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
              placeholder="Search by keyword"
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full md:w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <select
              className="border border-gray-300 rounded-md px-2 py-1.5 text-sm bg-white"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            >
              <option value="all">All Dates</option>
              <option value="today">Today</option>
              <option value="thisWeek">This Week</option>
              <option value="thisMonth">This Month</option>
            </select>

            <select
              className="border border-gray-300 rounded-md px-2 py-1.5 text-sm bg-white"
              value={countryFilter}
              onChange={(e) => setCountryFilter(e.target.value)}
            >
              <option value="all">All Countries</option>
              {availableCountries.map((country) => (
                <option key={country} value={country}>
                  {getCountryFlag(country)} {country}
                </option>
              ))}
            </select>

            <select
              className="border border-gray-300 rounded-md px-2 py-1.5 text-sm bg-white"
              value={intakeFilter}
              onChange={(e) => setIntakeFilter(e.target.value)}
            >
              <option value="all">All Intakes</option>
              {availableIntakes.map((intake) => (
                <option key={intake} value={intake}>
                  {intake}
                </option>
              ))}
            </select>

            <select
              className="border border-gray-300 rounded-md px-2 py-1.5 text-sm bg-white"
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
            >
              <option value="all">All Years</option>
              {availableYears.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>

            <select
              className="border border-gray-300 rounded-md px-2 py-1.5 text-sm bg-white"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Statuses</option>
              {availableStatuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
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
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {finalFilteredStudents.length > 0 ? (
            finalFilteredStudents.map((student) => (
              <div key={student._id} onClick={() => handleStudentClick(student._id)}>
                <StudentCard student={student} />
              </div>
            ))
          ) : (
            <div className="col-span-3 text-center py-10">
              <p className="text-gray-500">No students match your filter criteria.</p>
              <button
                onClick={() => {
                  setSearchTerm("")
                  setDateFilter("all")
                  setCountryFilter("all")
                  setIntakeFilter("all")
                  setYearFilter("all")
                  setStatusFilter("all")
                }}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      )}
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

export default Dashboard
