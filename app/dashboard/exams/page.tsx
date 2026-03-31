"use client";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { LabeledSelect } from "@/compnent/select-display";

const SUBJECTS = [
  "Mathematics", "English", "Urdu", "Science", "Physics", "Chemistry",
  "Biology", "Computer Science", "Social Studies", "Islamiat",
  "Pakistan Studies", "History", "Geography", "Art",
  "Physical Education", "Economics", "Accounting", "General Knowledge",
];

type EditExam = { id: string; title: string; description: string; date: string; subject: string } | null;

export default function ExamsPage() {
  const [openCreate, setOpenCreate] = useState(false);
  const [editing, setEditing] = useState<EditExam>(null);
  const [classId, setClassId] = useState("");
  const [subject, setSubject] = useState("");
  const [editSubject, setEditSubject] = useState("");

  const utils = trpc.useUtils();
  const { data: exams, isLoading } = trpc.exam.list.useQuery();
  const { data: classes } = trpc.class.list.useQuery();
  const { data: profile } = trpc.settings.getProfile.useQuery();

  const canManage = profile?.role === "TEACHER" || profile?.role === "ADMIN";

  const createMut = trpc.exam.create.useMutation({
    onSuccess: () => { utils.exam.list.invalidate(); utils.notification.unreadCount.invalidate(); setOpenCreate(false); setClassId(""); setSubject(""); toast.success("Exam created & notifications sent"); },
    onError: (e) => toast.error(e.message),
  });
  const updateMut = trpc.exam.update.useMutation({
    onSuccess: () => { utils.exam.list.invalidate(); setEditing(null); toast.success("Exam updated"); },
    onError: (e) => toast.error(e.message),
  });
  const deleteMut = trpc.exam.delete.useMutation({
    onSuccess: () => { utils.exam.list.invalidate(); toast.success("Exam deleted"); },
    onError: (e) => toast.error(e.message),
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Exams & Tests</h1>
          <p className="text-gray-500 dark:text-gray-400">{canManage ? "Schedule exams and tests for your classes" : "View upcoming exams and tests"}</p>
        </div>
        {canManage && <Button onClick={() => { setClassId(""); setSubject(""); setOpenCreate(true); }}>+ Schedule Exam</Button>}
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl border dark:border-gray-800 shadow-sm overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Class</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Created By</TableHead>
              <TableHead>Description</TableHead>
              {canManage && <TableHead className="text-right">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={7} className="text-center py-8 text-gray-400">Loading...</TableCell></TableRow>
            ) : !exams?.length ? (
              <TableRow><TableCell colSpan={7} className="text-center py-8 text-gray-400">No exams scheduled</TableCell></TableRow>
            ) : (
              exams.map((exam) => {
                const isPast = new Date(exam.date) < new Date();
                return (
                  <TableRow key={exam.id} className={isPast ? "opacity-60" : ""}>
                    <TableCell className="font-medium">{exam.title}</TableCell>
                    <TableCell><Badge variant="secondary">{exam.class.name}</Badge></TableCell>
                    <TableCell><Badge variant="outline">{exam.subject}</Badge></TableCell>
                    <TableCell>
                      <span className={isPast ? "text-gray-400" : ""}>{new Date(exam.date).toLocaleDateString()}</span>
                      {isPast && <span className="text-xs text-gray-400 ml-1">(past)</span>}
                    </TableCell>
                    <TableCell>{exam.createdBy.name}</TableCell>
                    <TableCell className="max-w-48 truncate">{exam.description || "—"}</TableCell>
                    {canManage && (
                      <TableCell className="text-right space-x-2">
                        <Button size="sm" variant="outline" onClick={() => {
                          setEditSubject(exam.subject);
                          setEditing({
                            id: exam.id,
                            title: exam.title,
                            description: exam.description || "",
                            date: new Date(exam.date).toISOString().split("T")[0],
                            subject: exam.subject,
                          });
                        }}>Edit</Button>
                        <Button size="sm" variant="destructive" onClick={() => { if (confirm("Delete this exam?")) deleteMut.mutate({ id: exam.id }); }}>Delete</Button>
                      </TableCell>
                    )}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Create Exam Dialog */}
      <Dialog open={openCreate} onOpenChange={setOpenCreate}>
        <DialogContent>
          <DialogHeader><DialogTitle>Schedule Exam / Test</DialogTitle></DialogHeader>
          <form onSubmit={(e) => {
            e.preventDefault();
            if (!classId) { toast.error("Select a class"); return; }
            if (!subject) { toast.error("Select a subject"); return; }
            const fd = new FormData(e.currentTarget);
            createMut.mutate({
              title: fd.get("title") as string,
              description: (fd.get("description") as string) || undefined,
              date: fd.get("date") as string,
              classId,
              subject,
            });
          }} className="space-y-4">
            <div><Label>Title</Label><Input name="title" placeholder="e.g. Math Midterm Exam" required /></div>
            <div><Label>Description (optional)</Label><Textarea name="description" rows={2} placeholder="Chapters 1-5, bring calculator" /></div>
            <div><Label>Date</Label><Input name="date" type="date" required /></div>
            <div>
              <Label>Class</Label>
              <LabeledSelect value={classId} onValueChange={setClassId} placeholder="Select class" items={classes?.map((c) => ({ value: c.id, label: c.name })) || []} />
            </div>
            <div>
              <Label>Subject</Label>
              <LabeledSelect value={subject} onValueChange={setSubject} placeholder="Select subject" items={SUBJECTS.map((s) => ({ value: s, label: s }))} />
            </div>
            <Button type="submit" className="w-full" disabled={createMut.isPending}>
              {createMut.isPending ? "Scheduling..." : "Schedule Exam & Notify"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Exam Dialog */}
      <Dialog open={!!editing} onOpenChange={(v) => { if (!v) setEditing(null); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Exam</DialogTitle></DialogHeader>
          <form onSubmit={(e) => {
            e.preventDefault();
            if (!editing || !editSubject) return;
            const fd = new FormData(e.currentTarget);
            updateMut.mutate({
              id: editing.id,
              title: fd.get("title") as string,
              description: (fd.get("description") as string) || undefined,
              date: fd.get("date") as string,
              subject: editSubject,
            });
          }} className="space-y-4">
            <div><Label>Title</Label><Input name="title" defaultValue={editing?.title || ""} required /></div>
            <div><Label>Description (optional)</Label><Textarea name="description" rows={2} defaultValue={editing?.description || ""} /></div>
            <div><Label>Date</Label><Input name="date" type="date" defaultValue={editing?.date || ""} required /></div>
            <div>
              <Label>Subject</Label>
              <LabeledSelect value={editSubject} onValueChange={setEditSubject} placeholder="Select subject" items={SUBJECTS.map((s) => ({ value: s, label: s }))} />
            </div>
            <Button type="submit" className="w-full" disabled={updateMut.isPending}>
              {updateMut.isPending ? "Saving..." : "Update Exam"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
