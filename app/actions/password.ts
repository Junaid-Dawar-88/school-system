"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";

export async function forgotPasswordAction(formData: FormData) {
  const email = formData.get("email") as string;
  if (!email) return { error: "Email is required" };

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return { success: "If an account exists, a reset link has been sent." };

  // Generate token
  const token = crypto.randomUUID();
  const exp = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await prisma.user.update({
    where: { id: user.id },
    data: { resetToken: token, resetTokenExp: exp },
  });

  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/reset-password?token=${token}`;

  await sendEmail({
    to: email,
    subject: "Reset Your Password — DawloomSys",
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
        <div style="background:#2563eb;padding:24px;text-align:center;border-radius:12px 12px 0 0;">
          <h1 style="color:white;margin:0;font-size:22px;">Password Reset</h1>
        </div>
        <div style="background:white;padding:24px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px;">
          <p>Dear ${user.name},</p>
          <p>Click the button below to reset your password. This link expires in 1 hour.</p>
          <div style="text-align:center;margin:24px 0;">
            <a href="${resetUrl}" style="display:inline-block;background:#2563eb;color:white;padding:12px 32px;border-radius:8px;text-decoration:none;font-weight:bold;">Reset Password</a>
          </div>
          <p style="color:#999;font-size:13px;">If you didn't request this, ignore this email.</p>
        </div>
      </div>
    `,
  }).catch(console.error);

  return { success: "If an account exists, a reset link has been sent." };
}

export async function resetPasswordAction(formData: FormData) {
  const token = formData.get("token") as string;
  const password = formData.get("password") as string;
  const confirm = formData.get("confirm") as string;

  if (!token || !password) return { error: "All fields are required" };
  if (password.length < 6) return { error: "Password must be at least 6 characters" };
  if (password !== confirm) return { error: "Passwords do not match" };

  const user = await prisma.user.findFirst({
    where: { resetToken: token, resetTokenExp: { gt: new Date() } },
  });

  if (!user) return { error: "Invalid or expired reset link. Please request a new one." };

  const hashed = await bcrypt.hash(password, 10);
  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashed, resetToken: null, resetTokenExp: null },
  });

  return { success: "Password reset successfully. You can now login." };
}
