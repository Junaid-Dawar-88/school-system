# DawloomSys — Multi-Tenant School Management System

A comprehensive, production-level multi-tenant school management platform built with **Next.js 16**, **tRPC 11**, **Prisma 7**, and **Neon PostgreSQL**. Each school is a fully isolated organization with role-based access for Admins, Teachers, and Parents.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16.2.1 (App Router, React 19) |
| API | tRPC v11 + TanStack React Query 5 |
| Database | PostgreSQL (Neon Serverless) + Prisma 7 |
| Auth | Cookie-based sessions + bcrypt |
| UI | Tailwind CSS 4 + shadcn/ui |
| Charts | Recharts 3 |
| Validation | Zod v4 |
| Email | Nodemailer (SMTP) |
| PDF | jsPDF + jspdf-autotable |
| Exports | xlsx, date-fns |

## Features (20 Modules)

### Core Modules
- **Dashboard** — Role-specific overview with stats, quick actions, invite code
- **Teachers** — CRUD with auto-generated login codes sent via email
- **Classes** — Create with multi-teacher subject assignments
- **Students** — Manage with parent linking and roll numbers
- **Attendance** — Bulk marking with email + in-app parent notifications

### Academic Modules
- **Exams** — Schedule exams per class/subject with notifications
- **Grades** — Bulk grade entry per exam, filter by class/exam/subject
- **Report Cards** — Auto-generate with rank calculation and PDF download
- **Assignments** — Create, submit, and grade with deadline tracking
- **Timetable** — Weekly schedule grid with day/time/subject/teacher/room

### Administration Modules
- **Fee Management** — Fee structures, payment recording, receipt generation, overdue tracking
- **Salary & Payroll** — Teacher salary records, payment status, monthly summaries
- **Leave Management** — Request/approve/reject leave with status tracking
- **Analytics** — Recharts dashboards: attendance trends, grade distribution, fee collection

### Resource Modules
- **Library** — Book inventory, issue/return tracking, fine management
- **Transport** — Vehicle management, route assignments, student mapping
- **Events** — School calendar with holidays, events, meetings

### Communication Modules
- **Complaints** — Threaded replies, PUBLIC/PRIVATE visibility, role-based access
- **Notifications** — In-app notification center with unread badges
- **Settings** — Profile, password, school name, invite code management

## Multi-Tenant Architecture

Every table includes `organizationId`. All queries filter by it. Zero cross-organization data access.

```
Organization A (School 1)         Organization B (School 2)
├── Admin                         ├── Admin
├── Teachers                      ├── Teachers
├── Parents                       ├── Parents
├── Classes / Students            ├── Classes / Students
├── Attendance / Grades           ├── Attendance / Grades
├── Fees / Salary                 ├── Fees / Salary
├── Library / Transport           ├── Library / Transport
├── Events / Leaves               ├── Events / Leaves
└── Complaints / Notifications    └── Complaints / Notifications
```

## Getting Started

### 1. Install

```bash
git clone <repo-url>
cd school-system
pnpm install
```

### 2. Environment

```env
DATABASE_URL='postgresql://user:pass@host/db?sslmode=require'
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=you@gmail.com
SMTP_PASS=app-password
SMTP_FROM=you@gmail.com
```

### 3. Database

```bash
npx prisma generate
npx prisma db push
npx tsx prisma/seed.ts    # Creates admin account
```

### 4. Run

```bash
pnpm dev
```

## Roles & Permissions

### ADMIN
Full access to all modules. Manages teachers, classes, fees, salary, library, transport, analytics, and school settings.

### TEACHER
Manages assigned classes, students, attendance, grades, exams, assignments. Can request leave and file complaints.

### PARENT
Views children's grades, report cards, attendance, fees, timetable, assignments, transport. Files complaints and receives notifications.

## Project Structure

```
app/
├── dashboard/
│   ├── page.tsx                 # Dashboard (role-specific)
│   ├── sidebar/sidebar.tsx      # Sectioned navigation
│   ├── teachers/               # Teacher management
│   ├── classes/                # Class management
│   ├── students/               # Student management
│   ├── attendance/             # Attendance marking
│   ├── exams/                  # Exam scheduling
│   ├── grades/                 # Grade entry
│   ├── report-cards/           # Report card generation
│   ├── assignments/            # Assignment management
│   ├── timetable/              # Weekly schedule
│   ├── fees/                   # Fee management
│   ├── salary/                 # Payroll
│   ├── leaves/                 # Leave management
│   ├── library/                # Library system
│   ├── transport/              # Transport management
│   ├── events/                 # Events calendar
│   ├── analytics/              # Charts & analytics
│   ├── complaints/             # Complaint system
│   ├── notifications/          # Notification center
│   └── settings/               # Profile & school settings

server/routers/
├── index.ts                     # 20 merged routers
├── organization.ts, teacher.ts, class.ts, student.ts
├── attendance.ts, exam.ts, complaint.ts, notification.ts
├── grade.ts, reportCard.ts, fee.ts, timetable.ts
├── assignment.ts, library.ts, transport.ts, event.ts
├── leave.ts, salary.ts, analytics.ts, settings.ts
```

## Database Models (23 Tables)

| Model | Description |
|-------|-------------|
| Organization | Multi-tenant school entity |
| User | Admin, Teacher, Parent accounts |
| Class, ClassTeacher | Classes with teacher-subject assignments |
| Student | Student records with parent linking |
| Attendance | Daily attendance (PRESENT/ABSENT/LATE) |
| Exam | Exam/test scheduling |
| Grade | Per-student per-exam scores |
| ReportCard | Auto-generated term report cards with ranks |
| Fee, FeePayment | Fee structures and payment tracking |
| Timetable | Weekly class schedule slots |
| Assignment, AssignmentSubmission | Homework with submissions and grading |
| LibraryBook, BookIssue | Book inventory and issue/return |
| Vehicle, TransportAssignment | Transport routes and student assignments |
| Event | School events, holidays, meetings |
| LeaveRequest | Teacher leave requests with approval |
| Salary | Monthly payroll records |
| Complaint, ComplaintReply | Threaded complaint system |
| Notification | In-app notifications |

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Development server |
| `pnpm build` | Production build |
| `npx prisma studio` | Database browser |
| `npx prisma db push` | Push schema to DB |
| `npx prisma generate` | Regenerate Prisma client |

## License

MIT
