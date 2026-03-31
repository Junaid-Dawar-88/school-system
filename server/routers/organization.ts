import { z } from "zod/v4";
import { router, protectedProcedure, adminProcedure } from "../trpc";
import { prisma } from "@/lib/prisma";

export const organizationRouter = router({
  get: protectedProcedure.query(async ({ ctx }) => {
    return prisma.organization.findUnique({
      where: { id: ctx.user.organizationId },
      select: { id: true, name: true, inviteCode: true },
    });
  }),

  stats: protectedProcedure.query(async ({ ctx }) => {
    const orgId = ctx.user.organizationId;
    const [teachers, parents, classes, students] = await Promise.all([
      prisma.user.count({ where: { organizationId: orgId, role: "TEACHER" } }),
      prisma.user.count({ where: { organizationId: orgId, role: "PARENT" } }),
      prisma.class.count({ where: { organizationId: orgId } }),
      prisma.student.count({ where: { organizationId: orgId } }),
    ]);
    return { teachers, parents, classes, students };
  }),

  updateName: adminProcedure
    .input(z.object({ name: z.string().min(1) }))
    .mutation(async ({ input, ctx }) => {
      return prisma.organization.update({
        where: { id: ctx.user.organizationId },
        data: { name: input.name },
      });
    }),

  regenerateInviteCode: adminProcedure.mutation(async ({ ctx }) => {
    return prisma.organization.update({
      where: { id: ctx.user.organizationId },
      data: { inviteCode: crypto.randomUUID() },
    });
  }),
});
