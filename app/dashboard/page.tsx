import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function DashboardPage() {
  const user = await getSession();
  if (!user) redirect("/login");

  const orgId = user.organizationId;
  const org = await prisma.organization.findUnique({ where: { id: orgId }, select: { name: true, inviteCode: true } });

  // Parent view
  if (user.role === "PARENT") {
    const children = await prisma.student.findMany({
      where: { parentId: user.id, organizationId: orgId },
      include: { class: { select: { name: true } } },
    });

    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">Welcome, {user.name}!</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{org?.name}</p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-2xl border dark:border-gray-800 shadow-sm p-5 sm:p-6">
          <h2 className="text-lg font-bold mb-4">Your Children</h2>
          {children.length === 0 ? (
            <p className="text-gray-400 text-sm">No children linked yet. Ask your school to add your child.</p>
          ) : (
            <div className="grid gap-3">
              {children.map((child) => (
                <Link key={child.id} href={`/dashboard/parent-view/${child.id}`}
                  className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border hover:border-blue-300 hover:bg-blue-50/50 transition-all group">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-sm shrink-0 group-hover:bg-blue-200 transition-colors">
                    {child.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">{child.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{child.class.name}</p>
                  </div>
                  <svg className="w-5 h-5 text-gray-300 group-hover:text-blue-500 transition-colors shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                </Link>
              ))}
            </div>
          )}
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link href="/dashboard/complaints" className="px-4 py-2.5 bg-white dark:bg-gray-900 rounded-xl border dark:border-gray-800 text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-all shadow-sm">Complaints</Link>
          <Link href="/dashboard/notifications" className="px-4 py-2.5 bg-white dark:bg-gray-900 rounded-xl border dark:border-gray-800 text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-all shadow-sm">Notifications</Link>
        </div>
      </div>
    );
  }

  // Admin / Teacher dashboard
  const [teachers, parents, classes, students] = await Promise.all([
    prisma.user.count({ where: { organizationId: orgId, role: "TEACHER" } }),
    prisma.user.count({ where: { organizationId: orgId, role: "PARENT" } }),
    prisma.class.count({ where: { organizationId: orgId } }),
    prisma.student.count({ where: { organizationId: orgId } }),
  ]);

  const stats = [
    { label: "Teachers", value: teachers, icon: "M4.26 10.147a60.438 60.438 0 00-.491 6.347A48.62 48.62 0 0112 20.904a48.62 48.62 0 018.232-4.41 60.46 60.46 0 00-.491-6.347", color: "from-blue-500 to-blue-600", bg: "bg-blue-50" },
    { label: "Parents", value: parents, icon: "M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z", color: "from-indigo-500 to-indigo-600", bg: "bg-indigo-50" },
    { label: "Classes", value: classes, icon: "M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21", color: "from-purple-500 to-purple-600", bg: "bg-purple-50" },
    { label: "Students", value: students, icon: "M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z", color: "from-green-500 to-green-600", bg: "bg-green-50" },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">Welcome back, {user.name}!</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{org?.name} &middot; {user.role}</p>
      </div>

      {user.role === "ADMIN" && org?.inviteCode && (
        <div className="mb-6 bg-linear-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-4 sm:p-5">
          <p className="text-sm font-semibold text-blue-800">Parent Invite Code</p>
          <p className="text-lg sm:text-xl font-mono font-bold text-blue-600 mt-1 select-all break-all">{org.inviteCode}</p>
          <p className="text-xs text-blue-500 mt-1">Share this with parents so they can register.</p>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
        {stats.map((s) => (
          <div key={s.label} className="bg-white dark:bg-gray-900 rounded-2xl border dark:border-gray-800 p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">{s.label}</p>
                <p className="mt-1 text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">{s.value}</p>
              </div>
              <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-linear-to-br ${s.color} flex items-center justify-center shadow-md`}>
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d={s.icon} />
                </svg>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl border dark:border-gray-800 p-4 sm:p-6 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {[
            ...(user.role === "ADMIN" ? [{ label: "Add Teacher", href: "/dashboard/teachers" }] : []),
            { label: "Manage Classes", href: "/dashboard/classes" },
            { label: "Attendance", href: "/dashboard/attendance" },
            { label: "Complaints", href: "/dashboard/complaints" },
            { label: "Notifications", href: "/dashboard/notifications" },
            { label: "Settings", href: "/dashboard/settings" },
          ].map((a) => (
            <Link key={a.label} href={a.href} className="flex items-center justify-center gap-2 px-3 py-3 bg-gray-50 dark:bg-gray-800 rounded-xl text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all border hover:border-blue-200 hover:shadow-sm">
              {a.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
