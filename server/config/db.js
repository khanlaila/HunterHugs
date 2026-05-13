const mongoose = require("mongoose");
if (typeof globalThis.crypto === "undefined") {
  globalThis.crypto = require("node:crypto").webcrypto;
}

async function connectDB() {
  const uri = process.env.MONGODB_URI || process.env.URI;

  if (!uri) {
    throw new Error("Missing MongoDB connection string. Set MONGODB_URI (or URI) in .env.");
  }
  const connectOptions = {};
  try {
    const parsed = new URL(uri);
    if (!parsed.pathname || parsed.pathname === "/") {
      connectOptions.dbName = process.env.MONGODB_DB_NAME || "hunterhugs";
    }
  } catch {
    // If URI parsing fails, let mongoose handle URI validity errors naturally.
  }

  await mongoose.connect(uri, connectOptions);
  console.log("MongoDB connected");
}

module.exports = connectDB;
