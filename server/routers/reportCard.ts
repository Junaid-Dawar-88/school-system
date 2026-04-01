import { z } from "zod/v4";
import { router, protectedProcedure, adminProcedure } from "../trpc";
import { prisma } from "@/lib/prisma";
import { TRPCError } from "@trpc/server";

export const reportCardRouter = router({
  list: protectedProcedure
    .input(z.object({ classId: z.string().optional(), term: z.string().optional(), year: z.number().optional() }))
    .query(async ({ input, ctx }) => {
      const orgId = ctx.user.organizationId;
      const where: Record<string, unknown> = { organizationId: orgId };

      if (input.classId) where.classId = input.classId;
      if (input.term) where.term = input.term;
      if (input.year) where.year = input.year;

      if (ctx.user.role === "PARENT") {
        const students = await prisma.student.findMany({ where: { parentId: ctx.user.id, organizationId: orgId }, select: { id: true } });
        where.studentId = { in: students.map((s) => s.id) };
      }

      return prisma.reportCard.findMany({
        where,
        include: {
          student: { select: { name: true, rollNumber: true } },
          class: { select: { name: true } },
        },
        orderBy: [{ year: "desc" }, { term: "desc" }],
      });
    }),

  generate: adminProcedure
    .input(z.object({ classId: z.string(), term: z.string(), year: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const orgId = ctx.user.organizationId;

      const students = await prisma.student.findMany({ where: { classId: input.classId, organizationId: orgId } });
      if (!students.length) throw new TRPCError({ code: "NOT_FOUND", message: "No students in this class" });

      const results = [];
      const studentScores: { studentId: string; total: number; maxTotal: number }[] = [];

      for (const student of students) {
        const grades = await prisma.grade.findMany({
          where: { studentId: student.id, classId: input.classId, organizationId: orgId },
        });

        const totalScore = grades.reduce((sum, g) => sum + g.score, 0);
        const maxTotal = grades.reduce((sum, g) => sum + g.maxScore, 0);
        const percentage = maxTotal > 0 ? Math.round((totalScore / maxTotal) * 100 * 100) / 100 : 0;

        studentScores.push({ studentId: student.id, total: totalScore, maxTotal });

        const rc = await prisma.reportCard.upsert({
          where: { studentId_term_year: { studentId: student.id, term: input.term, year: input.year } },
          update: { totalScore, maxTotal, percentage, classId: input.classId },
          create: {
            studentId: student.id,
            classId: input.classId,
            term: input.term,
            year: input.year,
            totalScore,
            maxTotal,
            percentage,
            organizationId: orgId,
          },
        });
        results.push(rc);
      }

      // Calculate ranks
      studentScores.sort((a, b) => b.total - a.total);
      for (let i = 0; i < studentScores.length; i++) {
        const rc = results.find((r) => r.studentId === studentScores[i].studentId);
        if (rc) {
          await prisma.reportCard.update({ where: { id: rc.id }, data: { rank: i + 1 } });
        }
      }

      return { count: results.length };
    }),

  delete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const record = await prisma.reportCard.findFirst({ where: { id: input.id, organizationId: ctx.user.organizationId } });
      if (!record) throw new TRPCError({ code: "NOT_FOUND" });
      return prisma.reportCard.delete({ where: { id: input.id } });
    }),
});
