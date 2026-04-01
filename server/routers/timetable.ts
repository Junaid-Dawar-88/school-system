import { z } from "zod/v4";
import { router, protectedProcedure, adminProcedure } from "../trpc";
import { prisma } from "@/lib/prisma";
import { TRPCError } from "@trpc/server";

export const timetableRouter = router({
  list: protectedProcedure
    .input(z.object({ classId: z.string().optional() }))
    .query(async ({ input, ctx }) => {
      const orgId = ctx.user.organizationId;
      const where: Record<string, unknown> = { organizationId: orgId };

      if (input.classId) where.classId = input.classId;

      if (ctx.user.role === "TEACHER") {
        if (!input.classId) where.teacherId = ctx.user.id;
      }
      if (ctx.user.role === "PARENT") {
        const students = await prisma.student.findMany({ where: { parentId: ctx.user.id, organizationId: orgId }, select: { classId: true } });
        where.classId = input.classId || { in: students.map((s) => s.classId) };
      }

      return prisma.timetable.findMany({
        where,
        include: {
          class: { select: { name: true } },
          teacher: { select: { name: true } },
        },
        orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
      });
    }),

  create: adminProcedure
    .input(z.object({
      classId: z.string(),
      dayOfWeek: z.enum(["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"]),
      startTime: z.string(),
      endTime: z.string(),
      subject: z.string().min(1),
      teacherId: z.string(),
      room: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      return prisma.timetable.create({
        data: { ...input, room: input.room || null, organizationId: ctx.user.organizationId },
      });
    }),

  update: adminProcedure
    .input(z.object({
      id: z.string(),
      dayOfWeek: z.enum(["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"]),
      startTime: z.string(),
      endTime: z.string(),
      subject: z.string().min(1),
      teacherId: z.string(),
      room: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const record = await prisma.timetable.findFirst({ where: { id: input.id, organizationId: ctx.user.organizationId } });
      if (!record) throw new TRPCError({ code: "NOT_FOUND" });
      const { id, ...data } = input;
      return prisma.timetable.update({ where: { id }, data: { ...data, room: data.room || null } });
    }),

  delete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const record = await prisma.timetable.findFirst({ where: { id: input.id, organizationId: ctx.user.organizationId } });
      if (!record) throw new TRPCError({ code: "NOT_FOUND" });
      return prisma.timetable.delete({ where: { id: input.id } });
    }),
});
