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
      enum: ["food", "housing", "mental-health", "financial-aid", "legal-services", "healthcare", "other"],
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    campus: {
      type: String,
      trim: true,
      default: "",
    },
    location: {
      type: String,
      trim: true,
      default: "",
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
      website: {
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
    schedules: {
      type: [
        {
          day: {
            type: String,
            enum: ["mon", "tue", "wed", "thu", "fri", "sat", "sun"],
            lowercase: true,
            trim: true,
          },
          open: {
            type: String,
            trim: true,
            default: "",
          },
          close: {
            type: String,
            trim: true,
            default: "",
          },
          notes: {
            type: String,
            trim: true,
            default: "",
          },
        },
      ],
      default: [],
    },
    hours: {
      open: {
        type: String,
        trim: true,
        default: "",
      },
      close: {
        type: String,
        trim: true,
        default: "",
      },
    },
    sourceUrl: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    versionKey: false,
    collection: "resource",
  }
);


resourceSchema.index({ category: 1 });
resourceSchema.index({ campus: 1 });
resourceSchema.index({ name: "text", description: "text", eligibilitySummary: "text", tags: "text", location: "text" });

module.exports = mongoose.model("Resource", resourceSchema);
