import cors from "cors";
import express from "express";
import path from "node:path";
import { env } from "./config/env.js";
import adminRoutes from "./routes/adminRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import { connectDatabase } from "./config/db.js";
import portfolioRoutes from "./routes/portfolioRoutes.js";
import { ensureAdminUser } from "./utils/bootstrap.js";
import { verifyMailerTransport } from "./utils/mailer.js";

const app = express();
const allowedOrigins = new Set([
  env.clientUrl,
  env.appUrl,
  "http://mouhebgh.com",
  "https://mouhebgh.com",
  "http://www.mouhebgh.com",
  "https://www.mouhebgh.com",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:5174",
  "http://127.0.0.1:5174",
  "http://localhost:5175",
  "http://127.0.0.1:5175",
].filter(Boolean));

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.has(origin)) {
        callback(null, true);
        return;
      }

      const error = new Error(`CORS origin not allowed: ${origin}`);
      error.status = 403;
      callback(error);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
app.use(express.json());
app.use("/uploads", express.static(path.resolve(process.cwd(), "uploads")));

app.use("/api/auth", authRoutes);
app.use("/api", portfolioRoutes);
app.use("/api/admin", adminRoutes);

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(error.status || 500).json({
    message: error.status === 403 ? "CORS origin not allowed" : "Internal server error",
  });
});

export async function start() {
  try {
    await connectDatabase(env.mongodbUri);
    await ensureAdminUser();
    try {
      await verifyMailerTransport();
      console.log("SMTP transport verified");
    } catch (error) {
      console.error(
        "SMTP verification failed. Password reset emails will be unavailable until SMTP is fixed.",
        error,
      );
    }
    app.listen(env.port, () => {
      console.log(`API listening on http://localhost:${env.port}`);
    });
  } catch (error) {
    console.error("Failed to start API", error);
    process.exit(1);
  }
}

export { app };

start();
