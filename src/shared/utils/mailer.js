import dns from "node:dns";
import nodemailer from "nodemailer";
import { env } from "../config/env.js";

// Render free tier blocks SMTP ports 465/587 — use Resend (HTTPS) in production.
if (typeof dns.setDefaultResultOrder === "function") {
  dns.setDefaultResultOrder("ipv4first");
}

let smtpTransporter = null;

function getSmtpTransporter() {
  if (!smtpTransporter) {
    smtpTransporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: env.emailUser,
        pass: env.emailPass,
      },
      family: 4,
      connectionTimeout: 15_000,
      greetingTimeout: 15_000,
      socketTimeout: 15_000,
    });
  }
  return smtpTransporter;
}

async function sendViaResend({ to, subject, text, html }) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: env.resendFrom,
      to: [to],
      subject,
      text,
      html,
    }),
  });

  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const detail =
      typeof body.message === "string"
        ? body.message
        : JSON.stringify(body);
    throw new Error(`Resend API error: ${detail}`);
  }
}

async function sendMail({ to, subject, text, html }) {
  if (env.resendApiKey) {
    await sendViaResend({ to, subject, text, html });
    return;
  }

  await getSmtpTransporter().sendMail({
    from: `Folio Books <${env.emailUser}>`,
    to,
    subject,
    text,
    html,
  });
}

async function verificationMail(to, code) {
  await sendMail({
    to,
    subject: "Your Folio Books verification code",
    text: `Your verification code is: ${code}\n\nThis code expires in 5 hours.`,
    html: `<h2>Your verification code</h2>
      <h1 style="letter-spacing:0.2em">${code}</h1>
      <p>This code expires in 5 hours.</p>`,
  });
}

async function resetPasswordMail(to, token) {
  const resetUrl = `${env.clientUrl}/reset-password?token=${encodeURIComponent(token)}`;
  await sendMail({
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

  await sendMail({
    to,
    subject: `Re: ${subject}`,
    text,
    html,
  });
}

export default { verificationMail, resetPasswordMail, inquiryReplyMail };
