"use client";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { LabeledSelect } from "@/compnent/select-display";

const DAYS = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"] as const;
const SUBJECTS = ["Math","English","Urdu","Science","Physics","Chemistry","Biology","Computer Science","Social Studies","Islamiat","Pakistan Studies","History","Geography","Art","PE","Economics","Accounting","General Knowledge"];

export default function TimetablePage() {
  const [open, setOpen] = useState(false);
  const [classId, setClassId] = useState("");

  const utils = trpc.useUtils();
  const { data: profile } = trpc.settings.getProfile.useQuery();
  const { data: classes } = trpc.class.list.useQuery();
  const { data: teachers } = trpc.teacher.list.useQuery();
  const { data: timetable, isLoading } = trpc.timetable.list.useQuery({ classId: classId || undefined });

  const isAdmin = profile?.role === "ADMIN";

  const createMut = trpc.timetable.create.useMutation({
    onSuccess: () => { utils.timetable.list.invalidate(); setOpen(false); toast.success("Slot added"); },
    onError: (e) => toast.error(e.message),
  });

  const deleteMut = trpc.timetable.delete.useMutation({
    onSuccess: () => { utils.timetable.list.invalidate(); toast.success("Deleted"); },
    onError: (e) => toast.error(e.message),
  });

  const dayColors: Record<string, string> = {
    MONDAY: "bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800",
    TUESDAY: "bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800",
    WEDNESDAY: "bg-purple-50 dark:bg-purple-950 border-purple-200 dark:border-purple-800",
    THURSDAY: "bg-orange-50 dark:bg-orange-950 border-orange-200 dark:border-orange-800",
    FRIDAY: "bg-pink-50 dark:bg-pink-950 border-pink-200 dark:border-pink-800",
    SATURDAY: "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700",
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Timetable</h1>
          <p className="text-gray-500 dark:text-gray-400">Weekly class schedule</p>
        </div>
        {isAdmin && <Button onClick={() => { if (!classId) { toast.error("Select a class first"); return; } setOpen(true); }}>+ Add Slot</Button>}
      </div>

      <div className="mb-6">
        <LabeledSelect value={classId} onValueChange={setClassId} placeholder="Select class" items={classes?.map((c) => ({ value: c.id, label: c.name })) || []} />
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-gray-400">Loading...</div>
      ) : !timetable?.length ? (
        <div className="bg-white dark:bg-gray-900 rounded-xl border dark:border-gray-800 p-12 text-center text-gray-400">
          {classId ? "No timetable entries for this class" : "Select a class to view timetable"}
        </div>
      ) : (
        <div className="space-y-6">
          {DAYS.map((day) => {
            const slots = timetable.filter((t) => t.dayOfWeek === day).sort((a, b) => a.startTime.localeCompare(b.startTime));
            if (!slots.length) return null;
            return (
              <div key={day}>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">{day.charAt(0) + day.slice(1).toLowerCase()}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                  {slots.map((slot) => (
                    <div key={slot.id} className={`rounded-xl border p-4 ${dayColors[day] || ""}`}>
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="secondary" className="text-xs">{slot.startTime} — {slot.endTime}</Badge>
                        {isAdmin && (
                          <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-red-500" onClick={() => { if (confirm("Delete?")) deleteMut.mutate({ id: slot.id }); }}>×</Button>
                        )}
                      </div>
                      <p className="font-semibold text-gray-900 dark:text-gray-100">{slot.subject}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{slot.teacher.name}</p>
                      {slot.room && <p className="text-xs text-gray-400 mt-1">Room: {slot.room}</p>}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Timetable Slot</DialogTitle></DialogHeader>
          <form onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            createMut.mutate({
              classId,
              dayOfWeek: fd.get("dayOfWeek") as typeof DAYS[number],
              startTime: fd.get("startTime") as string,
              endTime: fd.get("endTime") as string,
              subject: fd.get("subject") as string,
              teacherId: fd.get("teacherId") as string,
              room: (fd.get("room") as string) || undefined,
            });
          }} className="space-y-4">
            <div>
              <Label>Day</Label>
              <select name="dayOfWeek" className="w-full border rounded-lg p-2 dark:bg-gray-800 dark:border-gray-700" required>
                {DAYS.map((d) => <option key={d} value={d}>{d.charAt(0) + d.slice(1).toLowerCase()}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Start Time</Label><Input name="startTime" type="time" required /></div>
              <div><Label>End Time</Label><Input name="endTime" type="time" required /></div>
            </div>
            <div>
              <Label>Subject</Label>
              <select name="subject" className="w-full border rounded-lg p-2 dark:bg-gray-800 dark:border-gray-700" required>
                <option value="">Select subject</option>
                {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <Label>Teacher</Label>
              <select name="teacherId" className="w-full border rounded-lg p-2 dark:bg-gray-800 dark:border-gray-700" required>
                <option value="">Select teacher</option>
                {teachers?.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <div><Label>Room (optional)</Label><Input name="room" placeholder="e.g. Room 101" /></div>
            <Button type="submit" className="w-full" disabled={createMut.isPending}>{createMut.isPending ? "Adding..." : "Add Slot"}</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
