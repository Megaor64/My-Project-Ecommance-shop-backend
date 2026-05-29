import crypto from "crypto";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { OAuth2Client } from "google-auth-library";
import User from "../models/UserSchema.js";
import { ensureSettings } from "./settings.service.js";
import mailer from "../../shared/utils/mailer.js";
import { env } from "../../shared/config/env.js";
import { blacklistToken } from "./tokenBlacklist.js";

function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function toPublicUser(user) {
  if (!user) return null;
  const obj = user.toJSON ? user.toJSON() : user;
  return {
    id: String(obj._id ?? obj.id),
    name: obj.name,
    email: obj.email,
    role: obj.role,
    isVerified: obj.isVerified,
  };
}

function normalizeEmail(email) {
  return String(email).toLowerCase().trim();
}

function codesMatch(stored, provided) {
  if (!stored || !provided) return false;
  const a = Buffer.from(String(stored));
  const b = Buffer.from(String(provided));
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

function signAccessToken(user) {
  return jwt.sign(
    { userId: user._id, role: user.role },
    env.jwtSecret,
    { expiresIn: "15m" }
  );
}

function signRefreshToken(user) {
  return jwt.sign(
    { userId: user._id, role: user.role },
    env.refreshJwtSecret,
    { expiresIn: "7d" }
  );
}

async function issueTokens(user) {
  await ensureSettings(user._id, user.role);
  return {
    accessToken: signAccessToken(user),
    refreshToken: signRefreshToken(user),
    user: toPublicUser(user),
  };
}

async function verifyGoogleIdToken(idToken) {
  if (!env.googleClientId) {
    const err = new Error("Google sign-in is not configured");
    err.status = 503;
    throw err;
  }
  const client = new OAuth2Client(env.googleClientId);
  try {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: env.googleClientId,
    });
    return ticket.getPayload();
  } catch {
    const err = new Error("Invalid or expired Google token");
    err.status = 401;
    throw err;
  }
}

async function linkGoogleId(user, googleId) {
  if (user.googleId) {
    if (user.googleId !== googleId) {
      const err = new Error("Google account does not match this user");
      err.status = 400;
      throw err;
    }
    return user;
  }
  user.googleId = googleId;
  await user.save();
  return user;
}

export async function authenticateWithGoogle({ idToken, intent, adminPass }) {
  const payload = await verifyGoogleIdToken(idToken);
  const { sub: googleId, email, name, email_verified: emailVerified } = payload;

  if (!emailVerified) {
    const err = new Error("Google email is not verified");
    err.status = 400;
    throw err;
  }

  const normalizedEmail = String(email).toLowerCase().trim();

  if (intent === "customer") {
    let user =
      (await User.findOne({ googleId })) ||
      (await User.findOne({ email: normalizedEmail }));

    if (!user) {
      user = await User.create({
        name: name || normalizedEmail.split("@")[0],
        email: normalizedEmail,
        googleId,
        authProvider: "google",
        role: "customer",
        isVerified: true,
      });
      return issueTokens(user);
    }

    if (user.role === "admin") {
      const err = new Error("Use the admin portal to sign in");
      err.status = 400;
      throw err;
    }

    user = await linkGoogleId(user, googleId);
    if (!user.isVerified) {
      user.isVerified = true;
      user.verificationCode = null;
      await user.save();
    }
    return issueTokens(user);
  }

  if (intent === "admin-login") {
    const user = await User.findOne({ email: normalizedEmail, role: "admin" });
    if (!user) {
      const err = new Error("Invalid credentials");
      err.status = 400;
      throw err;
    }
    const linked = await linkGoogleId(user, googleId);
    return issueTokens(linked);
  }

  if (intent === "admin-register") {
    if (!env.adminRegisterEnabled) {
      const err = new Error("Not found");
      err.status = 403;
      throw err;
    }
    if (adminPass !== env.adminPass) {
      const err = new Error("Admins only");
      err.status = 403;
      throw err;
    }
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      const err = new Error("Cannot register with this email");
      err.status = 409;
      throw err;
    }
    const user = await User.create({
      name: name || normalizedEmail.split("@")[0],
      email: normalizedEmail,
      googleId,
      authProvider: "google",
      role: "admin",
      isVerified: true,
    });
    return issueTokens(user);
  }

  const err = new Error("Invalid request");
  err.status = 400;
  throw err;
}

export async function registerUser({ name, email, password, role = "customer" }) {
  const normalizedEmail = normalizeEmail(email);
  const hashed = await bcrypt.hash(password, 10);
  const code = generateCode();
  const user = await User.create({
    name,
    email: normalizedEmail,
    role,
    verificationCode: code,
    password: hashed,
  });
  try {
    await mailer.verificationMail(normalizedEmail, code);
  } catch {
    // registration succeeds even if email fails
  }
  await ensureSettings(user._id, user.role);
  return toPublicUser(user);
}

