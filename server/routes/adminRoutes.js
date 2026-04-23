import { Router } from "express";
import path from "node:path";
import Blog from "../models/Blog.js";
import { env } from "../config/env.js";
import { requireAuth } from "../middleware/auth.js";
import Certification from "../models/Certification.js";
import ContactMessage from "../models/ContactMessage.js";
import Experience from "../models/Experience.js";
import Profile from "../models/Profile.js";
import Project from "../models/Project.js";
import SkillGroup from "../models/SkillGroup.js";
import {
  normalizeBoolean,
  normalizeEmail,
  normalizeNumber,
  normalizeString,
  normalizeStringArray,
  normalizeUrl,
} from "../utils/validation.js";
import { imageUpload } from "../utils/upload.js";

const router = Router();

router.use(requireAuth);

function sanitizeProfileInput(body) {
  return {
    name: normalizeString(body.name, { required: true, maxLength: 120 }),
    title: normalizeString(body.title, { required: true, maxLength: 160 }),
    tagline: normalizeString(body.tagline, { required: true, maxLength: 240 }),
    about: normalizeString(body.about, { required: true, maxLength: 5000 }),
    location: normalizeString(body.location, { maxLength: 120 }),
    email: normalizeEmail(body.email),
    phone: normalizeString(body.phone, { maxLength: 60 }),
    highlights: normalizeStringArray(body.highlights, { maxItems: 12, maxItemLength: 120 }),
    socialLinks: Array.isArray(body.socialLinks)
      ? body.socialLinks
          .map((link) => ({
            label: normalizeString(link?.label, { maxLength: 60 }),
            href: normalizeUrl(link?.href),
          }))
          .filter((link) => link.label || link.href)
      : [],
  };
}

function sanitizeSkillInput(body) {
  return {
    title: normalizeString(body.title, { required: true, maxLength: 120 }),
    items: normalizeStringArray(body.items, { maxItems: 50, maxItemLength: 80 }),
    order: normalizeNumber(body.order),
  };
}

function sanitizeExperienceInput(body) {
  return {
    company: normalizeString(body.company, { required: true, maxLength: 160 }),
    role: normalizeString(body.role, { required: true, maxLength: 160 }),
    period: normalizeString(body.period, { required: true, maxLength: 80 }),
    highlights: normalizeStringArray(body.highlights, { maxItems: 20, maxItemLength: 240 }),
    order: normalizeNumber(body.order),
  };
}

function sanitizeProjectInput(body) {
  return {
    title: normalizeString(body.title, { required: true, maxLength: 160 }),
    description: normalizeString(body.description, { required: true, maxLength: 5000 }),
    stack: normalizeStringArray(body.stack, { maxItems: 30, maxItemLength: 80 }),
    githubUrl: normalizeUrl(body.githubUrl),
    liveUrl: normalizeUrl(body.liveUrl),
    imageUrl: normalizeUrl(body.imageUrl),
  };
}

function sanitizeCertificationInput(body) {
  return {
    name: normalizeString(body.name, { required: true, maxLength: 160 }),
    issuer: normalizeString(body.issuer, { required: true, maxLength: 160 }),
    date: normalizeString(body.date, { required: true, maxLength: 80 }),
    credentialUrl: normalizeUrl(body.credentialUrl),
    imageUrl: normalizeUrl(body.imageUrl),
    order: normalizeNumber(body.order),
  };
}

function sanitizeBlogInput(body) {
  return {
    title: normalizeString(body.title, { required: true, maxLength: 180 }),
    excerpt: normalizeString(body.excerpt, { required: true, maxLength: 500 }),
    content: normalizeString(body.content, { maxLength: 12000 }),
    linkUrl: normalizeUrl(body.linkUrl),
    imageUrl: normalizeUrl(body.imageUrl),
    publishedAt: normalizeString(body.publishedAt, { maxLength: 80 }),
    order: normalizeNumber(body.order),
  };
}

function sanitizeMessageInput(body) {
  return {
    subject: normalizeString(body.subject, { maxLength: 200 }),
    message: normalizeString(body.message, { required: true, maxLength: 4000 }),
    read: normalizeBoolean(body.read),
  };
}

function handleValidationError(error, res, next) {
  if (
    error.message === "This field is required" ||
    error.message === "Invalid email address" ||
    error.message === "Invalid URL" ||
    error.message.startsWith("Value must be at most")
  ) {
    return res.status(400).json({ message: error.message });
  }

  return next(error);
}

router.get("/portfolio", async (_req, res, next) => {
  try {
    const [profile, skills, experience, projects, certifications, blogs, messages] = await Promise.all([
      Profile.findOne().lean(),
      SkillGroup.find().sort({ order: 1, createdAt: 1 }).lean(),
      Experience.find().sort({ order: 1, createdAt: 1 }).lean(),
      Project.find().sort({ createdAt: -1 }).lean(),
      Certification.find().sort({ order: 1, createdAt: 1 }).lean(),
      Blog.find().sort({ order: 1, createdAt: -1 }).lean(),
      ContactMessage.find().sort({ createdAt: -1 }).limit(env.messagePageSize).lean(),
    ]);

    res.json({ profile, skills, experience, projects, certifications, blogs, messages });
  } catch (error) {
    next(error);
  }
});

router.post("/uploads/image", imageUpload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "Image file is required" });
  }

  const imageUrl = path.posix.join("/uploads", req.file.filename);
  return res.status(201).json({ imageUrl });
});

