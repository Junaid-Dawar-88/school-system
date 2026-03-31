"use client";
import { useState } from "react";
import { useQueryState } from "nuqs";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LabeledSelect } from "@/compnent/select-display";

const SUBJECTS = [
  "Mathematics", "English", "Urdu", "Science", "Physics", "Chemistry",
  "Biology", "Computer Science", "Social Studies", "Islamiat",
  "Pakistan Studies", "History", "Geography", "Art",
  "Physical Education", "Economics", "Accounting", "General Knowledge",
];

type EditTeacher = { id: string; name: string; email: string; subjects: string[] } | null;

export default function TeachersPage() {
  const [openAdd, setOpenAdd] = useState(false);
  const [editing, setEditing] = useState<EditTeacher>(null);
  const [newSubjects, setNewSubjects] = useState<string[]>([]);
  const [editSubjects, setEditSubjects] = useState<string[]>([]);
  const [search, setSearch] = useQueryState("q", { defaultValue: "" });
  const [filterSubject, setFilterSubject] = useQueryState("subject", { defaultValue: "" });

  const utils = trpc.useUtils();
  const { data: teachers, isLoading } = trpc.teacher.list.useQuery();

  const createMut = trpc.teacher.create.useMutation({
    onSuccess: () => { utils.teacher.list.invalidate(); setOpenAdd(false); setNewSubjects([]); toast.success("Teacher added! Login code sent to their email."); },
    onError: (e) => toast.error(e.message),
  });
  const updateMut = trpc.teacher.update.useMutation({
    onSuccess: () => { utils.teacher.list.invalidate(); setEditing(null); toast.success("Teacher updated"); },
    onError: (e) => toast.error(e.message),
  });
  const removeMut = trpc.teacher.remove.useMutation({
    onSuccess: () => { utils.teacher.list.invalidate(); toast.success("Teacher removed"); },
    onError: (e) => toast.error(e.message),
  });

  function toggleSubject(list: string[], setList: (v: string[]) => void, subject: string) {
    setList(list.includes(subject) ? list.filter((s) => s !== subject) : [...list, subject]);
  }

  function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (newSubjects.length === 0) { toast.error("Select at least one subject"); return; }
    const fd = new FormData(e.currentTarget);
    createMut.mutate({ name: fd.get("name") as string, email: fd.get("email") as string, subjects: newSubjects });
  }

  function handleUpdate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!editing || editSubjects.length === 0) { toast.error("Select at least one subject"); return; }
    const fd = new FormData(e.currentTarget);
    updateMut.mutate({ id: editing.id, name: fd.get("name") as string, email: fd.get("email") as string, subjects: editSubjects });
  }

  function SubjectPicker({ selected, onToggle }: { selected: string[]; onToggle: (s: string) => void }) {
    return (
      <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto border rounded-lg p-3">
        {SUBJECTS.map((s) => (
          <label key={s} className={`flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer text-sm transition-colors ${selected.includes(s) ? "bg-blue-50 text-blue-700" : "hover:bg-gray-50 text-gray-600"}`}>
            <input type="checkbox" checked={selected.includes(s)} onChange={() => onToggle(s)} className="rounded" />
            {s}
          </label>
        ))}
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-2xl font-bold">Teachers</h1><p className="text-gray-500">Add teachers — a login code will be emailed to them</p></div>
        <Button onClick={() => { setNewSubjects([]); setOpenAdd(true); }}>+ Add Teacher</Button>
      </div>

      {/* Search & Filter */}
      <div className="flex gap-3 mb-4">
        <Input placeholder="Search by name or email..." value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-sm" />
        <LabeledSelect value={filterSubject} onValueChange={setFilterSubject} placeholder="All Subjects" className="w-50" items={[{ value: "ALL", label: "All Subjects" }, ...SUBJECTS.map((s) => ({ value: s, label: s }))]} />
      </div>

      <div className="bg-white rounded-2xl border shadow-sm overflow-x-auto">
        <Table>
          <TableHeader><TableRow>
            <TableHead>Name</TableHead><TableHead>Email</TableHead><TableHead>Subjects</TableHead><TableHead>Classes</TableHead><TableHead className="text-right">Actions</TableHead>
          </TableRow></TableHeader>
          <TableBody>
            {isLoading ? <TableRow><TableCell colSpan={5} className="text-center py-8 text-gray-400">Loading...</TableCell></TableRow>
            : (() => {
              const filtered = teachers?.filter((t) => {
                const q = search.toLowerCase();
                const matchesSearch = !q || t.name.toLowerCase().includes(q) || t.email.toLowerCase().includes(q);
                const subjects = t.subject ? t.subject.split(",") : [];
                const matchesSubject = !filterSubject || filterSubject === "ALL" || subjects.includes(filterSubject);
                return matchesSearch && matchesSubject;
              });
              return !filtered?.length ? <TableRow><TableCell colSpan={5} className="text-center py-8 text-gray-400">{teachers?.length ? "No matching teachers" : "No teachers yet"}</TableCell></TableRow>
              : filtered.map((t) => {
              const subjects = t.subject ? t.subject.split(",") : [];
              return (
                <TableRow key={t.id}>
                  <TableCell className="font-medium">{t.name}</TableCell>
                  <TableCell>{t.email}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {subjects.length === 0 ? <span className="text-gray-400">—</span> : subjects.map((s) => (
                        <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell><Badge variant="secondary">{t.classAssignments.length}</Badge></TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button size="sm" variant="outline" onClick={() => { setEditSubjects(subjects); setEditing({ id: t.id, name: t.name, email: t.email, subjects }); }}>Edit</Button>
                    <Button size="sm" variant="destructive" onClick={() => { if (confirm("Remove this teacher?")) removeMut.mutate({ id: t.id }); }}>Remove</Button>
                  </TableCell>
                </TableRow>
              );
            });
            })()}
          </TableBody>
        </Table>
      </div>

      {/* Add Teacher */}
      <Dialog open={openAdd} onOpenChange={setOpenAdd}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Add Teacher</DialogTitle></DialogHeader>
          <p className="text-sm text-gray-500 mb-4">A login code will be generated and emailed to the teacher.</p>
          <form onSubmit={handleCreate} className="space-y-4">
            <div><Label>Name</Label><Input name="name" required /></div>
            <div><Label>Email</Label><Input name="email" type="email" required /></div>
            <div>
              <Label className="mb-2 block">Subjects <span className="text-gray-400 font-normal">({newSubjects.length} selected)</span></Label>
              <SubjectPicker selected={newSubjects} onToggle={(s) => toggleSubject(newSubjects, setNewSubjects, s)} />
            </div>
            <Button type="submit" className="w-full" disabled={createMut.isPending}>{createMut.isPending ? "Adding..." : "Add Teacher & Send Code"}</Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Teacher */}
      <Dialog open={!!editing} onOpenChange={(v) => { if (!v) setEditing(null); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Edit Teacher</DialogTitle></DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div><Label>Name</Label><Input name="name" defaultValue={editing?.name || ""} required /></div>
            <div><Label>Email</Label><Input name="email" type="email" defaultValue={editing?.email || ""} required /></div>
            <div>
              <Label className="mb-2 block">Subjects <span className="text-gray-400 font-normal">({editSubjects.length} selected)</span></Label>
              <SubjectPicker selected={editSubjects} onToggle={(s) => toggleSubject(editSubjects, setEditSubjects, s)} />
            </div>
            <Button type="submit" className="w-full" disabled={updateMut.isPending}>{updateMut.isPending ? "Saving..." : "Update Teacher"}</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