export async function verifyEmail({ email, code }) {
  const user = await User.findOne({ email: normalizeEmail(email) });
  if (!user) {
    const err = new Error("No account found for this email");
    err.status = 404;
    throw err;
  }
  if (!codesMatch(user.verificationCode, code)) {
    const err = new Error("Wrong code");
    err.status = 400;
    throw err;
  }
  user.isVerified = true;
  user.verificationCode = null;
  await user.save();
  await ensureSettings(user._id, user.role);
  return toPublicUser(user);
}

export async function resendVerificationEmail({ email }) {
  const normalizedEmail = normalizeEmail(email);
  const user = await User.findOne({ email: normalizedEmail });
  if (!user) {
    const err = new Error("No account found for this email");
    err.status = 404;
    throw err;
  }
  if (user.isVerified) {
    const err = new Error("Email is already verified");
    err.status = 400;
    throw err;
  }
  const code = generateCode();
  user.verificationCode = code;
  await user.save();
  try {
    await mailer.verificationMail(normalizedEmail, code);
  } catch {
    // still return success if mail fails (same as register)
  }
  return { message: "Verification code sent." };
}

export async function loginCustomer({ email, password }) {
  const user = await User.findOne({ email: normalizeEmail(email) });
  if (!user || user.role !== "customer") {
    const err = new Error("Invalid credentials");
    err.status = 400;
    throw err;
  }
  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    const err = new Error("Invalid credentials");
    err.status = 400;
    throw err;
  }
  if (!user.isVerified) {
    const err = new Error("The user is not verified, please verify");
    err.status = 400;
    throw err;
  }
  return issueTokens(user);
}

export async function adminLoginStep1({ email, password }) {
  const user = await User.findOne({ email: normalizeEmail(email), role: "admin" });
  if (!user) {
    const err = new Error("Invalid email or password");
    err.status = 400;
    throw err;
  }
  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    const err = new Error("Invalid email or password");
    err.status = 400;
    throw err;
  }
  const code = generateCode();
  user.verificationCode = code;
  await user.save();
  const normalizedEmail = normalizeEmail(email);
  try {
    await mailer.verificationMail(normalizedEmail, code);
  } catch {
    // step1 still succeeds
  }
  return { message: "Verification code sent." };
}

export async function adminLoginStep2({ email, code }) {
  const user = await User.findOne({ email: normalizeEmail(email), role: "admin" });
  if (!user) {
    const err = new Error("Invalid request");
    err.status = 400;
    throw err;
  }
  if (!codesMatch(user.verificationCode, code)) {
    const err = new Error("Wrong code");
    err.status = 400;
    throw err;
  }
  user.verificationCode = null;
  await user.save();
  return issueTokens(user);
}

export async function refreshAccessToken(refreshToken) {
  const decoded = jwt.verify(refreshToken, env.refreshJwtSecret);
  const user = await User.findById(decoded.userId);
  if (!user) {
    const err = new Error("Invalid refresh token");
    err.status = 401;
    throw err;
  }
  return {
    accessToken: signAccessToken(user),
    refreshToken: signRefreshToken(user),
  };
}

export async function requestPasswordReset(email) {
  const user = await User.findOne({ email });
  if (!user) return;

  const resetToken = jwt.sign({ userId: user._id }, env.resetJwtSecret, {
    expiresIn: "15m",
  });
  user.resetPasswordToken = resetToken;
  user.resetPasswordTokenExpiry = new Date(Date.now() + 15 * 60 * 1000);
  await user.save();

  try {
    await mailer.resetPasswordMail(email, resetToken);
  } catch {
    // do not leak email delivery status
  }
}

export async function resetPassword({ token, newPassword }) {
  let decoded;
  try {
    decoded = jwt.verify(token, env.resetJwtSecret);
  } catch {
    const err = new Error("Invalid or expired reset token");
    err.status = 400;
    throw err;
  }

  const user = await User.findById(decoded.userId);
  if (
    !user ||
    user.resetPasswordToken !== token ||
    !user.resetPasswordTokenExpiry ||
    user.resetPasswordTokenExpiry < new Date()
  ) {
    const err = new Error("Invalid or expired reset token");
    err.status = 400;
    throw err;
  }

  user.password = await bcrypt.hash(newPassword, 10);
  user.resetPasswordToken = null;
  user.resetPasswordTokenExpiry = null;
  await user.save();
}

export function logoutUser(token) {
  blacklistToken(token);
}
