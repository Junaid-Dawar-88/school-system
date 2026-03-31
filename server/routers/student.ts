import { z } from "zod/v4";
import { router, teacherProcedure, protectedProcedure, adminProcedure } from "../trpc";
import { prisma } from "@/lib/prisma";

export const studentRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    const where: Record<string, unknown> = { organizationId: ctx.user.organizationId };

    if (ctx.user.role === "TEACHER") {
      const assignments = await prisma.classTeacher.findMany({
        where: { teacherId: ctx.user.id },
        select: { classId: true },
      });
      where.classId = { in: assignments.map((a) => a.classId) };
    }
    if (ctx.user.role === "PARENT") where.parentId = ctx.user.id;

    return prisma.student.findMany({
      where,
      include: {
        class: { select: { id: true, name: true } },
        parent: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  }),

  create: teacherProcedure
    .input(z.object({
      name: z.string().min(1),
      rollNumber: z.string().min(1),
      fatherName: z.string().min(1),
      classId: z.string().min(1),
      parentId: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      if (ctx.user.role === "TEACHER") {
        const assignment = await prisma.classTeacher.findFirst({
          where: { classId: input.classId, teacherId: ctx.user.id },
        });
        if (!assignment) throw new Error("Class not found or not assigned to you");
      }
      try {
        return await prisma.student.create({
          data: {
            name: input.name,
            rollNumber: input.rollNumber,
            fatherName: input.fatherName,
            classId: input.classId,
            parentId: input.parentId && input.parentId.length > 0 ? input.parentId : null,
            organizationId: ctx.user.organizationId,
          },
        });
      } catch (err) {
        console.error("student.create error:", err);
        throw err;
      }
    }),

  update: adminProcedure
    .input(z.object({ id: z.string(), name: z.string().min(1), rollNumber: z.string().min(1), fatherName: z.string().min(1), classId: z.string(), parentId: z.string().optional() }))
    .mutation(async ({ input, ctx }) => {
      const { id, ...data } = input;
      const student = await prisma.student.findFirst({
        where: { id, organizationId: ctx.user.organizationId },
      });
      if (!student) throw new Error("Student not found");
      return prisma.student.update({ where: { id }, data });
    }),

  delete: adminProcedure.input(z.object({ id: z.string() })).mutation(async ({ input, ctx }) => {
    const student = await prisma.student.findFirst({
      where: { id: input.id, organizationId: ctx.user.organizationId },
    });
    if (!student) throw new Error("Student not found");
    return prisma.student.delete({ where: { id: input.id } });
  }),

  // Get parents in this org for select dropdown
  parents: teacherProcedure.query(async ({ ctx }) => {
    return prisma.user.findMany({
      where: { organizationId: ctx.user.organizationId, role: "PARENT" },
      select: { id: true, name: true, email: true },
      orderBy: { name: "asc" },
    });
  }),
});
