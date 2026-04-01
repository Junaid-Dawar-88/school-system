# DawloomSys — Complete Project Documentation

## Table of Contents

- [Overview](#overview)
- [What This Project Does](#what-this-project-does)
- [Tech Stack](#tech-stack)
- [Project Architecture](#project-architecture)
- [Directory Structure](#directory-structure)
- [Database Schema](#database-schema)
- [Authentication System](#authentication-system)
- [User Roles & Permissions](#user-roles--permissions)
- [Features Breakdown](#features-breakdown)
- [API Layer (tRPC Routers)](#api-layer-trpc-routers)
- [UI Components & Design System](#ui-components--design-system)
- [Email System](#email-system)
- [How It Works (User Flows)](#how-it-works-user-flows)
- [Benefits](#benefits)
- [Environment Variables](#environment-variables)
- [Getting Started](#getting-started)

---

## Overview

**DawloomSys** is a full-stack, multi-tenant school management system built with **Next.js 16**, **tRPC 11**, **Prisma 7**, and **Neon PostgreSQL**. It provides a centralized platform for schools to manage academics, administration, finance, resources, and communication with **role-based access control** for three user types: **Admin**, **Teacher**, and **Parent**.

The system includes **20 modules** covering grades, report cards, fee management, timetables, assignments, library, transport, events, leave management, salary/payroll, and analytics dashboards — alongside the core class, student, attendance, complaint, and notification systems.

---

## What This Project Does

| Problem | Solution |
|---------|----------|
| Manual attendance tracking | Digital bulk attendance with email + in-app parent notifications |
| No grading system | Bulk grade entry per exam with report card auto-generation |
| Paper-based fee records | Digital fee structures, payment tracking, receipt generation |
| No class schedule visibility | Weekly timetable grid with subject/teacher/room mapping |
| Homework tracking gaps | Assignment creation, submission, and grading system |
| Library inventory chaos | Book inventory with issue/return and fine tracking |
| Transport management | Vehicle routes with student stop assignments |
| No leave tracking | Leave request/approve/reject workflow |
| Payroll confusion | Monthly salary records with payment status tracking |
| No performance visibility | Recharts analytics dashboards for attendance, grades, fees |
| Parent communication gap | Real-time notifications, complaint system, parent portal |
| Scattered school data | Centralized dashboard with role-based views |

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Framework** | Next.js 16.2.1 (App Router) | Full-stack React framework with server components |
| **Language** | TypeScript 5 | End-to-end type safety |
| **API** | tRPC 11.16.0 | Type-safe RPC calls (no REST boilerplate) |
| **Database** | Prisma 7.6.0 + Neon PostgreSQL | ORM + serverless PostgreSQL |
| **Auth** | Cookie-based sessions + bcryptjs | Secure hashing and session management |
| **Email** | Nodemailer 8 | SMTP-based email notifications |
| **UI** | Tailwind CSS 4 + shadcn/ui | Utility-first styling + accessible components |
| **Charts** | Recharts 3 | Interactive analytics visualizations |
| **PDF** | jsPDF + jspdf-autotable | Report card PDF generation |
| **Export** | xlsx | Excel data export |
| **Dates** | date-fns 4 | Date formatting and manipulation |
| **State** | TanStack React Query 5 | Server state caching |
| **Validation** | Zod 4.3.6 | Runtime schema validation |
| **Toasts** | Sonner | User feedback notifications |
| **URL State** | nuqs | Search parameter management |
| **Theming** | next-themes | Dark/light mode toggle |

---

## Project Architecture

```
Browser (Client)
    |
    |-- React Components (app/dashboard/*)
    |       |
    |       |-- tRPC React Hooks (lib/trpc.ts)
    |               |
    |               |-- HTTP Batch Link --> /api/trpc
    |                                          |
    |                                    tRPC Server Handler
    |                                          |
    |                                    Middleware (Auth Check)
    |                                          |
    |                                    20 tRPC Routers (server/routers/*)
    |                                          |
    |                              +-----------+-----------+
    |                              |                       |
    |                        Prisma ORM              Nodemailer
    |                              |                       |
    |                     Neon PostgreSQL            SMTP Server
    |
    |-- Server Actions (app/actions/auth.ts)
            |
            |-- lib/auth.ts (Session Cookies)
```

### Key Architectural Decisions

1. **tRPC for API**: End-to-end type safety — no REST endpoints or manual types
2. **Cookie-based auth**: httpOnly cookies with 7-day expiry, secure in production
3. **Multi-tenant design**: All data scoped by `organizationId` for complete isolation
4. **Role-based middleware**: Four procedure types enforce access at the API layer
5. **Sectioned sidebar**: Navigation grouped by function (Academic, Management, Resources, Communication, System)
6. **Emerald/teal design system**: Professional color palette with role-aware accents

---

## Directory Structure

```
school-system/
├── app/
│   ├── layout.tsx                              # Root layout (fonts, ThemeProvider)
│   ├── page.tsx                                # Landing page
│   ├── globals.css                             # Tailwind + CSS variables + scrollbar styles
│   ├── login/page.tsx                          # Login (Admin/Parent tab + Teacher code tab)
│   ├── register/page.tsx                       # Parent registration with invite code
│   ├── forgot-password/page.tsx                # Password recovery
│   ├── reset-password/page.tsx                 # Password reset
│   ├── actions/
│   │   ├── auth.ts                             # Server actions (login, register, logout)
│   │   └── password.ts                         # Password reset actions
│   ├── api/trpc/[trpc]/route.ts               # tRPC API handler (GET + POST)
│   └── dashboard/
│       ├── layout.tsx                          # Auth guard + Sidebar + Providers
│       ├── page.tsx                            # Dashboard (role-specific with quick actions)
│       ├── sidebar/sidebar.tsx                 # Fixed sidebar with sectioned navigation
│       │
│       │── teachers/page.tsx                   # Teacher management (Admin)
│       │── classes/page.tsx                    # Class management with tabs
│       │── students/page.tsx                   # Student management
│       │── attendance/page.tsx                 # Attendance marking and history
│       │── exams/page.tsx                      # Exam/test scheduling
│       │
│       │── grades/page.tsx                     # Grade entry per exam (bulk)
│       │── report-cards/page.tsx               # Report card generation
│       │── assignments/page.tsx                # Assignment creation and grading
│       │── timetable/page.tsx                  # Weekly schedule grid
│       │
│       │── fees/page.tsx                       # Fee structures and payments
│       │── salary/page.tsx                     # Teacher payroll management
│       │── leaves/page.tsx                     # Leave request/approve workflow
│       │── analytics/page.tsx                  # Charts and analytics dashboard
│       │
│       │── library/page.tsx                    # Book inventory and issue tracking
│       │── transport/page.tsx                  # Vehicle and route management
│       │── events/page.tsx                     # School events calendar
│       │
│       │── complaints/page.tsx                 # Complaint system with replies
│       │── notifications/page.tsx              # Notification center
│       │── settings/page.tsx                   # Profile, password, school settings
│       └── parent-view/[studentId]/page.tsx    # Parent's view of child
│
├── server/
│   ├── trpc.ts                                 # tRPC init (context, procedures, middleware)
│   └── routers/
│       ├── index.ts                            # Root router (merges 20 sub-routers)
│       ├── organization.ts                     # Org stats, name, invite code
│       ├── teacher.ts                          # Teacher CRUD + email welcome
│       ├── class.ts                            # Class CRUD + teacher assignments
│       ├── student.ts                          # Student CRUD + parent linking
│       ├── attendance.ts                       # Bulk mark + history + parent notifications
│       ├── exam.ts                             # Exam scheduling + notifications
│       ├── complaint.ts                        # Complaints + replies + visibility
│       ├── notification.ts                     # Notification CRUD + unread count
│       ├── settings.ts                         # Profile + password
│       ├── grade.ts                            # Bulk grade entry + CRUD
│       ├── reportCard.ts                       # Auto-generate + rank calculation
│       ├── fee.ts                              # Fee structures + payment recording
│       ├── timetable.ts                        # Weekly schedule CRUD
│       ├── assignment.ts                       # Assignments + submissions + grading
│       ├── library.ts                          # Books + issue/return + fines
│       ├── transport.ts                        # Vehicles + student assignments
│       ├── event.ts                            # Events/holidays/meetings
│       ├── leave.ts                            # Leave requests + approve/reject
│       ├── salary.ts                           # Payroll records + mark paid
│       └── analytics.ts                        # Aggregated stats + trends
│
├── lib/
│   ├── auth.ts                                 # Session management (cookies)
│   ├── prisma.ts                               # Prisma client (Neon HTTP adapter)
│   ├── email.ts                                # Nodemailer SMTP config
│   ├── trpc.ts                                 # tRPC React client hooks
│   └── utils.ts                                # cn() classname utility
│
├── components/ui/                              # shadcn/ui components
├── compnent/                                   # Custom components (trpc-provider, theme-toggle)
│
├── prisma/
│   └── schema.prisma                           # 23-model database schema
│
├── package.json
├── tsconfig.json
├── next.config.ts
└── prisma.config.ts
```

---

## Database Schema

### Entity Relationship Overview

```
Organization (School)
├── Users (Admin, Teachers, Parents)
├── Classes
│   ├── ClassTeacher (teacher + subject)
│   ├── Students
│   │   ├── Attendance
│   │   ├── Grades
│   │   ├── ReportCards
│   │   ├── FeePayments
│   │   ├── AssignmentSubmissions
│   │   ├── BookIssues
│   │   └── TransportAssignments
│   ├── Fees
│   ├── Timetables
│   ├── Exams → Grades
│   └── Assignments → Submissions
├── LibraryBooks → BookIssues
├── Vehicles → TransportAssignments
├── Events
├── Complaints → ComplaintReplies
├── Notifications
├── LeaveRequests
└── Salaries
```

### All Models (23)

| Model | Key Fields | Description |
|-------|-----------|-------------|
| **Organization** | name, inviteCode, ownerId | Multi-tenant school entity |
| **User** | email, password, name, role, loginCode?, organizationId | Admin/Teacher/Parent accounts |
| **Class** | name, organizationId | School classes (unique per org) |
| **ClassTeacher** | classId, teacherId, subject | Many-to-many teacher-subject-class |
| **Student** | name, rollNumber, fatherName, classId, parentId?, orgId | Student records |
| **Attendance** | date, status, studentId, classId, orgId | PRESENT/ABSENT/LATE per day |
| **Exam** | title, date, subject, classId, createdById, orgId | Exam/test scheduling |
| **Grade** | score, maxScore, grade?, subject, studentId, examId, teacherId, orgId | Per-student per-exam scores |
| **ReportCard** | term, year, totalScore, maxTotal, percentage, rank?, studentId, classId, orgId | Auto-generated term report |
| **Fee** | title, amount, dueDate, classId, orgId | Fee structures per class |
| **FeePayment** | amountPaid, status, receiptNumber?, feeId, studentId, orgId | Payment records (PAID/PARTIAL/PENDING/OVERDUE) |
| **Timetable** | dayOfWeek, startTime, endTime, subject, teacherId, room?, classId, orgId | Weekly schedule slots |
| **Assignment** | title, description?, dueDate, subject, classId, teacherId, orgId | Homework/assignment creation |
| **AssignmentSubmission** | content?, grade?, feedback?, assignmentId, studentId, orgId | Student submissions with grading |
| **LibraryBook** | title, author, isbn?, category?, totalCopies, availableCopies, orgId | Book inventory |
| **BookIssue** | issueDate, dueDate, returnDate?, fine?, bookId, studentId, orgId | Issue/return tracking |
| **Vehicle** | vehicleNumber, driverName, driverPhone, capacity, route, orgId | Transport vehicles |
| **TransportAssignment** | stopName, vehicleId, studentId, orgId | Student route assignments |
| **Event** | title, description?, startDate, endDate, type, orgId | HOLIDAY/EVENT/MEETING/EXAM_SCHEDULE |
| **LeaveRequest** | startDate, endDate, reason, status, userId, orgId | PENDING/APPROVED/REJECTED |
| **Salary** | amount, month, year, status, paidDate?, userId, orgId | Monthly payroll records |
| **Complaint** | message, type, visibility, createdById, studentId?, teacherId?, orgId | ABOUT_STUDENT/ABOUT_TEACHER |
| **ComplaintReply** | message, complaintId, userId | Threaded replies |
| **Notification** | title, message, read, type, userId, orgId | COMPLAINT/EXAM/GENERAL |

### Enums

| Enum | Values |
|------|--------|
| Role | ADMIN, TEACHER, PARENT |
| AttendanceStatus | PRESENT, ABSENT, LATE |
| ComplaintType | ABOUT_STUDENT, ABOUT_TEACHER |
| ComplaintVisibility | PUBLIC, PRIVATE |
| NotificationType | COMPLAINT, EXAM, GENERAL |
| PaymentStatus | PENDING, PAID, PARTIAL, OVERDUE |
| DayOfWeek | MONDAY - SUNDAY |
| EventType | HOLIDAY, EVENT, MEETING, EXAM_SCHEDULE |
| LeaveStatus | PENDING, APPROVED, REJECTED |

---

## Authentication System

### Three Login Methods

1. **Admin/Parent Login** (`/login` - Tab 1)
   - Email + password → bcrypt verification → session cookie
2. **Teacher Code Login** (`/login` - Tab 2)
   - Email + 8-character alphanumeric code (auto-generated, emailed by admin)
3. **Parent Registration** (`/register`)
   - Name + email + password + school invite code → auto-login

### Session Management
- **Cookie**: `session_user_id` (httpOnly, secure, sameSite=lax)
- **Expiry**: 7 days
- **Functions**: `getSession()`, `createSession()`, `destroySession()`
- **Auth Guard**: Dashboard layout checks session, redirects to `/login` if missing

---

## User Roles & Permissions

### Admin (School Administrator)
| Module | Access |
|--------|--------|
| Dashboard | Stats + invite code + all quick actions |
| Teachers | Full CRUD + send login codes |
| Classes | Full CRUD + teacher-subject assignments |
| Students | Full CRUD + parent linking |
| Attendance | View history (all classes) |
| Exams | Full CRUD |
| Grades | View all + enter grades |
| Report Cards | Generate + view + delete |
| Fees | Create fee structures + record payments |
| Timetable | Full CRUD |
| Assignments | Full CRUD + grade submissions |
| Library | Add/edit/delete books + issue/return |
| Transport | Add vehicles + assign students |
| Events | Full CRUD |
| Leaves | View all + approve/reject |
| Salary | Create records + mark paid |
| Analytics | Full dashboards (attendance, grades, fees) |
| Complaints | View all + reply + delete any |
| Notifications | Full access |
| Settings | Profile + password + school name + invite code |

### Teacher
| Module | Access |
|--------|--------|
| Dashboard | Stats overview |
| Classes | View assigned classes only |
| Students | Add to assigned classes |
| Attendance | Mark + edit + delete |
| Exams | Create for assigned classes |
| Grades | Enter for assigned classes |
| Assignments | Create + grade submissions |
| Timetable | View own schedule |
| Complaints | File about students + reply |
| Leaves | Request leave |
| Notifications | Full access |
| Settings | Profile + password |

### Parent
| Module | Access |
|--------|--------|
| Dashboard | View linked children |
| Exams | View children's exams |
| Grades | View children's grades |
| Report Cards | View children's reports |
| Fees | View fee status |
| Timetable | View children's schedule |
| Assignments | View children's assignments |
| Transport | View children's route |
| Events | View all events |
| Complaints | File about teachers + reply |
| Notifications | Full access |
| Settings | Profile + password |

---

## Features Breakdown

### 1. Teacher Management (Admin Only)
- Add teachers with name, email, and subjects (18 available)
- Auto-generates 8-character login code sent via email
- Edit teacher details, remove teachers (cascading cleanup)
- Search by name/email, filter by subject

### 2. Class Management
- Create classes with teacher-subject assignments
- Tabbed interface: Students / Teachers / Attendance
- Edit class name and assignments, delete (cascades)

### 3. Attendance System
- Bulk mark per class per date (PRESENT/ABSENT/LATE)
- Auto-sends email + in-app notification to parents
- View history, edit/delete individual records or entire day
- Unique constraint: one record per student per day

### 4. Exam Scheduling
- Create exams with title, date, subject, class
- All org users notified when exam is created
- Teacher-scoped: only for assigned classes

### 5. Grades (NEW)
- Bulk grade entry per exam with score/maxScore/grade/remarks
- Filter by class, exam, or subject
- Upsert logic: update existing grades or create new

### 6. Report Cards (NEW)
- Auto-generate per class/term/year
- Calculates totalScore, percentage, and class rank
- Filter by class, term, year

### 7. Fee Management (NEW)
- Create fee structures per class with amount and due date
- Record payments (PAID/PARTIAL/PENDING/OVERDUE)
- Auto-generate receipt numbers
- Tabbed view: Fee Structures / Payments

### 8. Timetable (NEW)
- Weekly grid organized by day (Monday-Saturday)
- Each slot: time range, subject, teacher, room
- Color-coded by day with card-based layout

### 9. Assignments (NEW)
- Create with title, description, due date, subject, class
- View submissions with student name and content
- Inline grading with feedback per submission

### 10. Library (NEW)
- Add books with title, author, ISBN, category, copies
- Issue books to students with due dates
- Return with optional fine calculation
- Available/total copy tracking
- Tabbed view: Books / Active Issues

### 11. Transport (NEW)
- Add vehicles with driver info, capacity, route
- Assign students to vehicles with stop names
- Card-based layout showing passengers per vehicle

### 12. Events Calendar (NEW)
- Create events (HOLIDAY/EVENT/MEETING/EXAM_SCHEDULE)
- Color-coded event type badges
- Separated into Upcoming and Past sections

### 13. Leave Management (NEW)
- Teachers request leave with date range and reason
- Admin approves or rejects with one click
- Stats cards: Pending / Approved / Rejected counts

### 14. Salary & Payroll (NEW)
- Create monthly salary records per teacher
- Mark as paid with timestamp
- Summary cards: Total Payroll / Paid / Pending
- Filter by month and year

### 15. Analytics Dashboard (NEW)
- **Overview cards**: Students, Teachers, Classes, Parents
- **Attendance trend**: Line chart (last 30 days: present/absent/late)
- **Grade distribution**: Bar chart (average scores by subject)
- **Fee collection**: Pie chart (collected vs pending) + progress bar
- **Financial summary**: Total fees, collected, outstanding

### 16. Complaint System
- Two types: ABOUT_STUDENT (PUBLIC/PRIVATE) and ABOUT_TEACHER (always PUBLIC)
- Threaded replies from any authorized user
- Creator/admin can edit/delete

### 17. Notification Center
- Last 50 notifications with read/unread tracking
- Unread badge count in sidebar
- Mark single or all as read, delete single or all

### 18. Settings
- Profile: name and email
- Password: change with current password verification
- School Settings (Admin): school name, invite code, regenerate code

---

## API Layer (tRPC Routers)

### Router Structure (20 Routers, 80+ Procedures)

```
appRouter
├── org              # 4 procedures  — stats, name, invite code
├── teacher          # 4 procedures  — CRUD + email
├── class            # 5 procedures  — CRUD + teacher assignments
├── student          # 5 procedures  — CRUD + parent linking
├── attendance       # 7 procedures  — bulk mark, history, edit/delete
├── exam             # 4 procedures  — CRUD + notifications
├── complaint        # 7 procedures  — CRUD + replies + visibility
├── notification     # 6 procedures  — list, count, mark read, delete
├── settings         # 3 procedures  — profile, password
├── grade            # 4 procedures  — bulk create, update, delete
├── reportCard       # 3 procedures  — list, generate, delete
├── fee              # 6 procedures  — CRUD + payments
├── timetable        # 4 procedures  — CRUD
├── assignment       # 7 procedures  — CRUD + submit + grade
├── library          # 8 procedures  — books CRUD + issue/return
├── transport        # 6 procedures  — vehicles + assignments
├── event            # 4 procedures  — CRUD
├── leave            # 4 procedures  — create + approve/reject
├── salary           # 4 procedures  — CRUD + mark paid
└── analytics        # 4 procedures  — overview, trends, grades, fees
```

### Procedure Types

| Procedure | Auth | Role |
|-----------|------|------|
| `publicProcedure` | No | None |
| `protectedProcedure` | Yes | Must have organizationId |
| `teacherProcedure` | Yes | TEACHER or ADMIN |
| `adminProcedure` | Yes | ADMIN only |

---

## UI Components & Design System

### Color Palette
- **Sidebar**: Deep slate (`slate-950`) with emerald/teal accents
- **Active state**: Emerald left-edge pill + gradient background
- **Role colors**: Emerald (Admin), Sky (Teacher), Violet (Parent)
- **Status colors**: Green (present/paid), Red (absent/overdue), Yellow (late/pending), Blue (partial)
- **Dark mode**: Full support via next-themes with CSS variables

### Design Features
- **Sectioned sidebar**: Navigation grouped by Academic, Management, Resources, Communication, System
- **Fixed sidebar**: Stays in place with independent scroll
- **Collapsible**: Collapses to icon-only on desktop
- **Mobile drawer**: Hamburger menu with overlay
- **Responsive**: Mobile-first with sm/md/lg breakpoints
- **Thin scrollbar**: Custom 3px scrollbar for sidebar

### shadcn/ui Components Used
Button, Input, Label, Card, Badge, Dialog, Table, Tabs, Select, Textarea, Separator, Dropdown Menu, Sonner (toast)

---

## Email System

### 1. Teacher Welcome Email
- **Triggered**: Admin creates new teacher
- **Contains**: Name, school name, login code, app URL

### 2. Attendance Notification Email
- **Triggered**: Teacher marks attendance
- **Sent to**: Each parent with absent/late children
- **Contains**: HTML table with student name, class, date, status

---

## How It Works (User Flows)

### School Setup
1. Admin logs in → updates school name in Settings
2. Admin copies Parent Invite Code from dashboard
3. Admin adds teachers → each gets email with login code
4. Admin creates classes with teacher-subject assignments
5. Admin sets up fee structures, timetables, vehicles

### Teacher Daily Workflow
1. Teacher logs in with email + code
2. Marks attendance → parents notified automatically
3. Creates exams → enters grades after completion
4. Creates assignments → reviews and grades submissions
5. Files complaints if needed, requests leave

### Parent Experience
1. Registers with school invite code
2. Views children on dashboard → clicks for detailed view
3. Checks grades, report cards, timetable, fees
4. Receives notifications for attendance, exams, complaints
5. Files complaints about teachers, replies to discussions

### Admin Monthly Tasks
1. Reviews analytics dashboard (attendance trends, grade distribution)
2. Creates fee structures → records payments
3. Manages teacher salaries → marks as paid
4. Approves/rejects leave requests
5. Generates report cards for term end

---

## Benefits

### For School Administration
- **20 modules** covering every aspect of school operations
- **Real-time analytics** with attendance, grade, and fee dashboards
- **Financial tracking** for fees and payroll
- **Complete audit trail** for all actions

### For Teachers
- **Bulk operations**: Mark attendance, enter grades in one go
- **Assignment system**: Create, track, and grade homework
- **Easy login**: Code-based (no password to remember)
- **Scoped access**: Only see assigned classes

### For Parents
- **Full visibility**: Grades, report cards, attendance, fees, timetable
- **Real-time updates**: Email + in-app notifications
- **Communication**: Complaint system with threaded replies
- **Transport info**: Know which vehicle and stop for their child

### Technical
- **Type safety**: End-to-end with tRPC + TypeScript + Prisma + Zod
- **Multi-tenant**: Complete data isolation between schools
- **Serverless**: Neon PostgreSQL for scalable deployment
- **Modern stack**: Next.js 16, React 19, Tailwind CSS 4
- **23 database models** with proper relations and cascading deletes
- **80+ API procedures** with role-based middleware
- **Dark mode** with professional emerald/teal design system

---

## Environment Variables

```env
# Database (Neon PostgreSQL)
DATABASE_URL=postgresql://user:pass@host/db?sslmode=require

# SMTP Email (Gmail)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=your-email@gmail.com

# App URL (used in emails)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- pnpm (package manager)
- Neon PostgreSQL database (or any PostgreSQL)

### Installation

```bash
# 1. Install dependencies
pnpm install

# 2. Generate Prisma client
npx prisma generate

# 3. Push schema to database (creates all 23 tables)
npx prisma db push

# 4. Seed the database (creates admin account)
npx tsx prisma/seed.ts

# 5. Start development server
pnpm dev
```

### First Steps After Setup
1. Log in as admin
2. Update school name in Settings
3. Add teachers (they receive login codes via email)
4. Create classes and assign teachers with subjects
5. Set up fee structures and timetables
6. Share the parent invite code with parents
7. Parents register and admin/teachers link students to parents

---

## Subject List

The system supports 18 subjects:

Mathematics, English, Urdu, Science, Physics, Chemistry, Biology, Computer Science, Social Studies, Islamiat, Pakistan Studies, History, Geography, Art, Physical Education, Economics, Accounting, General Knowledge

---

*DawloomSys — A comprehensive school management system with 20 modules, 23 database models, 80+ API procedures, and a professional emerald/teal design system.*
