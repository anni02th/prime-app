const express = require("express")
const router = express.Router()
const Document = require("../models/Document")
const Student = require("../models/Student")
const { authenticateToken, isAdminOrAdvisor, isStudent } = require("../config/auth")
const mongoose = require("mongoose")
const upload = require("../config/upload") // Use the centralized upload configuration
const fs = require("fs")
const path = require("path")

// Get all documents (admin/advisor only)
router.get("/", authenticateToken, isAdminOrAdvisor, async (req, res) => {
  try {
    const documents = await Document.find().sort({ createdAt: -1 })
    res.json(documents)
  } catch (err) {
    console.error("Error fetching documents:", err)
    res.status(500).json({ message: err.message })
  }
})

// Get current student's documents
router.get("/my-documents", authenticateToken, async (req, res) => {
  try {
    console.log("User requesting documents:", req.user)

    // Check if user is a student
    if (req.user.role !== "student") {
      return res.status(403).json({ message: "Access denied: Only students can access their documents" })
    }

    // First try to get studentId from the user object
    let studentId = req.user.studentId

    // If studentId is not available, try to find the student profile by userId
    if (!studentId) {
      console.log("StudentId not found in user object, searching by userId:", req.user.id)
      const student = await Student.findOne({ userId: req.user.id })

      if (student) {
        studentId = student._id.toString()
        console.log("Found student profile with ID:", studentId)
      } else {
        console.log("No student profile found for user ID:", req.user.id)
        return res.status(404).json({ message: "Student profile not found" })
      }
    }

    console.log("Fetching documents for student ID:", studentId)

    const documents = await Document.find({ studentId: studentId }).sort({ createdAt: -1 })
    console.log("Found documents:", documents.length)

    res.json(documents)
  } catch (err) {
    console.error("Error fetching student documents:", err)
    res.status(500).json({ message: err.message })
  }
})

// Get a specific document
router.get("/:id", authenticateToken, async (req, res) => {
  try {
    // Validate if id is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid document ID format" })
    }

    const document = await Document.findById(req.params.id)

    if (!document) {
      return res.status(404).json({ message: "Document not found" })
    }

    // Check if user has permission to access this document
    if (req.user.role === "student") {
      // Get student ID either from user object or by finding student profile
      let studentId = req.user.studentId

      if (!studentId) {
        const student = await Student.findOne({ userId: req.user.id })
        if (student) {
          studentId = student._id.toString()
        }
      }

      if (!studentId || document.studentId.toString() !== studentId) {
        return res.status(403).json({ message: "Access denied: You don't have permission to view this document" })
      }
    }

    res.json(document)
  } catch (err) {
    console.error("Error fetching document:", err)
    res.status(500).json({ message: err.message })
  }
})

// Download a document
router.get("/:id/download", authenticateToken, async (req, res) => {
  try {
    // Validate if id is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid document ID format" })
    }

    const document = await Document.findById(req.params.id)

    if (!document) {
      return res.status(404).json({ message: "Document not found" })
    }

    // Check if user has permission to access this document
    if (req.user.role === "student") {
      // Get student ID either from user object or by finding student profile
      let studentId = req.user.studentId

      if (!studentId) {
        const student = await Student.findOne({ userId: req.user.id })
        if (student) {
          studentId = student._id.toString()
        }
      }

      if (!studentId || document.studentId.toString() !== studentId) {
        return res.status(403).json({ message: "Access denied: You don't have permission to download this document" })
      }
    }

    // Check if the path is an S3 URL
    if (document.path.startsWith("http")) {
      // For S3 URLs, redirect to the file
      return res.redirect(document.path)
    } else {
      // For local files, stream them as before
      const fs = require("fs")
      const path = require("path")

      // Check if file exists
      if (!document.path || !fs.existsSync(document.path)) {
        return res.status(404).json({ message: "File not found on server" })
      }

      // Set appropriate content type based on file extension
      const ext = path.extname(document.path).toLowerCase()
      let contentType = "application/octet-stream"

      if (ext === ".pdf") contentType = "application/pdf"
      else if (ext === ".doc" || ext === ".docx") contentType = "application/msword"
      else if (ext === ".xls" || ext === ".xlsx") contentType = "application/vnd.ms-excel"
      else if (ext === ".jpg" || ext === ".jpeg") contentType = "image/jpeg"
      else if (ext === ".png") contentType = "image/png"

      // Force download by setting Content-Disposition to attachment
      res.setHeader("Content-Type", contentType)
      res.setHeader("Content-Disposition", `attachment; filename="${document.name}"`)

      // Stream the file to the response
      const fileStream = fs.createReadStream(document.path)
      fileStream.pipe(res)
    }
  } catch (err) {
    console.error("Error downloading document:", err)
    res.status(500).json({ message: err.message })
  }
})

