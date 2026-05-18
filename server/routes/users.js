const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const crypto = require("node:crypto");
const User = require("../models/User");
const PendingUserVerification = require("../models/PendingUserVerification");

const router = express.Router();

function toOptionalNumber(value) {
  if (value === undefined || value === null || value === "") return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}
function normalizeString(value) {
  return typeof value === "string" ? value.trim() : "";
}
function normalizeCitizenshipStatus(value) {
  const normalized = normalizeString(value).toLowerCase();
  const allowed = new Set(["citizen", "permanent-resident", "international", "undocumented", "other", ""]);
  return allowed.has(normalized) ? normalized : "";
}
function readBearerToken(authorizationHeader) {
  if (!authorizationHeader || typeof authorizationHeader !== "string") return "";
  const [scheme, token] = authorizationHeader.split(" ");
  if (!scheme || scheme.toLowerCase() !== "bearer" || !token) return "";
  return token.trim();
}
function toProfileResponse(profile = {}) {
  return {
    studentId: profile.studentId || "",
    estimatedIncome: profile.estimatedIncome ?? profile.salary ?? "",
    salary: profile.salary ?? profile.estimatedIncome ?? "",
    citizenshipStatus: profile.citizenshipStatus || "",
    address: profile.address || "",
    campus: profile.campus || "",
    major: profile.major || profile.fieldOfStudy || profile.program || "",
    enrollmentStatus: profile.enrollmentStatus || "",
  };
}
function buildProfilePayload(input = {}) {
  const estimatedIncome =
    toOptionalNumber(input.estimatedIncome) ??
    toOptionalNumber(input.salary) ??
    toOptionalNumber(input.income);
  return {
    studentId: normalizeString(input.studentId),
    estimatedIncome,
    salary: estimatedIncome,
    citizenshipStatus: normalizeCitizenshipStatus(input.citizenshipStatus),
    address: normalizeString(input.address),
    campus: normalizeString(input.campus),
    major: normalizeString(input.major || input.fieldOfStudy || input.program),
    enrollmentStatus: normalizeString(input.enrollmentStatus),
  };
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
      major,
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
    const profilePayload = buildProfilePayload({
      studentId,
      estimatedIncome,
      citizenshipStatus,
      address,
      campus,
      major,
      enrollmentStatus,
    });
    const user = new User({
      fullName,
      email: normalizedEmail,
      passwordHash,
      profile: profilePayload,
    });
    await user.save();
    await PendingUserVerification.deleteOne({ email: normalizedEmail });

    const token = jwt.sign(
      { sub: user._id.toString(), email: user.email },
      process.env.JWT_SECRET || "dev-only-secret-change-me",
      { expiresIn: "7d" }
    );

    return res.status(201).json({
      message: "Account created and signed in.",
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        profile: toProfileResponse(user.profile),
      },
    });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({ message: "Email is already registered." });
    }
    if (error?.name === "ValidationError") {
      return res.status(400).json({ message: "Invalid signup data.", error: error.message });
    }
    return res.status(500).json({ message: "Failed to register user.", error: error.message });
  }
});

