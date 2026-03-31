import { z } from "zod/v4";
import { router, teacherProcedure, protectedProcedure } from "../trpc";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";

export const attendanceRouter = router({
  getByClassAndDate: protectedProcedure
    .input(z.object({ classId: z.string(), date: z.string() }))
    .query(async ({ input, ctx }) => {
      const dateObj = new Date(input.date);
      const start = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate());
      const end = new Date(start.getTime() + 86400000);

      return prisma.attendance.findMany({
        where: {
          classId: input.classId,
          organizationId: ctx.user.organizationId,
          date: { gte: start, lt: end },
        },
        include: { student: true },
      });
    }),

  getByStudent: protectedProcedure
    .input(z.object({ studentId: z.string() }))
    .query(async ({ input, ctx }) => {
      return prisma.attendance.findMany({
        where: { studentId: input.studentId, organizationId: ctx.user.organizationId },
        include: { class: { select: { name: true } } },
        orderBy: { date: "desc" },
        take: 30,
      });
    }),

  historyByClass: protectedProcedure
    .input(z.object({ classId: z.string() }))
    .query(async ({ input, ctx }) => {
      return prisma.attendance.findMany({
        where: { classId: input.classId, organizationId: ctx.user.organizationId },
        include: { student: { select: { name: true, rollNumber: true } } },
        orderBy: { date: "desc" },
        take: 200,
      });
    }),

  markBulk: teacherProcedure
    .input(z.object({
      classId: z.string(),
      date: z.string(),
      records: z.array(z.object({
        studentId: z.string(),
        status: z.enum(["PRESENT", "ABSENT", "LATE"]),
      })),
    }))
    .mutation(async ({ input, ctx }) => {
      const orgId = ctx.user.organizationId;
      const dateObj = new Date(input.date);
      const start = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate());
      const dateStr = start.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

      // Save attendance
      const results = [];
      for (const r of input.records) {
        const result = await prisma.attendance.upsert({
          where: { studentId_date: { studentId: r.studentId, date: start } },
          update: { status: r.status },
          create: {
            studentId: r.studentId,
            classId: input.classId,
            date: start,
            status: r.status,
            organizationId: orgId,
          },
        });
        results.push(result);
      }

      // Get class name
      const cls = await prisma.class.findUnique({ where: { id: input.classId }, select: { name: true } });

      // Notify parents — get all students with their parents
      const students = await prisma.student.findMany({
        where: {
          id: { in: input.records.map((r) => r.studentId) },
          parentId: { not: null },
        },
        select: { id: true, name: true, parentId: true, parent: { select: { id: true, email: true, name: true } } },
      });

      // Build a map of studentId -> status
      const statusMap = new Map(input.records.map((r) => [r.studentId, r.status]));

      // Group by parent (one parent may have multiple children)
      const parentNotifications = new Map<string, { parentName: string; parentEmail: string; parentUserId: string; children: { name: string; status: string }[] }>();

      for (const s of students) {
        if (!s.parent) continue;
        const existing = parentNotifications.get(s.parent.id);
        const childEntry = { name: s.name, status: statusMap.get(s.id) || "PRESENT" };
        if (existing) {
          existing.children.push(childEntry);
        } else {
          parentNotifications.set(s.parent.id, {
            parentName: s.parent.name,
            parentEmail: s.parent.email,
            parentUserId: s.parent.id,
            children: [childEntry],
          });
        }
      }

      // Send notification + email to each parent
      for (const [, parent] of parentNotifications) {
        const childLines = parent.children
          .map((c) => `${c.name}: ${c.status}`)
          .join(", ");

        // In-app notification
        await prisma.notification.create({
          data: {
            userId: parent.parentUserId,
            title: `Attendance Marked — ${dateStr}`,
            message: `${cls?.name || "Class"}: ${childLines}`,
            type: "GENERAL",
            organizationId: orgId,
          },
        });

        // Email to parent
        const childRows = parent.children.map((c) => {
          const color = c.status === "PRESENT" ? "green" : c.status === "ABSENT" ? "red" : "orange";
          return `<tr><td style="padding:8px;border-bottom:1px solid #eee;">${c.name}</td><td style="padding:8px;border-bottom:1px solid #eee;color:${color};font-weight:bold;">${c.status}</td></tr>`;
        }).join("");

        sendEmail({
          to: parent.parentEmail,
          subject: `Attendance Report — ${dateStr}`,
          html: `
            <h2>Attendance Report</h2>
            <p>Dear ${parent.parentName},</p>
            <p>Attendance has been marked for <strong>${cls?.name || "class"}</strong> on <strong>${dateStr}</strong>:</p>
            <table style="border-collapse:collapse;width:100%;max-width:400px;">
              <tr style="background:#f9f9f9;"><th style="padding:8px;text-align:left;border-bottom:2px solid #ddd;">Student</th><th style="padding:8px;text-align:left;border-bottom:2px solid #ddd;">Status</th></tr>
              ${childRows}
            </table>
            <p style="margin-top:16px;color:#666;">You can view the full attendance record by logging into SchoolSystem.</p>
            <p>Thank you,<br>SchoolSystem</p>
          `,
        }).catch(console.error);
      }

      return { count: results.length };
    }),

  // Edit a single attendance record
  update: teacherProcedure
    .input(z.object({ id: z.string(), status: z.enum(["PRESENT", "ABSENT", "LATE"]) }))
    .mutation(async ({ input, ctx }) => {
      const record = await prisma.attendance.findFirst({
        where: { id: input.id, organizationId: ctx.user.organizationId },
      });
      if (!record) throw new Error("Not found");
      return prisma.attendance.update({ where: { id: input.id }, data: { status: input.status } });
    }),

  // Delete a single attendance record
  delete: teacherProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const record = await prisma.attendance.findFirst({
        where: { id: input.id, organizationId: ctx.user.organizationId },
      });
      if (!record) throw new Error("Not found");
      return prisma.attendance.delete({ where: { id: input.id } });
    }),

  // Delete all attendance for a class on a date
  deleteByClassAndDate: teacherProcedure
    .input(z.object({ classId: z.string(), date: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const dateObj = new Date(input.date);
      const start = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate());
      const end = new Date(start.getTime() + 86400000);
      return prisma.attendance.deleteMany({
        where: { classId: input.classId, organizationId: ctx.user.organizationId, date: { gte: start, lt: end } },
      });
    }),
});
