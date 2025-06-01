"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { api } from "../services/api"
import { useAuth } from "../context/AuthContext"

const EditApplication = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { currentUser } = useAuth()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [application, setApplication] = useState(null)
  const [formData, setFormData] = useState({
    program: "",
    university: "",
    intake: "",
    year: "",
    countryCode: "",
  })

  useEffect(() => {
    const fetchApplication = async () => {
      try {
        const response = await api.get(`/api/applications/${id}`)
        setApplication(response.data)
        setFormData({
          program: response.data.program || "",
          university: response.data.university || "",
          intake: response.data.intake || "",
          year: response.data.year || new Date().getFullYear(),
          countryCode: response.data.countryCode || "",
        })
      } catch (err) {
        console.error("Error fetching application:", err)
        setError("Failed to load application. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchApplication()
  }, [id])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await api.put(`/api/applications/${id}`, formData)
      setSuccess("Application updated successfully!")
      setApplication(response.data)
    } catch (err) {
      console.error("Error updating application:", err)
      setError(err.response?.data?.message || "Failed to update application. Please try again.")
    } finally {
      setSubmitting(false)
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

  if (!application) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">Application not found.</span>
          <div className="mt-4">
            <button
              onClick={() => navigate("/student-application")}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Back to Applications
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Edit Application</h1>
        <button
          onClick={() => navigate("/student-application")}
          className="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-900 transition-colors"
        >
          Back to Applications
        </button>
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
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Application ID: {application.applicationId}</h2>
            <span
              className={`inline-block px-3 py-1 text-sm rounded-full ${
                application.status === "Approved"
                  ? "bg-green-100 text-green-800"
                  : application.status === "Rejected"
                    ? "bg-red-100 text-red-800"
                    : application.status === "Pending"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-blue-100 text-blue-800"
              }`}
            >
              {application.status}
            </span>
          </div>
          <p className="text-gray-600 mt-2">
            Status: <span className="font-medium">{application.status}</span>
          </p>
          <p className="text-gray-600">
            Date: <span className="font-medium">{new Date(application.date).toLocaleDateString()}</span>
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Program *</label>
              <input
                type="text"
                name="program"
                value={formData.program}
                onChange={handleChange}
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
          </div>

          <div className="mt-6">
            <button
              type="submit"
              disabled={submitting}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {submitting ? "Updating..." : "Update Application"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditApplication
