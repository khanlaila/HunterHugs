const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    const { fullName, email, password, salary, citizenshipStatus, campus, enrollmentStatus } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "Full Name, Email, and Password are required." });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(409).json({ message: "Email is already registered." });
    }

    const user = new User({
      fullName,
      email,
      profile: {
        salary,
        citizenshipStatus,
        campus,
        enrollmentStatus,
      },
    });

    await user.setPassword(password);
    await user.save();

    return res.status(201).json({
      message: "User registered successfully.",
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        profile: {
          campus: user.profile?.campus || "",
          enrollmentStatus: user.profile?.enrollmentStatus || "",
        },
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to register user.", error: error.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "email and password are required." });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select("+passwordHash");
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const isValid = await user.validatePassword(password);
    if (!isValid) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const token = jwt.sign(
      { sub: user._id.toString(), email: user.email },
      process.env.JWT_SECRET || "dev-only-secret-change-me",
      { expiresIn: "7d" }
    );

    return res.status(200).json({
      message: "Login successful.",
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        profile: {
          campus: user.profile?.campus || "",
          enrollmentStatus: user.profile?.enrollmentStatus || "",
        },
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to log in.", error: error.message });
  }
});


module.exports = router;
