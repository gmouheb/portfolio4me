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

const clientUrl = process.env.CLIENT_URL?.trim() || "http://localhost:5173";
const appUrl = process.env.APP_URL?.trim() || clientUrl;

export const env = {
  mongodbUri: requireEnv("MONGODB_URI"),
  port: Number(process.env.PORT || 5000),
  clientUrl,
  appUrl,
  jwtSecret: requireEnv("JWT_SECRET"),
  adminUsername: requireEnv("ADMIN_USERNAME"),
  adminPassword: requireEnv("ADMIN_PASSWORD"),
  adminEmail: requireEnv("ADMIN_EMAIL").toLowerCase(),
  smtpFrom: requireEnv("SMTP_FROM"),
  smtpAppPassword: requireEnv("SMTP_APP_PASSWORD"),
  smtpAppName: process.env.SMTP_APP_NAME?.trim() || "my_portfolio",
  resetTokenExpiresMs: parseResetExpiryMs(process.env.RESET_TOKEN_EXPIRES?.trim() || "15m"),
  isProduction: process.env.NODE_ENV === "production",
  sessionCookieName: "admin_session",
  messagePageSize: 100,
};

export { parseResetExpiryMs };
