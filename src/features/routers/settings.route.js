import express from "express";
import {
  getSettings,
  patchAppearance,
  patchNotifications,
  patchPermissions,
} from "../controllers/settings.controller.js";
import { adminCheck } from "../../shared/middleware/adminMiddlware.js";
import { validateRequest } from "../../shared/middleware/validateRequest.js";
import {
  appearanceSchema,
  notificationsSchema,
  permissionsSchema,
  settingsUserIdParamsSchema,
} from "../validation/settings.schemas.js";

const router = express.Router({ mergeParams: true });

router.get(
  "/",
  validateRequest(settingsUserIdParamsSchema, "params"),
  getSettings
);

router.patch(
  "/appearance",
  validateRequest(settingsUserIdParamsSchema, "params"),
  validateRequest(appearanceSchema, "body"),
  patchAppearance
);

router.patch(
  "/notifications",
  validateRequest(settingsUserIdParamsSchema, "params"),
  validateRequest(notificationsSchema, "body"),
  patchNotifications
);

router.patch(
  "/permissions",
  adminCheck,
  validateRequest(settingsUserIdParamsSchema, "params"),
  validateRequest(permissionsSchema, "body"),
  patchPermissions
);

export default router;
