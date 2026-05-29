import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { isTokenBlacklisted } from "../../features/service/tokenBlacklist.js";

export const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      status: 401,
      message: "No token provided",
      data: null,
    });
  }

  const token = authHeader.split(" ")[1];

  if (isTokenBlacklisted(token)) {
    return res.status(401).json({
      status: 401,
      message: "Token has been revoked",
      data: null,
    });
  }

  try {
    const decoded = jwt.verify(token, env.jwtSecret);
    req.user = {
      id: decoded.userId,
      role: decoded.role,
    };
    next();
  } catch (error) {
    const message =
      error.name === "TokenExpiredError" ? "Token expired" : "Token is invalid";
    res.status(401).json({
      status: 401,
      message,
      data: null,
    });
  }
};
