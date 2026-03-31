# School Management System - Complete Project Documentation

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
- [UI Components](#ui-components)
- [Email System](#email-system)
- [How It Works (User Flows)](#how-it-works-user-flows)
- [Benefits](#benefits)
- [Environment Variables](#environment-variables)
- [Getting Started](#getting-started)

---

## Overview

**School Management System** is a full-stack, multi-tenant web application built with **Next.js 16**, **tRPC**, **Prisma**, and **Neon PostgreSQL**. It provides a centralized platform for schools to manage teachers, students, classes, attendance, complaints, and notifications with **role-based access control** for three user types: **Admin**, **Teacher**, and **Parent**.

---

## What This Project Does

This application solves the day-to-day administrative challenges schools face:

| Problem | Solution |
|---------|----------|
| Manual attendance tracking on paper | Digital attendance with bulk marking and history |
| Parents unaware of child's attendance | Automatic email + in-app notifications to parents |
| No structured complaint system | Typed complaint system with PUBLIC/PRIVATE visibility and replies |
| Difficult teacher onboarding | Admin creates teacher accounts with auto-generated login codes sent via email |
| Parent communication gap | Parent portal with real-time access to child's data |
| Scattered school data | Centralized dashboard with stats, quick actions, and role-based views |

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Framework** | Next.js 16.2.1 (App Router) | Full-stack React framework |
| **Language** | TypeScript | Type safety across frontend and backend |
| **API** | tRPC 11.16.0 | End-to-end type-safe API calls |
| **Database** | Prisma 7.6.0 + Neon PostgreSQL | ORM + Serverless PostgreSQL |
| **Auth** | Cookie-based sessions + bcryptjs | Secure password hashing and session management |
| **Email** | Nodemailer | SMTP-based email sending |
| **UI** | Tailwind CSS 4 + shadcn/ui | Utility-first styling + pre-built components |
| **State** | React Query (TanStack Query) | Server state caching and synchronization |
| **Validation** | Zod 4.3.6 | Runtime schema validation |
| **Toasts** | Sonner | User feedback notifications |
| **URL State** | nuqs | URL search parameter management |

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
    |                                    tRPC Routers (server/routers/*)
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

1. **tRPC for API**: Provides end-to-end type safety between frontend and backend -- no REST endpoints to maintain, no manual type definitions
2. **Cookie-based auth**: Simple, secure session management using httpOnly cookies (7-day expiry)
3. **Multi-tenant design**: All data is scoped to an `organizationId`, ensuring complete data isolation between schools
4. **Role-based middleware**: Four procedure types (`public`, `protected`, `admin`, `teacher`) enforce access control at the API layer

---

## Directory Structure

```
school-system/
├── app/
│   ├── layout.tsx                              # Root layout (fonts, metadata)
│   ├── page.tsx                                # Landing page (hero, features)
│   ├── login/page.tsx                          # Login page (2 tabs: Admin/Parent & Teacher Code)
│   ├── register/page.tsx                       # Parent registration (invite code)
│   ├── actions/auth.ts                         # Server actions (login, register, logout)
│   ├── api/trpc/[trpc]/route.ts               # tRPC API handler (GET + POST)
│   └── dashboard/
│       ├── layout.tsx                          # Dashboard wrapper (auth guard, sidebar, providers)
│       ├── page.tsx                            # Dashboard home (stats for admin, children for parent)
│       ├── sidebar/sidebar.tsx                 # Collapsible sidebar with role-based menu
│       ├── teachers/page.tsx                   # Teacher management (ADMIN only)
│       ├── classes/page.tsx                    # Class management with tabs (students, teachers, attendance)
│       ├── students/page.tsx                   # Student list and management
│       ├── attendance/page.tsx                 # Attendance marking and history
│       ├── complaints/page.tsx                 # Complaint system with replies
│       ├── notifications/page.tsx              # Notification center
│       ├── settings/page.tsx                   # Profile, password, school settings
│       └── parent-view/[studentId]/page.tsx    # Parent's view of child details
│
├── server/
│   ├── trpc.ts                                 # tRPC init (context, router, procedures)
│   └── routers/
│       ├── index.ts                            # Root router (merges all sub-routers)
│       ├── organization.ts                     # Org stats, name update, invite code
│       ├── teacher.ts                          # Teacher CRUD + email welcome
│       ├── class.ts                            # Class CRUD + teacher assignments
│       ├── student.ts                          # Student CRUD + parent linking
│       ├── attendance.ts                       # Bulk mark, history, parent notifications
│       ├── complaint.ts                        # Complaints + replies + visibility
│       ├── notification.ts                     # Notification CRUD + unread count
│       └── settings.ts                         # Profile update, password change
│
├── lib/
│   ├── auth.ts                                 # Session management (cookies)
│   ├── prisma.ts                               # Prisma client (Neon HTTP adapter)
│   ├── email.ts                                # Nodemailer SMTP config
│   ├── trpc.ts                                 # tRPC React client hooks
│   └── utils.ts                                # cn() classname utility
│
├── components/ui/                              # shadcn/ui components
│   ├── badge.tsx, button.tsx, card.tsx
│   ├── dialog.tsx, dropdown-menu.tsx
│   ├── input.tsx, label.tsx, select.tsx
│   ├── separator.tsx, sonner.tsx
│   ├── table.tsx, tabs.tsx, textarea.tsx
│
├── compnent/
│   └── trpc-provider.tsx                       # tRPC + React Query provider wrapper
│
├── prisma/
│   ├── schema.prisma                           # Complete database schema
│   ├── seed.ts                                 # Initial admin + org seeding
│   ├── fix-admin.ts                            # Admin credential recovery
│   └── update-org.ts                           # Organization name update utility
│
├── package.json
├── tsconfig.json
├── next.config.ts
└── prisma.config.ts                            # Prisma adapter configuration
```

---

## Database Schema

### Entity Relationship Overview

```
Organization (School)
├── Users (Admin, Teachers, Parents)
├── Classes
│   ├── ClassTeacher (teacher + subject assignment)
│   └── Students
│       ├── Attendance records
│       └── Complaints (about student)
├── Complaints (about teacher)
│   └── ComplaintReplies
└── Notifications
```

### Models

#### Organization
| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| name | String | School name |
| inviteCode | UUID | Unique code for parent registration |
| ownerId | UUID | Admin who owns the organization |

#### User
| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| email | String | Unique email address |
| password | String | bcrypt hashed password |
| name | String | Full name |
| role | Enum | ADMIN, TEACHER, or PARENT |
| subject | String? | Comma-separated subjects (teachers) |
| loginCode | String? | 8-char code for teacher login |
| organizationId | UUID? | Linked organization |

#### Class
| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| name | String | Class name (e.g., "Grade 5-A") |
| organizationId | UUID | Belongs to organization |
| Unique | [name, organizationId] | No duplicate class names per school |

#### ClassTeacher (Many-to-Many)
| Field | Type | Description |
|-------|------|-------------|
| classId | UUID | The class |
| teacherId | UUID | The teacher |
| subject | String | Subject taught in this class |
| Unique | [classId, teacherId, subject] | One teacher-subject pair per class |

#### Student
| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| name | String | Student name |
| rollNumber | String | Roll number |
| fatherName | String | Father's name |
| classId | UUID | Enrolled class |
| parentId | UUID? | Linked parent account |
| organizationId | UUID | Belongs to organization |

#### Attendance
| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| date | DateTime | Attendance date |
| status | Enum | PRESENT, ABSENT, or LATE |
| studentId | UUID | Student |
| classId | UUID | Class |
| Unique | [studentId, date] | One record per student per day |

#### Complaint
| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| message | String | Complaint text |
| type | Enum | ABOUT_STUDENT or ABOUT_TEACHER |
| visibility | Enum | PUBLIC or PRIVATE (default: PUBLIC) |
| createdById | UUID | User who filed it |
| studentId | UUID? | Target student (if ABOUT_STUDENT) |
| teacherId | UUID? | Target teacher (if ABOUT_TEACHER) |

#### ComplaintReply
| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| message | String | Reply text |
| complaintId | UUID | Parent complaint |
| userId | UUID | Reply author |

#### Notification
| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| title | String | Notification title |
| message | String | Notification body |
| read | Boolean | Read status (default: false) |
| type | Enum | COMPLAINT or GENERAL |
| userId | UUID | Target user |

---

## Authentication System

### Three Login Methods

1. **Admin/Parent Login** (`/login` - Tab 1)
   - Email + password
   - Password verified with bcrypt
   - Session cookie set for 7 days

2. **Teacher Code Login** (`/login` - Tab 2)
   - Email + 8-character alphanumeric code
   - Code auto-generated when admin creates teacher
   - Code sent to teacher's email

3. **Parent Registration** (`/register`)
   - Name + email + password + school invite code
   - Invite code validates against organization
   - Auto-login after registration

### Session Management
- **Storage**: `session_user_id` httpOnly cookie
- **Expiry**: 7 days
- **Security**: httpOnly, secure, sameSite=lax
- **Data stored**: User ID (looked up on each request)

### Auth Guard
- Dashboard layout checks session on every load
- Redirects to `/login` if no valid session
- Role checked in tRPC middleware for API calls

---

## User Roles & Permissions

### Admin (School Administrator)
| Feature | Access |
|---------|--------|
| Dashboard | Stats (teachers, parents, classes, students) + invite code |
| Teachers | Full CRUD (create, edit, delete) |
| Classes | Full CRUD + teacher assignment |
| Students | Full CRUD + parent linking |
| Attendance | View history (all classes) |
| Complaints | View all + reply + delete any |
| Notifications | Full access |
| Settings | Profile + password + school name + invite code |

### Teacher
| Feature | Access |
|---------|--------|
| Dashboard | Stats overview |
| Classes | View assigned classes only |
| Students | Add students to assigned classes |
| Attendance | Mark attendance + view/edit/delete history |
| Complaints | File about students + view PUBLIC + reply |
| Notifications | Full access |
| Settings | Profile + password |

### Parent
| Feature | Access |
|---------|--------|
| Dashboard | View linked children with class info |
| Parent View | Child's attendance summary + history |
| Complaints | File about teachers + view about own children + reply |
| Notifications | Full access |
| Settings | Profile + password |

---

## Features Breakdown

### 1. Teacher Management (Admin Only)
- Add teachers with name, email, and subjects (18 available subjects)
- Auto-generates 8-character login code
- Sends welcome email with login credentials
- Edit teacher details (name, email, subjects)
- Remove teachers (cascades: removes class assignments, notifications, complaints)
- Search teachers by name/email
- Filter by subject

### 2. Class Management
- Create classes with name and teacher-subject assignments
- Assign multiple teachers to a class (each with a specific subject)
- View class details in tabbed interface:
  - **Students tab**: Full student list with add/edit/remove
  - **Teachers tab**: Assigned teachers and their subjects
  - **Attendance tab**: Historical attendance grouped by date
- Edit class name and teacher assignments
- Delete classes (cascades to students and attendance)

### 3. Student Management
- Add students with name, roll number, father's name, and class
- Link students to parent accounts (optional)
- View all students across classes
- Edit student details
- Remove students

### 4. Attendance System
- **Mark Attendance**: Select class + date, mark each student as PRESENT/ABSENT/LATE
- **Bulk Save**: Save entire class attendance in one action
- **Parent Notifications**: When attendance is marked:
  - In-app notification created for each parent
  - HTML email sent to each parent with child's status
- **History View**: Browse past attendance grouped by date
- **Edit/Delete**: Modify individual records or clear entire day
- **Unique Constraint**: One attendance record per student per day (upsert logic)

### 5. Complaint System
- **Two complaint types**:
  - `ABOUT_STUDENT`: Filed by teachers/admin, targets a specific student
  - `ABOUT_TEACHER`: Filed by parents only, targets a specific teacher
- **Visibility levels**:
  - `PUBLIC`: Visible to all teachers + admin + student's parent
  - `PRIVATE`: Visible only to admin + student's parent
- **Reply system**: Any authorized user can reply to complaints
- **Notifications**: Complaints trigger notifications to relevant parties
- **CRUD**: Edit/delete own complaints, admin can delete any

### 6. Notification Center
- In-app notification list (last 50)
- Unread count badge in sidebar
- Mark single or all notifications as read
- Delete single or all notifications
- Notification types: COMPLAINT, GENERAL
- Auto-generated on: attendance marking, complaint filing

### 7. Settings
- **Profile**: Update name and email
- **Password**: Change password (requires current password verification)
- **School Settings** (Admin only):
  - Update school name
  - View parent invite code
  - Copy invite code to clipboard
  - Regenerate invite code

### 8. Parent Portal
- View all linked children on dashboard
- Click child to see detailed view:
  - Student info (name, roll number, father name, class)
  - Teachers and their subjects
  - Attendance summary (total, present, absent, late counts)
  - Full attendance history (last 60 records)

---

## API Layer (tRPC Routers)

### Router Structure

```
appRouter
├── org          (organization.ts)    # 4 procedures
├── teacher      (teacher.ts)         # 4 procedures
├── class        (class.ts)           # 5 procedures
├── student      (student.ts)         # 5 procedures
├── attendance   (attendance.ts)      # 7 procedures
├── complaint    (complaint.ts)       # 7 procedures
├── notification (notification.ts)    # 6 procedures
└── settings     (settings.ts)        # 3 procedures
                                      # Total: 41 procedures
```

### Procedure Types

| Procedure | Auth Required | Role Restriction |
|-----------|--------------|-----------------|
| `publicProcedure` | No | None |
| `protectedProcedure` | Yes | Must have organizationId |
| `adminProcedure` | Yes | ADMIN role only |
| `teacherProcedure` | Yes | TEACHER or ADMIN role |

### Key API Endpoints

| Router | Procedure | Access | Description |
|--------|-----------|--------|-------------|
| `org.stats` | Protected | All | Get teacher/parent/class/student counts |
| `org.regenerateInviteCode` | Admin | Admin | Generate new parent invite code |
| `teacher.create` | Admin | Admin | Create teacher + send email with login code |
| `teacher.remove` | Admin | Admin | Delete teacher + cascade cleanup |
| `class.list` | Protected | Role-filtered | Teachers see assigned, parents see children's |
| `class.create` | Admin | Admin | Create class with teacher-subject assignments |
| `student.create` | Teacher | Teacher/Admin | Add student to class |
| `attendance.markBulk` | Teacher | Teacher | Mark entire class + notify parents |
| `complaint.createAboutStudent` | Teacher | Teacher/Admin | File student complaint |
| `complaint.createAboutTeacher` | Protected | Parent | File teacher complaint |
| `complaint.reply` | Protected | All | Reply to any accessible complaint |
| `notification.unreadCount` | Protected | All | Get badge count for sidebar |
| `settings.changePassword` | Protected | All | Verify current + set new password |

---

## UI Components

Built with **shadcn/ui** (Base-UI primitives + Tailwind CSS):

| Component | Usage |
|-----------|-------|
| `Button` | Actions (variants: default, outline, secondary, ghost, destructive) |
| `Input` | Form text inputs |
| `Label` | Form field labels |
| `Card` | Content containers (dashboard stats, settings sections) |
| `Badge` | Status indicators (roles, subjects, counts) |
| `Dialog` | Modal forms (add/edit teacher, student, class, complaint) |
| `DropdownMenu` | Action menus |
| `Table` | Data display (teachers, students, attendance) |
| `Tabs` | Tabbed navigation (login types, class details) |
| `Select` | Dropdown selectors (class, subject, parent, status) |
| `Textarea` | Multi-line text (complaints, replies) |
| `Separator` | Visual dividers |
| `Sonner/Toast` | Success/error feedback messages |

---

## Email System

Uses **Nodemailer** with SMTP configuration for two types of emails:

### 1. Teacher Welcome Email
- **Triggered**: When admin creates a new teacher
- **Contains**: Teacher name, school name, login code, app URL
- **Template**: HTML formatted with styling

### 2. Attendance Notification Email
- **Triggered**: When teacher marks attendance (for absent/late students)
- **Sent to**: Parent's email address
- **Contains**: Student name, class, date, status (PRESENT/ABSENT/LATE)
- **Template**: HTML formatted with color-coded status

---

## How It Works (User Flows)

### Flow 1: School Setup
```
1. Admin account is seeded (prisma/seed.ts)
2. Admin logs in with email + password
3. Admin goes to Settings -> updates school name
4. Admin copies Parent Invite Code
5. Admin goes to Teachers -> adds teachers
   -> Each teacher gets an email with their login code
6. Admin goes to Classes -> creates classes with teacher assignments
```

### Flow 2: Teacher Daily Workflow
```
1. Teacher logs in with email + code
2. Teacher goes to Classes -> selects assigned class
3. Teacher goes to Students tab -> adds students
4. Teacher goes to Attendance -> selects class + date
5. Teacher marks each student (Present/Absent/Late)
6. Teacher saves -> parents are notified via email + in-app
7. Teacher can file complaints about students if needed
```

### Flow 3: Parent Onboarding & Usage
```
1. Parent receives invite code from school admin
2. Parent goes to /register -> enters details + invite code
3. Parent logs in -> sees Dashboard with linked children
4. Admin/Teacher links students to parent account
5. Parent clicks child -> sees attendance summary + history
6. Parent receives notifications when:
   - Attendance is marked (email + in-app)
   - Complaint is filed about their child
7. Parent can file complaints about teachers
8. Parent can reply to complaints about their children
```

### Flow 4: Complaint Resolution
```
1. Teacher files complaint about student (PUBLIC or PRIVATE)
2. Notifications sent to:
   - PUBLIC: All teachers + admin + parent
   - PRIVATE: Admin + parent only
3. Parent views complaint in Complaints page
4. Parent/Admin/Teacher can reply
5. Conversation continues via replies
6. Creator or admin can delete when resolved
```

---

## Benefits

### For School Administration
- **Centralized Management**: One platform for all school operations
- **Data Insights**: Dashboard with real-time counts and statistics
- **Secure Onboarding**: Invite code system for controlled parent registration
- **Audit Trail**: All complaints, replies, and attendance are timestamped

### For Teachers
- **Quick Attendance**: Bulk mark entire class in seconds
- **Structured Complaints**: Formal system with visibility controls
- **Easy Access**: Code-based login (no password to remember)
- **Class-Scoped View**: Only see assigned classes and students

### For Parents
- **Real-Time Updates**: Instant email and in-app notifications
- **Attendance Tracking**: Full history with present/absent/late breakdown
- **Voice**: Ability to file complaints about teachers
- **Transparency**: Access to child's class, teachers, and performance data

### Technical Benefits
- **Type Safety**: End-to-end types with tRPC + TypeScript + Prisma
- **Multi-Tenant**: Complete data isolation between schools
- **Serverless Ready**: Neon PostgreSQL adapter for serverless deployment
- **Modern Stack**: Next.js 16, React 19, Tailwind CSS 4 (latest versions)
- **Scalable**: Role-based middleware prevents unauthorized access at API layer
- **Maintainable**: Modular router structure with clear separation of concerns

---

## Environment Variables

```env
# Database
DATABASE_URL=postgresql://...          # Neon PostgreSQL connection string

# SMTP Email
SMTP_HOST=smtp.gmail.com               # SMTP server host
SMTP_PORT=587                          # SMTP server port
SMTP_USER=your-email@gmail.com         # SMTP username
SMTP_PASS=your-app-password            # SMTP password/app password
SMTP_FROM=your-email@gmail.com         # "From" address in emails

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000  # App URL (used in emails)
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

# 3. Push schema to database
npx prisma db push

# 4. Seed the database (creates admin account)
npx tsx prisma/seed.ts

# 5. Start development server
pnpm dev
```

### Default Admin Credentials
- **Email**: `junaid@admin.com`
- **Password**: `khan12!@`

### First Steps After Setup
1. Log in as admin
2. Update school name in Settings
3. Add teachers (they'll receive login codes via email)
4. Create classes and assign teachers
5. Share the parent invite code with parents
6. Parents register and admin/teachers link students to parents

---

## Subject List

The system supports 18 subjects for teacher-class assignments:

Mathematics, English, Urdu, Science, Physics, Chemistry, Biology, Computer Science, Social Studies, Islamiat, Pakistan Studies, History, Geography, Art, Physical Education, Economics, Accounting, General Knowledge

---

*This documentation covers the complete School Management System as of its current state. The system provides a comprehensive solution for school administration with role-based access, real-time notifications, and multi-tenant data isolation.*
