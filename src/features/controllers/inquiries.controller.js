import Inquiry from "../models/inquirySchema.js";
import mailer from "../../shared/utils/mailer.js";
import { success, error } from "../../shared/utils/apiResponse.utils.js";

export async function createInquiry(req, res, next) {
  try {
    const inquiry = await Inquiry.create(req.body);
    return success(res, inquiry, "Inquiry submitted", 201);
  } catch (err) {
    next(err);
  }
}

export async function getInquiries(req, res, next) {
  try {
    const inquiries = await Inquiry.find().sort({ createdAt: -1 });
    return success(res, inquiries, "Inquiries retrieved");
  } catch (err) {
    next(err);
  }
}

export async function updateInquiry(req, res, next) {
  try {
    const existing = await Inquiry.findById(req.params.id);
    if (!existing) return error(res, "Inquiry not found", null, 404);

    const nextReply =
      typeof req.body.reply === "string" ? req.body.reply.trim() : "";
    const previousReply = (existing.reply ?? "").trim();
    const shouldEmailReply =
      nextReply.length > 0 && nextReply !== previousReply;

    const inquiry = await Inquiry.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    let message = "Inquiry updated";
    if (shouldEmailReply) {
      try {
        await mailer.inquiryReplyMail(inquiry.email, {
          name: inquiry.name,
          subject: inquiry.subject,
          originalMessage: inquiry.message,
          reply: inquiry.reply,
        });
        message = "Inquiry updated and reply emailed to the customer";
      } catch (mailErr) {
        console.error("Inquiry reply email failed:", mailErr);
        message =
          "Inquiry updated; reply saved but the email could not be sent";
      }
    }

    return success(res, inquiry, message);
  } catch (err) {
    next(err);
  }
}

export async function deleteInquiry(req, res, next) {
  try {
    const inquiry = await Inquiry.findByIdAndDelete(req.params.id);
    if (!inquiry) return error(res, "Inquiry not found", null, 404);
    return success(res, null, "Inquiry deleted");
  } catch (err) {
    next(err);
  }
}
