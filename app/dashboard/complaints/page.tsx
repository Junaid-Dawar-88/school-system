"use client";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { LabeledSelect } from "@/compnent/select-display";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function ComplaintsPage() {
  const [openStudent, setOpenStudent] = useState(false);
  const [openTeacher, setOpenTeacher] = useState(false);
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyMsg, setReplyMsg] = useState("");
  const [selectedClassId, setSelectedClassId] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [selectedTeacherId, setSelectedTeacherId] = useState("");
  const [studentMsg, setStudentMsg] = useState("");
  const [teacherMsg, setTeacherMsg] = useState("");
  const [visibility, setVisibility] = useState<"PUBLIC" | "PRIVATE">("PUBLIC");
  const [editingComplaint, setEditingComplaint] = useState<{ id: string; message: string } | null>(null);

  const utils = trpc.useUtils();
  const { data: profile } = trpc.settings.getProfile.useQuery();
  const { data: complaints, isLoading } = trpc.complaint.list.useQuery();
  const { data: classes } = trpc.class.list.useQuery();
  const { data: students } = trpc.student.list.useQuery();
  const { data: teachers } = trpc.complaint.teachers.useQuery();

  // Filter students by selected class
  const filteredStudents = selectedClassId
    ? students?.filter((s) => s.class.id === selectedClassId)
    : students;

  const aboutStudentMut = trpc.complaint.createAboutStudent.useMutation({
    onSuccess: () => { utils.complaint.list.invalidate(); setOpenStudent(false); setSelectedStudentId(""); setStudentMsg(""); toast.success("Complaint filed"); },
    onError: (e) => toast.error(e.message),
  });
  const aboutTeacherMut = trpc.complaint.createAboutTeacher.useMutation({
    onSuccess: () => { utils.complaint.list.invalidate(); setOpenTeacher(false); setSelectedTeacherId(""); setTeacherMsg(""); toast.success("Complaint filed"); },
    onError: (e) => toast.error(e.message),
  });
  const updateComplaintMut = trpc.complaint.update.useMutation({
    onSuccess: () => { utils.complaint.list.invalidate(); setEditingComplaint(null); toast.success("Complaint updated"); },
    onError: (e) => toast.error(e.message),
  });
  const deleteComplaintMut = trpc.complaint.delete.useMutation({
    onSuccess: () => { utils.complaint.list.invalidate(); toast.success("Complaint deleted"); },
    onError: (e) => toast.error(e.message),
  });
  const toggleStatusMut = trpc.complaint.toggleStatus.useMutation({
    onSuccess: () => { utils.complaint.list.invalidate(); toast.success("Status updated"); },
    onError: (e) => toast.error(e.message),
  });
  const replyMut = trpc.complaint.reply.useMutation({
    onSuccess: () => { utils.complaint.list.invalidate(); setReplyTo(null); setReplyMsg(""); toast.success("Reply sent"); },
    onError: (e) => toast.error(e.message),
  });

  const roleBadge: Record<string, string> = { ADMIN: "bg-purple-100 text-purple-700", TEACHER: "bg-blue-100 text-blue-700", PARENT: "bg-green-100 text-green-700" };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-2xl font-bold">Complaints</h1><p className="text-gray-500">File and respond to complaints</p></div>
        <div className="flex gap-2">
          {students && students.length > 0 && <Button onClick={() => { setSelectedClassId(""); setSelectedStudentId(""); setStudentMsg(""); setVisibility("PUBLIC"); setOpenStudent(true); }}>Complaint About Student</Button>}
          {teachers && <Button variant="outline" onClick={() => { setSelectedTeacherId(""); setTeacherMsg(""); setOpenTeacher(true); }}>Complaint About Teacher</Button>}
        </div>
      </div>

      {isLoading ? <p className="text-gray-400">Loading...</p>
      : !complaints?.length ? <div className="bg-white rounded-2xl border shadow-sm p-12 text-center text-gray-400">No complaints yet</div>
      : <div className="space-y-4">{complaints.map((c) => (
        <Card key={c.id}>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2 flex-wrap">
              <CardTitle className="text-base">{c.type === "ABOUT_STUDENT" ? `About student: ${c.student?.name}` : `About teacher: ${c.teacherName || "Unknown"}`}</CardTitle>
              <Badge className={roleBadge[c.createdBy.role]} variant="secondary">{c.createdBy.role}</Badge>
              <span className="text-xs text-gray-400">{c.createdBy.name} &middot; {new Date(c.createdAt).toLocaleDateString()}</span>
              {c.student?.class && <Badge variant="outline">{c.student.class.name}</Badge>}
              {c.type === "ABOUT_STUDENT" && (
                <Badge className={c.visibility === "PRIVATE" ? "bg-orange-100 text-orange-700" : "bg-gray-100 text-gray-600"}>
                  {c.visibility === "PRIVATE" ? "Parent & Admin Only" : "Public"}
                </Badge>
              )}
              <Badge className={c.status === "RESOLVED" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}>
                {c.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-3">{c.message}</p>
            {/* Actions — creator or admin */}
            {(c.createdById === profile?.id || profile?.role === "ADMIN") && (
              <div className="flex gap-2 mb-4">
                <Button size="sm" variant={c.status === "OPEN" ? "default" : "outline"} onClick={() => toggleStatusMut.mutate({ id: c.id })}>
                  {c.status === "OPEN" ? "Mark Resolved" : "Reopen"}
                </Button>
                {c.createdById === profile?.id && (
                  <Button size="sm" variant="outline" onClick={() => setEditingComplaint({ id: c.id, message: c.message })}>Edit</Button>
                )}
                <Button size="sm" variant="destructive" onClick={() => { if (confirm("Delete this complaint?")) deleteComplaintMut.mutate({ id: c.id }); }}>Delete</Button>
              </div>
            )}
            {c.replies.length > 0 && (<><Separator className="mb-4" /><div className="space-y-3"><p className="text-sm font-semibold text-gray-500">Replies</p>
              {c.replies.map((r) => (
                <div key={r.id} className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium">{r.user.name}</span>
                    <Badge className={roleBadge[r.user.role]} variant="secondary">{r.user.role}</Badge>
                    <span className="text-xs text-gray-400">{new Date(r.createdAt).toLocaleString()}</span>
                  </div>
                  <p className="text-sm text-gray-700">{r.message}</p>
                </div>
              ))}
            </div></>)}
            <div className="mt-4">
              {replyTo === c.id ? (
                <div className="flex gap-2">
                  <Textarea value={replyMsg} onChange={(e) => setReplyMsg(e.target.value)} placeholder="Your reply..." className="flex-1" />
                  <div className="flex flex-col gap-2">
                    <Button size="sm" onClick={() => replyMut.mutate({ complaintId: c.id, message: replyMsg })} disabled={replyMut.isPending}>Send</Button>
                    <Button size="sm" variant="outline" onClick={() => { setReplyTo(null); setReplyMsg(""); }}>Cancel</Button>
                  </div>
                </div>
              ) : <Button size="sm" variant="outline" onClick={() => setReplyTo(c.id)}>Reply</Button>}
            </div>
          </CardContent>
        </Card>
      ))}</div>}

      {/* Complaint about Student */}
      <Dialog open={openStudent} onOpenChange={setOpenStudent}>
        <DialogContent><DialogHeader><DialogTitle>Complaint About Student</DialogTitle></DialogHeader>
          <form onSubmit={(e) => {
            e.preventDefault();
            if (!selectedClassId) { toast.error("Select a class"); return; }
            if (!selectedStudentId) { toast.error("Select a student"); return; }
            aboutStudentMut.mutate({ studentId: selectedStudentId, message: studentMsg, visibility });
          }} className="space-y-4">
            <div>
              <Label>Class</Label>
              <LabeledSelect value={selectedClassId} onValueChange={(v) => { setSelectedClassId(v); setSelectedStudentId(""); }} placeholder="Select class first" items={classes?.map((c) => ({ value: c.id, label: c.name })) || []} />
            </div>
            <div>
              <Label>Student</Label>
              <LabeledSelect value={selectedStudentId} onValueChange={setSelectedStudentId} placeholder={selectedClassId ? "Select student" : "Select a class first"} disabled={!selectedClassId} items={filteredStudents?.map((s) => ({ value: s.id, label: `${s.name} (Roll: ${s.rollNumber})` })) || []} />
            </div>
            <div><Label>Message</Label><Textarea value={studentMsg} onChange={(e) => setStudentMsg(e.target.value)} rows={4} required /></div>
            <div>
              <Label className="mb-3 block">Who can see this complaint?</Label>
              <div className="space-y-2">
                <label className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${visibility === "PUBLIC" ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:bg-gray-50"}`}>
                  <input type="radio" name="visibility" value="PUBLIC" checked={visibility === "PUBLIC"} onChange={() => setVisibility("PUBLIC")} className="mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">All Teachers & Parent</p>
                    <p className="text-xs text-gray-500">Visible to all teachers in the school + the student&apos;s parent + admin</p>
                  </div>
                </label>
                <label className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${visibility === "PRIVATE" ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:bg-gray-50"}`}>
                  <input type="radio" name="visibility" value="PRIVATE" checked={visibility === "PRIVATE"} onChange={() => setVisibility("PRIVATE")} className="mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Parent & Admin Only</p>
                    <p className="text-xs text-gray-500">Only the student&apos;s parent and admin can see this. Other teachers cannot.</p>
                  </div>
                </label>
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={aboutStudentMut.isPending}>{aboutStudentMut.isPending ? "Submitting..." : "Submit Complaint"}</Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Complaint about Teacher */}
      <Dialog open={openTeacher} onOpenChange={setOpenTeacher}>
        <DialogContent><DialogHeader><DialogTitle>Complaint About Teacher</DialogTitle></DialogHeader>
          <form onSubmit={(e) => {
            e.preventDefault();
            if (!selectedTeacherId) { toast.error("Select a teacher"); return; }
            aboutTeacherMut.mutate({ teacherId: selectedTeacherId, message: teacherMsg });
          }} className="space-y-4">
            <div>
              <Label>Teacher</Label>
              <LabeledSelect value={selectedTeacherId} onValueChange={setSelectedTeacherId} placeholder="Select teacher" items={teachers?.map((t) => ({ value: t.id, label: t.name })) || []} />
            </div>
            <div><Label>Message</Label><Textarea value={teacherMsg} onChange={(e) => setTeacherMsg(e.target.value)} rows={4} required /></div>
            <Button type="submit" className="w-full" disabled={aboutTeacherMut.isPending}>{aboutTeacherMut.isPending ? "Submitting..." : "Submit"}</Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Complaint Dialog */}
      <Dialog open={!!editingComplaint} onOpenChange={(v) => { if (!v) setEditingComplaint(null); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Complaint</DialogTitle></DialogHeader>
          <form onSubmit={(e) => {
            e.preventDefault();
            if (!editingComplaint) return;
            const fd = new FormData(e.currentTarget);
            updateComplaintMut.mutate({ id: editingComplaint.id, message: fd.get("message") as string });
          }} className="space-y-4">
            <div><Label>Message</Label><Textarea name="message" defaultValue={editingComplaint?.message || ""} rows={4} required /></div>
            <Button type="submit" className="w-full" disabled={updateComplaintMut.isPending}>{updateComplaintMut.isPending ? "Saving..." : "Update Complaint"}</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
