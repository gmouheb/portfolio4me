import bcrypt from "bcryptjs";
import crypto from "crypto";
import { Router } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { createRateLimiter } from "../middleware/rateLimit.js";
import User from "../models/User.js";
import { parseCookies } from "../utils/cookies.js";
import { sendResetPasswordEmail } from "../utils/mailer.js";
import { normalizeEmail, validatePasswordStrength } from "../utils/validation.js";

const router = Router();
const loginRateLimit = createRateLimiter({ windowMs: 15 * 60 * 1000, max: 10, keyPrefix: "login" });
const forgotPasswordRateLimit = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 5,
  keyPrefix: "forgot-password",
});

function getCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "strict",
    secure: env.isProduction,
    path: "/",
    maxAge: 24 * 60 * 60 * 1000,
  };
}

router.post("/login", loginRateLimit, async (req, res, next) => {
  try {
    const username = typeof req.body.username === "string" ? req.body.username.trim() : "";
    const password = typeof req.body.password === "string" ? req.body.password : "";

    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }

    const user = await User.findOne({ username }).lean();

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { sub: user._id.toString(), username: user.username },
      env.jwtSecret,
      { expiresIn: "1d" },
    );

    res.cookie(env.sessionCookieName, token, getCookieOptions());

    return res.json({
      user: {
        username: user.username,
      },
    });
  } catch (error) {
    return next(error);
  }
});

router.get("/me", async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const bearerToken = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : "";
    const cookies = parseCookies(req.headers.cookie);
    const token = bearerToken || cookies[env.sessionCookieName];

    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const payload = jwt.verify(token, env.jwtSecret);
    const user = await User.findById(payload.sub).lean();

    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    return res.json({
      user: {
        username: user.username,
      },
    });
  } catch (error) {
    if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Unauthorized" });
    }

    return next(error);
  }
});

router.post("/logout", (_req, res) => {
  res.clearCookie(env.sessionCookieName, getCookieOptions());
  res.status(204).send();
});

router.post("/forgot-password", forgotPasswordRateLimit, async (req, res, next) => {
  try {
    const email = normalizeEmail(req.body.email, { required: true });

    const user = await User.findOne({ email });

    if (!user) {
      return res.json({
        message: "If the account exists, a reset email has been sent",
      });
    }

    const rawToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");
    const expiresAt = new Date(Date.now() + env.resetTokenExpiresMs);

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpiresAt = expiresAt;
    await user.save();

    const resetUrl = `${env.appUrl}/control-room/reset-password?token=${rawToken}`;

    try {
      await sendResetPasswordEmail({
        to: user.email,
        resetUrl,
      });
    } catch (mailError) {
      user.resetPasswordToken = null;
      user.resetPasswordExpiresAt = null;
      await user.save();
      return next(mailError);
    }

    return res.json({
      message: "If the account exists, a reset email has been sent",
    });
  } catch (error) {
    return next(error);
  }
});

router.post("/reset-password", async (req, res, next) => {
  try {
    const token = typeof req.body.token === "string" ? req.body.token.trim() : "";
    const password = typeof req.body.password === "string" ? req.body.password : "";

    if (!token || !password) {
      return res.status(400).json({ message: "Token and password are required" });
    }

    validatePasswordStrength(password);

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpiresAt: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired reset token" });
    }

    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = null;
    user.resetPasswordExpiresAt = null;
    await user.save();

    return res.json({ message: "Password reset successfully" });
  } catch (error) {
    if (error.message?.startsWith("Password must")) {
      return res.status(400).json({ message: error.message });
    }

    if (error.message === "Invalid email address" || error.message === "This field is required") {
      return res.status(400).json({ message: error.message === "This field is required" ? "Email is required" : error.message });
    }

    return next(error);
  }
});

export default router;
