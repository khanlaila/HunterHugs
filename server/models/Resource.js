const mongoose = require("mongoose");

const resourceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      enum: ["food", "housing", "mental-health", "financial-aid", "legal-services", "other"],
    },
    buildingAddress: {
      type: String,
      required: true,
      trim: true,
    },
    eligibilitySummary: {
      type: String,
      trim: true,
      default: "",
    },
    contact: {
      email: {
        type: String,
        trim: true,
        lowercase: true,
        default: "",
      },
      phone: {
        type: String,
        trim: true,
        default: "",
      },
    },
    tags: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],
    hours: {
        open: {
          type: String, // "09:00"
          trim: true,
          default: ""
        },
        close: {
          type: String, // "17:00"
          trim: true,
          default: ""
        },
      },
    },
  {
    timestamps: true,
  }
);

resourceSchema.index({ category: 1 });
resourceSchema.index({ name: "text", eligibilitySummary: "text", tags: "text" });

module.exports = mongoose.model("Resource", resourceSchema);
