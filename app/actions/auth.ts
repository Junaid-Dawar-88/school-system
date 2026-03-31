"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createSession, destroySession } from "@/lib/auth";
import { redirect } from "next/navigation";

// ─── Login (Admin / Parent — email + password) ──────────────
export async function loginAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) return { error: "Email and password are required" };

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return { error: "Invalid email or password" };
  if (!user.organizationId) return { error: "Account not linked to any organization" };

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return { error: "Invalid email or password" };

  await createSession(user.id);
  redirect("/dashboard");
}

// ─── Teacher Login (email + code) ────────────────────────────
export async function teacherCodeLoginAction(formData: FormData) {
  const email = formData.get("email") as string;
  const code = formData.get("code") as string;

  if (!email || !code) return { error: "Email and code are required" };

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || user.role !== "TEACHER") return { error: "Invalid email or code" };
  if (!user.loginCode || user.loginCode !== code) return { error: "Invalid email or code" };
  if (!user.organizationId) return { error: "Account not linked to any organization" };

  await createSession(user.id);
  redirect("/dashboard");
}

// ─── Register as Parent (invite code) ────────────────────────
export async function registerParentAction(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const inviteCode = formData.get("inviteCode") as string;

  if (!name || !email || !password || !inviteCode) return { error: "All fields are required" };

  const org = await prisma.organization.findUnique({ where: { inviteCode } });
  if (!org) return { error: "Invalid invite code. Check with your school admin." };

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return { error: "Email already in use" };

  const hashed = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { name, email, password: hashed, role: "PARENT", organizationId: org.id },
  });

  await createSession(user.id);
  redirect("/dashboard");
}

// ─── Logout ──────────────────────────────────────────────────
export async function logoutAction() {
  await destroySession();
  redirect("/");
}
