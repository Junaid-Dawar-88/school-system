import { z } from "zod/v4";
import { router, protectedProcedure, teacherProcedure } from "../trpc";
import { prisma } from "@/lib/prisma";
import { TRPCError } from "@trpc/server";

export const assignmentRouter = router({
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

    return prisma.assignment.findMany({
      where,
      include: {
        class: { select: { name: true } },
        teacher: { select: { name: true } },
        submissions: { include: { student: { select: { name: true, rollNumber: true } } } },
      },
      orderBy: { dueDate: "desc" },
    });
  }),

  create: teacherProcedure
    .input(z.object({
      title: z.string().min(1),
      description: z.string().optional(),
      dueDate: z.string(),
      subject: z.string().min(1),
      classId: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      const orgId = ctx.user.organizationId;

      if (ctx.user.role === "TEACHER") {
        const assignment = await prisma.classTeacher.findFirst({ where: { classId: input.classId, teacherId: ctx.user.id } });
        if (!assignment) throw new TRPCError({ code: "FORBIDDEN", message: "Not your class" });
      }

      return prisma.assignment.create({
        data: {
          title: input.title,
          description: input.description || null,
          dueDate: new Date(input.dueDate),
          subject: input.subject,
          classId: input.classId,
          teacherId: ctx.user.id,
          organizationId: orgId,
        },
      });
    }),

  update: teacherProcedure
    .input(z.object({
      id: z.string(),
      title: z.string().min(1),
      description: z.string().optional(),
      dueDate: z.string(),
      subject: z.string().min(1),
    }))
    .mutation(async ({ input, ctx }) => {
      const record = await prisma.assignment.findFirst({ where: { id: input.id, organizationId: ctx.user.organizationId } });
      if (!record) throw new TRPCError({ code: "NOT_FOUND" });
      if (ctx.user.role === "TEACHER" && record.teacherId !== ctx.user.id) throw new TRPCError({ code: "FORBIDDEN" });
      return prisma.assignment.update({
        where: { id: input.id },
        data: { title: input.title, description: input.description, dueDate: new Date(input.dueDate), subject: input.subject },
      });
    }),

  delete: teacherProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const record = await prisma.assignment.findFirst({ where: { id: input.id, organizationId: ctx.user.organizationId } });
      if (!record) throw new TRPCError({ code: "NOT_FOUND" });
      if (ctx.user.role === "TEACHER" && record.teacherId !== ctx.user.id) throw new TRPCError({ code: "FORBIDDEN" });
      return prisma.assignment.delete({ where: { id: input.id } });
    }),

  submit: protectedProcedure
    .input(z.object({
      assignmentId: z.string(),
      studentId: z.string(),
      content: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const orgId = ctx.user.organizationId;
      return prisma.assignmentSubmission.upsert({
        where: { assignmentId_studentId: { assignmentId: input.assignmentId, studentId: input.studentId } },
        update: { content: input.content },
        create: {
          assignmentId: input.assignmentId,
          studentId: input.studentId,
          content: input.content,
          organizationId: orgId,
        },
      });
    }),

  gradeSubmission: teacherProcedure
    .input(z.object({
      id: z.string(),
      grade: z.number().min(0),
      feedback: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const record = await prisma.assignmentSubmission.findFirst({ where: { id: input.id, organizationId: ctx.user.organizationId } });
      if (!record) throw new TRPCError({ code: "NOT_FOUND" });
      return prisma.assignmentSubmission.update({
        where: { id: input.id },
        data: { grade: input.grade, feedback: input.feedback },
      });
    }),
});
