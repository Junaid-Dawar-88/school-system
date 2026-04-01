"use client";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LabeledSelect } from "@/compnent/select-display";

export default function FeesPage() {
  const [feeOpen, setFeeOpen] = useState(false);
  const [payOpen, setPayOpen] = useState(false);
  const [selectedFee, setSelectedFee] = useState<string>("");

  const utils = trpc.useUtils();
  const { data: profile } = trpc.settings.getProfile.useQuery();
  const { data: classes } = trpc.class.list.useQuery();
  const { data: fees, isLoading } = trpc.fee.list.useQuery();
  const { data: students } = trpc.student.list.useQuery();
  const { data: payments } = trpc.fee.payments.useQuery({});

  const isAdmin = profile?.role === "ADMIN";

  const createMut = trpc.fee.create.useMutation({
    onSuccess: () => { utils.fee.list.invalidate(); setFeeOpen(false); toast.success("Fee created"); },
    onError: (e) => toast.error(e.message),
  });

  const deleteMut = trpc.fee.delete.useMutation({
    onSuccess: () => { utils.fee.list.invalidate(); toast.success("Deleted"); },
    onError: (e) => toast.error(e.message),
  });

  const payMut = trpc.fee.recordPayment.useMutation({
    onSuccess: () => { utils.fee.payments.invalidate(); utils.fee.list.invalidate(); setPayOpen(false); toast.success("Payment recorded"); },
    onError: (e) => toast.error(e.message),
  });

  const statusColor: Record<string, string> = { PAID: "text-green-600", PENDING: "text-yellow-600", PARTIAL: "text-blue-600", OVERDUE: "text-red-600" };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Fee Management</h1>
          <p className="text-gray-500 dark:text-gray-400">Manage fee structures and payments</p>
        </div>
        {isAdmin && (
          <div className="flex gap-2">
            <Button onClick={() => setFeeOpen(true)}>+ Create Fee</Button>
            <Button variant="outline" onClick={() => setPayOpen(true)}>Record Payment</Button>
          </div>
        )}
      </div>

      <Tabs defaultValue="fees">
        <TabsList className="mb-4">
          <TabsTrigger value="fees">Fee Structures</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
        </TabsList>

        <TabsContent value="fees">
          <div className="bg-white dark:bg-gray-900 rounded-xl border dark:border-gray-800">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Payments</TableHead>
                  {isAdmin && <TableHead className="text-right">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow><TableCell colSpan={6} className="text-center py-8 text-gray-400">Loading...</TableCell></TableRow>
                ) : !fees?.length ? (
                  <TableRow><TableCell colSpan={6} className="text-center py-8 text-gray-400">No fees yet</TableCell></TableRow>
                ) : (
                  fees.map((f) => (
                    <TableRow key={f.id}>
                      <TableCell className="font-medium">{f.title}</TableCell>
                      <TableCell><Badge variant="secondary">{f.class.name}</Badge></TableCell>
                      <TableCell className="font-semibold">Rs. {f.amount.toLocaleString()}</TableCell>
                      <TableCell>{new Date(f.dueDate).toLocaleDateString()}</TableCell>
                      <TableCell><Badge variant="outline">{f.payments.length} paid</Badge></TableCell>
                      {isAdmin && (
                        <TableCell className="text-right">
                          <Button size="sm" variant="destructive" onClick={() => { if (confirm("Delete?")) deleteMut.mutate({ id: f.id }); }}>Delete</Button>
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="payments">
          <div className="bg-white dark:bg-gray-900 rounded-xl border dark:border-gray-800">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Fee</TableHead>
                  <TableHead>Amount Paid</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Receipt</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {!payments?.length ? (
                  <TableRow><TableCell colSpan={6} className="text-center py-8 text-gray-400">No payments yet</TableCell></TableRow>
                ) : (
                  payments.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">{p.student.name}</TableCell>
                      <TableCell>{p.fee.title}</TableCell>
                      <TableCell className="font-semibold">Rs. {p.amountPaid.toLocaleString()}</TableCell>
                      <TableCell className={`font-semibold ${statusColor[p.status] || ""}`}>{p.status}</TableCell>
                      <TableCell className="font-mono text-xs">{p.receiptNumber || "—"}</TableCell>
                      <TableCell>{new Date(p.paidDate).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>

      {/* Create Fee Dialog */}
      <Dialog open={feeOpen} onOpenChange={setFeeOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Create Fee</DialogTitle></DialogHeader>
          <form onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            createMut.mutate({
              title: fd.get("title") as string,
              amount: parseFloat(fd.get("amount") as string),
              dueDate: fd.get("dueDate") as string,
              classId: fd.get("classId") as string,
            });
          }} className="space-y-4">
            <div><Label>Title</Label><Input name="title" placeholder="e.g. Monthly Fee - January" required /></div>
            <div><Label>Amount (Rs.)</Label><Input name="amount" type="number" placeholder="5000" required /></div>
            <div><Label>Due Date</Label><Input name="dueDate" type="date" required /></div>
            <div>
              <Label>Class</Label>
              <select name="classId" className="w-full border rounded-lg p-2 dark:bg-gray-800 dark:border-gray-700" required>
                <option value="">Select class</option>
                {classes?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <Button type="submit" className="w-full" disabled={createMut.isPending}>{createMut.isPending ? "Creating..." : "Create Fee"}</Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Record Payment Dialog */}
      <Dialog open={payOpen} onOpenChange={setPayOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Record Payment</DialogTitle></DialogHeader>
          <form onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            payMut.mutate({
              feeId: fd.get("feeId") as string,
              studentId: fd.get("studentId") as string,
              amountPaid: parseFloat(fd.get("amountPaid") as string),
              status: fd.get("status") as "PAID" | "PARTIAL" | "PENDING" | "OVERDUE",
            });
          }} className="space-y-4">
            <div>
              <Label>Fee</Label>
              <select name="feeId" className="w-full border rounded-lg p-2 dark:bg-gray-800 dark:border-gray-700" required>
                <option value="">Select fee</option>
                {fees?.map((f) => <option key={f.id} value={f.id}>{f.title} — Rs. {f.amount}</option>)}
              </select>
            </div>
            <div>
              <Label>Student</Label>
              <select name="studentId" className="w-full border rounded-lg p-2 dark:bg-gray-800 dark:border-gray-700" required>
                <option value="">Select student</option>
                {students?.map((s) => <option key={s.id} value={s.id}>{s.name} ({s.rollNumber})</option>)}
              </select>
            </div>
            <div><Label>Amount Paid (Rs.)</Label><Input name="amountPaid" type="number" required /></div>
            <div>
              <Label>Status</Label>
              <select name="status" className="w-full border rounded-lg p-2 dark:bg-gray-800 dark:border-gray-700" required>
                <option value="PAID">Paid</option>
                <option value="PARTIAL">Partial</option>
                <option value="PENDING">Pending</option>
                <option value="OVERDUE">Overdue</option>
              </select>
            </div>
            <Button type="submit" className="w-full" disabled={payMut.isPending}>{payMut.isPending ? "Recording..." : "Record Payment"}</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
