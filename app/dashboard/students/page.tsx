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
import { LabeledSelect } from "@/compnent/select-display";

export default function StudentsPage() {
  const [open, setOpen] = useState(false);
  const [classId, setClassId] = useState("");
  const [parentId, setParentId] = useState("");

  const utils = trpc.useUtils();
  const { data: students, isLoading } = trpc.student.list.useQuery();
  const { data: classes } = trpc.class.list.useQuery();
  const { data: parents } = trpc.student.parents.useQuery(undefined, {});

  const createMut = trpc.student.create.useMutation({
    onSuccess: () => {
      utils.student.list.invalidate();
      setOpen(false);
      setClassId("");
      setParentId("");
      toast.success("Student added");
    },
    onError: (e) => toast.error(e.message),
  });
  const deleteMut = trpc.student.delete.useMutation({
    onSuccess: () => { utils.student.list.invalidate(); toast.success("Student removed"); },
    onError: (e) => toast.error(e.message),
  });

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);

    if (!classId) {
      toast.error("Please select a class");
      return;
    }

    createMut.mutate({
      name: fd.get("name") as string,
      rollNumber: fd.get("rollNumber") as string,
      fatherName: fd.get("fatherName") as string,
      classId,
      parentId: parentId || undefined,
    });
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-2xl font-bold">Students</h1><p className="text-gray-500">Manage students in your classes</p></div>
        <Button onClick={() => { setClassId(""); setParentId(""); setOpen(true); }}>+ Add Student</Button>
      </div>

      <div className="bg-white rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Roll No.</TableHead>
              <TableHead>Student Name</TableHead>
              <TableHead>Father Name</TableHead>
              <TableHead>Class</TableHead>
              <TableHead>Parent Account</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8 text-gray-400">Loading...</TableCell></TableRow>
            ) : !students?.length ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8 text-gray-400">No students yet</TableCell></TableRow>
            ) : (
              students.map((s) => (
                <TableRow key={s.id}>
                  <TableCell><Badge variant="outline" className="font-mono">{s.rollNumber}</Badge></TableCell>
                  <TableCell className="font-medium">{s.name}</TableCell>
                  <TableCell>{s.fatherName}</TableCell>
                  <TableCell><Badge variant="secondary">{s.class.name}</Badge></TableCell>
                  <TableCell>{s.parent?.name || "—"}</TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="destructive" onClick={() => { if (confirm("Remove this student?")) deleteMut.mutate({ id: s.id }); }}>Remove</Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add New Student</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Student Name</Label>
              <Input id="name" name="name" placeholder="e.g. Ahmed Ali" required />
            </div>
            <div>
              <Label htmlFor="rollNumber">Roll Number</Label>
              <Input id="rollNumber" name="rollNumber" placeholder="e.g. 101" required />
            </div>
            <div>
              <Label htmlFor="fatherName">Father Name</Label>
              <Input id="fatherName" name="fatherName" placeholder="e.g. Muhammad Ali" required />
            </div>
            <div>
              <Label>Class</Label>
              <LabeledSelect value={classId} onValueChange={setClassId} placeholder="Select class" items={classes?.map((c) => ({ value: c.id, label: c.name })) || []} />
            </div>
            <div>
              <Label>Parent Account <span className="text-gray-400 font-normal">(optional)</span></Label>
              <LabeledSelect value={parentId} onValueChange={setParentId} placeholder="No parent linked" items={parents?.map((p) => ({ value: p.id, label: `${p.name} (${p.email})` })) || []} />
            </div>
            <Button type="submit" className="w-full" disabled={createMut.isPending}>
              {createMut.isPending ? "Adding..." : "Add Student"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
