import { z } from "zod/v4";
import { router, adminProcedure } from "../trpc";
import { prisma } from "@/lib/prisma";
import { TRPCError } from "@trpc/server";
import { sendEmail } from "@/lib/email";

function generateCode() {
  // 8-char alphanumeric code
  return Math.random().toString(36).substring(2, 10).toUpperCase();
}

export const teacherRouter = router({
  list: adminProcedure.query(async ({ ctx }) => {
    return prisma.user.findMany({
      where: { organizationId: ctx.user.organizationId, role: "TEACHER" },
      select: { id: true, name: true, email: true, subject: true, createdAt: true, classAssignments: { select: { id: true } } },
      orderBy: { createdAt: "desc" },
    });
  }),

  // Admin adds teacher → generates login code → emails it
  create: adminProcedure
    .input(z.object({ name: z.string().min(1), email: z.string().email(), subjects: z.array(z.string()).min(1) }))
    .mutation(async ({ input, ctx }) => {
      const existing = await prisma.user.findUnique({ where: { email: input.email } });
      if (existing) throw new TRPCError({ code: "CONFLICT", message: "Email already in use" });

      const code = generateCode();

      const teacher = await prisma.user.create({
        data: {
          name: input.name,
          email: input.email,
          subject: input.subjects.join(","),
          password: "",
          role: "TEACHER",
          loginCode: code,
          organizationId: ctx.user.organizationId,
        },
      });

      // Get org name for the email
      const org = await prisma.organization.findUnique({ where: { id: ctx.user.organizationId } });

      // Send welcome email with login code
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

      sendEmail({
        to: input.email,
        subject: `Welcome to ${org?.name || "SchoolSystem"} — Download & Login`,
        html: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#f9fafb;padding:24px;">
            <div style="background:#2563eb;padding:32px;text-align:center;border-radius:12px 12px 0 0;">
              <h1 style="color:white;margin:0;font-size:28px;">Welcome to SchoolSystem!</h1>
              <p style="color:#bfdbfe;margin:8px 0 0 0;font-size:14px;">${org?.name || "Your School"}</p>
            </div>

            <div style="background:white;padding:32px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px;">
              <p style="font-size:16px;color:#333;">Dear <strong>${input.name}</strong>,</p>

              <p style="font-size:15px;color:#555;line-height:1.7;">
                Welcome! You have been added as a <strong>Teacher</strong> at <strong>${org?.name || "your school"}</strong>.
                Open the SchoolSystem app to start managing your classes, students, and attendance.
              </p>

              <div style="text-align:center;margin:24px 0;">
                <a href="${appUrl}/login" style="display:inline-block;background:#2563eb;color:white;padding:14px 32px;border-radius:8px;text-decoration:none;font-size:16px;font-weight:bold;">
                  Open SchoolSystem
                </a>
              </div>

              <div style="background:#f0f9ff;border:2px dashed #2563eb;border-radius:12px;padding:24px;margin:24px 0;text-align:center;">
                <p style="margin:0 0 4px 0;color:#555;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Your Login Code</p>
                <p style="margin:0;font-size:36px;font-weight:bold;color:#2563eb;letter-spacing:6px;font-family:monospace;">${code}</p>
              </div>

              <table style="width:100%;border-collapse:collapse;margin:20px 0;">
                <tr>
                  <td style="padding:8px 0;color:#888;font-size:13px;width:100px;">Email:</td>
                  <td style="padding:8px 0;color:#333;font-size:14px;font-weight:bold;">${input.email}</td>
                </tr>
                <tr>
                  <td style="padding:8px 0;color:#888;font-size:13px;">Login Code:</td>
                  <td style="padding:8px 0;color:#2563eb;font-size:14px;font-weight:bold;font-family:monospace;">${code}</td>
                </tr>
              </table>

              <div style="background:#fffbeb;border:1px solid #fbbf24;border-radius:8px;padding:16px;margin:20px 0;">
                <p style="margin:0;font-size:13px;color:#92400e;">
                  <strong>How to login:</strong> Open the app &rarr; Click "Login" &rarr; Select <strong>"Teacher (Code)"</strong> tab &rarr; Enter your email and code above.
                </p>
              </div>

              <p style="font-size:13px;color:#999;margin-top:24px;padding-top:16px;border-top:1px solid #eee;">
                Keep this code safe. You will need it every time you log in.<br>
                If you did not expect this email, please ignore it.
              </p>
            </div>
          </div>
        `,
      }).catch(console.error);

      return teacher;
    }),

  update: adminProcedure
    .input(z.object({ id: z.string(), name: z.string().min(1), email: z.string().email(), subjects: z.array(z.string()).min(1) }))
    .mutation(async ({ input, ctx }) => {
      const user = await prisma.user.findFirst({
        where: { id: input.id, organizationId: ctx.user.organizationId, role: "TEACHER" },
      });
      if (!user) throw new TRPCError({ code: "NOT_FOUND" });

      const dup = await prisma.user.findFirst({ where: { email: input.email, NOT: { id: input.id } } });
      if (dup) throw new TRPCError({ code: "CONFLICT", message: "Email already in use" });

      return prisma.user.update({
        where: { id: input.id },
        data: { name: input.name, email: input.email, subject: input.subjects.join(",") },
      });
    }),

  remove: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const user = await prisma.user.findFirst({
        where: { id: input.id, organizationId: ctx.user.organizationId, role: "TEACHER" },
      });
      if (!user) throw new TRPCError({ code: "NOT_FOUND" });

      // Remove teacher from all class assignments
      await prisma.classTeacher.deleteMany({ where: { teacherId: input.id } });
      // Delete notifications
      await prisma.notification.deleteMany({ where: { userId: input.id } });
      // Delete complaint replies
      await prisma.complaintReply.deleteMany({ where: { userId: input.id } });
      // Delete complaints created by teacher
      await prisma.complaint.deleteMany({ where: { createdById: input.id } });
      // Now delete the user
      return prisma.user.delete({ where: { id: input.id } });
    }),
});
