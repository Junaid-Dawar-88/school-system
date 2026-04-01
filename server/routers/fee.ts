import { z } from "zod/v4";
import { router, protectedProcedure, adminProcedure } from "../trpc";
import { prisma } from "@/lib/prisma";
import { TRPCError } from "@trpc/server";

export const feeRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    const orgId = ctx.user.organizationId;
    const where: Record<string, unknown> = { organizationId: orgId };

    if (ctx.user.role === "PARENT") {
      const students = await prisma.student.findMany({ where: { parentId: ctx.user.id, organizationId: orgId }, select: { classId: true } });
      where.classId = { in: students.map((s) => s.classId) };
    }

    return prisma.fee.findMany({
      where,
      include: {
        class: { select: { name: true } },
        payments: { include: { student: { select: { name: true, rollNumber: true } } } },
      },
      orderBy: { dueDate: "desc" },
    });
  }),

  create: adminProcedure
    .input(z.object({
      title: z.string().min(1),
      amount: z.number().min(0),
      dueDate: z.string(),
      classId: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      return prisma.fee.create({
        data: {
          title: input.title,
          amount: input.amount,
          dueDate: new Date(input.dueDate),
          classId: input.classId,
          organizationId: ctx.user.organizationId,
        },
      });
    }),

  update: adminProcedure
    .input(z.object({
      id: z.string(),
      title: z.string().min(1),
      amount: z.number().min(0),
      dueDate: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      const record = await prisma.fee.findFirst({ where: { id: input.id, organizationId: ctx.user.organizationId } });
      if (!record) throw new TRPCError({ code: "NOT_FOUND" });
      return prisma.fee.update({ where: { id: input.id }, data: { title: input.title, amount: input.amount, dueDate: new Date(input.dueDate) } });
    }),

  delete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const record = await prisma.fee.findFirst({ where: { id: input.id, organizationId: ctx.user.organizationId } });
      if (!record) throw new TRPCError({ code: "NOT_FOUND" });
      return prisma.fee.delete({ where: { id: input.id } });
    }),

  recordPayment: adminProcedure
    .input(z.object({
      feeId: z.string(),
      studentId: z.string(),
      amountPaid: z.number().min(0),
      status: z.enum(["PENDING", "PAID", "PARTIAL", "OVERDUE"]),
    }))
    .mutation(async ({ input, ctx }) => {
      const orgId = ctx.user.organizationId;
      const fee = await prisma.fee.findFirst({ where: { id: input.feeId, organizationId: orgId } });
      if (!fee) throw new TRPCError({ code: "NOT_FOUND" });

      return prisma.feePayment.create({
        data: {
          feeId: input.feeId,
          studentId: input.studentId,
          amountPaid: input.amountPaid,
          status: input.status,
          receiptNumber: `RCP-${Date.now()}`,
          organizationId: orgId,
        },
      });
    }),

  payments: protectedProcedure
    .input(z.object({ feeId: z.string().optional(), studentId: z.string().optional() }))
    .query(async ({ input, ctx }) => {
      const orgId = ctx.user.organizationId;
      const where: Record<string, unknown> = { organizationId: orgId };
      if (input.feeId) where.feeId = input.feeId;
      if (input.studentId) where.studentId = input.studentId;

      if (ctx.user.role === "PARENT") {
        const students = await prisma.student.findMany({ where: { parentId: ctx.user.id, organizationId: orgId }, select: { id: true } });
        where.studentId = { in: students.map((s) => s.id) };
      }

      return prisma.feePayment.findMany({
        where,
        include: {
          fee: { select: { title: true, amount: true } },
          student: { select: { name: true, rollNumber: true } },
        },
        orderBy: { createdAt: "desc" },
      });
    }),
});
