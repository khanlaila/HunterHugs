
const express = require("express");
const cors = require("cors");
require("dotenv").config();
const connectDB = require("./config/db");
const usersRouter = require("./routes/users");

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/users", usersRouter);

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
