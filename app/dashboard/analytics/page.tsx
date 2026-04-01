"use client";
import { trpc } from "@/lib/trpc";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend } from "recharts";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

export default function AnalyticsPage() {
  const { data: overview } = trpc.analytics.overview.useQuery();
  const { data: attendanceTrend } = trpc.analytics.attendanceTrend.useQuery();
  const { data: gradeDistribution } = trpc.analytics.gradeDistribution.useQuery();
  const { data: feeCollection } = trpc.analytics.feeCollection.useQuery();

  const feeData = feeCollection ? [
    { name: "Collected", value: feeCollection.totalCollected },
    { name: "Pending", value: feeCollection.totalPending },
  ] : [];

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Analytics Dashboard</h1>
        <p className="text-gray-500 dark:text-gray-400">School performance overview and insights</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Students", value: overview?.totalStudents || 0, color: "from-blue-500 to-blue-600" },
          { label: "Teachers", value: overview?.totalTeachers || 0, color: "from-green-500 to-green-600" },
          { label: "Classes", value: overview?.totalClasses || 0, color: "from-purple-500 to-purple-600" },
          { label: "Parents", value: overview?.totalParents || 0, color: "from-orange-500 to-orange-600" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white dark:bg-gray-900 rounded-2xl border dark:border-gray-800 p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{stat.label}</p>
                <p className="mt-1 text-3xl font-bold text-gray-900 dark:text-gray-100">{stat.value}</p>
              </div>
              <div className={`w-11 h-11 rounded-xl bg-linear-to-br ${stat.color} flex items-center justify-center shadow-md`}>
                <span className="text-white text-lg font-bold">{stat.label[0]}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance Trend */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border dark:border-gray-800 p-5">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Attendance Trend (Last 30 Days)</h2>
          {attendanceTrend?.length ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={attendanceTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(v) => v.slice(5)} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line type="monotone" dataKey="present" stroke="#10b981" strokeWidth={2} name="Present" />
                <Line type="monotone" dataKey="absent" stroke="#ef4444" strokeWidth={2} name="Absent" />
                <Line type="monotone" dataKey="late" stroke="#f59e0b" strokeWidth={2} name="Late" />
                <Legend />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-400">No attendance data</div>
          )}
        </div>

        {/* Grade Distribution */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border dark:border-gray-800 p-5">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Average Scores by Subject</h2>
          {gradeDistribution?.length ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={gradeDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="subject" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" height={80} />
                <YAxis tick={{ fontSize: 11 }} domain={[0, 100]} />
                <Tooltip />
                <Bar dataKey="averageScore" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Avg Score %" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-400">No grade data</div>
          )}
        </div>

        {/* Fee Collection */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border dark:border-gray-800 p-5">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Fee Collection Status</h2>
          {feeCollection && (feeCollection.totalCollected > 0 || feeCollection.totalPending > 0) ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={feeData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={({ name, percent }) => `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`}>
                  {feeData.map((_, i) => (
                    <Cell key={i} fill={i === 0 ? "#10b981" : "#f59e0b"} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `Rs. ${Number(value).toLocaleString()}`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-400">No fee data</div>
          )}
        </div>

        {/* Summary */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border dark:border-gray-800 p-5">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Financial Summary</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <span className="text-gray-600 dark:text-gray-400">Total Fees Expected</span>
              <span className="text-xl font-bold text-gray-900 dark:text-gray-100">Rs. {(feeCollection?.totalFees || 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-950 rounded-lg">
              <span className="text-green-600 dark:text-green-400">Total Collected</span>
              <span className="text-xl font-bold text-green-700 dark:text-green-300">Rs. {(feeCollection?.totalCollected || 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
              <span className="text-yellow-600 dark:text-yellow-400">Outstanding</span>
              <span className="text-xl font-bold text-yellow-700 dark:text-yellow-300">Rs. {(feeCollection?.totalPending || 0).toLocaleString()}</span>
            </div>
            {feeCollection && feeCollection.totalFees > 0 && (
              <div className="mt-4">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-500">Collection Rate</span>
                  <span className="font-semibold">{Math.round((feeCollection.totalCollected / feeCollection.totalFees) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                  <div className="bg-green-500 h-3 rounded-full transition-all" style={{ width: `${Math.min(100, (feeCollection.totalCollected / feeCollection.totalFees) * 100)}%` }} />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
