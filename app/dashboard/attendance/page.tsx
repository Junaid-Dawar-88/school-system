"use client";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LabeledSelect } from "@/compnent/select-display";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Status = "PRESENT" | "ABSENT" | "LATE";

export default function AttendancePage() {
  const [classId, setClassId] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [records, setRecords] = useState<Record<string, Status>>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editStatus, setEditStatus] = useState<Status>("PRESENT");

  const utils = trpc.useUtils();
  const { data: profile } = trpc.settings.getProfile.useQuery();
  const { data: classes } = trpc.class.list.useQuery();
  const { data: classDetail } = trpc.class.getById.useQuery({ id: classId }, { enabled: !!classId });
  const { data: existing } = trpc.attendance.getByClassAndDate.useQuery({ classId, date }, { enabled: !!classId && !!date });
  const { data: history } = trpc.attendance.historyByClass.useQuery({ classId }, { enabled: !!classId });

  const isAdmin = profile?.role === "ADMIN";

  const invalidateAll = () => {
    utils.attendance.getByClassAndDate.invalidate();
    utils.attendance.historyByClass.invalidate();
  };

  const markMut = trpc.attendance.markBulk.useMutation({
    onSuccess: () => { invalidateAll(); toast.success("Attendance saved"); },
    onError: (e) => toast.error(e.message),
  });
  const updateMut = trpc.attendance.update.useMutation({
    onSuccess: () => { invalidateAll(); setEditingId(null); toast.success("Updated"); },
    onError: (e) => toast.error(e.message),
  });
  const deleteMut = trpc.attendance.delete.useMutation({
    onSuccess: () => { invalidateAll(); toast.success("Deleted"); },
    onError: (e) => toast.error(e.message),
  });
  const deleteByDateMut = trpc.attendance.deleteByClassAndDate.useMutation({
    onSuccess: () => { invalidateAll(); toast.success("All attendance for that date deleted"); },
    onError: (e) => toast.error(e.message),
  });

  const studs = classDetail?.students || [];
  const getStatus = (sid: string): Status => records[sid] || (existing?.find((a) => a.studentId === sid)?.status as Status) || "PRESENT";

  const markColors: Record<Status, string> = { PRESENT: "bg-green-100 text-green-700", ABSENT: "bg-red-100 text-red-700", LATE: "bg-yellow-100 text-yellow-700" };
  const textColors: Record<string, string> = { PRESENT: "text-green-600", ABSENT: "text-red-600", LATE: "text-yellow-600" };

  // Group history by date
  const historyByDate = new Map<string, { dateRaw: string; records: { id: string; studentName: string; rollNumber: string; status: string }[] }>();
  history?.forEach((a) => {
    const dk = new Date(a.date).toLocaleDateString();
    if (!historyByDate.has(dk)) historyByDate.set(dk, { dateRaw: new Date(a.date).toISOString().split("T")[0], records: [] });
    historyByDate.get(dk)!.records.push({ id: a.id, studentName: a.student.name, rollNumber: a.student.rollNumber, status: a.status });
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Attendance</h1>
        <p className="text-gray-500">{isAdmin ? "View attendance history by class" : "Mark and manage attendance"}</p>
      </div>

      {/* Class selector */}
      <div className="bg-white rounded-xl border p-6 mb-6">
        <div className={`grid grid-cols-1 ${isAdmin ? "" : "md:grid-cols-2"} gap-4`}>
          <div><Label>Class</Label>
            <LabeledSelect value={classId} onValueChange={(v) => { setClassId(v); setRecords({}); }} placeholder="Select class" items={classes?.map((c) => ({ value: c.id, label: c.name })) || []} />
          </div>
          {!isAdmin && (
            <div><Label>Date (for marking)</Label><Input type="date" value={date} onChange={(e) => { setDate(e.target.value); setRecords({}); }} /></div>
          )}
        </div>
      </div>

      {/* ─── Admin: History only ─── */}
      {classId && isAdmin && (
        <div className="bg-white rounded-xl border">
          <div className="p-4 border-b"><h2 className="text-lg font-bold">Attendance History — {classes?.find((c) => c.id === classId)?.name}</h2></div>
          {historyByDate.size === 0 ? (
            <div className="p-8 text-center text-gray-400">No attendance records yet</div>
          ) : (
            <div className="divide-y">
              {Array.from(historyByDate.entries()).map(([dateKey, { records: recs }]) => (
                <div key={dateKey} className="p-4">
                  <p className="text-sm font-semibold text-gray-700 mb-2">{dateKey}</p>
                  <div className="font-mono text-sm space-y-1">
                    {recs.map((r) => (
                      <p key={r.id} className="flex gap-4">
                        <span className="text-gray-400 w-12">{r.rollNumber}</span>
                        <span className="text-gray-700 flex-1">{r.studentName}</span>
                        <span className={`font-semibold ${textColors[r.status]}`}>{r.status}</span>
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─── Teacher: Mark + History tabs ─── */}
      {classId && !isAdmin && (
        <Tabs defaultValue="mark">
          <TabsList className="mb-4">
            <TabsTrigger value="mark">Mark Attendance</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="mark">
            <div className="bg-white rounded-xl border">
              <div className="p-4 border-b flex items-center justify-between">
                <h2 className="text-lg font-bold">{date}</h2>
                <Button disabled={!classId || markMut.isPending} onClick={() => markMut.mutate({ classId, date, records: studs.map((s) => ({ studentId: s.id, status: getStatus(s.id) })) })}>
                  {markMut.isPending ? "Saving..." : "Save Attendance"}
                </Button>
              </div>
              <Table>
                <TableHeader><TableRow><TableHead>Student</TableHead><TableHead>Roll No.</TableHead><TableHead className="text-center">Status</TableHead></TableRow></TableHeader>
                <TableBody>
                  {!studs.length ? <TableRow><TableCell colSpan={3} className="text-center py-8 text-gray-400">No students in this class</TableCell></TableRow>
                  : studs.map((s) => {
                    const st = getStatus(s.id);
                    return (
                      <TableRow key={s.id}>
                        <TableCell className="font-medium">{s.name}</TableCell>
                        <TableCell><Badge variant="outline" className="font-mono">{s.rollNumber}</Badge></TableCell>
                        <TableCell>
                          <div className="flex justify-center gap-2">
                            {(["PRESENT","ABSENT","LATE"] as Status[]).map((v) => (
                              <button key={v} onClick={() => setRecords((p) => ({ ...p, [s.id]: v }))}
                                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${st === v ? markColors[v] : "bg-gray-50 text-gray-400 hover:bg-gray-100"}`}>
                                {v}
                              </button>
                            ))}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="history">
            <div className="bg-white rounded-xl border">
              <div className="p-4 border-b"><h2 className="text-lg font-bold">Attendance History</h2></div>
              {historyByDate.size === 0 ? (
                <div className="p-8 text-center text-gray-400">No attendance records yet</div>
              ) : (
                <div className="divide-y">
                  {Array.from(historyByDate.entries()).map(([dateKey, { dateRaw, records: recs }]) => (
                    <div key={dateKey} className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-sm font-semibold text-gray-700">{dateKey}</p>
                        <Button size="sm" variant="destructive" onClick={() => { if (confirm(`Delete all attendance for ${dateKey}?`)) deleteByDateMut.mutate({ classId, date: dateRaw }); }}>
                          Delete Day
                        </Button>
                      </div>
                      <Table>
                        <TableHeader><TableRow><TableHead>Roll No.</TableHead><TableHead>Student</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                        <TableBody>
                          {recs.map((r) => (
                            <TableRow key={r.id}>
                              <TableCell><Badge variant="outline" className="font-mono">{r.rollNumber}</Badge></TableCell>
                              <TableCell className="font-medium">{r.studentName}</TableCell>
                              <TableCell>
                                {editingId === r.id ? (
                                  <div className="flex gap-1">
                                    {(["PRESENT","ABSENT","LATE"] as Status[]).map((v) => (
                                      <button key={v} onClick={() => setEditStatus(v)}
                                        className={`px-2 py-1 rounded text-xs font-medium ${editStatus === v ? markColors[v] : "bg-gray-50 text-gray-400"}`}>
                                        {v}
                                      </button>
                                    ))}
                                  </div>
                                ) : (
                                  <span className={`font-semibold text-sm ${textColors[r.status]}`}>{r.status}</span>
                                )}
                              </TableCell>
                              <TableCell className="text-right space-x-2">
                                {editingId === r.id ? (
                                  <>
                                    <Button size="sm" onClick={() => updateMut.mutate({ id: r.id, status: editStatus })} disabled={updateMut.isPending}>Save</Button>
                                    <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>Cancel</Button>
                                  </>
                                ) : (
                                  <>
                                    <Button size="sm" variant="outline" onClick={() => { setEditingId(r.id); setEditStatus(r.status as Status); }}>Edit</Button>
                                    <Button size="sm" variant="destructive" onClick={() => { if (confirm("Delete?")) deleteMut.mutate({ id: r.id }); }}>Delete</Button>
                                  </>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
