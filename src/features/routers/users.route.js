import express from "express";
import {
  deleteUser,
  getUserById,
  getUsers,
  updateUser,
} from "../controllers/users.controller.js";
import { updateUserRole } from "../controllers/settings.controller.js";
import settingsRouter from "./settings.route.js";
import { authMiddleware } from "../../shared/middleware/authMiddleware.js";
import { adminCheck } from "../../shared/middleware/adminMiddlware.js";
import { ownerOrAdmin } from "../../shared/middleware/ownerOrAdmin.js";
import { checkPermissions } from "../../shared/middleware/checkPermissions.js";
import { validateRequest } from "../../shared/middleware/validateRequest.js";
import {
  getUserByIdParamsSchema,
  updateUserBodySchema,
} from "../validation/user.schemas.js";
import {
  settingsUserIdParamsSchema,
  updateRoleBodySchema,
} from "../validation/settings.schemas.js";

const router = express.Router();

router.get("/", authMiddleware, adminCheck, getUsers);
router.get(
  "/:id",
  validateRequest(getUserByIdParamsSchema, "params"),
  authMiddleware,
  ownerOrAdmin,
  getUserById
);
router.use(
  "/:id/settings",
  validateRequest(settingsUserIdParamsSchema, "params"),
  authMiddleware,
  ownerOrAdmin,
  settingsRouter
);
router.patch(
  "/:id/role",
  validateRequest(getUserByIdParamsSchema, "params"),
  validateRequest(updateRoleBodySchema, "body"),
  authMiddleware,
  adminCheck,
  updateUserRole
);
router.patch(
  "/:id",
  validateRequest(getUserByIdParamsSchema, "params"),
  validateRequest(updateUserBodySchema, "body"),
  authMiddleware,
  checkPermissions,
  updateUser
);
router.delete(
  "/:id",
  validateRequest(getUserByIdParamsSchema, "params"),
  authMiddleware,
  checkPermissions,
  deleteUser
);

export default router;
