import { z } from "zod/v4";
import { router, protectedProcedure, teacherProcedure } from "../trpc";
import { prisma } from "@/lib/prisma";
import { TRPCError } from "@trpc/server";

export const gradeRouter = router({
  list: protectedProcedure
    .input(z.object({ classId: z.string().optional(), examId: z.string().optional() }))
    .query(async ({ input, ctx }) => {
      const orgId = ctx.user.organizationId;
      const where: Record<string, unknown> = { organizationId: orgId };

      if (input.classId) where.classId = input.classId;
      if (input.examId) where.examId = input.examId;

      if (ctx.user.role === "TEACHER") {
        const assignments = await prisma.classTeacher.findMany({ where: { teacherId: ctx.user.id }, select: { classId: true } });
        where.classId = input.classId || { in: assignments.map((a) => a.classId) };
      }
      if (ctx.user.role === "PARENT") {
        const students = await prisma.student.findMany({ where: { parentId: ctx.user.id, organizationId: orgId }, select: { id: true } });
        where.studentId = { in: students.map((s) => s.id) };
      }

      return prisma.grade.findMany({
        where,
        include: {
          student: { select: { name: true, rollNumber: true } },
          exam: { select: { title: true, date: true } },
          class: { select: { name: true } },
        },
        orderBy: { createdAt: "desc" },
      });
    }),

  bulkCreate: teacherProcedure
    .input(z.object({
      examId: z.string(),
      classId: z.string(),
      subject: z.string(),
      grades: z.array(z.object({
        studentId: z.string(),
        score: z.number().min(0),
        maxScore: z.number().min(1).default(100),
        grade: z.string().optional(),
        remarks: z.string().optional(),
      })),
    }))
    .mutation(async ({ input, ctx }) => {
      const orgId = ctx.user.organizationId;

      if (ctx.user.role === "TEACHER") {
        const assignment = await prisma.classTeacher.findFirst({ where: { classId: input.classId, teacherId: ctx.user.id } });
        if (!assignment) throw new TRPCError({ code: "FORBIDDEN", message: "Not your class" });
      }

      const results = [];
      for (const g of input.grades) {
        const result = await prisma.grade.upsert({
          where: { studentId_examId_subject: { studentId: g.studentId, examId: input.examId, subject: input.subject } },
          update: { score: g.score, maxScore: g.maxScore, grade: g.grade, remarks: g.remarks },
          create: {
            score: g.score,
            maxScore: g.maxScore,
            grade: g.grade,
            remarks: g.remarks,
            subject: input.subject,
            studentId: g.studentId,
            classId: input.classId,
            examId: input.examId,
            teacherId: ctx.user.id,
            organizationId: orgId,
          },
        });
        results.push(result);
      }
      return { count: results.length };
    }),

  update: teacherProcedure
    .input(z.object({
      id: z.string(),
      score: z.number().min(0),
      maxScore: z.number().min(1),
      grade: z.string().optional(),
      remarks: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const record = await prisma.grade.findFirst({ where: { id: input.id, organizationId: ctx.user.organizationId } });
      if (!record) throw new TRPCError({ code: "NOT_FOUND" });
      return prisma.grade.update({ where: { id: input.id }, data: { score: input.score, maxScore: input.maxScore, grade: input.grade, remarks: input.remarks } });
    }),

  delete: teacherProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const record = await prisma.grade.findFirst({ where: { id: input.id, organizationId: ctx.user.organizationId } });
      if (!record) throw new TRPCError({ code: "NOT_FOUND" });
      return prisma.grade.delete({ where: { id: input.id } });
    }),
});