router.post("/verify-email", async (req, res) => {
  try {
    const { token, email } = req.body;
    if (!token) {
      if (email) {
        const existingUserByEmail = await User.findOne({ email: String(email).toLowerCase().trim() }).select(
          "+profile.salary +profile.estimatedIncome +profile.citizenshipStatus +profile.address +profile.major +profile.campus +profile.enrollmentStatus +profile.studentId"
        );
        if (existingUserByEmail) {
          const alreadyToken = jwt.sign(
            { sub: existingUserByEmail._id.toString(), email: existingUserByEmail.email },
            process.env.JWT_SECRET || "dev-only-secret-change-me",
            { expiresIn: "7d" }
          );
          return res.status(200).json({
            message: "Email already verified. You can now sign in.",
            token: alreadyToken,
            user: {
              id: existingUserByEmail._id,
              fullName: existingUserByEmail.fullName,
              email: existingUserByEmail.email,
              profile: toProfileResponse(existingUserByEmail.profile),
            },
          });
        }
      }
      return res.status(400).json({ message: "Verification token is required." });
    }

    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const pending = await PendingUserVerification.findOne({
      verificationTokenHash: tokenHash,
      verificationExpiresAt: { $gt: new Date() },
    }).select("+passwordHash +verificationTokenHash");

    if (!pending) {
      if (email) {
        const existingUserByEmail = await User.findOne({ email: String(email).toLowerCase().trim() }).select(
          "+profile.salary +profile.estimatedIncome +profile.citizenshipStatus +profile.address +profile.major +profile.campus +profile.enrollmentStatus +profile.studentId"
        );
        if (existingUserByEmail) {
          const alreadyToken = jwt.sign(
            { sub: existingUserByEmail._id.toString(), email: existingUserByEmail.email },
            process.env.JWT_SECRET || "dev-only-secret-change-me",
            { expiresIn: "7d" }
          );
          return res.status(200).json({
            message: "Email already verified. You can now sign in.",
            token: alreadyToken,
            user: {
              id: existingUserByEmail._id,
              fullName: existingUserByEmail.fullName,
              email: existingUserByEmail.email,
              profile: toProfileResponse(existingUserByEmail.profile),
            },
          });
        }
      }
      return res.status(400).json({ message: "Invalid or expired verification token." });
    }

    let verifiedUser = await User.findOne({ email: pending.email }).select(
      "+profile.salary +profile.estimatedIncome +profile.citizenshipStatus +profile.address +profile.major +profile.campus +profile.enrollmentStatus +profile.studentId"
    );
    if (!verifiedUser) {
      verifiedUser = new User({
        fullName: pending.fullName,
        email: pending.email,
        passwordHash: pending.passwordHash,
        profile: buildProfilePayload(
          pending.profile?.toObject ? pending.profile.toObject() : pending.profile || {}
        ),
      });
      await verifiedUser.save();
    }

    await PendingUserVerification.deleteOne({ _id: pending._id });
    const verifiedToken = jwt.sign(
      { sub: verifiedUser._id.toString(), email: verifiedUser.email },
      process.env.JWT_SECRET || "dev-only-secret-change-me",
      { expiresIn: "7d" }
    );
    return res.status(200).json({
      message: "Email verified successfully.",
      token: verifiedToken,
      user: {
        id: verifiedUser._id,
        fullName: verifiedUser.fullName,
        email: verifiedUser.email,
        profile: toProfileResponse(verifiedUser.profile),
      },
    });
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
    const normalizedEmail = email.toLowerCase().trim();

    const user = await User.findOne({ email: normalizedEmail }).select(
      "+passwordHash +profile.salary +profile.estimatedIncome +profile.citizenshipStatus +profile.address +profile.major +profile.campus +profile.enrollmentStatus +profile.studentId"
    );
    if (!user) {
      const pending = await PendingUserVerification.findOne({ email: normalizedEmail }).select(
        "+passwordHash +verificationExpiresAt"
      );
      if (pending) {
        return res.status(403).json({
          message: "Account not verified yet. Please verify your email before signing in.",
        });
      }
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const isValid = await user.validatePassword(password);
    if (!isValid) {
      const pending = await PendingUserVerification.findOne({ email: normalizedEmail }).select(
        "+passwordHash +verificationExpiresAt"
      );
      if (pending) {
        const pendingPasswordMatches = await bcrypt.compare(password, pending.passwordHash);
        if (pendingPasswordMatches) {
          user.passwordHash = pending.passwordHash;
          user.profile = buildProfilePayload(
            pending.profile?.toObject ? pending.profile.toObject() : pending.profile || {}
          );
          await user.save();
          await PendingUserVerification.deleteOne({ _id: pending._id });
        }
      }
      const recoveredUser = await User.findById(user._id).select("+passwordHash");
      const recoveredValid = recoveredUser ? await recoveredUser.validatePassword(password) : false;
      if (!recoveredValid) {
        return res.status(401).json({ message: "Invalid credentials." });
      }
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
        profile: toProfileResponse(user.profile),
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to log in.", error: error.message });
  }
});
router.get("/me", async (req, res) => {
  try {
    const token = readBearerToken(req.headers.authorization);
    let user = null;
    if (token) {
      try {
        const payload = jwt.verify(token, process.env.JWT_SECRET || "dev-only-secret-change-me");
        const userId = payload.sub || payload.id || payload.userId;
        if (userId) {
          user = await User.findById(userId).select(
            "+profile.salary +profile.estimatedIncome +profile.citizenshipStatus +profile.address +profile.major +profile.campus +profile.enrollmentStatus +profile.studentId"
          );
        }
      } catch {
      }
    }

    if (!user && req.query?.email) {
      const normalizedEmail = String(req.query.email).toLowerCase().trim();
      user = await User.findOne({ email: normalizedEmail }).select(
        "+profile.salary +profile.estimatedIncome +profile.citizenshipStatus +profile.address +profile.major +profile.campus +profile.enrollmentStatus +profile.studentId"
      );
    }

    if (!user) {
      return res.status(401).json({ message: "Could not resolve user session." });
    }

    return res.status(200).json({
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        profile: toProfileResponse(user.profile),
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to load user profile.", error: error.message });
  }
});

module.exports = router;