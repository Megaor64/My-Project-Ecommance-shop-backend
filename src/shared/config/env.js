import dotenv from "dotenv";

dotenv.config();

const required = ["MONGO_URI", "JWT_SECRET", "RESET_JWT_SECRET"];

const usesResend = Boolean(process.env.RESEND_API_KEY?.trim());

if (!usesResend) {
  required.push("EMAIL_USER", "EMAIL_PASS");
}

for (const key of required) {
  if (!process.env[key]) {
    console.error(`Missing required environment variable: ${key}`);
    process.exit(1);
  }
}

if (usesResend) {
  console.log("Email: using Resend API (HTTPS)");
} else {
  console.log("Email: using Gmail SMTP (local dev)");
}

function normalizeEmailPass(value) {
  // Gmail app passwords are often copied with spaces (abcd efgh ...).
  return String(value || "").replace(/\s+/g, "").trim();
}

export const env = {
  mongoUri: process.env.MONGO_URI,
  jwtSecret: process.env.JWT_SECRET,
  resetJwtSecret: process.env.RESET_JWT_SECRET,
  refreshJwtSecret: process.env.REFRESH_JWT_SECRET || process.env.JWT_SECRET,
  adminPass: process.env.ADMIN_PASS,
  clientUrl: process.env.CLIENT_URL || "http://localhost:3000",
  emailUser: String(process.env.EMAIL_USER || "").trim(),
  emailPass: normalizeEmailPass(process.env.EMAIL_PASS),
  resendApiKey: String(process.env.RESEND_API_KEY || "").trim(),
  resendFrom:
    String(process.env.RESEND_FROM || "").trim() ||
    "Folio Books <onboarding@resend.dev>",
  nodeEnv: process.env.NODE_ENV || "development",
  adminRegisterEnabled: process.env.ADMIN_REGISTER_ENABLED === "true",
  googleClientId: process.env.GOOGLE_CLIENT_ID || "",
};
