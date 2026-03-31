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

export default function ExamsPage() {
  const [open, setOpen] = useState(false);
  const [classId, setClassId] = useState("");

  const utils = trpc.useUtils();
  const { data: exams, isLoading } = trpc.exam.list.useQuery();
  const { data: classes } = trpc.class.list.useQuery();
  const { data: profile } = trpc.settings.getProfile.useQuery();

  const isTeacherOrAdmin = profile?.role === "TEACHER" || profile?.role === "ADMIN";

  const createMut = trpc.exam.create.useMutation({
    onSuccess: () => { utils.exam.list.invalidate(); utils.notification.unreadCount.invalidate(); setOpen(false); setClassId(""); toast.success("Exam scheduled & notifications sent"); },
    onError: (e) => toast.error(e.message),
  });
  const deleteMut = trpc.exam.delete.useMutation({
    onSuccess: () => { utils.exam.list.invalidate(); toast.success("Exam deleted"); },
    onError: (e) => toast.error(e.message),
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-2xl font-bold">Exams</h1><p className="text-gray-500 dark:text-gray-400">Schedule and manage exams</p></div>
        {isTeacherOrAdmin && <Button onClick={() => { setClassId(""); setOpen(true); }}>+ Schedule Exam</Button>}
      </div>
      <div className="bg-white dark:bg-gray-900 rounded-2xl border dark:border-gray-800 shadow-sm overflow-x-auto">
        <Table>
          <TableHeader><TableRow><TableHead>Title</TableHead><TableHead>Class</TableHead><TableHead>Date</TableHead><TableHead>Created By</TableHead><TableHead>Description</TableHead>{isTeacherOrAdmin && <TableHead className="text-right">Actions</TableHead>}</TableRow></TableHeader>
          <TableBody>
            {isLoading ? <TableRow><TableCell colSpan={6} className="text-center py-8 text-gray-400">Loading...</TableCell></TableRow>
            : !exams?.length ? <TableRow><TableCell colSpan={6} className="text-center py-8 text-gray-400">No exams scheduled</TableCell></TableRow>
            : exams.map((e) => (
              <TableRow key={e.id}>
                <TableCell className="font-medium">{e.title}</TableCell>
                <TableCell><Badge variant="secondary">{e.class.name}</Badge></TableCell>
                <TableCell>{new Date(e.date).toLocaleDateString()}</TableCell>
                <TableCell>{e.createdBy.name}</TableCell>
                <TableCell className="max-w-48 truncate">{e.description || "—"}</TableCell>
                {isTeacherOrAdmin && <TableCell className="text-right">
                  <Button size="sm" variant="destructive" onClick={() => { if (confirm("Delete?")) deleteMut.mutate({ id: e.id }); }}>Delete</Button>
                </TableCell>}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Schedule Exam</DialogTitle></DialogHeader>
          <form onSubmit={(e) => {
            e.preventDefault();
            if (!classId) { toast.error("Select a class"); return; }
            const fd = new FormData(e.currentTarget);
            createMut.mutate({ title: fd.get("title") as string, description: (fd.get("description") as string) || undefined, date: fd.get("date") as string, classId });
          }} className="space-y-4">
            <div><Label>Title</Label><Input name="title" placeholder="e.g. Math Midterm" required /></div>
            <div><Label>Description (optional)</Label><Textarea name="description" rows={3} /></div>
            <div><Label>Date</Label><Input name="date" type="date" required /></div>
            <div><Label>Class</Label><LabeledSelect value={classId} onValueChange={setClassId} placeholder="Select class" items={classes?.map((c) => ({ value: c.id, label: c.name })) || []} /></div>
            <Button type="submit" className="w-full" disabled={createMut.isPending}>{createMut.isPending ? "Scheduling..." : "Schedule Exam & Notify"}</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
