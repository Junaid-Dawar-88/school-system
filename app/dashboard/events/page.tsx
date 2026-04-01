"use client";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

const typeColors: Record<string, string> = {
  HOLIDAY: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
  EVENT: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  MEETING: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
  EXAM_SCHEDULE: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
};

export default function EventsPage() {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<{ id: string; title: string; description: string | null; startDate: Date; endDate: Date; type: string } | null>(null);

  const utils = trpc.useUtils();
  const { data: profile } = trpc.settings.getProfile.useQuery();
  const { data: events, isLoading } = trpc.event.list.useQuery();

  const isAdmin = profile?.role === "ADMIN";

  const createMut = trpc.event.create.useMutation({
    onSuccess: () => { utils.event.list.invalidate(); setOpen(false); setEditing(null); toast.success("Event created"); },
    onError: (e) => toast.error(e.message),
  });

  const updateMut = trpc.event.update.useMutation({
    onSuccess: () => { utils.event.list.invalidate(); setOpen(false); setEditing(null); toast.success("Updated"); },
    onError: (e) => toast.error(e.message),
  });

  const deleteMut = trpc.event.delete.useMutation({
    onSuccess: () => { utils.event.list.invalidate(); toast.success("Deleted"); },
    onError: (e) => toast.error(e.message),
  });

  const upcoming = events?.filter((e) => new Date(e.startDate) >= new Date()) || [];
  const past = events?.filter((e) => new Date(e.startDate) < new Date()) || [];

  function formatDateRange(start: Date | string, end: Date | string) {
    const s = new Date(start);
    const e = new Date(end);
    if (s.toDateString() === e.toDateString()) return s.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
    return `${s.toLocaleDateString("en-US", { month: "short", day: "numeric" })} — ${e.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Events & Calendar</h1>
          <p className="text-gray-500 dark:text-gray-400">School events, holidays, and meetings</p>
        </div>
        {isAdmin && <Button onClick={() => { setEditing(null); setOpen(true); }}>+ Add Event</Button>}
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-gray-400">Loading...</div>
      ) : (
        <div className="space-y-8">
          {/* Upcoming */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Upcoming Events ({upcoming.length})</h2>
            {!upcoming.length ? (
              <div className="bg-white dark:bg-gray-900 rounded-xl border dark:border-gray-800 p-8 text-center text-gray-400">No upcoming events</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {upcoming.map((ev) => (
                  <div key={ev.id} className="bg-white dark:bg-gray-900 rounded-xl border dark:border-gray-800 p-5 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${typeColors[ev.type] || ""}`}>{ev.type.replace("_", " ")}</span>
                      {isAdmin && (
                        <div className="flex gap-1">
                          <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={() => { setEditing({ ...ev, description: ev.description }); setOpen(true); }}>&#9998;</Button>
                          <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-red-500" onClick={() => { if (confirm("Delete?")) deleteMut.mutate({ id: ev.id }); }}>×</Button>
                        </div>
                      )}
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">{ev.title}</h3>
                    {ev.description && <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{ev.description}</p>}
                    <p className="text-sm font-medium text-blue-600 dark:text-blue-400">{formatDateRange(ev.startDate, ev.endDate)}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Past */}
          {past.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-500 dark:text-gray-400 mb-4">Past Events ({past.length})</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {past.map((ev) => (
                  <div key={ev.id} className="bg-gray-50 dark:bg-gray-800/50 rounded-xl border dark:border-gray-800 p-5 opacity-70">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${typeColors[ev.type] || ""}`}>{ev.type.replace("_", " ")}</span>
                    <h3 className="font-semibold text-gray-700 dark:text-gray-300 mt-2 mb-1">{ev.title}</h3>
                    <p className="text-sm text-gray-500">{formatDateRange(ev.startDate, ev.endDate)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? "Edit Event" : "Add Event"}</DialogTitle></DialogHeader>
          <form onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            const data = {
              title: fd.get("title") as string,
              description: (fd.get("description") as string) || undefined,
              startDate: fd.get("startDate") as string,
              endDate: fd.get("endDate") as string,
              type: fd.get("type") as "HOLIDAY" | "EVENT" | "MEETING" | "EXAM_SCHEDULE",
            };
            if (editing) updateMut.mutate({ id: editing.id, ...data });
            else createMut.mutate(data);
          }} className="space-y-4">
            <div><Label>Title</Label><Input name="title" defaultValue={editing?.title} required /></div>
            <div><Label>Description</Label><Textarea name="description" defaultValue={editing?.description || ""} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Start Date</Label><Input name="startDate" type="date" defaultValue={editing ? new Date(editing.startDate).toISOString().split("T")[0] : ""} required /></div>
              <div><Label>End Date</Label><Input name="endDate" type="date" defaultValue={editing ? new Date(editing.endDate).toISOString().split("T")[0] : ""} required /></div>
            </div>
            <div>
              <Label>Type</Label>
              <select name="type" className="w-full border rounded-lg p-2 dark:bg-gray-800 dark:border-gray-700" defaultValue={editing?.type || "EVENT"} required>
                <option value="EVENT">Event</option>
                <option value="HOLIDAY">Holiday</option>
                <option value="MEETING">Meeting</option>
                <option value="EXAM_SCHEDULE">Exam Schedule</option>
              </select>
            </div>
            <Button type="submit" className="w-full">{editing ? "Update" : "Create Event"}</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
