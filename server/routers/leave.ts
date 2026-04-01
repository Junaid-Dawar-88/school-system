import { z } from "zod/v4";
import { router, protectedProcedure, adminProcedure } from "../trpc";
import { prisma } from "@/lib/prisma";
import { TRPCError } from "@trpc/server";

export const leaveRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    const orgId = ctx.user.organizationId;
    const where: Record<string, unknown> = { organizationId: orgId };

    if (ctx.user.role === "TEACHER") {
      where.userId = ctx.user.id;
    }

    return prisma.leaveRequest.findMany({
      where,
      include: { user: { select: { name: true, role: true } } },
      orderBy: { createdAt: "desc" },
    });
  }),

  create: protectedProcedure
    .input(z.object({
      startDate: z.string(),
      endDate: z.string(),
      reason: z.string().min(1),
    }))
    .mutation(async ({ input, ctx }) => {
      return prisma.leaveRequest.create({
        data: {
          startDate: new Date(input.startDate),
          endDate: new Date(input.endDate),
          reason: input.reason,
          userId: ctx.user.id,
          organizationId: ctx.user.organizationId,
        },
      });
    }),

  updateStatus: adminProcedure
    .input(z.object({
      id: z.string(),
      status: z.enum(["APPROVED", "REJECTED"]),
    }))
    .mutation(async ({ input, ctx }) => {
      const record = await prisma.leaveRequest.findFirst({ where: { id: input.id, organizationId: ctx.user.organizationId } });
      if (!record) throw new TRPCError({ code: "NOT_FOUND" });
      return prisma.leaveRequest.update({ where: { id: input.id }, data: { status: input.status } });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const record = await prisma.leaveRequest.findFirst({
        where: { id: input.id, organizationId: ctx.user.organizationId },
      });
      if (!record) throw new TRPCError({ code: "NOT_FOUND" });
      if (ctx.user.role !== "ADMIN" && record.userId !== ctx.user.id) throw new TRPCError({ code: "FORBIDDEN" });
      return prisma.leaveRequest.delete({ where: { id: input.id } });
    }),
});
