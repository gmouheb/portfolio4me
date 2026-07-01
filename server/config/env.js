import "dotenv/config";

function requireEnv(name) {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`${name} is required`);
  }

  return value;
}

function parseResetExpiryMs(rawValue) {
  const match = /^(\d+)([mh])$/.exec(rawValue);

  if (!match) {
    throw new Error("RESET_TOKEN_EXPIRES must use the format <number>m or <number>h");
  }

  const value = Number(match[1]);
  return match[2] === "h" ? value * 60 * 60 * 1000 : value * 60 * 1000;
}

function parseListEnv(rawValue) {
  return (rawValue || "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
}

function firstListValue(rawValue, fallback) {
  return parseListEnv(rawValue)[0] || fallback;
}

const clientUrls = parseListEnv(process.env.CLIENT_URL);
const clientUrl = firstListValue(process.env.CLIENT_URL, "http://localhost:5173");
const appUrls = parseListEnv(process.env.APP_URL);
const appUrl = firstListValue(process.env.APP_URL, clientUrl);
const explicitCorsOrigins = parseListEnv(process.env.CORS_ORIGINS);
const corsOrigins = explicitCorsOrigins.length
  ? explicitCorsOrigins
  : [...clientUrls, ...appUrls, clientUrl, appUrl];
const cookieSameSite = (process.env.COOKIE_SAME_SITE?.trim().toLowerCase() || "lax");
const cookieSecure = process.env.COOKIE_SECURE?.trim()
  ? process.env.COOKIE_SECURE.trim().toLowerCase() === "true"
  : envFromNode();

function envFromNode() {
  return process.env.NODE_ENV === "production";
}

export const env = {
  mongodbUri: requireEnv("MONGODB_URI"),
  port: Number(process.env.PORT || 5000),
  clientUrl,
  appUrl,
  corsOrigins,
  jwtSecret: requireEnv("JWT_SECRET"),
  adminUsername: requireEnv("ADMIN_USERNAME"),
  adminPassword: requireEnv("ADMIN_PASSWORD"),
  adminEmail: requireEnv("ADMIN_EMAIL").toLowerCase(),
  smtpFrom: requireEnv("SMTP_FROM"),
  smtpAppPassword: requireEnv("SMTP_APP_PASSWORD"),
  smtpAppName: process.env.SMTP_APP_NAME?.trim() || "my_portfolio",
  resetTokenExpiresMs: parseResetExpiryMs(process.env.RESET_TOKEN_EXPIRES?.trim() || "15m"),
  isProduction: envFromNode(),
  cookieSameSite,
  cookieSecure,
  sessionCookieName: "admin_session",
  messagePageSize: 100,
};

export { firstListValue, parseListEnv, parseResetExpiryMs };

