const mongoose = require("mongoose");

const pendingUserVerificationSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
      select: false,
    },
    verificationTokenHash: {
      type: String,
      required: true,
      index: true,
      select: false,
    },
    verificationExpiresAt: {
      type: Date,
      required: true,
      index: true,
    },
    profile: {
      studentId: { type: String, trim: true, default: "" },
      salary: { type: Number, min: 0 },
      estimatedIncome: { type: Number, min: 0 },
      citizenshipStatus: {
        type: String,
        trim: true,
        enum: ["citizen", "permanent-resident", "international", "undocumented", "other", ""],
        default: "",
      },
      address: { type: String, trim: true, default: "" },
      campus: { type: String, trim: true, default: "" },
      major: { type: String, trim: true, default: "" },
      enrollmentStatus: { type: String, trim: true, default: "" },
    },
  },
  { timestamps: true, versionKey: false, collection: "pending_user_verifications" }
);

module.exports = mongoose.model("PendingUserVerification", pendingUserVerificationSchema);
