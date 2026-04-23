import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { parseCookies } from "../utils/cookies.js";

export function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  const bearerToken = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : "";
  const cookies = parseCookies(req.headers.cookie);
  const token = bearerToken || cookies[env.sessionCookieName];

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const payload = jwt.verify(token, env.jwtSecret);
    req.user = payload;
    return next();
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
}
