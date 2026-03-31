import nodemailer from "nodemailer";

function getTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

export async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log("[Email] SMTP_USER or SMTP_PASS not set. Skipping email to:", to);
    console.log("[Email] Subject:", subject);
    console.log("[Email] SMTP_USER exists:", !!process.env.SMTP_USER);
    console.log("[Email] SMTP_PASS exists:", !!process.env.SMTP_PASS);
    return;
  }

  try {
    const transporter = getTransporter();
    const result = await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to,
      subject,
      html,
    });
    console.log("[Email] Sent to:", to, "MessageId:", result.messageId);
    return result;
  } catch (error) {
    console.error("[Email] Failed to send to:", to, "Error:", error);
    throw error;
  }
}
