"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "react-router-dom"
import TabNavigation from "../components/TabNavigation"
import { api } from "../services/api"
import { useAuth } from "../context/AuthContext"

const Documents = () => {
  const [searchParams] = useSearchParams()
  const studentId = searchParams.get("student")
  const { isAdminOrAdvisor } = useAuth()

  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")

  const [selectedFile, setSelectedFile] = useState(null)
  const [documentType, setDocumentType] = useState("")
  const [uploadLoading, setUploadLoading] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(null)

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        setLoading(true)
        let response

        if (studentId) {
          // If studentId is provided, fetch documents for that student
          response = await api.get(`/api/documents/student/${studentId}`)
        } else {
          // Otherwise fetch all documents (for admin/advisor) or user's documents (for student)
          response = await api.get("/api/documents")
        }

        setDocuments(response.data)
        setError(null)
      } catch (err) {
        console.error("Error fetching documents:", err)
        setError("Failed to load documents. Please try again later.")
        // Use mock data for demonstration
        setDocuments(mockDocuments)
      } finally {
        setLoading(false)
      }
    }

    fetchDocuments()
  }, [studentId])

  const tabs = [
    {
      label: "Student Profile",
      path: studentId ? `/student/${studentId}` : "/dashboard",
      icon: (
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
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          ></path>
        </svg>
      ),
    },
    {
      label: "Application",
      path: studentId ? `/applications?student=${studentId}` : "/applications",
      icon: (
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
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          ></path>
        </svg>
      ),
    },
    {
      label: "Documents",
      path: studentId ? `/documents?student=${studentId}` : "/documents",
      icon: (
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
            d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"
          ></path>
        </svg>
      ),
    },
  ]

  // Filter documents based on search term
  const filteredDocuments = documents.filter((doc) => doc.name.toLowerCase().includes(searchTerm.toLowerCase()))

  // Mock data for demonstration
  const mockDocuments = [{ _id: "1", name: "Empty Template", type: "pdf", icon: "document" }]

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const maxSizeInMB = 5
      const maxSizeInBytes = maxSizeInMB * 1024 * 1024

      if (file.size > maxSizeInBytes) {
        alert(`File size exceeds ${maxSizeInMB}MB limit. Please upload a smaller file.`)
        e.target.value = null // Reset the file input
        return
      }

      setSelectedFile(file)
    }
  }

  const handleUpload = async (e) => {
    e.preventDefault()

    if (!selectedFile) {
      alert("Please select a file to upload")
      return
    }

    try {
      setUploadLoading(true)
      setError(null)

      const formData = new FormData()
      formData.append("file", selectedFile)
      formData.append("type", documentType || selectedFile.type.split("/")[1])

      // If we're viewing a specific student's documents, include their ID
      if (studentId) {
        formData.append("studentId", studentId)
      }

      await api.post("/api/documents/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })

      setUploadSuccess(true)
      setSelectedFile(null)
      setDocumentType("")

      // Refresh document list
      const response = studentId
        ? await api.get(`/api/documents/student/${studentId}`)
        : await api.get("/api/documents")

      setDocuments(response.data)

      // Reset success message after 3 seconds
      setTimeout(() => {
        setUploadSuccess(false)
      }, 3000)
    } catch (err) {
      console.error("Error uploading document:", err)
      setError("Failed to upload document. Please try again.")
    } finally {
      setUploadLoading(false)
    }
  }

  const handleDownloadDocument = async (doc) => {
    try {
      if (doc._id) {
        // Create a direct download link
        const response = await api.get(`/api/documents/${doc._id}/download`, {
          responseType: "blob",
        })

        // Create a blob URL for the file
        const blob = new Blob([response.data])
        const url = window.URL.createObjectURL(blob)

        // Create a temporary link element
        const link = document.createElement("a")
        link.href = url
        link.setAttribute("download", doc.name)

        // Append to body, click, and clean up
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)

        // Release the blob URL
        setTimeout(() => {
          window.URL.revokeObjectURL(url)
        }, 100)
      } else {
        // For mock documents, create a dummy download
        alert(`Downloading ${doc.name}...`)
      }
    } catch (err) {
      console.error("Error downloading document:", err)
      alert("Failed to download document. Please try again later.")
    }
  }

  const handleDeleteDocument = async (id) => {
    if (!window.confirm("Are you sure you want to delete this document?")) {
      return
    }

    try {
      setDeleteLoading(id)
      await api.delete(`/api/documents/${id}`)
      // Remove document from state
      setDocuments(documents.filter((doc) => doc._id !== id))
    } catch (err) {
      console.error("Error deleting document:", err)
      alert("Failed to delete document. Please try again.")
    } finally {
      setDeleteLoading(null)
    }
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Documents</h1>
        <button className="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-900 transition-colors flex items-center">
          Edit{" "}
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
        </button>
      </div>

      <TabNavigation tabs={tabs} />

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="mb-6">
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
              placeholder="Find..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {isAdminOrAdvisor() && (
          <div className="mb-6 bg-gray-50 p-4 rounded-md border">
            <h3 className="text-lg font-medium mb-3">
              {studentId ? "Upload Document for Student" : "Upload Document"}
            </h3>

            <form onSubmit={handleUpload} className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Select File</label>
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-gray-800 file:text-white hover:file:bg-gray-100 hover:file:text-gray-800"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Document Type</label>
                <select
                  value={documentType}
                  onChange={(e) => setDocumentType(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
                >
                  <option value="">Select Type</option>
                  <option value="Passport">Passport</option>
                  <option value="Transcript">Transcript</option>
                  <option value="Degree Certificate">Degree Certificate</option>
                  <option value="Letter of Recommendation">Letter of Recommendation</option>
                  <option value="Statement of Purpose">Statement of Purpose</option>
                  <option value="CV/Resume">CV/Resume</option>
                  <option value="IELTS/TOEFL Score">IELTS/TOEFL Score</option>
                  <option value="Bank Statement">Bank Statement</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="md:col-span-3 flex items-center">
                <button
                  type="submit"
                  disabled={uploadLoading || !selectedFile}
                  className={`px-4 py-2 text-white rounded-md ${
                    uploadLoading || !selectedFile ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
                  } transition-colors`}
                >
                  {uploadLoading ? "Uploading..." : "Upload Document"}
                </button>

                {uploadSuccess && <span className="ml-3 text-green-600">Document uploaded successfully!</span>}
              </div>
            </form>
          </div>
        )}

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
          <div className="space-y-4">
            {(filteredDocuments.length > 0 ? filteredDocuments : mockDocuments).map((doc) => (
              <div key={doc._id} className="flex items-center p-3 border-b hover:bg-gray-50">
                <div className="mr-3">
                  <svg
                    className="w-6 h-6 text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    ></path>
                  </svg>
                </div>
                <span className="flex-1">{doc.name}</span>

                <button
                  onClick={() => handleDownloadDocument(doc)}
                  className="text-gray-500 hover:text-gray-700 mr-2"
                  title="Download document"
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
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                    ></path>
                  </svg>
                </button>
                <button
                  onClick={() => handleDeleteDocument(doc._id)}
                  disabled={deleteLoading === doc._id}
                  className="text-red-500 hover:text-red-700 disabled:opacity-50"
                  title="Delete document"
                >
                  {deleteLoading === doc._id ? (
                    <svg
                      className="animate-spin w-5 h-5"
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
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      ></path>
                    </svg>
                  )}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Documents
