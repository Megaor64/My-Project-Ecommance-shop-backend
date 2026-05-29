import express from "express";
import {
  createInquiry,
  deleteInquiry,
  getInquiries,
  updateInquiry,
} from "../controllers/inquiries.controller.js";
import { authMiddleware } from "../../shared/middleware/authMiddleware.js";
import { requireAdmin } from "../../shared/middleware/requireAdmin.js";
import { validateRequest } from "../../shared/middleware/validateRequest.js";
import {
  createInquirySchema,
  updateInquirySchema,
  inquiryIdParamsSchema,
} from "../validation/inquiries.schemas.js";

const router = express.Router();

router.post(
  "/",
  validateRequest(createInquirySchema, "body"),
  createInquiry
);
router.get("/", authMiddleware, requireAdmin, getInquiries);
router.patch(
  "/:id",
  validateRequest(inquiryIdParamsSchema, "params"),
  validateRequest(updateInquirySchema, "body"),
  authMiddleware,
  requireAdmin,
  updateInquiry
);
router.delete(
  "/:id",
  validateRequest(inquiryIdParamsSchema, "params"),
  authMiddleware,
  requireAdmin,
  deleteInquiry
);

export default router;
