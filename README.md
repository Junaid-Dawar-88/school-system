# SchoolSystem — Multi-Tenant School Management SaaS

A production-level multi-tenant school management platform. Each school is an isolated organization. One admin per org. Teachers manage classes and students. Parents track their children.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| API | tRPC v11 + React Query |
| Database | PostgreSQL (Neon) + Prisma 7 |
| Auth | Cookie-based sessions + bcrypt |
| UI | Tailwind CSS 4 + shadcn/ui |
| Validation | Zod v4 |
| Email | Nodemailer (SMTP) |

## Multi-Tenant Architecture

Every table includes `organizationId`. All queries filter by it. No cross-organization data access is possible.

```
Organization A (Springfield High)     Organization B (Shelbyville School)
├── Admin (1 only)                    ├── Admin (1 only)
├── Teachers                          ├── Teachers
├── Parents                           ├── Parents
├── Classes                           ├── Classes
├── Students                          ├── Students
├── Attendance                        ├── Attendance
├── Complaints                        ├── Complaints
└── Notifications                     └── Notifications
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

# Optional: email notifications
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=you@gmail.com
SMTP_PASS=app-password
```

### 3. Database

```bash
npx prisma db push
npx prisma generate
```

### 4. Run

```bash
pnpm dev
```

## Auth Flows

| Action | URL | Who |
|--------|-----|-----|
| Create organization | `/create-org` | Becomes the ADMIN (one per org) |
| Login | `/login` | All roles |
| Register as parent | `/register` | Requires school invite code |

### How it works

1. **Admin** visits `/create-org`, enters school name + their details → creates Organization + Admin account
2. Admin logs in, goes to dashboard, sees the **invite code**
3. Admin adds **teachers** from the Teachers page (creates their accounts)
4. **Parents** visit `/register`, enter the invite code → join the organization
5. Teachers create **classes**, add **students** (linking each to a parent)
6. Teachers mark **attendance**, file **complaints**
7. Parents view their children's data and respond to complaints

## Roles & Permissions

### ADMIN (one per organization)

- View organization stats and invite code
- Add/remove teachers
- View all classes, students, attendance, complaints
- Respond to complaints
- Manage settings

### TEACHER

- Create classes (owned by them)
- Add/update/delete students in their classes
- Mark attendance per class per date
- Create complaints about students
- View all complaints in the organization
- Respond to complaints

### PARENT

- Register with invite code
- View their children's data
- View attendance for their children
- View complaints about their children
- Create complaints about teachers
- Respond to complaints

## Features

### Organization System

- Create organization (one-time, becomes admin)
- Auto-generated invite code for parents
- Regenerate invite code from settings

### Class System

- Teachers create classes (`classId + teacherId + organizationId`)
- Teachers only see their own classes
- Admin sees all classes

### Student System

- Each student belongs to ONE class and ONE parent
- Students are org-scoped — cannot be shared across orgs
- Teachers add students to their own classes, selecting a parent from the org

### Attendance System

- Select class + date → mark each student Present/Absent/Late
- Saves in bulk
- Parents can view their child's attendance history

### Complaint System

| Complaint Type | Created By | About | Visible To |
|---------------|-----------|-------|-----------|
| About Student | Teacher | A student | Admin + all teachers + the parent |
| About Teacher | Parent | A teacher | Admin + all teachers + the parent |

All complaints have a **threaded reply system** where any participant can respond.

### Notification System

- Complaints trigger notifications to all relevant users
- Unread count badge in sidebar
- Mark individual or all as read

### Settings

- Update name and email
- Change password
- Admin: view/regenerate invite code

## Project Structure

```
app/
├── page.tsx                     # Landing page
├── login/page.tsx               # Login
├── register/page.tsx            # Parent registration (invite code)
├── create-org/page.tsx          # Create organization (become admin)
├── actions/auth.ts              # Server actions (login, register, create-org)
├── api/trpc/[trpc]/route.ts     # tRPC API handler
└── dashboard/
    ├── layout.tsx               # Protected layout + sidebar
    ├── page.tsx                 # Dashboard home (stats, invite code)
    ├── teachers/page.tsx        # Teacher management (admin)
    ├── classes/page.tsx         # Class management (teacher)
    ├── students/page.tsx        # Student management (teacher)
    ├── attendance/page.tsx      # Mark attendance (teacher)
    ├── complaints/page.tsx      # Complaints + replies (all)
    ├── notifications/page.tsx   # Notification center
    └── settings/page.tsx        # Profile + org settings

server/
├── trpc.ts                      # tRPC init + role middleware
└── routers/
    ├── index.ts                 # Root router
    ├── organization.ts          # Org stats, invite code
    ├── teacher.ts               # CRUD teachers (admin)
    ├── class.ts                 # CRUD classes (teacher)
    ├── student.ts               # CRUD students (teacher)
    ├── attendance.ts            # Mark/view attendance
    ├── complaint.ts             # Create/reply complaints
    ├── notification.ts          # List/mark notifications
    └── settings.ts              # Profile/password

lib/
├── prisma.ts                    # Prisma client (Neon adapter)
├── auth.ts                      # Session management
├── trpc.ts                      # tRPC React client
├── email.ts                     # Nodemailer utility
└── utils.ts                     # shadcn cn() helper
```

## Database Models

| Model | Key Fields | Tenant-Scoped |
|-------|-----------|:---:|
| Organization | name, inviteCode, ownerId | — |
| User | name, email, password, role, organizationId | Yes |
| Class | name, teacherId, organizationId | Yes |
| Student | name, classId, parentId, organizationId | Yes |
| Attendance | studentId, classId, date, status, organizationId | Yes |
| Complaint | message, type, createdById, studentId?, teacherId?, organizationId | Yes |
| ComplaintReply | complaintId, userId, message | Via complaint |
| Notification | title, message, userId, type, organizationId | Yes |

## tRPC Middleware

```
publicProcedure     → No auth
protectedProcedure  → Logged in + has organizationId
teacherProcedure    → TEACHER or ADMIN
adminProcedure      → ADMIN only
```

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Development server |
| `pnpm build` | Production build |
| `pnpm start` | Production server |
| `npx prisma studio` | Database browser |
| `npx prisma db push` | Push schema to DB |
| `npx prisma generate` | Regenerate client |

## License

MIT
