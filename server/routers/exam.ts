import { z } from "zod/v4";
import { router, protectedProcedure, teacherProcedure } from "../trpc";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { TRPCError } from "@trpc/server";

export const examRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    const orgId = ctx.user.organizationId;
    const where: Record<string, unknown> = { organizationId: orgId };

    if (ctx.user.role === "TEACHER") {
      const assignments = await prisma.classTeacher.findMany({ where: { teacherId: ctx.user.id }, select: { classId: true } });
      where.classId = { in: assignments.map((a) => a.classId) };
    }
    if (ctx.user.role === "PARENT") {
      const students = await prisma.student.findMany({ where: { parentId: ctx.user.id, organizationId: orgId }, select: { classId: true } });
      where.classId = { in: students.map((s) => s.classId) };
    }

    return prisma.exam.findMany({
      where,
      include: {
        class: { select: { name: true } },
        createdBy: { select: { name: true } },
      },
      orderBy: { date: "desc" },
    });
  }),

  create: teacherProcedure
    .input(z.object({
      title: z.string().min(1),
      description: z.string().optional(),
      date: z.string(),
      classId: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      const orgId = ctx.user.organizationId;

      if (ctx.user.role === "TEACHER") {
        const assignment = await prisma.classTeacher.findFirst({ where: { classId: input.classId, teacherId: ctx.user.id } });
        if (!assignment) throw new TRPCError({ code: "FORBIDDEN", message: "Not your class" });
      }

      const exam = await prisma.exam.create({
        data: {
          title: input.title,
          description: input.description,
          date: new Date(input.date),
          classId: input.classId,
          createdById: ctx.user.id,
          organizationId: orgId,
        },
        include: { class: true },
      });

      // Notify all users in org + email parents
      const users = await prisma.user.findMany({ where: { organizationId: orgId, NOT: { id: ctx.user.id } }, select: { id: true } });
      for (const u of users) {
        await prisma.notification.create({
          data: { userId: u.id, title: `New Exam: ${input.title}`, message: `${exam.class.name} — ${new Date(input.date).toLocaleDateString()}`, type: "EXAM", organizationId: orgId },
        });
      }

      // Email parents of students in this class
      const students = await prisma.student.findMany({
        where: { classId: input.classId, parentId: { not: null } },
        include: { parent: { select: { email: true, name: true } } },
      });
      const emailed = new Set<string>();
      for (const s of students) {
        if (s.parent && !emailed.has(s.parent.email)) {
          emailed.add(s.parent.email);
          sendEmail({
            to: s.parent.email,
            subject: `Exam Scheduled: ${input.title}`,
            html: `<h2>Exam Notification</h2><p>Dear ${s.parent.name},</p><p>An exam has been scheduled:</p><ul><li><b>Exam:</b> ${input.title}</li><li><b>Class:</b> ${exam.class.name}</li><li><b>Date:</b> ${new Date(input.date).toLocaleDateString()}</li>${input.description ? `<li><b>Details:</b> ${input.description}</li>` : ""}</ul><p>DawloomSys</p>`,
          }).catch(console.error);
        }
      }

      return exam;
    }),

  delete: teacherProcedure.input(z.object({ id: z.string() })).mutation(async ({ input, ctx }) => {
    const exam = await prisma.exam.findFirst({ where: { id: input.id, organizationId: ctx.user.organizationId } });
    if (!exam) throw new TRPCError({ code: "NOT_FOUND" });
    return prisma.exam.delete({ where: { id: input.id } });
  }),
});
