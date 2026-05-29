import dotenv from "dotenv";

dotenv.config();

const required = [
  "MONGO_URI",
  "JWT_SECRET",
  "RESET_JWT_SECRET",
  "EMAIL_USER",
  "EMAIL_PASS",
];

for (const key of required) {
  if (!process.env[key]) {
    console.error(`Missing required environment variable: ${key}`);
    process.exit(1);
  }
}

export const env = {
  mongoUri: process.env.MONGO_URI,
  jwtSecret: process.env.JWT_SECRET,
  resetJwtSecret: process.env.RESET_JWT_SECRET,
  refreshJwtSecret: process.env.REFRESH_JWT_SECRET || process.env.JWT_SECRET,
  adminPass: process.env.ADMIN_PASS,
  clientUrl: process.env.CLIENT_URL || "http://localhost:3000",
  emailUser: process.env.EMAIL_USER,
  emailPass: process.env.EMAIL_PASS,
  nodeEnv: process.env.NODE_ENV || "development",
  adminRegisterEnabled: process.env.ADMIN_REGISTER_ENABLED === "true",
  googleClientId: process.env.GOOGLE_CLIENT_ID || "",
};
