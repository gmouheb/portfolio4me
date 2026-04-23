import { Router } from "express";
import Blog from "../models/Blog.js";
import Certification from "../models/Certification.js";
import { createRateLimiter } from "../middleware/rateLimit.js";
import ContactMessage from "../models/ContactMessage.js";
import Experience from "../models/Experience.js";
import Profile from "../models/Profile.js";
import Project from "../models/Project.js";
import SkillGroup from "../models/SkillGroup.js";
import { normalizeEmail, normalizeString } from "../utils/validation.js";

const router = Router();
const contactRateLimit = createRateLimiter({ windowMs: 15 * 60 * 1000, max: 8, keyPrefix: "contact" });

router.get("/health", (_req, res) => {
  res.json({ ok: true });
});

router.get("/portfolio", async (_req, res, next) => {
  try {
    const [profile, skills, experience, projects, certifications, blogs] = await Promise.all([
      Profile.findOne().lean(),
      SkillGroup.find().sort({ order: 1, createdAt: 1 }).lean(),
      Experience.find().sort({ order: 1, createdAt: 1 }).lean(),
      Project.find().sort({ createdAt: -1 }).lean(),
      Certification.find().sort({ order: 1, createdAt: 1 }).lean(),
      Blog.find().sort({ order: 1, createdAt: -1 }).lean(),
    ]);

    res.json({
      profile,
      skills,
      experience,
      projects,
      certifications,
      blogs,
    });
  } catch (error) {
    next(error);
  }
});

router.post("/contact", contactRateLimit, async (req, res, next) => {
  try {
    const name = normalizeString(req.body.name, { required: true, maxLength: 120 });
    const email = normalizeEmail(req.body.email, { required: true });
    const subject = normalizeString(req.body.subject, { maxLength: 200 });
    const message = normalizeString(req.body.message, { required: true, maxLength: 4000 });

    const created = await ContactMessage.create({
      name,
      email,
      subject,
      message,
    });

    return res.status(201).json({
      message: "Message sent successfully",
      id: created._id,
    });
  } catch (error) {
    if (error.message === "Invalid email address") {
      return res.status(400).json({ message: error.message });
    }

    if (error.message === "This field is required" || error.message.startsWith("Value must be at most")) {
      return res.status(400).json({ message: error.message === "This field is required" ? "Name, email, and message are required" : error.message });
    }

    return next(error);
  }
});

export default router;
