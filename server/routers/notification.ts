import { z } from "zod/v4";
import { router, protectedProcedure } from "../trpc";
import { prisma } from "@/lib/prisma";

export const notificationRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    return prisma.notification.findMany({
      where: { userId: ctx.user.id, organizationId: ctx.user.organizationId },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
  }),

  unreadCount: protectedProcedure.query(async ({ ctx }) => {
    return prisma.notification.count({
      where: { userId: ctx.user.id, organizationId: ctx.user.organizationId, read: false },
    });
  }),

  markRead: protectedProcedure.input(z.object({ id: z.string() })).mutation(async ({ input, ctx }) => {
    return prisma.notification.update({
      where: { id: input.id, userId: ctx.user.id },
      data: { read: true },
    });
  }),

  markAllRead: protectedProcedure.mutation(async ({ ctx }) => {
    return prisma.notification.updateMany({
      where: { userId: ctx.user.id, organizationId: ctx.user.organizationId, read: false },
      data: { read: true },
    });
  }),

  delete: protectedProcedure.input(z.object({ id: z.string() })).mutation(async ({ input, ctx }) => {
    return prisma.notification.delete({ where: { id: input.id, userId: ctx.user.id } });
  }),

  deleteAll: protectedProcedure.mutation(async ({ ctx }) => {
    return prisma.notification.deleteMany({
      where: { userId: ctx.user.id, organizationId: ctx.user.organizationId },
    });
  }),
});
