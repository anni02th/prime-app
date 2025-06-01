"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { api } from "../services/api"
import { useAuth } from "../context/AuthContext"

const ApplicationForm = () => {
  const { studentId } = useParams()
  const navigate = useNavigate()
  const { isAdminOrAdvisor } = useAuth()
  const [student, setStudent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [formData, setFormData] = useState({
    program: "",
    university: "",
    intake: "",
    year: new Date().getFullYear(),
    status: "Pending",
    notes: "",
    countryCode: "",
    portalName: "", // New field for portal name
    potalId: "", // New field for total ID
  })
  const [formError, setFormError] = useState(null)
  const [formSuccess, setFormSuccess] = useState(null)
  const [formLoading, setFormLoading] = useState(false)

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const response = await api.get(`/api/students/${studentId}`)
        setStudent(response.data)
      } catch (err) {
        console.error("Error fetching student:", err)
        setError("Failed to load student. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    if (studentId) {
      fetchStudent()
    } else {
      setError("Invalid student ID")
      setLoading(false)
    }
  }, [studentId])

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

    try {
      const applicationData = {
        ...formData,
        studentId,
        applicationId: `${Math.floor(Math.random() * 900000) + 100000}/${formData.year}`,
        date: new Date().toISOString(),
      }

      const response = await api.post("/api/applications", applicationData)
      setFormSuccess("Application created successfully!")

      // Reset form
      setFormData({
        program: "",
        university: "",
        intake: "",
        year: new Date().getFullYear(),
        status: "Pending",
        notes: "",
        countryCode: "",
        portalName: "",
        potalId: "",
      })

      // Redirect after successful submission
      setTimeout(() => {
        navigate(`/applications?student=${studentId}`)
      }, 2000)
    } catch (err) {
      console.error("Error creating application:", err)
      setFormError(err.response?.data?.message || "Failed to create application. Please try again.")
    } finally {
      setFormLoading(false)
    }
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
    { code: "JP", name: "Japan" },
    { code: "SG", name: "Singapore" },
    { code: "NL", name: "Netherlands" },
    { code: "SE", name: "Sweden" },
    { code: "CH", name: "Switzerland" },
    { code: "IE", name: "Ireland" },
  ]

  const intakes = ["Fall", "Spring", "Summer", "Winter"]

  const statuses = [
    "Pending",
    "In Progress",
    "Application Fee Pending",
    "Documents Pending",
    "Under Review",
    "Approved",
    "Rejected",
    "Waitlisted",
    "Deferred",
    "Withdrawn",
    "Completed",
  ]

  if (!isAdminOrAdvisor()) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Access Denied!</strong>
          <span className="block sm:inline"> You don't have permission to access this page.</span>
        </div>
      </div>
    )
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

  if (error && !student) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error!</strong>
        <span className="block sm:inline"> {error}</span>
        <div className="mt-4">
          <button
            onClick={() => navigate("/dashboard")}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">New Application for {student?.name}</h1>
        <button
          onClick={() => navigate(`/student/${studentId}`)}
          className="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-900 transition-colors"
        >
          Back to Student Profile
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Portal Name</label>
              <input
                type="text"
                name="portalName"
                value={formData.portalName}
                onChange={handleChange}
                placeholder="UAS"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Portal ID</label>
              <input
                type="text"
                name="potalId"
                value={formData.potalId}
                onChange={handleChange}
                placeholder="e.g. T12345678"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status *</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows="4"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Add any additional notes about this application..."
              ></textarea>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={() => navigate(`/student/${studentId}`)}
              className="px-4 py-2 border border-gray-300 rounded-md mr-2 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={formLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {formLoading ? "Creating..." : "Create Application"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ApplicationForm
