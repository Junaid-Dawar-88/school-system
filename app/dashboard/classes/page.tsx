"use client";
import { useState } from "react";
import { useQueryState } from "nuqs";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LabeledSelect } from "@/compnent/select-display";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

type TeacherAssignment = { teacherId: string; subject: string };

const SUBJECTS = [
  "Mathematics", "English", "Urdu", "Science", "Physics", "Chemistry",
  "Biology", "Computer Science", "Social Studies", "Islamiat",
  "Pakistan Studies", "History", "Geography", "Art",
  "Physical Education", "Economics", "Accounting", "General Knowledge",
];

export default function ClassesPage() {
  const [openCreate, setOpenCreate] = useState(false);
  const [editing, setEditing] = useState<{ id: string; name: string; teachers: TeacherAssignment[] } | null>(null);
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [searchClass, setSearchClass] = useQueryState("q", { defaultValue: "" });
  const [searchStudent, setSearchStudent] = useQueryState("student", { defaultValue: "" });

  // Teacher assignments for create/edit
  const [assignments, setAssignments] = useState<TeacherAssignment[]>([]);
  const [pickTeacher, setPickTeacher] = useState("");
  const [pickSubject, setPickSubject] = useState("");

  // Student modals
  const [openAddStudent, setOpenAddStudent] = useState(false);
  const [editingStudent, setEditingStudent] = useState<{ id: string; name: string; rollNumber: string; fatherName: string } | null>(null);
  const [studentParentId, setStudentParentId] = useState("");

  const utils = trpc.useUtils();
  const { data: classes, isLoading } = trpc.class.list.useQuery();
  const { data: classDetail } = trpc.class.getById.useQuery({ id: selectedClassId! }, { enabled: !!selectedClassId });
  const { data: teachers } = trpc.complaint.teachers.useQuery();
  const { data: parents } = trpc.student.parents.useQuery(undefined, {});
  const { data: profile } = trpc.settings.getProfile.useQuery();
  const { data: attendanceHistory } = trpc.attendance.historyByClass.useQuery({ classId: selectedClassId! }, { enabled: !!selectedClassId });

  const isAdmin = profile?.role === "ADMIN";

  const createClassMut = trpc.class.create.useMutation({
    onSuccess: () => { utils.class.list.invalidate(); setOpenCreate(false); setAssignments([]); toast.success("Class created"); },
    onError: (e) => toast.error(e.message),
  });
  const updateClassMut = trpc.class.update.useMutation({
    onSuccess: () => { utils.class.list.invalidate(); utils.class.getById.invalidate(); setEditing(null); setAssignments([]); toast.success("Class updated"); },
    onError: (e) => toast.error(e.message),
  });
  const deleteClassMut = trpc.class.delete.useMutation({
    onSuccess: () => { utils.class.list.invalidate(); setSelectedClassId(null); toast.success("Class deleted"); },
    onError: (e) => toast.error(e.message),
  });
  const createStudentMut = trpc.student.create.useMutation({
    onSuccess: () => { utils.class.getById.invalidate(); utils.student.list.invalidate(); setOpenAddStudent(false); setStudentParentId(""); toast.success("Student added"); },
    onError: (e) => toast.error(e.message),
  });
  const updateStudentMut = trpc.student.update.useMutation({
    onSuccess: () => { utils.class.getById.invalidate(); utils.student.list.invalidate(); setEditingStudent(null); toast.success("Student updated"); },
    onError: (e) => toast.error(e.message),
  });
  const deleteStudentMut = trpc.student.delete.useMutation({
    onSuccess: () => { utils.class.getById.invalidate(); utils.student.list.invalidate(); toast.success("Student removed"); },
    onError: (e) => toast.error(e.message),
  });

  function addAssignment() {
    if (!pickTeacher || !pickSubject) { toast.error("Select both teacher and subject"); return; }
    if (assignments.some((a) => a.teacherId === pickTeacher && a.subject === pickSubject)) { toast.error("Already assigned"); return; }
    setAssignments([...assignments, { teacherId: pickTeacher, subject: pickSubject }]);
    setPickTeacher("");
    setPickSubject("");
  }

  function removeAssignment(idx: number) {
    setAssignments(assignments.filter((_, i) => i !== idx));
  }

  function getTeacherName(id: string) {
    return teachers?.find((t) => t.id === id)?.name || "Unknown";
  }

  // Attendance history grouped by date
  const historyByDate = new Map<string, { records: { studentName: string; rollNumber: string; status: string }[] }>();
  attendanceHistory?.forEach((a) => {
    const dk = new Date(a.date).toLocaleDateString();
    if (!historyByDate.has(dk)) historyByDate.set(dk, { records: [] });
    historyByDate.get(dk)!.records.push({ studentName: a.student.name, rollNumber: a.student.rollNumber, status: a.status });
  });
  const statusColor: Record<string, string> = { PRESENT: "text-green-600", ABSENT: "text-red-600", LATE: "text-yellow-600" };

  // Group assignments by teacher for display
  function groupedAssignments() {
    const map = new Map<string, { teacherId: string; name: string; subjects: { subject: string; idx: number }[] }>();
    assignments.forEach((a, i) => {
      const name = getTeacherName(a.teacherId);
      if (!map.has(a.teacherId)) map.set(a.teacherId, { teacherId: a.teacherId, name, subjects: [] });
      map.get(a.teacherId)!.subjects.push({ subject: a.subject, idx: i });
    });
    return Array.from(map.values());
  }

  // Teacher assignment picker component
  function AssignmentPicker() {
    const grouped = groupedAssignments();
    return (
      <div className="space-y-3">
        <Label>Assign Teachers & Subjects</Label>
        <p className="text-xs text-gray-400">One teacher can teach multiple subjects in this class</p>
        <div className="flex gap-2">
          <LabeledSelect value={pickTeacher} onValueChange={setPickTeacher} placeholder="Select teacher" className="flex-1" items={teachers?.map((t) => ({ value: t.id, label: t.name })) || []} />
          <LabeledSelect value={pickSubject} onValueChange={setPickSubject} placeholder="Select subject" className="flex-1" items={SUBJECTS.map((s) => ({ value: s, label: s }))} />
          <Button type="button" variant="outline" onClick={addAssignment}>Add</Button>
        </div>
        {grouped.length > 0 && (
          <div className="space-y-3 border rounded-xl p-3">
            {grouped.map((g) => (
              <div key={g.teacherId} className="space-y-1">
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">{g.name}</p>
                <div className="flex flex-wrap gap-2">
                  {g.subjects.map((s) => (
                    <span key={s.idx} className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 text-xs font-medium px-2.5 py-1 rounded-lg">
                      {s.subject}
                      <button type="button" onClick={() => removeAssignment(s.idx)} className="text-blue-400 hover:text-red-500 transition-colors">&times;</button>
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
        {assignments.length === 0 && <p className="text-xs text-gray-400">Add at least one teacher with a subject</p>}
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Classes</h1>
          <p className="text-gray-500 dark:text-gray-400">{selectedClassId ? "Managing class" : "Click a class to manage"}</p>
        </div>
        {isAdmin && !selectedClassId && <Button onClick={() => { setAssignments([]); setPickTeacher(""); setPickSubject(""); setOpenCreate(true); }}>+ Create Class</Button>}
        {selectedClassId && <Button variant="outline" onClick={() => setSelectedClassId(null)}>&larr; Back to Classes</Button>}
      </div>

      {/* ─── Class Cards ─── */}
      {!selectedClassId && (
        <>
          <Input placeholder="Search classes or teacher..." value={searchClass} onChange={(e) => setSearchClass(e.target.value)} className="max-w-sm mb-4" />
          {isLoading ? <p className="text-gray-400">Loading...</p>
          : (() => {
            const q = searchClass.toLowerCase();
            const filtered = classes?.filter((c) => {
              const teacherNames = c.teachers.map((t) => t.teacher.name.toLowerCase()).join(" ");
              return !q || c.name.toLowerCase().includes(q) || teacherNames.includes(q);
            });
            return !filtered?.length ? <div className="bg-white dark:bg-gray-900 rounded-xl border dark:border-gray-800 p-12 text-center text-gray-400">{classes?.length ? "No matching classes" : "No classes yet."}</div>
            : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((c) => (
                <Card key={c.id} className="cursor-pointer transition-all hover:shadow-md hover:border-blue-300" onClick={() => setSelectedClassId(c.id)}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{c.name}</CardTitle>
                      <Badge variant="secondary">{c._count.students} students</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-1.5 mb-2">
                      {(() => {
                        // Group by teacher
                        const tMap = new Map<string, { name: string; subjects: string[] }>();
                        c.teachers.forEach((t) => {
                          if (!tMap.has(t.teacher.id)) tMap.set(t.teacher.id, { name: t.teacher.name, subjects: [] });
                          tMap.get(t.teacher.id)!.subjects.push(t.subject);
                        });
                        return tMap.size === 0 ? <span className="text-xs text-gray-400">No teachers assigned</span>
                        : Array.from(tMap.entries()).map(([id, { name, subjects }]) => (
                          <div key={id} className="text-xs">
                            <span className="font-medium text-gray-700 dark:text-gray-300">{name}</span>
                            <span className="text-gray-400 mx-1">—</span>
                            <span className="text-gray-500 dark:text-gray-400">{subjects.join(", ")}</span>
                          </div>
                        ));
                      })()}
                    </div>
                    {isAdmin && (
                      <div className="flex gap-2 mt-2" onClick={(e) => e.stopPropagation()}>
                        <Button size="sm" variant="outline" onClick={() => {
                          const existing = c.teachers.map((t) => ({ teacherId: t.teacher.id, subject: t.subject }));
                          setAssignments(existing);
                          setPickTeacher(""); setPickSubject("");
                          setEditing({ id: c.id, name: c.name, teachers: existing });
                        }}>Edit</Button>
                        <Button size="sm" variant="destructive" onClick={() => { if (confirm("Delete this class?")) deleteClassMut.mutate({ id: c.id }); }}>Delete</Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
            );
          })()}
        </>
      )}

      {/* ─── Selected Class View ─── */}
      {selectedClassId && (
        <Tabs defaultValue="students">
          <TabsList className="mb-4">
            <TabsTrigger value="students">Students</TabsTrigger>
            <TabsTrigger value="teachers">Teachers & Subjects</TabsTrigger>
            <TabsTrigger value="attendance">Attendance History</TabsTrigger>
          </TabsList>

          {/* Students Tab */}
          <TabsContent value="students">
            <div className="bg-white dark:bg-gray-900 rounded-xl border dark:border-gray-800">
              <div className="p-4 border-b flex items-center justify-between">
                <h2 className="text-lg font-bold">{classes?.find((c) => c.id === selectedClassId)?.name} — Students</h2>
                <Button size="sm" onClick={() => { setStudentParentId(""); setEditingStudent(null); setOpenAddStudent(true); }}>+ Add Student</Button>
              </div>
              <div className="p-4 border-b dark:border-gray-800">
                <Input placeholder="Search by name, roll number, or father name..." value={searchStudent} onChange={(e) => setSearchStudent(e.target.value)} className="max-w-sm" />
              </div>
              <Table>
                <TableHeader><TableRow><TableHead>Roll No.</TableHead><TableHead>Student Name</TableHead><TableHead>Father Name</TableHead><TableHead>Parent Account</TableHead>{isAdmin && <TableHead className="text-right">Actions</TableHead>}</TableRow></TableHeader>
                <TableBody>
                  {(() => {
                    const q = searchStudent.toLowerCase();
                    const filtered = classDetail?.students?.filter((s) => !q || s.name.toLowerCase().includes(q) || s.rollNumber.toLowerCase().includes(q) || s.fatherName.toLowerCase().includes(q));
                    return !filtered?.length ? (
                      <TableRow><TableCell colSpan={5} className="text-center py-8 text-gray-400">{classDetail?.students?.length ? "No matching students" : "No students yet."}</TableCell></TableRow>
                    ) : filtered.map((s) => (
                      <TableRow key={s.id}>
                        <TableCell><Badge variant="outline" className="font-mono">{s.rollNumber}</Badge></TableCell>
                        <TableCell className="font-medium">{s.name}</TableCell>
                        <TableCell>{s.fatherName}</TableCell>
                        <TableCell>{s.parent?.name || "—"}</TableCell>
                        {isAdmin && (
                          <TableCell className="text-right space-x-2">
                            <Button size="sm" variant="outline" onClick={() => { setStudentParentId(""); setEditingStudent({ id: s.id, name: s.name, rollNumber: s.rollNumber, fatherName: s.fatherName }); }}>Edit</Button>
                            <Button size="sm" variant="destructive" onClick={() => { if (confirm("Remove?")) deleteStudentMut.mutate({ id: s.id }); }}>Remove</Button>
                          </TableCell>
                        )}
                        {!isAdmin && <TableCell />}
                      </TableRow>
                    ));
                  })()}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          {/* Teachers & Subjects Tab */}
          <TabsContent value="teachers">
            <div className="bg-white dark:bg-gray-900 rounded-xl border dark:border-gray-800 p-6">
              <h2 className="text-lg font-bold mb-4">{classes?.find((c) => c.id === selectedClassId)?.name} — Teachers & Subjects</h2>
              {classDetail?.teachers?.length === 0 ? (
                <p className="text-gray-400">No teachers assigned to this class.</p>
              ) : (
                <div className="space-y-4">
                  {(() => {
                    const tMap = new Map<string, { name: string; subjects: string[] }>();
                    classDetail?.teachers?.forEach((t) => {
                      if (!tMap.has(t.teacher.id)) tMap.set(t.teacher.id, { name: t.teacher.name, subjects: [] });
                      tMap.get(t.teacher.id)!.subjects.push(t.subject);
                    });
                    return Array.from(tMap.entries()).map(([id, { name, subjects }]) => (
                      <div key={id} className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-sm shrink-0">
                          {name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-gray-100">{name}</p>
                          <div className="flex flex-wrap gap-1.5 mt-1">
                            {subjects.map((s) => (
                              <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Attendance History Tab */}
          <TabsContent value="attendance">
            <div className="bg-white dark:bg-gray-900 rounded-xl border dark:border-gray-800">
              <div className="p-4 border-b dark:border-gray-800"><h2 className="text-lg font-bold">Attendance History</h2></div>
              {historyByDate.size === 0 ? (
                <div className="p-8 text-center text-gray-400">No attendance records yet.</div>
              ) : (
                <div className="divide-y">
                  {Array.from(historyByDate.entries()).map(([dateKey, { records }]) => (
                    <div key={dateKey} className="p-4">
                      <p className="text-sm font-semibold text-gray-700 mb-2">{dateKey}</p>
                      <div className="font-mono text-sm space-y-1">
                        {records.map((r, i) => (
                          <p key={i} className="flex gap-4">
                            <span className="text-gray-400 w-12">{r.rollNumber}</span>
                            <span className="text-gray-700 flex-1">{r.studentName}</span>
                            <span className={`font-semibold ${statusColor[r.status]}`}>{r.status}</span>
                          </p>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      )}

      {/* ─── Create Class Dialog ─── */}
      <Dialog open={openCreate} onOpenChange={setOpenCreate}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Create Class</DialogTitle></DialogHeader>
          <form onSubmit={(e) => {
            e.preventDefault();
            if (assignments.length === 0) { toast.error("Add at least one teacher"); return; }
            const fd = new FormData(e.currentTarget);
            createClassMut.mutate({ name: fd.get("name") as string, teachers: assignments });
          }} className="space-y-4">
            <div><Label>Class Name</Label><Input name="name" placeholder="e.g. Grade 5-A" required /></div>
            <Separator />
            <AssignmentPicker />
            <Button type="submit" className="w-full" disabled={createClassMut.isPending}>{createClassMut.isPending ? "Creating..." : "Create Class"}</Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* ─── Edit Class Dialog ─── */}
      <Dialog open={!!editing} onOpenChange={(v) => { if (!v) setEditing(null); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Edit Class</DialogTitle></DialogHeader>
          <form onSubmit={(e) => {
            e.preventDefault();
            if (!editing) return;
            const fd = new FormData(e.currentTarget);
            updateClassMut.mutate({ id: editing.id, name: fd.get("name") as string, teachers: assignments });
          }} className="space-y-4">
            <div><Label>Class Name</Label><Input name="name" defaultValue={editing?.name || ""} required /></div>
            <Separator />
            <AssignmentPicker />
            <Button type="submit" className="w-full" disabled={updateClassMut.isPending}>{updateClassMut.isPending ? "Saving..." : "Update Class"}</Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* ─── Add Student Dialog ─── */}
      <Dialog open={openAddStudent} onOpenChange={setOpenAddStudent}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Student</DialogTitle></DialogHeader>
          <form onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            createStudentMut.mutate({ name: fd.get("name") as string, rollNumber: fd.get("rollNumber") as string, fatherName: fd.get("fatherName") as string, classId: selectedClassId!, parentId: studentParentId || undefined });
          }} className="space-y-4">
            <div><Label>Student Name</Label><Input name="name" required /></div>
            <div><Label>Roll Number</Label><Input name="rollNumber" required /></div>
            <div><Label>Father Name</Label><Input name="fatherName" required /></div>
            <div><Label>Parent Account <span className="text-gray-400 font-normal">(optional)</span></Label>
              <LabeledSelect value={studentParentId} onValueChange={setStudentParentId} placeholder="No parent linked" items={parents?.map((p) => ({ value: p.id, label: `${p.name} (${p.email})` })) || []} />
            </div>
            <Button type="submit" className="w-full" disabled={createStudentMut.isPending}>{createStudentMut.isPending ? "Adding..." : "Add Student"}</Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* ─── Edit Student Dialog ─── */}
      <Dialog open={!!editingStudent} onOpenChange={(v) => { if (!v) setEditingStudent(null); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Student</DialogTitle></DialogHeader>
          <form onSubmit={(e) => {
            e.preventDefault();
            if (!editingStudent) return;
            const fd = new FormData(e.currentTarget);
            updateStudentMut.mutate({ id: editingStudent.id, name: fd.get("name") as string, rollNumber: fd.get("rollNumber") as string, fatherName: fd.get("fatherName") as string, classId: selectedClassId!, parentId: studentParentId || undefined });
          }} className="space-y-4">
            <div><Label>Student Name</Label><Input name="name" defaultValue={editingStudent?.name || ""} required /></div>
            <div><Label>Roll Number</Label><Input name="rollNumber" defaultValue={editingStudent?.rollNumber || ""} required /></div>
            <div><Label>Father Name</Label><Input name="fatherName" defaultValue={editingStudent?.fatherName || ""} required /></div>
            <div><Label>Parent Account <span className="text-gray-400 font-normal">(optional)</span></Label>
              <LabeledSelect value={studentParentId} onValueChange={setStudentParentId} placeholder="No parent linked" items={parents?.map((p) => ({ value: p.id, label: `${p.name} (${p.email})` })) || []} />
            </div>
            <Button type="submit" className="w-full" disabled={updateStudentMut.isPending}>{updateStudentMut.isPending ? "Saving..." : "Update Student"}</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
