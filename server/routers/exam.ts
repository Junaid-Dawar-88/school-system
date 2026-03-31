import { z } from "zod/v4";
import { router, protectedProcedure, teacherProcedure } from "../trpc";
import { prisma } from "@/lib/prisma";
import { TRPCError } from "@trpc/server";

export const examRouter = router({
  // All roles can view exams (scoped by org + class access)
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

  // Admin/Teacher create exam linked to class + subject
  create: teacherProcedure
    .input(z.object({
      title: z.string().min(1),
      description: z.string().optional(),
      date: z.string(),
      subject: z.string().min(1),
      classId: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      const orgId = ctx.user.organizationId;

      // Teacher can only create for their assigned classes
      if (ctx.user.role === "TEACHER") {
        const assignment = await prisma.classTeacher.findFirst({ where: { classId: input.classId, teacherId: ctx.user.id } });
        if (!assignment) throw new TRPCError({ code: "FORBIDDEN", message: "Not your class" });
      }

      console.log("[exam.create] Input:", JSON.stringify(input));
      console.log("[exam.create] OrgId:", orgId, "UserId:", ctx.user.id);

      let exam;
      try {
        exam = await prisma.exam.create({
          data: {
            title: input.title,
            description: input.description || null,
            date: new Date(input.date),
            subject: input.subject,
            classId: input.classId,
            createdById: ctx.user.id,
            organizationId: orgId,
          },
        });
        console.log("[exam.create] Success:", exam.id);
      } catch (err) {
        console.error("[exam.create] DB Error:", err);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to create exam. Check server logs." });
      }

      // Notify all org users (non-blocking)
      try {
        const cls = await prisma.class.findUnique({ where: { id: input.classId }, select: { name: true } });
        const allUsers = await prisma.user.findMany({
          where: { organizationId: orgId, NOT: { id: ctx.user.id } },
          select: { id: true },
        });

        for (const u of allUsers) {
          await prisma.notification.create({
            data: {
              userId: u.id,
              title: `New Exam: ${input.title}`,
              message: `${cls?.name || "Class"} — ${input.subject} — ${new Date(input.date).toLocaleDateString()}`,
              type: "GENERAL",
              organizationId: orgId,
            },
          });
        }
      } catch (err) {
        console.error("[exam.create] Notification error (non-fatal):", err);
      }

      return exam;
    }),

  // Admin/Teacher update
  update: teacherProcedure
    .input(z.object({
      id: z.string(),
      title: z.string().min(1),
      description: z.string().optional(),
      date: z.string(),
      subject: z.string().min(1),
    }))
    .mutation(async ({ input, ctx }) => {
      const exam = await prisma.exam.findFirst({ where: { id: input.id, organizationId: ctx.user.organizationId } });
      if (!exam) throw new TRPCError({ code: "NOT_FOUND" });

      if (ctx.user.role === "TEACHER" && exam.createdById !== ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "You can only edit exams you created" });
      }

      return prisma.exam.update({
        where: { id: input.id },
        data: {
          title: input.title,
          description: input.description,
          date: new Date(input.date),
          subject: input.subject,
        },
      });
    }),

  // Admin/Teacher delete
  delete: teacherProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const exam = await prisma.exam.findFirst({ where: { id: input.id, organizationId: ctx.user.organizationId } });
      if (!exam) throw new TRPCError({ code: "NOT_FOUND" });

      if (ctx.user.role === "TEACHER" && exam.createdById !== ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "You can only delete exams you created" });
      }

      return prisma.exam.delete({ where: { id: input.id } });
    }),
});
