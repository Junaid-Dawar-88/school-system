"use client";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const SUBJECTS = ["Math","English","Urdu","Science","Physics","Chemistry","Biology","Computer Science","Social Studies","Islamiat","Pakistan Studies","History","Geography","Art","PE","Economics","Accounting","General Knowledge"];

export default function AssignmentsPage() {
  const [open, setOpen] = useState(false);
  const [detailId, setDetailId] = useState<string | null>(null);

  const utils = trpc.useUtils();
  const { data: profile } = trpc.settings.getProfile.useQuery();
  const { data: classes } = trpc.class.list.useQuery();
  const { data: assignments, isLoading } = trpc.assignment.list.useQuery();

  const canManage = profile?.role === "TEACHER" || profile?.role === "ADMIN";

  const createMut = trpc.assignment.create.useMutation({
    onSuccess: () => { utils.assignment.list.invalidate(); setOpen(false); toast.success("Assignment created"); },
    onError: (e) => toast.error(e.message),
  });

  const deleteMut = trpc.assignment.delete.useMutation({
    onSuccess: () => { utils.assignment.list.invalidate(); toast.success("Deleted"); },
    onError: (e) => toast.error(e.message),
  });

  const gradeSubMut = trpc.assignment.gradeSubmission.useMutation({
    onSuccess: () => { utils.assignment.list.invalidate(); toast.success("Graded"); },
    onError: (e) => toast.error(e.message),
  });

  const detailAssignment = assignments?.find((a) => a.id === detailId);

  function isOverdue(dueDate: string | Date) {
    return new Date(dueDate) < new Date();
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Assignments</h1>
          <p className="text-gray-500 dark:text-gray-400">Create and manage assignments</p>
        </div>
        {canManage && <Button onClick={() => setOpen(true)}>+ Create Assignment</Button>}
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl border dark:border-gray-800">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Class</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Submissions</TableHead>
              <TableHead>Teacher</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={7} className="text-center py-8 text-gray-400">Loading...</TableCell></TableRow>
            ) : !assignments?.length ? (
              <TableRow><TableCell colSpan={7} className="text-center py-8 text-gray-400">No assignments yet</TableCell></TableRow>
            ) : (
              assignments.map((a) => (
                <TableRow key={a.id}>
                  <TableCell className="font-medium">{a.title}</TableCell>
                  <TableCell><Badge variant="secondary">{a.class.name}</Badge></TableCell>
                  <TableCell><Badge variant="outline">{a.subject}</Badge></TableCell>
                  <TableCell className={isOverdue(a.dueDate) ? "text-red-600 font-semibold" : ""}>{new Date(a.dueDate).toLocaleDateString()}</TableCell>
                  <TableCell><Badge variant="outline">{a.submissions.length} submitted</Badge></TableCell>
                  <TableCell>{a.teacher.name}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button size="sm" variant="outline" onClick={() => setDetailId(a.id)}>View</Button>
                    {canManage && <Button size="sm" variant="destructive" onClick={() => { if (confirm("Delete?")) deleteMut.mutate({ id: a.id }); }}>Delete</Button>}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Create Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Create Assignment</DialogTitle></DialogHeader>
          <form onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            createMut.mutate({
              title: fd.get("title") as string,
              description: (fd.get("description") as string) || undefined,
              dueDate: fd.get("dueDate") as string,
              subject: fd.get("subject") as string,
              classId: fd.get("classId") as string,
            });
          }} className="space-y-4">
            <div><Label>Title</Label><Input name="title" placeholder="Assignment title" required /></div>
            <div><Label>Description</Label><Textarea name="description" placeholder="Instructions..." /></div>
            <div><Label>Due Date</Label><Input name="dueDate" type="date" required /></div>
            <div>
              <Label>Subject</Label>
              <select name="subject" className="w-full border rounded-lg p-2 dark:bg-gray-800 dark:border-gray-700" required>
                <option value="">Select subject</option>
                {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <Label>Class</Label>
              <select name="classId" className="w-full border rounded-lg p-2 dark:bg-gray-800 dark:border-gray-700" required>
                <option value="">Select class</option>
                {classes?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <Button type="submit" className="w-full" disabled={createMut.isPending}>{createMut.isPending ? "Creating..." : "Create"}</Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Detail/Submissions Dialog */}
      <Dialog open={!!detailId} onOpenChange={() => setDetailId(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{detailAssignment?.title} — Submissions</DialogTitle></DialogHeader>
          {detailAssignment?.description && <p className="text-gray-500 dark:text-gray-400 mb-4">{detailAssignment.description}</p>}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Content</TableHead>
                <TableHead>Grade</TableHead>
                <TableHead>Feedback</TableHead>
                {canManage && <TableHead>Action</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {!detailAssignment?.submissions.length ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-gray-400">No submissions</TableCell></TableRow>
              ) : (
                detailAssignment.submissions.map((sub) => (
                  <TableRow key={sub.id}>
                    <TableCell className="font-medium">{sub.student.name}</TableCell>
                    <TableCell>{new Date(sub.submittedAt).toLocaleDateString()}</TableCell>
                    <TableCell className="max-w-[150px] truncate">{sub.content || "—"}</TableCell>
                    <TableCell>{sub.grade != null ? sub.grade : "—"}</TableCell>
                    <TableCell className="max-w-[150px] truncate">{sub.feedback || "—"}</TableCell>
                    {canManage && (
                      <TableCell>
                        <form className="flex gap-1" onSubmit={(e) => {
                          e.preventDefault();
                          const fd = new FormData(e.currentTarget);
                          gradeSubMut.mutate({
                            id: sub.id,
                            grade: parseFloat(fd.get("grade") as string),
                            feedback: (fd.get("feedback") as string) || undefined,
                          });
                        }}>
                          <Input name="grade" type="number" placeholder="Grade" className="w-16" defaultValue={sub.grade ?? ""} />
                          <Input name="feedback" placeholder="Feedback" className="w-24" defaultValue={sub.feedback ?? ""} />
                          <Button size="sm" type="submit">Save</Button>
                        </form>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </DialogContent>
      </Dialog>
    </div>
  );
}
