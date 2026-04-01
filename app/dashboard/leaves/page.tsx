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

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
  APPROVED: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
  REJECTED: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
};

export default function LeavesPage() {
  const [open, setOpen] = useState(false);

  const utils = trpc.useUtils();
  const { data: profile } = trpc.settings.getProfile.useQuery();
  const { data: leaves, isLoading } = trpc.leave.list.useQuery();

  const isAdmin = profile?.role === "ADMIN";
  const isTeacher = profile?.role === "TEACHER";

  const createMut = trpc.leave.create.useMutation({
    onSuccess: () => { utils.leave.list.invalidate(); setOpen(false); toast.success("Leave request submitted"); },
    onError: (e) => toast.error(e.message),
  });

  const updateStatusMut = trpc.leave.updateStatus.useMutation({
    onSuccess: () => { utils.leave.list.invalidate(); toast.success("Status updated"); },
    onError: (e) => toast.error(e.message),
  });

  const deleteMut = trpc.leave.delete.useMutation({
    onSuccess: () => { utils.leave.list.invalidate(); toast.success("Deleted"); },
    onError: (e) => toast.error(e.message),
  });

  function getDays(start: Date | string, end: Date | string) {
    const diff = new Date(end).getTime() - new Date(start).getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Leave Management</h1>
          <p className="text-gray-500 dark:text-gray-400">{isAdmin ? "Review and manage leave requests" : "Submit and track leave requests"}</p>
        </div>
        {(isTeacher || isAdmin) && <Button onClick={() => setOpen(true)}>+ Request Leave</Button>}
      </div>

      {/* Stats */}
      {isAdmin && leaves && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-yellow-50 dark:bg-yellow-950 rounded-xl border border-yellow-200 dark:border-yellow-800 p-4 text-center">
            <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">{leaves.filter((l) => l.status === "PENDING").length}</p>
            <p className="text-sm text-yellow-600 dark:text-yellow-400">Pending</p>
          </div>
          <div className="bg-green-50 dark:bg-green-950 rounded-xl border border-green-200 dark:border-green-800 p-4 text-center">
            <p className="text-2xl font-bold text-green-700 dark:text-green-300">{leaves.filter((l) => l.status === "APPROVED").length}</p>
            <p className="text-sm text-green-600 dark:text-green-400">Approved</p>
          </div>
          <div className="bg-red-50 dark:bg-red-950 rounded-xl border border-red-200 dark:border-red-800 p-4 text-center">
            <p className="text-2xl font-bold text-red-700 dark:text-red-300">{leaves.filter((l) => l.status === "REJECTED").length}</p>
            <p className="text-sm text-red-600 dark:text-red-400">Rejected</p>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-900 rounded-xl border dark:border-gray-800">
        <Table>
          <TableHeader>
            <TableRow>
              {isAdmin && <TableHead>Requester</TableHead>}
              <TableHead>From</TableHead>
              <TableHead>To</TableHead>
              <TableHead>Days</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={7} className="text-center py-8 text-gray-400">Loading...</TableCell></TableRow>
            ) : !leaves?.length ? (
              <TableRow><TableCell colSpan={7} className="text-center py-8 text-gray-400">No leave requests</TableCell></TableRow>
            ) : (
              leaves.map((l) => (
                <TableRow key={l.id}>
                  {isAdmin && <TableCell className="font-medium">{l.user.name} <Badge variant="outline" className="ml-1">{l.user.role}</Badge></TableCell>}
                  <TableCell>{new Date(l.startDate).toLocaleDateString()}</TableCell>
                  <TableCell>{new Date(l.endDate).toLocaleDateString()}</TableCell>
                  <TableCell className="font-semibold">{getDays(l.startDate, l.endDate)}</TableCell>
                  <TableCell className="max-w-[200px] truncate">{l.reason}</TableCell>
                  <TableCell><span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusColors[l.status]}`}>{l.status}</span></TableCell>
                  <TableCell className="text-right space-x-1">
                    {isAdmin && l.status === "PENDING" && (
                      <>
                        <Button size="sm" variant="outline" className="text-green-600" onClick={() => updateStatusMut.mutate({ id: l.id, status: "APPROVED" })}>Approve</Button>
                        <Button size="sm" variant="outline" className="text-red-600" onClick={() => updateStatusMut.mutate({ id: l.id, status: "REJECTED" })}>Reject</Button>
                      </>
                    )}
                    <Button size="sm" variant="destructive" onClick={() => { if (confirm("Delete?")) deleteMut.mutate({ id: l.id }); }}>Delete</Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Request Leave</DialogTitle></DialogHeader>
          <form onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            createMut.mutate({
              startDate: fd.get("startDate") as string,
              endDate: fd.get("endDate") as string,
              reason: fd.get("reason") as string,
            });
          }} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>From</Label><Input name="startDate" type="date" required /></div>
              <div><Label>To</Label><Input name="endDate" type="date" required /></div>
            </div>
            <div><Label>Reason</Label><Textarea name="reason" placeholder="Reason for leave..." required /></div>
            <Button type="submit" className="w-full" disabled={createMut.isPending}>{createMut.isPending ? "Submitting..." : "Submit Request"}</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
