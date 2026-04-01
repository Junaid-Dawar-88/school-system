"use client";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { LabeledSelect } from "@/compnent/select-display";

const SUBJECTS = ["Math","English","Urdu","Science","Physics","Chemistry","Biology","Computer Science","Social Studies","Islamiat","Pakistan Studies","History","Geography","Art","PE","Economics","Accounting","General Knowledge"];

export default function GradesPage() {
  const [open, setOpen] = useState(false);
  const [classId, setClassId] = useState("");
  const [examId, setExamId] = useState("");
  const [subject, setSubject] = useState("");

  const utils = trpc.useUtils();
  const { data: profile } = trpc.settings.getProfile.useQuery();
  const { data: classes } = trpc.class.list.useQuery();
  const { data: exams } = trpc.exam.list.useQuery();
  const { data: grades, isLoading } = trpc.grade.list.useQuery({ classId: classId || undefined, examId: examId || undefined });
  const { data: students } = trpc.student.list.useQuery();

  const canManage = profile?.role === "TEACHER" || profile?.role === "ADMIN";

  const bulkCreateMut = trpc.grade.bulkCreate.useMutation({
    onSuccess: () => { utils.grade.list.invalidate(); setOpen(false); toast.success("Grades saved"); },
    onError: (e) => toast.error(e.message),
  });

  const deleteMut = trpc.grade.delete.useMutation({
    onSuccess: () => { utils.grade.list.invalidate(); toast.success("Deleted"); },
    onError: (e) => toast.error(e.message),
  });

  const [gradeEntries, setGradeEntries] = useState<Record<string, { score: string; grade: string; remarks: string }>>({});

  const classStudents = students?.filter((s) => s.classId === classId) || [];
  const filteredExams = exams?.filter((e) => !classId || e.classId === classId) || [];

  function openBulkEntry() {
    if (!classId || !examId || !subject) { toast.error("Select class, exam and subject"); return; }
    const entries: Record<string, { score: string; grade: string; remarks: string }> = {};
    for (const s of classStudents) {
      const existing = grades?.find((g) => g.studentId === s.id && g.examId === examId && g.subject === subject);
      entries[s.id] = { score: existing?.score?.toString() || "", grade: existing?.grade || "", remarks: existing?.remarks || "" };
    }
    setGradeEntries(entries);
    setOpen(true);
  }

  function handleBulkSubmit(e: React.FormEvent) {
    e.preventDefault();
    const gradesList = Object.entries(gradeEntries)
      .filter(([, v]) => v.score !== "")
      .map(([studentId, v]) => ({
        studentId,
        score: parseFloat(v.score),
        maxScore: 100,
        grade: v.grade || undefined,
        remarks: v.remarks || undefined,
      }));
    if (!gradesList.length) { toast.error("Enter at least one score"); return; }
    bulkCreateMut.mutate({ examId, classId, subject, grades: gradesList });
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Grades</h1>
          <p className="text-gray-500 dark:text-gray-400">Manage student grades per exam</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        <LabeledSelect value={classId} onValueChange={setClassId} placeholder="Filter by class" items={classes?.map((c) => ({ value: c.id, label: c.name })) || []} />
        <LabeledSelect value={examId} onValueChange={setExamId} placeholder="Filter by exam" items={filteredExams?.map((e) => ({ value: e.id, label: e.title })) || []} />
        {canManage && (
          <>
            <LabeledSelect value={subject} onValueChange={setSubject} placeholder="Subject" items={SUBJECTS.map((s) => ({ value: s, label: s }))} />
            <Button onClick={openBulkEntry}>+ Enter Grades</Button>
          </>
        )}
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl border dark:border-gray-800">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student</TableHead>
              <TableHead>Exam</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Score</TableHead>
              <TableHead>Grade</TableHead>
              <TableHead>Remarks</TableHead>
              {canManage && <TableHead className="text-right">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={7} className="text-center py-8 text-gray-400">Loading...</TableCell></TableRow>
            ) : !grades?.length ? (
              <TableRow><TableCell colSpan={7} className="text-center py-8 text-gray-400">No grades yet</TableCell></TableRow>
            ) : (
              grades.map((g) => (
                <TableRow key={g.id}>
                  <TableCell className="font-medium">{g.student.name} <Badge variant="outline" className="font-mono ml-1">{g.student.rollNumber}</Badge></TableCell>
                  <TableCell>{g.exam.title}</TableCell>
                  <TableCell><Badge variant="secondary">{g.subject}</Badge></TableCell>
                  <TableCell className="font-semibold">{g.score}/{g.maxScore}</TableCell>
                  <TableCell>{g.grade || "—"}</TableCell>
                  <TableCell className="max-w-[200px] truncate">{g.remarks || "—"}</TableCell>
                  {canManage && (
                    <TableCell className="text-right">
                      <Button size="sm" variant="destructive" onClick={() => { if (confirm("Delete?")) deleteMut.mutate({ id: g.id }); }}>Delete</Button>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Enter Grades — {subject}</DialogTitle></DialogHeader>
          <form onSubmit={handleBulkSubmit} className="space-y-3">
            {classStudents.map((s) => (
              <div key={s.id} className="flex items-center gap-3 p-2 rounded-lg bg-gray-50 dark:bg-gray-800">
                <span className="font-medium min-w-[120px]">{s.name}</span>
                <Input type="number" placeholder="Score" className="w-20" value={gradeEntries[s.id]?.score || ""} onChange={(e) => setGradeEntries((prev) => ({ ...prev, [s.id]: { ...prev[s.id], score: e.target.value } }))} />
                <Input placeholder="Grade" className="w-16" value={gradeEntries[s.id]?.grade || ""} onChange={(e) => setGradeEntries((prev) => ({ ...prev, [s.id]: { ...prev[s.id], grade: e.target.value } }))} />
                <Input placeholder="Remarks" className="flex-1" value={gradeEntries[s.id]?.remarks || ""} onChange={(e) => setGradeEntries((prev) => ({ ...prev, [s.id]: { ...prev[s.id], remarks: e.target.value } }))} />
              </div>
            ))}
            <Button type="submit" className="w-full" disabled={bulkCreateMut.isPending}>
              {bulkCreateMut.isPending ? "Saving..." : "Save Grades"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
