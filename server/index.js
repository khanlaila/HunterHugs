
const express = require("express");
const cors = require("cors");
require("dotenv").config();
const connectDB = require("./config/db");
const usersRouter = require("./routes/users");
const resourcesRouter = require("./routes/resources");
const chatRouter = require("./routes/chat");

const app = express();
const configuredOrigins = (process.env.FRONTEND_URLS || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
const allowedOrigins = Array.from(
  new Set(["http://localhost:5173", "http://127.0.0.1:5173", ...configuredOrigins])
);

app.use(
  cors({
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    origin(origin, callback) {
      if (!origin) return callback(null, true);
      if (!allowedOrigins.length) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error("CORS blocked for this origin"));
    },
  })
);
app.use(express.json());
app.use("/api/users", usersRouter);
app.use("/api/resources", resourcesRouter);
app.use("/api/chat", chatRouter);

app.get("/", (req, res) => {
  res.send("If you see this, then the server is running :)");
});

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
}

startServer();
