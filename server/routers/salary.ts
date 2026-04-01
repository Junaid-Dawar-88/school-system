import { z } from "zod/v4";
import { router, protectedProcedure, adminProcedure } from "../trpc";
import { prisma } from "@/lib/prisma";
import { TRPCError } from "@trpc/server";

export const salaryRouter = router({
  list: adminProcedure
    .input(z.object({ month: z.number().optional(), year: z.number().optional() }))
    .query(async ({ input, ctx }) => {
      const where: Record<string, unknown> = { organizationId: ctx.user.organizationId };
      if (input.month) where.month = input.month;
      if (input.year) where.year = input.year;

      return prisma.salary.findMany({
        where,
        include: { user: { select: { name: true, email: true, role: true } } },
        orderBy: [{ year: "desc" }, { month: "desc" }],
      });
    }),

  create: adminProcedure
    .input(z.object({
      userId: z.string(),
      amount: z.number().min(0),
      month: z.number().min(1).max(12),
      year: z.number(),
    }))
    .mutation(async ({ input, ctx }) => {
      return prisma.salary.upsert({
        where: { userId_month_year: { userId: input.userId, month: input.month, year: input.year } },
        update: { amount: input.amount },
        create: { ...input, organizationId: ctx.user.organizationId },
      });
    }),

  markPaid: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const record = await prisma.salary.findFirst({ where: { id: input.id, organizationId: ctx.user.organizationId } });
      if (!record) throw new TRPCError({ code: "NOT_FOUND" });
      return prisma.salary.update({ where: { id: input.id }, data: { status: "PAID", paidDate: new Date() } });
    }),

  delete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const record = await prisma.salary.findFirst({ where: { id: input.id, organizationId: ctx.user.organizationId } });
      if (!record) throw new TRPCError({ code: "NOT_FOUND" });
      return prisma.salary.delete({ where: { id: input.id } });
    }),
});
