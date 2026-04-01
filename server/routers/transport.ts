import { z } from "zod/v4";
import { router, protectedProcedure, adminProcedure } from "../trpc";
import { prisma } from "@/lib/prisma";
import { TRPCError } from "@trpc/server";

export const transportRouter = router({
  vehicles: protectedProcedure.query(async ({ ctx }) => {
    return prisma.vehicle.findMany({
      where: { organizationId: ctx.user.organizationId },
      include: {
        assignments: {
          include: { student: { select: { name: true, rollNumber: true, class: { select: { name: true } } } } },
        },
      },
      orderBy: { route: "asc" },
    });
  }),

  createVehicle: adminProcedure
    .input(z.object({
      vehicleNumber: z.string().min(1),
      driverName: z.string().min(1),
      driverPhone: z.string().min(1),
      capacity: z.number().min(1),
      route: z.string().min(1),
    }))
    .mutation(async ({ input, ctx }) => {
      return prisma.vehicle.create({ data: { ...input, organizationId: ctx.user.organizationId } });
    }),

  updateVehicle: adminProcedure
    .input(z.object({
      id: z.string(),
      vehicleNumber: z.string().min(1),
      driverName: z.string().min(1),
      driverPhone: z.string().min(1),
      capacity: z.number().min(1),
      route: z.string().min(1),
    }))
    .mutation(async ({ input, ctx }) => {
      const record = await prisma.vehicle.findFirst({ where: { id: input.id, organizationId: ctx.user.organizationId } });
      if (!record) throw new TRPCError({ code: "NOT_FOUND" });
      const { id, ...data } = input;
      return prisma.vehicle.update({ where: { id }, data });
    }),

  deleteVehicle: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const record = await prisma.vehicle.findFirst({ where: { id: input.id, organizationId: ctx.user.organizationId } });
      if (!record) throw new TRPCError({ code: "NOT_FOUND" });
      return prisma.vehicle.delete({ where: { id: input.id } });
    }),

  assignStudent: adminProcedure
    .input(z.object({
      vehicleId: z.string(),
      studentId: z.string(),
      stopName: z.string().min(1),
    }))
    .mutation(async ({ input, ctx }) => {
      return prisma.transportAssignment.upsert({
        where: { vehicleId_studentId: { vehicleId: input.vehicleId, studentId: input.studentId } },
        update: { stopName: input.stopName },
        create: { ...input, organizationId: ctx.user.organizationId },
      });
    }),

  removeAssignment: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const record = await prisma.transportAssignment.findFirst({ where: { id: input.id, organizationId: ctx.user.organizationId } });
      if (!record) throw new TRPCError({ code: "NOT_FOUND" });
      return prisma.transportAssignment.delete({ where: { id: input.id } });
    }),
});
