import { router } from "../trpc";
import { organizationRouter } from "./organization";
import { teacherRouter } from "./teacher";
import { classRouter } from "./class";
import { studentRouter } from "./student";
import { attendanceRouter } from "./attendance";
import { complaintRouter } from "./complaint";
import { notificationRouter } from "./notification";
import { settingsRouter } from "./settings";
import { examRouter } from "./exam";

export const appRouter = router({
  org: organizationRouter,
  teacher: teacherRouter,
  class: classRouter,
  student: studentRouter,
  attendance: attendanceRouter,
  complaint: complaintRouter,
  notification: notificationRouter,
  settings: settingsRouter,
  exam: examRouter,
});

export type AppRouter = typeof appRouter;
