"use client"

import { useState, useEffect } from "react"
import { api } from "../services/api"
import { useAuth } from "../context/AuthContext"

const MyDocuments = () => {
  const { currentUser } = useAuth()
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [uploadLoading, setUploadLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedFile, setSelectedFile] = useState(null)
  const [documentType, setDocumentType] = useState("")
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(null)

  useEffect(() => {
    fetchDocuments()
  }, [])

  const fetchDocuments = async () => {
    try {
      setLoading(true)
      const response = await api.get("/api/documents/my-documents")
      setDocuments(response.data)
      setError(null)
    } catch (err) {
      console.error("Error fetching documents:", err)
      setError("Failed to load documents. Please try again later.")
    } finally {
      setLoading(false)
    }
  }

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0])
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

      await api.post("/api/documents/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })

      setUploadSuccess(true)
      setSelectedFile(null)
      setDocumentType("")

      // Refresh document list
      fetchDocuments()

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

  const handleDownloadDocument = async (doc) => {
    try {
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
    } catch (err) {
      console.error("Error downloading document:", err)
      alert("Failed to download document. Please try again later.")
    }
  }

  const handleViewDocument = async (doc) => {
    try {
      window.open(`${api.defaults.baseURL}/api/documents/${doc._id}/view`, "_blank")
    } catch (err) {
      console.error("Error viewing document:", err)
      alert("Failed to view document. Please try again later.")
    }
  }

  // Filter documents based on search term
  const filteredDocuments = documents.filter((doc) => doc.name.toLowerCase().includes(searchTerm.toLowerCase()))

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">My Documents</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Upload Form */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">Upload Document</h2>

            <form onSubmit={handleUpload}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Select File</label>
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Document Type (Optional)</label>
                <select
                  value={documentType}
                  onChange={(e) => setDocumentType(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="">Select Type</option>
                  <option value="transcript">Transcript</option>
                  <option value="certificate">Certificate</option>
                  <option value="letter">Recommendation Letter</option>
                  <option value="statement">Statement of Purpose</option>
                  <option value="financial">Financial Document</option>
                  <option value="identification">Identification</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={uploadLoading || !selectedFile}
                className={`w-full px-4 py-2 text-white rounded-md ${
                  uploadLoading || !selectedFile ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
                } transition-colors`}
              >
                {uploadLoading ? "Uploading..." : "Upload Document"}
              </button>

              {uploadSuccess && (
                <div className="mt-3 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
                  Document uploaded successfully!
                </div>
              )}

              {error && (
                <div className="mt-3 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                  {error}
                </div>
              )}
            </form>
          </div>
        </div>

        {/* Document List */}
        <div className="md:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">My Documents</h2>

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
                  placeholder="Search documents..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md"
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
            ) : filteredDocuments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {searchTerm ? "No documents match your search." : "No documents found. Upload your first document!"}
              </div>
            ) : (
              <div className="space-y-2">
                {filteredDocuments.map((doc) => (
                  <div key={doc._id} className="flex items-center p-3 border rounded-md hover:bg-gray-50">
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
                    <div className="flex-1">
                      <p className="font-medium">{doc.name}</p>
                      <p className="text-sm text-gray-500">Uploaded: {new Date(doc.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleViewDocument(doc)}
                        className="text-gray-500 hover:text-gray-700"
                        title="View document"
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
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          ></path>
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          ></path>
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDownloadDocument(doc)}
                        className="text-gray-500 hover:text-gray-700"
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
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default MyDocuments
