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
import { gradeRouter } from "./grade";
import { reportCardRouter } from "./reportCard";
import { feeRouter } from "./fee";
import { timetableRouter } from "./timetable";
import { assignmentRouter } from "./assignment";
import { libraryRouter } from "./library";
import { transportRouter } from "./transport";
import { eventRouter } from "./event";
import { leaveRouter } from "./leave";
import { salaryRouter } from "./salary";
import { analyticsRouter } from "./analytics";

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
  grade: gradeRouter,
  reportCard: reportCardRouter,
  fee: feeRouter,
  timetable: timetableRouter,
  assignment: assignmentRouter,
  library: libraryRouter,
  transport: transportRouter,
  event: eventRouter,
  leave: leaveRouter,
  salary: salaryRouter,
  analytics: analyticsRouter,
});

export type AppRouter = typeof appRouter;
