import nodemailer from "nodemailer";
import { env } from "../config/env.js";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: env.emailUser,
    pass: env.emailPass,
  },
});

async function verificationMail(to, code) {
  await transporter.sendMail({
    from: `my website ${env.emailUser}`,
    to,
    subject: "Your Verification Code:",
    text: `This is the Verification code: ${code}`,
    html: `<h2>Your verification code</h2>
      <h1>${code}</h1>
      <p>This code expires in 5 hours.</p>`,
  });
}

async function resetPasswordMail(to, token) {
  const resetUrl = `${env.clientUrl}/reset-password?token=${encodeURIComponent(token)}`;
  await transporter.sendMail({
    from: `my website ${env.emailUser}`,
    to,
    subject: "Password reset link",
    text: `Use this link to reset your password: ${resetUrl}`,
    html: `<h2>Reset your password</h2>
      <p><a href="${resetUrl}">${resetUrl}</a></p>
      <p>This link expires in 15 minutes.</p>`,
  });
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

async function inquiryReplyMail(to, { name, subject, originalMessage, reply }) {
  const safeName = escapeHtml(name || "there");
  const safeSubject = escapeHtml(subject);
  const safeReply = escapeHtml(reply);
  const safeOriginal = escapeHtml(originalMessage);
  const text = `Hello ${name || "there"},

Thank you for contacting Folio Books regarding "${subject}".

Our team replied to your message:

${reply}

---
Your original message:
${originalMessage}

— Folio Books`;

  const html = `<h2>Reply from Folio Books</h2>
    <p>Hello ${safeName},</p>
    <p>Thank you for contacting us about <strong>${safeSubject}</strong>.</p>
    <h3>Our reply</h3>
    <p style="white-space:pre-wrap">${safeReply}</p>
    <hr />
    <h4>Your message</h4>
    <p style="white-space:pre-wrap;color:#555">${safeOriginal}</p>
    <p>— Folio Books</p>`;

  await transporter.sendMail({
    from: `Folio Books <${env.emailUser}>`,
    to,
    subject: `Re: ${subject}`,
    text,
    html,
  });
}

export default { verificationMail, resetPasswordMail, inquiryReplyMail };
