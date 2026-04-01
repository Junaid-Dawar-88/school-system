import { z } from "zod/v4";
import { router, protectedProcedure, adminProcedure } from "../trpc";
import { prisma } from "@/lib/prisma";
import { TRPCError } from "@trpc/server";

export const eventRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    return prisma.event.findMany({
      where: { organizationId: ctx.user.organizationId },
      orderBy: { startDate: "desc" },
    });
  }),

  create: adminProcedure
    .input(z.object({
      title: z.string().min(1),
      description: z.string().optional(),
      startDate: z.string(),
      endDate: z.string(),
      type: z.enum(["HOLIDAY", "EVENT", "MEETING", "EXAM_SCHEDULE"]),
    }))
    .mutation(async ({ input, ctx }) => {
      return prisma.event.create({
        data: {
          title: input.title,
          description: input.description || null,
          startDate: new Date(input.startDate),
          endDate: new Date(input.endDate),
          type: input.type,
          organizationId: ctx.user.organizationId,
        },
      });
    }),

  update: adminProcedure
    .input(z.object({
      id: z.string(),
      title: z.string().min(1),
      description: z.string().optional(),
      startDate: z.string(),
      endDate: z.string(),
      type: z.enum(["HOLIDAY", "EVENT", "MEETING", "EXAM_SCHEDULE"]),
    }))
    .mutation(async ({ input, ctx }) => {
      const record = await prisma.event.findFirst({ where: { id: input.id, organizationId: ctx.user.organizationId } });
      if (!record) throw new TRPCError({ code: "NOT_FOUND" });
      return prisma.event.update({
        where: { id: input.id },
        data: {
          title: input.title,
          description: input.description,
          startDate: new Date(input.startDate),
          endDate: new Date(input.endDate),
          type: input.type,
        },
      });
    }),

  delete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const record = await prisma.event.findFirst({ where: { id: input.id, organizationId: ctx.user.organizationId } });
      if (!record) throw new TRPCError({ code: "NOT_FOUND" });
      return prisma.event.delete({ where: { id: input.id } });
    }),
});
