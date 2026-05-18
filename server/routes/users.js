const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const crypto = require("node:crypto");
const User = require("../models/User");
const PendingUserVerification = require("../models/PendingUserVerification");
const { sendVerificationEmail } = require("../utils/email");

const router = express.Router();
const VERIFICATION_TTL_MS = 1000 * 60 * 60 * 24;

function toOptionalNumber(value) {
  if (value === undefined || value === null || value === "") return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

router.post("/register", async (req, res) => {
  try {
    const {
      fullName,
      email,
      password,
      studentId,
      estimatedIncome,
      citizenshipStatus,
      address,
      campus,
      enrollmentStatus,
    } = req.body;

    if (
      !fullName ||
      !email ||
      !password ||
      !studentId ||
      estimatedIncome === undefined ||
      estimatedIncome === null ||
      estimatedIncome === ""
    ) {
      return res.status(400).json({
        message: "Full Name, Email, Password, Student ID, and Estimated Income are required.",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({ message: "Email is already registered." });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationTokenHash = crypto.createHash("sha256").update(verificationToken).digest("hex");
    const verificationExpiresAt = new Date(Date.now() + VERIFICATION_TTL_MS);

    const pendingPayload = {
      fullName,
      email: normalizedEmail,
      passwordHash,
      verificationTokenHash,
      verificationExpiresAt,
      profile: {
        studentId,
        estimatedIncome: toOptionalNumber(estimatedIncome),
        salary: toOptionalNumber(estimatedIncome),
        citizenshipStatus,
        address,
        campus,
        enrollmentStatus,
      },
    };

    await PendingUserVerification.findOneAndUpdate(
      { email: normalizedEmail },
      { $set: pendingPayload },
      { upsert: true, setDefaultsOnInsert: true }
    );

    const frontendBaseUrl = (process.env.FRONTEND_BASE_URL || process.env.FRONTEND_URL || "").replace(/\/$/, "");
    const verificationLink = `${frontendBaseUrl || "http://localhost:5173"}/verify-email?token=${verificationToken}`;
    const emailResult = await sendVerificationEmail({
      to: normalizedEmail,
      verificationLink,
    });

    return res.status(201).json({
      message: "Verification email sent. Please verify before signing in.",
      emailDelivered: emailResult.delivered,
      verificationLink: emailResult.delivered ? undefined : verificationLink,
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to register user.", error: error.message });
  }
});

router.post("/verify-email", async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ message: "Verification token is required." });
    }

    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const pending = await PendingUserVerification.findOne({
      verificationTokenHash: tokenHash,
      verificationExpiresAt: { $gt: new Date() },
    }).select("+passwordHash +verificationTokenHash");

    if (!pending) {
      return res.status(400).json({ message: "Invalid or expired verification token." });
    }

    const existingUser = await User.findOne({ email: pending.email });
    if (!existingUser) {
      const user = new User({
        fullName: pending.fullName,
        email: pending.email,
        passwordHash: pending.passwordHash,
        profile: pending.profile || {},
      });
      await user.save();
    }

    await PendingUserVerification.deleteOne({ _id: pending._id });
    return res.status(200).json({ message: "Email verified successfully. You can now sign in." });
  } catch (error) {
    return res.status(500).json({ message: "Failed to verify email.", error: error.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "email and password are required." });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select(
      "+passwordHash +profile.salary +profile.estimatedIncome +profile.citizenshipStatus +profile.address"
    );
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
          studentId: user.profile?.studentId || "",
          estimatedIncome: user.profile?.estimatedIncome ?? "",
          salary: user.profile?.salary ?? "",
          citizenshipStatus: user.profile?.citizenshipStatus || "",
          address: user.profile?.address || "",
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