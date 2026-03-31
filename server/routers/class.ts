import { z } from "zod/v4";
import { router, protectedProcedure, adminProcedure } from "../trpc";
import { prisma } from "@/lib/prisma";
import { TRPCError } from "@trpc/server";

export const classRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    const where: Record<string, unknown> = { organizationId: ctx.user.organizationId };

    if (ctx.user.role === "TEACHER") {
      // Teacher sees only classes they're assigned to
      const assignments = await prisma.classTeacher.findMany({
        where: { teacherId: ctx.user.id },
        select: { classId: true },
      });
      where.id = { in: assignments.map((a) => a.classId) };
    }
    if (ctx.user.role === "PARENT") {
      const students = await prisma.student.findMany({
        where: { parentId: ctx.user.id, organizationId: ctx.user.organizationId },
        select: { classId: true },
      });
      where.id = { in: students.map((s) => s.classId) };
    }

    return prisma.class.findMany({
      where,
      include: {
        teachers: { include: { teacher: { select: { id: true, name: true } } } },
        _count: { select: { students: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  }),

  getById: protectedProcedure.input(z.object({ id: z.string() })).query(async ({ input, ctx }) => {
    return prisma.class.findFirst({
      where: { id: input.id, organizationId: ctx.user.organizationId },
      include: {
        teachers: { include: { teacher: { select: { id: true, name: true } } } },
        students: { include: { parent: { select: { name: true } } } },
      },
    });
  }),

  // Admin creates class and assigns teachers with subjects
  create: adminProcedure
    .input(z.object({
      name: z.string().min(1),
      teachers: z.array(z.object({
        teacherId: z.string(),
        subject: z.string(),
      })).min(1),
    }))
    .mutation(async ({ input, ctx }) => {
      // Check if class name already exists in this org
      const existing = await prisma.class.findFirst({
        where: { name: input.name, organizationId: ctx.user.organizationId },
      });
      if (existing) throw new TRPCError({ code: "CONFLICT", message: "A class with this name already exists" });

      console.log("[class.create] Input:", JSON.stringify(input));
      console.log("[class.create] OrgId:", ctx.user.organizationId);

      const cls = await prisma.class.create({
        data: {
          name: input.name,
          organizationId: ctx.user.organizationId,
        },
      });
      console.log("[class.create] Class created:", cls.id);

      for (const t of input.teachers) {
        console.log("[class.create] Adding teacher:", t.teacherId, "subject:", t.subject);
        await prisma.classTeacher.create({
          data: { classId: cls.id, teacherId: t.teacherId, subject: t.subject },
        });
      }
      console.log("[class.create] Done, teachers assigned:", input.teachers.length);

      return cls;
    }),

  update: adminProcedure
    .input(z.object({
      id: z.string(),
      name: z.string().min(1),
      teachers: z.array(z.object({
        teacherId: z.string(),
        subject: z.string(),
      })),
    }))
    .mutation(async ({ input, ctx }) => {
      const cls = await prisma.class.findFirst({
        where: { id: input.id, organizationId: ctx.user.organizationId },
      });
      if (!cls) throw new Error("Class not found");

      await prisma.class.update({ where: { id: input.id }, data: { name: input.name } });

      // Remove old assignments, add new ones
      await prisma.classTeacher.deleteMany({ where: { classId: input.id } });
      for (const t of input.teachers) {
        await prisma.classTeacher.create({
          data: { classId: input.id, teacherId: t.teacherId, subject: t.subject },
        });
      }

      return cls;
    }),

  delete: adminProcedure.input(z.object({ id: z.string() })).mutation(async ({ input, ctx }) => {
    const cls = await prisma.class.findFirst({
      where: { id: input.id, organizationId: ctx.user.organizationId },
    });
    if (!cls) throw new Error("Class not found");
    return prisma.class.delete({ where: { id: input.id } });
  }),
});
