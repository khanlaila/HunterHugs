const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    passwordHash: {
      type: String,
      required: true,
      select: false,
    },
    profile: {
      studentId: {
        type: String,
        trim: true,
        default: "",
        index: true,
      },
      salary: {
        type: Number,
        min: 0,
        select: false,
      },
      estimatedIncome: {
        type: Number,
        min: 0,
        select: false,
      },
      citizenshipStatus: {
        type: String,
        trim: true,
        enum: ["citizen", "permanent-resident", "international", "undocumented", "other", ""],
        default: "",
        select: false,
      },
      address: {
        type: String,
        trim: true,
        default: "",
        select: false,
      },
      campus: {
        type: String,
        trim: true,
        default: "",
      },
      major: {
        type: String,
        trim: true,
        default: "",
      },
      enrollmentStatus: {
        type: String,
        trim: true,
        default: "",
      },
    },
  },
);

userSchema.methods.setPassword = async function setPassword(rawPassword) {
  this.passwordHash = await bcrypt.hash(rawPassword, 12);
};

userSchema.methods.validatePassword = async function validatePassword(rawPassword) {
  return bcrypt.compare(rawPassword, this.passwordHash);
};

module.exports = mongoose.model("User", userSchema);
