const mongoose = require("mongoose")

const AvatarSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    username: {
      type: String,
      required: true,
      index: true, // Added index for faster username searches
    },
    avatarUrl: {
      type: String,
      required: true,
    },
    originalFilename: {
      type: String,
    },
    contentType: {
      type: String,
    },
    size: {
      type: Number,
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
)

// Create indexes for common queries
AvatarSchema.index({ username: "text" })

module.exports = mongoose.model("Avatar", AvatarSchema)