router.put("/messages/:id", async (req, res, next) => {
  try {
    const payload = sanitizeMessageInput(req.body);
    const updated = await ContactMessage.findByIdAndUpdate(
      req.params.id,
      payload,
      {
        new: true,
        runValidators: true,
      },
    ).lean();

    if (!updated) {
      return res.status(404).json({ message: "Message not found" });
    }

    return res.json(updated);
  } catch (error) {
    return handleValidationError(error, res, next);
  }
});

router.delete("/messages/:id", async (req, res, next) => {
  try {
    const deleted = await ContactMessage.findByIdAndDelete(req.params.id).lean();

    if (!deleted) {
      return res.status(404).json({ message: "Message not found" });
    }

    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
});

router.put("/profile/:id", async (req, res, next) => {
  try {
    const payload = sanitizeProfileInput(req.body);
    const updated = await Profile.findByIdAndUpdate(req.params.id, payload, {
      new: true,
      runValidators: true,
    }).lean();

    if (!updated) {
      return res.status(404).json({ message: "Profile not found" });
    }

    return res.json(updated);
  } catch (error) {
    return handleValidationError(error, res, next);
  }
});

router.post("/skills", async (req, res, next) => {
  try {
    const created = await SkillGroup.create(sanitizeSkillInput(req.body));
    return res.status(201).json(created);
  } catch (error) {
    return handleValidationError(error, res, next);
  }
});

router.put("/skills/:id", async (req, res, next) => {
  try {
    const payload = sanitizeSkillInput(req.body);
    const updated = await SkillGroup.findByIdAndUpdate(req.params.id, payload, {
      new: true,
      runValidators: true,
    }).lean();

    if (!updated) {
      return res.status(404).json({ message: "Skill group not found" });
    }

    return res.json(updated);
  } catch (error) {
    return handleValidationError(error, res, next);
  }
});

router.delete("/skills/:id", async (req, res, next) => {
  try {
    const deleted = await SkillGroup.findByIdAndDelete(req.params.id).lean();

    if (!deleted) {
      return res.status(404).json({ message: "Skill group not found" });
    }

    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
});

router.post("/experience", async (req, res, next) => {
  try {
    const created = await Experience.create(sanitizeExperienceInput(req.body));
    return res.status(201).json(created);
  } catch (error) {
    return handleValidationError(error, res, next);
  }
});

router.put("/experience/:id", async (req, res, next) => {
  try {
    const payload = sanitizeExperienceInput(req.body);
    const updated = await Experience.findByIdAndUpdate(req.params.id, payload, {
      new: true,
      runValidators: true,
    }).lean();

    if (!updated) {
      return res.status(404).json({ message: "Experience not found" });
    }

    return res.json(updated);
  } catch (error) {
    return handleValidationError(error, res, next);
  }
});

router.delete("/experience/:id", async (req, res, next) => {
  try {
    const deleted = await Experience.findByIdAndDelete(req.params.id).lean();

    if (!deleted) {
      return res.status(404).json({ message: "Experience not found" });
    }

    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
});

router.post("/certifications", async (req, res, next) => {
  try {
    const created = await Certification.create(sanitizeCertificationInput(req.body));
    return res.status(201).json(created);
  } catch (error) {
    return handleValidationError(error, res, next);
  }
});

router.put("/certifications/:id", async (req, res, next) => {
  try {
    const payload = sanitizeCertificationInput(req.body);
    const updated = await Certification.findByIdAndUpdate(req.params.id, payload, {
      new: true,
      runValidators: true,
    }).lean();

    if (!updated) {
      return res.status(404).json({ message: "Certification not found" });
    }

    return res.json(updated);
  } catch (error) {
    return handleValidationError(error, res, next);
  }
});

router.delete("/certifications/:id", async (req, res, next) => {
  try {
    const deleted = await Certification.findByIdAndDelete(req.params.id).lean();

    if (!deleted) {
      return res.status(404).json({ message: "Certification not found" });
    }

    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
});

router.post("/blogs", async (req, res, next) => {
  try {
    const created = await Blog.create(sanitizeBlogInput(req.body));
    return res.status(201).json(created);
  } catch (error) {
    return handleValidationError(error, res, next);
  }
});

router.put("/blogs/:id", async (req, res, next) => {
  try {
    const payload = sanitizeBlogInput(req.body);
    const updated = await Blog.findByIdAndUpdate(req.params.id, payload, {
      new: true,
      runValidators: true,
    }).lean();

    if (!updated) {
      return res.status(404).json({ message: "Blog not found" });
    }

    return res.json(updated);
  } catch (error) {
    return handleValidationError(error, res, next);
  }
});

router.delete("/blogs/:id", async (req, res, next) => {
  try {
    const deleted = await Blog.findByIdAndDelete(req.params.id).lean();

    if (!deleted) {
      return res.status(404).json({ message: "Blog not found" });
    }

    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
});

router.post("/projects", async (req, res, next) => {
  try {
    const created = await Project.create(sanitizeProjectInput(req.body));
    return res.status(201).json(created);
  } catch (error) {
    return handleValidationError(error, res, next);
  }
});

router.put("/projects/:id", async (req, res, next) => {
  try {
    const payload = sanitizeProjectInput(req.body);
    const updated = await Project.findByIdAndUpdate(req.params.id, payload, {
      new: true,
      runValidators: true,
    }).lean();

    if (!updated) {
      return res.status(404).json({ message: "Project not found" });
    }

    return res.json(updated);
  } catch (error) {
    return handleValidationError(error, res, next);
  }
});

router.delete("/projects/:id", async (req, res, next) => {
  try {
    const deleted = await Project.findByIdAndDelete(req.params.id).lean();

    if (!deleted) {
      return res.status(404).json({ message: "Project not found" });
    }

    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
});

export default router;
