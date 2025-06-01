const express = require("express")
const router = express.Router()
const Avatar = require("../models/Avatar")
const User = require("../models/User")
const auth = require("../config/auth")
const upload = require("../config/upload")
const path = require("path")
const fs = require("fs")

// Get all avatars (paginated)
router.get("/", async (req, res) => {
  try {
    const page = Number.parseInt(req.query.page) || 1
    const limit = Number.parseInt(req.query.limit) || 20
    const skip = (page - 1) * limit

    // Get users with avatars
    const users = await User.find({ avatar: { $exists: true, $ne: null } })
      .select("_id name avatar role")
      .skip(skip)
      .limit(limit)
      .sort({ name: 1 })

    // Get total count for pagination
    const total = await User.countDocuments({ avatar: { $exists: true, $ne: null } })

    return res.json({
      users: users.map((user) => ({
        _id: user._id,
        name: user.name,
        role: user.role,
        avatar: user.avatar || "/placeholder.png?height=120&width=120",
        avatarPath: user.avatar,
      })),
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching avatars:", error)
    return res.status(500).json({ message: "Server error while fetching avatars" })
  }
})

// Get avatars by username search
router.get("/search", async (req, res) => {
  try {
    const { username } = req.query

    if (!username) {
      return res.status(400).json({ message: "Username query parameter is required" })
    }

    // Find users that match the username pattern
    const users = await User.find({
      name: { $regex: username, $options: "i" },
    }).select("_id name avatar role")

    if (!users.length) {
      return res.status(404).json({ message: "No users found matching that username" })
    }

    // Format the response
    const formattedUsers = users.map((user) => ({
      _id: user._id,
      name: user.name,
      role: user.role,
      avatar: user.avatar || "/placeholder.png?height=120&width=120",
      avatarPath: user.avatar,
    }))

    return res.json(formattedUsers)
  } catch (error) {
    console.error("Error searching avatars:", error)
    return res.status(500).json({ message: "Server error while searching avatars" })
  }
})

// Get single avatar by user ID
router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params

    const user = await User.findById(userId).select("name avatar role")

    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    return res.json({
      _id: user._id,
      name: user.name,
      role: user.role,
      avatar: user.avatar || "/placeholder.png?height=120&width=120",
      avatarPath: user.avatar,
    })
  } catch (error) {
    console.error("Error fetching avatar:", error)
    return res.status(500).json({ message: "Server error while fetching avatar" })
  }
})

// Upload a new avatar (protected route)
router.post("/upload", auth.authenticate, upload.single("avatar"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" })
    }

    const avatarPath = `/uploads/avatars/${req.file.filename}`

    // Update user's avatar
    const user = await User.findByIdAndUpdate(req.user._id, { avatar: avatarPath }, { new: true }).select(
      "_id name avatar role",
    )

    // Create/update avatar record
    const avatarData = {
      userId: req.user._id,
      username: user.name,
      avatarUrl: avatarPath,
      originalFilename: req.file.originalname,
      contentType: req.file.mimetype,
      size: req.file.size,
      isActive: true,
    }

    // Check if avatar already exists for this user
    let avatar = await Avatar.findOne({ userId: req.user._id })

    if (avatar) {
      // Update existing avatar record
      avatar = await Avatar.findByIdAndUpdate(avatar._id, avatarData, { new: true })
    } else {
      // Create new avatar record
      avatar = await Avatar.create(avatarData)
    }

    return res.json({
      _id: user._id,
      name: user.name,
      role: user.role,
      avatar: user.avatar,
      avatarPath: user.avatar,
    })
  } catch (error) {
    console.error("Error uploading avatar:", error)
    return res.status(500).json({ message: "Server error while uploading avatar" })
  }
})

// Upload avatar for another user (admin only)
router.post("/upload/:userId", auth.authenticate, auth.authorizeAdmin, upload.single("avatar"), async (req, res) => {
  try {
    const { userId } = req.params

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" })
    }

    // Check if user exists
    const targetUser = await User.findById(userId)
    if (!targetUser) {
      return res.status(404).json({ message: "User not found" })
    }

    const avatarPath = `/uploads/avatars/${req.file.filename}`

    // Update user's avatar
    const user = await User.findByIdAndUpdate(userId, { avatar: avatarPath }, { new: true }).select(
      "_id name avatar role",
    )

    // Create/update avatar record
    const avatarData = {
      userId: user._id,
      username: user.name,
      avatarUrl: avatarPath,
      originalFilename: req.file.originalname,
      contentType: req.file.mimetype,
      size: req.file.size,
      isActive: true,
      uploadedBy: req.user._id,
    }

    // Check if avatar already exists for this user
    let avatar = await Avatar.findOne({ userId: user._id })

    if (avatar) {
      // Update existing avatar record
      avatar = await Avatar.findByIdAndUpdate(avatar._id, avatarData, { new: true })
    } else {
      // Create new avatar record
      avatar = await Avatar.create(avatarData)
    }

    return res.json({
      _id: user._id,
      name: user.name,
      role: user.role,
      avatar: user.avatar,
      avatarPath: user.avatar,
    })
  } catch (error) {
    console.error("Error uploading avatar for user:", error)
    return res.status(500).json({ message: "Server error while uploading avatar" })
  }
})

// Delete avatar (protected route)
router.delete("/", auth.authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)

    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    // If user has a custom avatar (not the default placeholder)
    if (user.avatar && !user.avatar.includes("placeholder")) {
      // Remove the file from storage
      const filePath = path.join(__dirname, "..", "..", "public", user.avatar)

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath)
      }
    }

    // Update user to use default avatar
    user.avatar = "/placeholder.png?height=120&width=120"
    await user.save()

    // Update avatar record
    await Avatar.findOneAndUpdate({ userId: user._id }, { isActive: false }, { new: true })

    return res.json({
      _id: user._id,
      name: user.name,
      role: user.role,
      avatar: user.avatar,
      avatarPath: user.avatar,
    })
  } catch (error) {
    console.error("Error deleting avatar:", error)
    return res.status(500).json({ message: "Server error while deleting avatar" })
  }
})

// Delete avatar for another user (admin only)
router.delete("/:userId", auth.authenticate, auth.authorizeAdmin, async (req, res) => {
  try {
    const { userId } = req.params
    const user = await User.findById(userId)

    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    // If user has a custom avatar (not the default placeholder)
    if (user.avatar && !user.avatar.includes("placeholder")) {
      // Remove the file from storage
      const filePath = path.join(__dirname, "..", "..", "public", user.avatar)

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath)
      }
    }

    // Update user to use default avatar
    user.avatar = "/placeholder.png?height=120&width=120"
    await user.save()

    // Update avatar record
    await Avatar.findOneAndUpdate({ userId: user._id }, { isActive: false }, { new: true })

    return res.json({
      _id: user._id,
      name: user.name,
      role: user.role,
      avatar: user.avatar,
      avatarPath: user.avatar,
    })
  } catch (error) {
    console.error("Error deleting avatar:", error)
    return res.status(500).json({ message: "Server error while deleting avatar" })
  }
})

module.exports = router
