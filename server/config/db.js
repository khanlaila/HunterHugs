const mongoose = require("mongoose");

async function connectDB() {
  const uri = process.env.MONGODB_URI || process.env.URI;

  if (!uri) {
    throw new Error("Missing MongoDB connection string. Set MONGODB URI in .env.");
  }

  await mongoose.connect(uri);
  console.log("MongoDB connected");
}

module.exports = connectDB;
