import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

const quickActions = [
  { label: "Classes", href: "/dashboard/classes", icon: "M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21", color: "from-blue-500/10 to-blue-600/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800/50 hover:border-blue-400" },
  { label: "Attendance", href: "/dashboard/attendance", icon: "M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z", color: "from-emerald-500/10 to-emerald-600/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50 hover:border-emerald-400" },
  { label: "Grades", href: "/dashboard/grades", icon: "M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.562.562 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z", color: "from-amber-500/10 to-amber-600/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800/50 hover:border-amber-400" },
  { label: "Report Cards", href: "/dashboard/report-cards", icon: "M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V19.5a2.25 2.25 0 002.25 2.25h.75", color: "from-violet-500/10 to-violet-600/10 text-violet-600 dark:text-violet-400 border-violet-200 dark:border-violet-800/50 hover:border-violet-400" },
  { label: "Timetable", href: "/dashboard/timetable", icon: "M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5", color: "from-cyan-500/10 to-cyan-600/10 text-cyan-600 dark:text-cyan-400 border-cyan-200 dark:border-cyan-800/50 hover:border-cyan-400" },
  { label: "Assignments", href: "/dashboard/assignments", icon: "M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z", color: "from-rose-500/10 to-rose-600/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800/50 hover:border-rose-400" },
  { label: "Events", href: "/dashboard/events", icon: "M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 010 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 010-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375z", color: "from-pink-500/10 to-pink-600/10 text-pink-600 dark:text-pink-400 border-pink-200 dark:border-pink-800/50 hover:border-pink-400" },
  { label: "Exams", href: "/dashboard/exams", icon: "M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z", color: "from-orange-500/10 to-orange-600/10 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-800/50 hover:border-orange-400" },
];

const adminActions = [
  { label: "Add Teacher", href: "/dashboard/teachers", icon: "M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z", color: "from-teal-500/10 to-teal-600/10 text-teal-600 dark:text-teal-400 border-teal-200 dark:border-teal-800/50 hover:border-teal-400" },
  { label: "Fees", href: "/dashboard/fees", icon: "M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75", color: "from-green-500/10 to-green-600/10 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800/50 hover:border-green-400" },
  { label: "Library", href: "/dashboard/library", icon: "M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25", color: "from-indigo-500/10 to-indigo-600/10 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800/50 hover:border-indigo-400" },
  { label: "Transport", href: "/dashboard/transport", icon: "M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0H6.375c-.621 0-1.125-.504-1.125-1.125V14.25", color: "from-slate-500/10 to-slate-600/10 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800/50 hover:border-slate-400" },
  { label: "Leaves", href: "/dashboard/leaves", icon: "M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5", color: "from-yellow-500/10 to-yellow-600/10 text-yellow-600 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800/50 hover:border-yellow-400" },
  { label: "Salary", href: "/dashboard/salary", icon: "M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z", color: "from-emerald-500/10 to-emerald-600/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50 hover:border-emerald-400" },
  { label: "Analytics", href: "/dashboard/analytics", icon: "M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z", color: "from-purple-500/10 to-purple-600/10 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800/50 hover:border-purple-400" },
];

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
      <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">
        <div className="mb-8">
          <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400 mb-1">{org?.name}</p>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">Welcome back, {user.name}</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Track your child&apos;s academic progress and school activities</p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 sm:p-6 mb-6">
          <h2 className="text-base font-semibold text-slate-900 dark:text-white mb-4">Your Children</h2>
          {children.length === 0 ? (
            <p className="text-slate-400 text-sm">No children linked yet. Ask your school to add your child.</p>
          ) : (
            <div className="grid gap-3">
              {children.map((child) => (
                <Link key={child.id} href={`/dashboard/parent-view/${child.id}`}
                  className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/50 hover:border-emerald-300 dark:hover:border-emerald-700 hover:shadow-sm transition-all group">
                  <div className="w-11 h-11 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-md shadow-emerald-500/20">
                    {child.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900 dark:text-white truncate">{child.name}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{child.class.name}</p>
                  </div>
                  <svg className="w-5 h-5 text-slate-300 dark:text-slate-600 group-hover:text-emerald-500 transition-colors shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                </Link>
              ))}
            </div>
          )}
        </div>

        <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">Quick Access</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {quickActions.map((a) => (
            <Link key={a.label} href={a.href}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl bg-gradient-to-br ${a.color} border transition-all hover:shadow-sm`}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.7} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d={a.icon} />
              </svg>
              <span className="text-xs font-semibold">{a.label}</span>
            </Link>
          ))}
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
    { label: "Total Students", value: students, icon: "M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z", gradient: "from-emerald-500 to-teal-600", bg: "bg-emerald-50 dark:bg-emerald-950/30", border: "border-emerald-200 dark:border-emerald-800/30" },
    { label: "Teachers", value: teachers, icon: "M4.26 10.147a60.438 60.438 0 00-.491 6.347A48.62 48.62 0 0112 20.904a48.62 48.62 0 018.232-4.41 60.46 60.46 0 00-.491-6.347", gradient: "from-sky-500 to-blue-600", bg: "bg-sky-50 dark:bg-sky-950/30", border: "border-sky-200 dark:border-sky-800/30" },
    { label: "Classes", value: classes, icon: "M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21", gradient: "from-violet-500 to-purple-600", bg: "bg-violet-50 dark:bg-violet-950/30", border: "border-violet-200 dark:border-violet-800/30" },
    { label: "Parents", value: parents, icon: "M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z", gradient: "from-amber-500 to-orange-600", bg: "bg-amber-50 dark:bg-amber-950/30", border: "border-amber-200 dark:border-amber-800/30" },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400 mb-1">{org?.name}</p>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">Welcome back, {user.name}</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Here&apos;s an overview of your school today</p>
      </div>

      {/* Invite Code */}
      {user.role === "ADMIN" && org?.inviteCode && (
        <div className="mb-8 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 border border-emerald-200 dark:border-emerald-800/40 rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900/50 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">Parent Invite Code</p>
          </div>
          <p className="text-xl font-mono font-bold text-emerald-700 dark:text-emerald-400 select-all break-all">{org.inviteCode}</p>
          <p className="text-xs text-emerald-600/70 dark:text-emerald-500/70 mt-1.5">Share this code with parents so they can register and link their children</p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => (
          <div key={s.label} className={`${s.bg} ${s.border} border rounded-2xl p-5 transition-shadow hover:shadow-md`}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{s.label}</p>
                <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">{s.value}</p>
              </div>
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${s.gradient} flex items-center justify-center shadow-lg`}>
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={1.7} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d={s.icon} />
                </svg>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {quickActions.map((a) => (
            <Link key={a.label} href={a.href}
              className={`flex flex-col items-center gap-2.5 p-4 rounded-xl bg-gradient-to-br ${a.color} border transition-all hover:shadow-sm`}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.7} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d={a.icon} />
              </svg>
              <span className="text-xs font-semibold">{a.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Admin-only actions */}
      {user.role === "ADMIN" && (
        <div>
          <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">Administration</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            {adminActions.map((a) => (
              <Link key={a.label} href={a.href}
                className={`flex flex-col items-center gap-2 p-3.5 rounded-xl bg-gradient-to-br ${a.color} border transition-all hover:shadow-sm`}>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.7} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d={a.icon} />
                </svg>
                <span className="text-[11px] font-semibold text-center">{a.label}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
