import nodemailer from "nodemailer";
import { env } from "../config/env.js";

let transporter;

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: env.smtpFrom,
        pass: env.smtpAppPassword,
      },
    });
  }

  return transporter;
}

export async function verifyMailerTransport() {
  await getTransporter().verify();
}

export async function sendResetPasswordEmail({ to, resetUrl }) {
  const mailer = getTransporter();

  await mailer.sendMail({
    from: `"${env.smtpAppName}" <${env.smtpFrom}>`,
    to,
    subject: "Reset your admin password",
    text: `Reset your password using this link: ${resetUrl}`,
    html: `
      <div style="font-family:Segoe UI,sans-serif;line-height:1.6;color:#111827">
        <h2>Reset your admin password</h2>
        <p>Use the link below to set a new password for your admin account.</p>
        <p><a href="${resetUrl}">${resetUrl}</a></p>
        <p>If you did not request this, you can ignore this email.</p>
      </div>
    `,
  });
}
