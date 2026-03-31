import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* ─── Navbar ─── */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-linear-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
              </svg>
            </div>
            <span className="text-lg sm:text-xl font-bold tracking-tight">Dawloom<span className="text-blue-600">Sys</span></span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600">
            <a href="#features" className="hover:text-blue-600 transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-blue-600 transition-colors">How It Works</a>
            <a href="#roles" className="hover:text-blue-600 transition-colors">Roles</a>
            <a href="#benefits" className="hover:text-blue-600 transition-colors">Benefits</a>
          </nav>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link href="/login" className="px-3 sm:px-5 py-2 sm:py-2.5 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors">Login</Link>
            <Link href="/register" className="px-3 sm:px-5 py-2 sm:py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm">Sign Up</Link>
          </div>
        </div>
      </header>

      {/* ─── Hero ─── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-br from-blue-50 via-indigo-50 to-white" />
        <div className="absolute top-20 left-10 w-48 sm:w-72 h-48 sm:h-72 bg-blue-200/30 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-64 sm:w-96 h-64 sm:h-96 bg-indigo-200/20 rounded-full blur-3xl" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24 md:py-32 text-center">
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 mb-5 sm:mb-6 text-xs sm:text-sm font-medium text-blue-700 bg-blue-100 rounded-full">
            <span className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
            Complete School Management Platform
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-extrabold tracking-tight leading-tight max-w-4xl mx-auto">
            The Smarter Way to{" "}
            <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-indigo-600">
              Manage Your School
            </span>
          </h1>
          <p className="mt-4 sm:mt-6 text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed px-4">
            One platform for admins, teachers, and parents. Manage classes, track attendance, handle complaints, and keep everyone connected.
          </p>
          <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 px-4">
            <Link href="/login" className="w-full sm:w-auto px-8 py-3.5 text-base font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/25 text-center">
              Login to Dashboard
            </Link>
            <Link href="/register" className="w-full sm:w-auto px-8 py-3.5 text-base font-semibold text-gray-700 bg-white border border-gray-200 rounded-xl hover:border-gray-300 transition-all text-center">
              Sign Up as Parent
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Stats ─── */}
      <section className="border-y border-gray-100 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14 grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
          {[
            { value: "100%", label: "Data Isolation" },
            { value: "3", label: "User Roles" },
            { value: "Real-time", label: "Notifications" },
            { value: "Secure", label: "Authentication" },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-blue-600">{s.value}</div>
              <div className="mt-1 text-xs sm:text-sm text-gray-500 font-medium">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Features ─── */}
      <section id="features" className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold">Everything Your School Needs</h2>
            <p className="mt-4 text-gray-500 text-base sm:text-lg">Powerful tools to simplify school management from top to bottom.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[
              { title: "Class Management", desc: "Create classes, assign multiple teachers with their subjects. Each class is an isolated unit.", icon: "M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21", color: "from-blue-500 to-blue-600" },
              { title: "Student Records", desc: "Add students with roll numbers, father names. Link students to parents for tracking.", icon: "M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493", color: "from-indigo-500 to-indigo-600" },
              { title: "Attendance Tracking", desc: "Mark daily attendance per class. Parents get notified instantly via email and in-app alerts.", icon: "M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z", color: "from-green-500 to-green-600" },
              { title: "Complaint System", desc: "Teachers complain about students, parents complain about teachers. Threaded replies visible to all.", icon: "M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z", color: "from-orange-500 to-orange-600" },
              { title: "Email Notifications", desc: "Teachers receive login codes via email. Parents get attendance reports and complaint alerts.", icon: "M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75", color: "from-pink-500 to-pink-600" },
              { title: "Multi-Tenant Security", desc: "Each school is isolated. No data leaks between organizations. Every query is org-scoped.", icon: "M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622", color: "from-purple-500 to-purple-600" },
            ].map((f) => (
              <div key={f.title} className="group bg-white rounded-2xl border p-6 hover:shadow-lg hover:border-blue-100 transition-all duration-300">
                <div className={`w-12 h-12 rounded-xl bg-linear-to-br ${f.color} flex items-center justify-center mb-4 shadow-md group-hover:scale-110 transition-transform`}>
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d={f.icon} />
                  </svg>
                </div>
                <h3 className="text-lg font-bold mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── How It Works ─── */}
      <section id="how-it-works" className="py-16 sm:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold">How to Use SchoolSystem</h2>
            <p className="mt-4 text-gray-500 text-base sm:text-lg">Get started in minutes. Here&apos;s how each role works.</p>
          </div>

          {/* Admin Steps */}
          <div className="mb-12 sm:mb-16">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-linear-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                </svg>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold">For Admin</h3>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { step: "1", title: "Login", desc: "Login with your admin credentials to access the dashboard." },
                { step: "2", title: "Add Teachers", desc: "Go to Teachers page. Enter name & email. A login code is emailed to the teacher automatically." },
                { step: "3", title: "Create Classes", desc: "Go to Classes page. Create a class and assign one or more teachers with their subjects." },
                { step: "4", title: "Share Invite Code", desc: "Copy the Parent Invite Code from your dashboard and share it with parents so they can register." },
              ].map((s) => (
                <div key={s.step} className="bg-white rounded-2xl border p-5 relative">
                  <div className="w-8 h-8 bg-purple-100 text-purple-700 rounded-lg flex items-center justify-center text-sm font-bold mb-3">{s.step}</div>
                  <h4 className="font-bold mb-1">{s.title}</h4>
                  <p className="text-sm text-gray-500 leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Teacher Steps */}
          <div className="mb-12 sm:mb-16">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-linear-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 00-.491 6.347A48.62 48.62 0 0112 20.904a48.62 48.62 0 018.232-4.41 60.46 60.46 0 00-.491-6.347" />
                </svg>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold">For Teacher</h3>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { step: "1", title: "Get Your Code", desc: "Check your email for the login code sent by your school admin." },
                { step: "2", title: "Login with Code", desc: "Go to Login page, select 'Teacher' tab, enter your email and the code from email." },
                { step: "3", title: "Add Students", desc: "Open your assigned class, click '+ Add Student'. Enter student name, roll number, and father name." },
                { step: "4", title: "Mark Attendance", desc: "Go to Attendance page, select your class and date. Mark each student as Present, Absent, or Late." },
              ].map((s) => (
                <div key={s.step} className="bg-white rounded-2xl border p-5 relative">
                  <div className="w-8 h-8 bg-blue-100 text-blue-700 rounded-lg flex items-center justify-center text-sm font-bold mb-3">{s.step}</div>
                  <h4 className="font-bold mb-1">{s.title}</h4>
                  <p className="text-sm text-gray-500 leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Parent Steps */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-linear-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-md">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493" />
                </svg>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold">For Parent</h3>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { step: "1", title: "Get Invite Code", desc: "Ask your school admin for the Parent Invite Code." },
                { step: "2", title: "Register", desc: "Click 'Sign Up', enter your name, email, password, and the invite code." },
                { step: "3", title: "View Your Child", desc: "On your dashboard, click on your child's name to see their class, teachers, and attendance record." },
                { step: "4", title: "Complaints", desc: "View complaints from teachers about your child. Reply to them. Or file a complaint about a teacher." },
              ].map((s) => (
                <div key={s.step} className="bg-white rounded-2xl border p-5 relative">
                  <div className="w-8 h-8 bg-green-100 text-green-700 rounded-lg flex items-center justify-center text-sm font-bold mb-3">{s.step}</div>
                  <h4 className="font-bold mb-1">{s.title}</h4>
                  <p className="text-sm text-gray-500 leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── Roles Detail ─── */}
      <section id="roles" className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold">Built for Every Role</h2>
            <p className="mt-4 text-gray-500 text-base sm:text-lg">Each user sees exactly what they need. Nothing more, nothing less.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-4 sm:gap-6">
            {[
              {
                role: "Admin",
                color: "from-purple-600 to-indigo-700",
                highlight: true,
                features: [
                  "Add and remove teachers",
                  "Create classes with multiple teachers",
                  "Assign subjects to teachers per class",
                  "View all attendance across classes",
                  "View and respond to all complaints",
                  "Share invite code with parents",
                  "Manage school name and settings",
                ],
              },
              {
                role: "Teacher",
                color: "from-blue-600 to-blue-700",
                highlight: false,
                features: [
                  "View assigned classes only",
                  "Add students to your classes",
                  "Mark daily attendance",
                  "File complaints about students",
                  "View and respond to all complaints",
                  "Login with emailed code (no password)",
                  "Edit/delete attendance records",
                ],
              },
              {
                role: "Parent",
                color: "from-green-600 to-green-700",
                highlight: false,
                features: [
                  "Register with school invite code",
                  "View your child's class and teachers",
                  "View attendance history (read-only)",
                  "Receive attendance email alerts",
                  "View complaints about your child",
                  "Reply to complaints",
                  "File complaints about teachers",
                ],
              },
            ].map((card) => (
              <div key={card.role} className={`rounded-2xl p-6 sm:p-8 ${card.highlight ? `bg-linear-to-br ${card.color} text-white shadow-xl` : "bg-white border text-gray-900"}`}>
                <h3 className="text-2xl font-bold mb-6">{card.role}</h3>
                <ul className="space-y-3">
                  {card.features.map((f) => (
                    <li key={f} className="flex items-start gap-3 text-sm">
                      <svg className={`w-5 h-5 shrink-0 mt-0.5 ${card.highlight ? "text-purple-200" : "text-blue-600"}`} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                      <span className={card.highlight ? "text-purple-50" : "text-gray-600"}>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Benefits ─── */}
      <section id="benefits" className="py-16 sm:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold">Why Use SchoolSystem?</h2>
            <p className="mt-4 text-gray-500 text-base sm:text-lg">Built to solve real problems schools face every day.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[
              { title: "Save Time", desc: "No more paper registers or manual tracking. Mark attendance in seconds, manage students with a few clicks.", icon: "M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" },
              { title: "Stay Connected", desc: "Parents are instantly notified when attendance is marked or a complaint is filed. No gaps in communication.", icon: "M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" },
              { title: "Complete Privacy", desc: "Each school is a separate organization. Teachers only see their classes. Parents only see their children.", icon: "M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" },
              { title: "Easy Complaints", desc: "Teachers file complaints about students. Parents file complaints about teachers. Everyone can reply. Admin sees all.", icon: "M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" },
              { title: "Email Alerts", desc: "Teachers get welcome emails with login codes. Parents get attendance reports. All automated.", icon: "M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" },
              { title: "Works Everywhere", desc: "Fully responsive design. Use it on desktop, tablet, or phone. Works in any modern browser.", icon: "M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" },
            ].map((b) => (
              <div key={b.title} className="bg-white rounded-2xl border p-6 hover:shadow-lg hover:border-blue-100 transition-all">
                <div className="w-11 h-11 bg-blue-50 rounded-xl flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d={b.icon} />
                  </svg>
                </div>
                <h3 className="text-lg font-bold mb-2">{b.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="py-16 sm:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-blue-600 via-blue-700 to-indigo-700 px-6 sm:px-8 py-12 sm:py-16 md:px-16 text-center shadow-2xl shadow-blue-600/20">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.15),transparent_50%)]" />
            <div className="relative">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white">Ready to Get Started?</h2>
              <p className="mt-4 text-base sm:text-lg text-blue-100 max-w-xl mx-auto">
                Login as admin to set up your school, or sign up as a parent to connect with your child&apos;s school.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
                <Link href="/login" className="w-full sm:w-auto px-8 py-3.5 text-base font-semibold text-blue-700 bg-white rounded-xl hover:bg-blue-50 transition-colors shadow-lg text-center">
                  Login
                </Link>
                <Link href="/register" className="w-full sm:w-auto px-8 py-3.5 text-base font-semibold text-white border-2 border-white/30 rounded-xl hover:bg-white/10 transition-colors text-center">
                  Sign Up as Parent
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="border-t border-gray-100 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-12">
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-linear-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
                  </svg>
                </div>
                <span className="font-bold">Dawloom<span className="text-blue-600">Sys</span></span>
              </div>
              <p className="text-sm text-gray-500 leading-relaxed">Complete school management platform for modern education.</p>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-4">Platform</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><a href="#features" className="hover:text-blue-600 transition-colors">Features</a></li>
                <li><a href="#how-it-works" className="hover:text-blue-600 transition-colors">How It Works</a></li>
                <li><a href="#roles" className="hover:text-blue-600 transition-colors">User Roles</a></li>
                <li><a href="#benefits" className="hover:text-blue-600 transition-colors">Benefits</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-4">Get Started</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><Link href="/login" className="hover:text-blue-600 transition-colors">Admin Login</Link></li>
                <li><Link href="/login" className="hover:text-blue-600 transition-colors">Teacher Login</Link></li>
                <li><Link href="/register" className="hover:text-blue-600 transition-colors">Parent Sign Up</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-4">Contact</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li>junaidiqbal.dev88@gmail.com</li>
              </ul>
            </div>
          </div>
          <div className="mt-10 pt-8 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between text-sm text-gray-400">
            <p>&copy; 2026 DawloomSys. All rights reserved.</p>
            <p className="mt-2 sm:mt-0">Built for educators, by educators.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
