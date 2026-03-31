import { z } from "zod/v4";
import { router, protectedProcedure } from "../trpc";
import { prisma } from "@/lib/prisma";
import { TRPCError } from "@trpc/server";

async function notifyUsers(userIds: string[], title: string, message: string, orgId: string) {
  for (const userId of userIds) {
    await prisma.notification.create({
      data: { userId, title, message, type: "COMPLAINT", organizationId: orgId },
    });
  }
}

export const complaintRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    const orgId = ctx.user.organizationId;

    let where: Record<string, unknown> = { organizationId: orgId };

    if (ctx.user.role === "TEACHER") {
      where = { organizationId: orgId, OR: [{ visibility: "PUBLIC" }, { createdById: ctx.user.id }] };
    } else if (ctx.user.role === "PARENT") {
      const myStudents = await prisma.student.findMany({
        where: { parentId: ctx.user.id, organizationId: orgId },
        select: { id: true },
      });
      where = { organizationId: orgId, OR: [{ studentId: { in: myStudents.map((s) => s.id) } }, { createdById: ctx.user.id }] };
    }

    const complaints = await fetchComplaints(where);

    // Resolve teacher names for ABOUT_TEACHER complaints
    const teacherIds = complaints.filter((c) => c.teacherId).map((c) => c.teacherId!);
    const teacherMap = new Map<string, string>();
    if (teacherIds.length > 0) {
      const teachers = await prisma.user.findMany({
        where: { id: { in: teacherIds } },
        select: { id: true, name: true },
      });
      teachers.forEach((t) => teacherMap.set(t.id, t.name));
    }

    return complaints.map((c) => ({
      ...c,
      teacherName: c.teacherId ? teacherMap.get(c.teacherId) || null : null,
    }));
  }),

  teachers: protectedProcedure.query(async ({ ctx }) => {
    return prisma.user.findMany({
      where: { organizationId: ctx.user.organizationId, role: "TEACHER" },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    });
  }),

  createAboutStudent: protectedProcedure
    .input(z.object({
      message: z.string().min(1),
      studentId: z.string(),
      visibility: z.enum(["PUBLIC", "PRIVATE"]),
    }))
    .mutation(async ({ input, ctx }) => {
      if (ctx.user.role !== "TEACHER" && ctx.user.role !== "ADMIN")
        throw new TRPCError({ code: "FORBIDDEN" });

      const orgId = ctx.user.organizationId;
      const student = await prisma.student.findFirst({
        where: { id: input.studentId, organizationId: orgId },
      });
      if (!student) throw new TRPCError({ code: "NOT_FOUND", message: "Student not found" });

      const complaint = await prisma.complaint.create({
        data: {
          message: input.message,
          type: "ABOUT_STUDENT",
          visibility: input.visibility,
          createdById: ctx.user.id,
          studentId: input.studentId,
          organizationId: orgId,
        },
      });

      // Notify based on visibility
      let notifyFilter;
      if (input.visibility === "PUBLIC") {
        // All teachers + admin + parent
        notifyFilter = {
          organizationId: orgId,
          OR: [
            { role: "ADMIN" as const },
            { role: "TEACHER" as const },
            ...(student.parentId ? [{ id: student.parentId }] : []),
          ],
          NOT: { id: ctx.user.id },
        };
      } else {
        // PRIVATE: only admin + parent
        notifyFilter = {
          organizationId: orgId,
          OR: [
            { role: "ADMIN" as const },
            ...(student.parentId ? [{ id: student.parentId }] : []),
          ],
          NOT: { id: ctx.user.id },
        };
      }

      const usersToNotify = await prisma.user.findMany({ where: notifyFilter, select: { id: true } });
      const label = input.visibility === "PRIVATE" ? "Private Complaint" : "Complaint";
      await notifyUsers(usersToNotify.map((u) => u.id), `New ${label} About Student`, input.message.slice(0, 100), orgId);

      return complaint;
    }),

  createAboutTeacher: protectedProcedure
    .input(z.object({ message: z.string().min(1), teacherId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      if (ctx.user.role !== "PARENT")
        throw new TRPCError({ code: "FORBIDDEN", message: "Only parents can complain about teachers" });

      const orgId = ctx.user.organizationId;
      const teacher = await prisma.user.findFirst({
        where: { id: input.teacherId, organizationId: orgId, role: "TEACHER" },
      });
      if (!teacher) throw new TRPCError({ code: "NOT_FOUND", message: "Teacher not found" });

      const complaint = await prisma.complaint.create({
        data: {
          message: input.message,
          type: "ABOUT_TEACHER",
          createdById: ctx.user.id,
          teacherId: input.teacherId,
          organizationId: orgId,
        },
      });

      const usersToNotify = await prisma.user.findMany({
        where: { organizationId: orgId, OR: [{ role: "ADMIN" }, { role: "TEACHER" }] },
        select: { id: true },
      });
      await notifyUsers(usersToNotify.map((u) => u.id), "New Complaint About Teacher", input.message.slice(0, 100), orgId);

      return complaint;
    }),

  reply: protectedProcedure
    .input(z.object({ complaintId: z.string(), message: z.string().min(1) }))
    .mutation(async ({ input, ctx }) => {
      const complaint = await prisma.complaint.findFirst({
        where: { id: input.complaintId, organizationId: ctx.user.organizationId },
      });
      if (!complaint) throw new TRPCError({ code: "NOT_FOUND" });

      return prisma.complaintReply.create({
        data: { complaintId: input.complaintId, message: input.message, userId: ctx.user.id },
      });
    }),

  // Only the creator can update their complaint
  update: protectedProcedure
    .input(z.object({ id: z.string(), message: z.string().min(1) }))
    .mutation(async ({ input, ctx }) => {
      const complaint = await prisma.complaint.findFirst({
        where: { id: input.id, createdById: ctx.user.id, organizationId: ctx.user.organizationId },
      });
      if (!complaint) throw new TRPCError({ code: "NOT_FOUND", message: "Complaint not found or not yours" });
      return prisma.complaint.update({ where: { id: input.id }, data: { message: input.message } });
    }),

  // Creator or admin can delete
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const complaint = await prisma.complaint.findFirst({
        where: { id: input.id, organizationId: ctx.user.organizationId },
      });
      if (!complaint) throw new TRPCError({ code: "NOT_FOUND" });
      if (complaint.createdById !== ctx.user.id && ctx.user.role !== "ADMIN") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Only the creator or admin can delete" });
      }
      // Delete replies first
      await prisma.complaintReply.deleteMany({ where: { complaintId: input.id } });
      return prisma.complaint.delete({ where: { id: input.id } });
    }),
});

function fetchComplaints(where: Record<string, unknown>) {
  return prisma.complaint.findMany({
    where,
    include: {
      createdBy: { select: { name: true, role: true } },
      student: { select: { name: true, class: { select: { name: true } } } },
      replies: {
        include: { user: { select: { name: true, role: true } } },
        orderBy: { createdAt: "asc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}