// View a document (opens in browser)
router.get("/:id/view", authenticateToken, async (req, res) => {
  try {
    // Validate if id is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid document ID format" })
    }

    const document = await Document.findById(req.params.id)

    if (!document) {
      return res.status(404).json({ message: "Document not found" })
    }

    // Check if user has permission to access this document
    if (req.user.role === "student") {
      // Get student ID either from user object or by finding student profile
      let studentId = req.user.studentId

      if (!studentId) {
        const student = await Student.findOne({ userId: req.user.id })
        if (student) {
          studentId = student._id.toString()
        }
      }

      if (!studentId || document.studentId.toString() !== studentId) {
        return res.status(403).json({ message: "Access denied: You don't have permission to view this document" })
      }
    }

    // Check if the path is an S3 URL
    if (document.path.startsWith("http")) {
      // For S3 URLs, redirect to the file
      return res.redirect(document.path)
    } else {
      // For local files, stream them as before
      const fs = require("fs")
      const path = require("path")

      // Check if file exists
      if (!document.path || !fs.existsSync(document.path)) {
        return res.status(404).json({ message: "File not found on server" })
      }

      // Set appropriate content type based on file extension
      const ext = path.extname(document.path).toLowerCase()
      let contentType = "application/octet-stream"

      if (ext === ".pdf") contentType = "application/pdf"
      else if (ext === ".doc" || ext === ".docx") contentType = "application/msword"
      else if (ext === ".xls" || ext === ".xlsx") contentType = "application/vnd.ms-excel"
      else if (ext === ".jpg" || ext === ".jpeg") contentType = "image/jpeg"
      else if (ext === ".png") contentType = "image/png"

      // Set for inline viewing in browser
      res.setHeader("Content-Type", contentType)
      res.setHeader("Content-Disposition", `inline; filename="${document.name}"`)

      // Stream the file to the response
      const fileStream = fs.createReadStream(document.path)
      fileStream.pipe(res)
    }
  } catch (err) {
    console.error("Error viewing document:", err)
    res.status(500).json({ message: err.message })
  }
})

// Update the upload route to handle S3 paths
// Upload a document
router.post("/upload", authenticateToken, upload.single("file"), async (req, res) => {
  try {
    console.log("Upload request from user:", req.user)
    console.log("Upload file:", req.file ? req.file.originalname : "No file")
    console.log("Upload body:", req.body)

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" })
    }

    let studentId

    // If the user is a student, use their own studentId
    if (req.user.role === "student") {
      studentId = req.user.studentId

      // If studentId is not available, try to find the student profile
      if (!studentId) {
        console.log("StudentId not found in user object, searching by userId:", req.user.id)
        const student = await Student.findOne({ userId: req.user.id })

        if (student) {
          studentId = student._id.toString()
          console.log("Found student profile with ID:", studentId)
        } else {
          return res.status(404).json({ message: "Student profile not found" })
        }
      }
    }
    // If admin/advisor is uploading for a student, they must provide studentId
    else if (["admin", "advisor"].includes(req.user.role)) {
      if (!req.body.studentId || !mongoose.Types.ObjectId.isValid(req.body.studentId)) {
        return res.status(400).json({ message: "Invalid or missing studentId" })
      }
      studentId = req.body.studentId
    } else {
      return res.status(403).json({ message: "Unauthorized to upload documents" })
    }

    console.log("Creating document for student ID:", studentId)

    // Get the file path - for S3 it will be the Location property
    const filePath = req.file.location || req.file.path.replace(/\\/g, "/")

    // Create new document record
    const document = new Document({
      name: req.file.originalname,
      path: filePath,
      type: req.body.type || req.file.originalname.split(".").pop(),
      studentId: studentId,
      uploadedBy: req.user.id,
    })

    const savedDocument = await document.save()
    console.log("Document saved:", savedDocument)

    res.status(201).json(savedDocument)
  } catch (err) {
    console.error("Error uploading document:", err)
    res.status(400).json({ message: err.message })
  }
})

// Delete a document
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    // Validate if id is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid document ID format" })
    }

    const document = await Document.findById(req.params.id)

    if (!document) {
      return res.status(404).json({ message: "Document not found" })
    }

    // Check if user has permission to delete this document
    if (req.user.role === "student") {
      // Get student ID either from user object or by finding student profile
      let studentId = req.user.studentId

      if (!studentId) {
        const student = await Student.findOne({ userId: req.user.id })
        if (student) {
          studentId = student._id.toString()
        }
      }

      if (!studentId || document.studentId.toString() !== studentId) {
        return res.status(403).json({ message: "Access denied: You don't have permission to delete this document" })
      }
    }

    // If it's an S3 URL, we don't need to delete the file as it's managed by S3 lifecycle policies
    // If it's a local file, delete it
    if (!document.path.startsWith("http")) {
      const fs = require("fs")
      if (document.path && fs.existsSync(document.path)) {
        fs.unlinkSync(document.path)
      }
    }

    // Delete the document record
    await Document.findByIdAndDelete(req.params.id)

    res.json({ message: "Document deleted successfully" })
  } catch (err) {
    console.error("Error deleting document:", err)
    res.status(500).json({ message: err.message })
  }
})

// Get documents for a student
router.get("/student/:studentId", authenticateToken, async (req, res) => {
  try {
    // Validate if studentId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.params.studentId)) {
      return res.status(400).json({ message: "Invalid student ID format" })
    }

    // Check if user has permission to access these documents
    if (req.user.role === "student") {
      // Get student ID either from user object or by finding student profile
      let studentId = req.user.studentId

      if (!studentId) {
        const student = await Student.findOne({ userId: req.user.id })
        if (student) {
          studentId = student._id.toString()
        }
      }

      if (!studentId || req.params.studentId !== studentId) {
        return res.status(403).json({ message: "Access denied: You don't have permission to view these documents" })
      }
    }

    const documents = await Document.find({ studentId: req.params.studentId }).sort({ createdAt: -1 })
    res.json(documents)
  } catch (err) {
    console.error("Error fetching student documents:", err)
    res.status(500).json({ message: err.message })
  }
})

module.exports = router
