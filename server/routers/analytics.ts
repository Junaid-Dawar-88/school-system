import { router, adminProcedure } from "../trpc";
import { prisma } from "@/lib/prisma";

export const analyticsRouter = router({
  overview: adminProcedure.query(async ({ ctx }) => {
    const orgId = ctx.user.organizationId;

    const [totalStudents, totalTeachers, totalClasses, totalParents] = await Promise.all([
      prisma.student.count({ where: { organizationId: orgId } }),
      prisma.user.count({ where: { organizationId: orgId, role: "TEACHER" } }),
      prisma.class.count({ where: { organizationId: orgId } }),
      prisma.user.count({ where: { organizationId: orgId, role: "PARENT" } }),
    ]);

    return { totalStudents, totalTeachers, totalClasses, totalParents };
  }),

  attendanceTrend: adminProcedure.query(async ({ ctx }) => {
    const orgId = ctx.user.organizationId;
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const attendances = await prisma.attendance.findMany({
      where: { organizationId: orgId, date: { gte: thirtyDaysAgo } },
      select: { date: true, status: true },
    });

    const dayMap: Record<string, { present: number; absent: number; late: number; total: number }> = {};
    for (const a of attendances) {
      const key = a.date.toISOString().split("T")[0];
      if (!dayMap[key]) dayMap[key] = { present: 0, absent: 0, late: 0, total: 0 };
      dayMap[key].total++;
      if (a.status === "PRESENT") dayMap[key].present++;
      else if (a.status === "ABSENT") dayMap[key].absent++;
      else dayMap[key].late++;
    }

    return Object.entries(dayMap)
      .map(([date, counts]) => ({ date, ...counts }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }),

  gradeDistribution: adminProcedure.query(async ({ ctx }) => {
    const orgId = ctx.user.organizationId;
    const grades = await prisma.grade.findMany({
      where: { organizationId: orgId },
      select: { score: true, maxScore: true, subject: true },
    });

    const subjectMap: Record<string, { totalPercent: number; count: number }> = {};
    for (const g of grades) {
      if (!subjectMap[g.subject]) subjectMap[g.subject] = { totalPercent: 0, count: 0 };
      subjectMap[g.subject].totalPercent += (g.score / g.maxScore) * 100;
      subjectMap[g.subject].count++;
    }

    return Object.entries(subjectMap).map(([subject, data]) => ({
      subject,
      averageScore: Math.round(data.totalPercent / data.count),
    }));
  }),

  feeCollection: adminProcedure.query(async ({ ctx }) => {
    const orgId = ctx.user.organizationId;
    const [fees, payments] = await Promise.all([
      prisma.fee.findMany({ where: { organizationId: orgId }, select: { amount: true, classId: true } }),
      prisma.feePayment.findMany({ where: { organizationId: orgId, status: "PAID" }, select: { amountPaid: true } }),
    ]);

    const totalStudents = await prisma.student.count({ where: { organizationId: orgId } });
    const totalFees = fees.reduce((sum, f) => sum + f.amount, 0) * totalStudents;
    const totalCollected = payments.reduce((sum, p) => sum + p.amountPaid, 0);
    const totalPending = totalFees - totalCollected;

    return {
      totalFees: Math.round(totalFees),
      totalCollected: Math.round(totalCollected),
      totalPending: Math.round(Math.max(0, totalPending)),
    };
  }),
});
