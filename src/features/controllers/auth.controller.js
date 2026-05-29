import * as authService from "../service/auth.service.js";
import { env } from "../../shared/config/env.js";

export const getAuthConfig = (_req, res) => {
  res.status(200).json({
    status: 200,
    message: "OK",
    data: {
      adminRegisterEnabled: env.adminRegisterEnabled,
    },
  });
};

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const user = await authService.registerUser({ name, email, password });
    res.status(200).json({
      status: 200,
      message: "Verification code sent.",
      data: user,
    });
  } catch (error) {
    if (String(error.code) === "11000") {
      return res.status(409).json({
        status: 409,
        message: "Cannot register with this email",
        data: null,
      });
    }
    res.status(500).json({
      status: 500,
      message: "Failed register a new user",
      data: null,
    });
  }
};

export async function emailCodeVerification(req, res) {
  try {
    await authService.verifyEmail(req.body);
    res.status(200).json({ message: "Email verified successfully" });
  } catch (error) {
    res.status(error.status || 500).json({
      message: error.message || "Something went wrong",
    });
  }
}

export async function resendVerification(req, res) {
  try {
    const result = await authService.resendVerificationEmail(req.body);
    res.status(200).json({
      status: 200,
      message: result.message,
      data: null,
    });
  } catch (error) {
    res.status(error.status || 500).json({
      status: error.status || 500,
      message: error.message || "Something went wrong",
      data: null,
    });
  }
}

export const adminRegister = async (req, res) => {
  if (!env.adminRegisterEnabled) {
    return res.status(404).json({
      status: 404,
      message: "Not found",
      data: null,
    });
  }
  try {
    const { name, email, password } = req.body;
    if (password !== env.adminPass) {
      return res.status(403).json({
        status: 403,
        message: "Admins only",
        data: null,
      });
    }
    const user = await authService.registerUser({
      name,
      email,
      password,
      role: "admin",
    });
    res.status(200).json({
      status: 200,
      message: "Verification code sent.",
      data: user,
    });
  } catch (error) {
    if (String(error.code) === "11000") {
      return res.status(409).json({
        status: 409,
        message: "Cannot register with this email",
        data: null,
      });
    }
    res.status(500).json({
      status: 500,
      message: "Failed register a new user",
      data: null,
    });
  }
};

export const login = async (req, res) => {
  try {
    const tokens = await authService.loginCustomer(req.body);
    res.status(200).json({
      status: 200,
      message: "Login successfully",
      data: tokens,
    });
  } catch (error) {
    res.status(error.status || 500).json({
      status: error.status || 500,
      message: error.message || "User login failed",
      data: null,
    });
  }
};

export const adminLoginStep1 = async (req, res, next) => {
  try {
    const result = await authService.adminLoginStep1(req.body);
    res.status(200).json({
      status: 200,
      message: result.message,
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

export const adminLoginStep2 = async (req, res, next) => {
  try {
    const tokens = await authService.adminLoginStep2(req.body);
    res.status(200).json({
      status: 200,
      message: "Login successfully",
      data: tokens,
    });
  } catch (error) {
    res.status(error.status || 400).json({
      status: error.status || 400,
      message: error.message,
      data: null,
    });
  }
};

export const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken: token } = req.body;
    const tokens = await authService.refreshAccessToken(token);
    res.status(200).json({
      status: 200,
      message: "Token refreshed",
      data: tokens,
    });
  } catch (error) {
    res.status(401).json({
      status: 401,
      message: "Invalid refresh token",
      data: null,
    });
  }
};

export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    await authService.requestPasswordReset(email);
    return res.status(200).json({
      status: 200,
      message: "If the email exists, a reset link has been sent",
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;
    await authService.resetPassword({ token, newPassword });
    return res.status(200).json({
      status: 200,
      message: "Password has been reset",
      data: null,
    });
  } catch (error) {
    res.status(error.status || 400).json({
      status: error.status || 400,
      message: error.message,
      data: null,
    });
  }
};

export const googleAuth = async (req, res) => {
  try {
    const tokens = await authService.authenticateWithGoogle(req.body);
    res.status(200).json({
      status: 200,
      message: "Login successfully",
      data: tokens,
    });
  } catch (error) {
    res.status(error.status || 500).json({
      status: error.status || 500,
      message: error.message || "Google sign-in failed",
      data: null,
    });
  }
};

export const logout = async (req, res, next) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({
        status: 400,
        message: "Wrong token",
        data: null,
      });
    }
    authService.logoutUser(token);
    res.status(200).json({
      status: 200,
      message: "Token deleted",
      data: null,
    });
  } catch (error) {
    next(error);
  }
};
