import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const user = await getSession();
  if (!user) redirect("/");

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user.name}!
        </h1>
        <p className="mt-1 text-gray-500">
          Here&apos;s what&apos;s happening at your school today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { label: "Total Students", value: "0", icon: "students", color: "blue" },
          { label: "Total Teachers", value: "0", icon: "teachers", color: "indigo" },
          { label: "Total Classes", value: "0", icon: "classes", color: "purple" },
          { label: "Attendance Rate", value: "—", icon: "attendance", color: "green" },
        ].map((stat) => {
          const colorMap: Record<string, string> = {
            blue: "bg-blue-100 text-blue-600",
            indigo: "bg-indigo-100 text-indigo-600",
            purple: "bg-purple-100 text-purple-600",
            green: "bg-green-100 text-green-600",
          };
          return (
            <div
              key={stat.label}
              className="bg-white rounded-xl border border-gray-200 p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    {stat.label}
                  </p>
                  <p className="mt-1 text-3xl font-bold text-gray-900">
                    {stat.value}
                  </p>
                </div>
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center ${colorMap[stat.color]}`}
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
                    />
                  </svg>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Add Student", href: "/dashboard/students" },
            { label: "Add Teacher", href: "/dashboard/teachers" },
            { label: "Create Class", href: "/dashboard/classes" },
            { label: "Take Attendance", href: "/dashboard/attendance" },
          ].map((action) => (
            <a
              key={action.label}
              href={action.href}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-50 rounded-lg text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors border border-gray-100"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 4.5v15m7.5-7.5h-15"
                />
              </svg>
              {action.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
