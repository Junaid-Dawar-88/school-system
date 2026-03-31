import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function ParentViewPage({ params }: { params: Promise<{ studentId: string }> }) {
  const user = await getSession();
  if (!user) redirect("/login");

  const { studentId } = await params;

  const student = await prisma.student.findFirst({
    where: { id: studentId, parentId: user.id, organizationId: user.organizationId },
    include: {
      class: { select: { name: true, teachers: { include: { teacher: { select: { name: true } } } } } },
    },
  });

  if (!student) redirect("/dashboard");

  const attendance = await prisma.attendance.findMany({
    where: { studentId, organizationId: user.organizationId },
    orderBy: { date: "desc" },
    take: 60,
  });

  const total = attendance.length;
  const present = attendance.filter((a) => a.status === "PRESENT").length;
  const absent = attendance.filter((a) => a.status === "ABSENT").length;
  const late = attendance.filter((a) => a.status === "LATE").length;

  const statusLabel: Record<string, { text: string; color: string }> = {
    PRESENT: { text: "Present", color: "text-green-600" },
    ABSENT: { text: "Absent", color: "text-red-600" },
    LATE: { text: "Late", color: "text-yellow-600" },
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto">
      <Link href="/dashboard" className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline mb-4">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
        Back
      </Link>

      <div className="bg-white rounded-2xl border shadow-sm p-5 sm:p-6 mb-4 sm:mb-6">
        <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Student</p>
        <p className="text-xl sm:text-2xl font-bold text-gray-900">{student.name}</p>
        <div className="grid grid-cols-2 gap-2 mt-3 text-sm text-gray-500">
          <p>Roll Number: <strong className="text-gray-700">{student.rollNumber}</strong></p>
          <p>Father: <strong className="text-gray-700">{student.fatherName}</strong></p>
          <p>Class: <strong className="text-gray-700">{student.class.name}</strong></p>
          <p>Teachers: <strong className="text-gray-700">{student.class.teachers.map((t) => t.teacher.name).join(", ") || "None"}</strong></p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4 sm:mb-6">
        {[
          { label: "Total", value: total, cls: "bg-white border" },
          { label: "Present", value: present, cls: "bg-green-50 border-green-200" },
          { label: "Absent", value: absent, cls: "bg-red-50 border-red-200" },
          { label: "Late", value: late, cls: "bg-yellow-50 border-yellow-200" },
        ].map((s) => (
          <div key={s.label} className={`rounded-xl border p-3 sm:p-4 text-center ${s.cls}`}>
            <p className="text-xl sm:text-2xl font-bold">{s.value}</p>
            <p className="text-xs text-gray-500">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border shadow-sm p-5 sm:p-6">
        <p className="text-xs text-gray-400 uppercase tracking-wider mb-3">Attendance Records</p>
        {attendance.length === 0 ? (
          <p className="text-gray-400 text-sm">No attendance records yet.</p>
        ) : (
          <div className="font-mono text-sm leading-7 select-none">
            {attendance.map((a) => {
              const date = new Date(a.date).toLocaleDateString("en-US", { weekday: "short", year: "numeric", month: "short", day: "2-digit" });
              const s = statusLabel[a.status];
              return (
                <p key={a.id} className="border-b border-gray-50 py-1 last:border-0 flex justify-between">
                  <span className="text-gray-600">{date}</span>
                  <span className={`font-semibold ${s.color}`}>{s.text}</span>
                </p>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
