import { z } from "zod/v4";
import { router, protectedProcedure } from "../trpc";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { TRPCError } from "@trpc/server";

export const settingsRouter = router({
  getProfile: protectedProcedure.query(async ({ ctx }) => {
    return prisma.user.findUnique({
      where: { id: ctx.user.id },
      select: { id: true, name: true, email: true, role: true },
    });
  }),

  updateProfile: protectedProcedure
    .input(z.object({ name: z.string().min(1), email: z.string().email() }))
    .mutation(async ({ input, ctx }) => {
      const dup = await prisma.user.findFirst({ where: { email: input.email, NOT: { id: ctx.user.id } } });
      if (dup) throw new TRPCError({ code: "CONFLICT", message: "Email already in use" });
      return prisma.user.update({ where: { id: ctx.user.id }, data: input });
    }),

  changePassword: protectedProcedure
    .input(z.object({ currentPassword: z.string().min(1), newPassword: z.string().min(6) }))
    .mutation(async ({ input, ctx }) => {
      const user = await prisma.user.findUnique({ where: { id: ctx.user.id } });
      if (!user) throw new TRPCError({ code: "NOT_FOUND" });
      const valid = await bcrypt.compare(input.currentPassword, user.password);
      if (!valid) throw new TRPCError({ code: "BAD_REQUEST", message: "Current password is incorrect" });
      const hashed = await bcrypt.hash(input.newPassword, 10);
      return prisma.user.update({ where: { id: ctx.user.id }, data: { password: hashed } });
    }),
});
