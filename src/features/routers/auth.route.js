import express from "express";
import {
  login,
  register,
  emailCodeVerification,
  resendVerification,
  adminLoginStep1,
  adminLoginStep2,
  forgotPassword,
  resetPassword,
  logout,
  adminRegister,
  refreshToken,
  getAuthConfig,
  googleAuth,
} from "../controllers/auth.controller.js";
import { validateRequest } from "../../shared/middleware/validateRequest.js";
import {
  registerSchema,
  adminRegisterSchema,
  verifySchema,
  resendVerificationSchema,
  loginSchema,
  adminLoginStep1Schema,
  adminLoginStep2Schema,
  forgotPasswordSchema,
  resetPasswordSchema,
  logoutSchema,
  refreshTokenSchema,
  googleAuthBodySchema,
} from "../validation/auth.schemas.js";

const router = express.Router();

router.get("/config", getAuthConfig);
router.post("/register", validateRequest(registerSchema, "body"), register);
router.post(
  "/admin/register",
  validateRequest(adminRegisterSchema, "body"),
  adminRegister
);
router.post("/verify", validateRequest(verifySchema, "body"), emailCodeVerification);
router.post(
  "/resend-verification",
  validateRequest(resendVerificationSchema, "body"),
  resendVerification
);
router.post("/login", validateRequest(loginSchema, "body"), login);
router.post(
  "/google",
  validateRequest(googleAuthBodySchema, "body"),
  googleAuth
);
router.post(
  "/admin/login",
  validateRequest(adminLoginStep1Schema, "body"),
  adminLoginStep1
);
router.post(
  "/admin/login2",
  validateRequest(adminLoginStep2Schema, "body"),
  adminLoginStep2
);
router.post(
  "/forgotPassward",
  validateRequest(forgotPasswordSchema, "body"),
  forgotPassword
);
router.post(
  "/resetPassward",
  validateRequest(resetPasswordSchema, "body"),
  resetPassword
);
router.post("/logout", validateRequest(logoutSchema, "body"), logout);
router.post(
  "/refresh",
  validateRequest(refreshTokenSchema, "body"),
  refreshToken
);

export default router;
