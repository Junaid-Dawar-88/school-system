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

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

export default function SalaryPage() {
  const [open, setOpen] = useState(false);
  const [monthFilter, setMonthFilter] = useState<number>(new Date().getMonth() + 1);
  const [yearFilter, setYearFilter] = useState<number>(new Date().getFullYear());

  const utils = trpc.useUtils();
  const { data: salaries, isLoading } = trpc.salary.list.useQuery({ month: monthFilter, year: yearFilter });
  const { data: teachers } = trpc.teacher.list.useQuery();

  const createMut = trpc.salary.create.useMutation({
    onSuccess: () => { utils.salary.list.invalidate(); setOpen(false); toast.success("Salary record created"); },
    onError: (e) => toast.error(e.message),
  });

  const markPaidMut = trpc.salary.markPaid.useMutation({
    onSuccess: () => { utils.salary.list.invalidate(); toast.success("Marked as paid"); },
    onError: (e) => toast.error(e.message),
  });

  const deleteMut = trpc.salary.delete.useMutation({
    onSuccess: () => { utils.salary.list.invalidate(); toast.success("Deleted"); },
    onError: (e) => toast.error(e.message),
  });

  const totalAmount = salaries?.reduce((sum, s) => sum + s.amount, 0) || 0;
  const totalPaid = salaries?.filter((s) => s.status === "PAID").reduce((sum, s) => sum + s.amount, 0) || 0;
  const totalPending = totalAmount - totalPaid;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Salary & Payroll</h1>
          <p className="text-gray-500 dark:text-gray-400">Manage teacher salaries</p>
        </div>
        <Button onClick={() => setOpen(true)}>+ Add Salary Record</Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 dark:bg-blue-950 rounded-xl border border-blue-200 dark:border-blue-800 p-4 text-center">
          <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">Rs. {totalAmount.toLocaleString()}</p>
          <p className="text-sm text-blue-600 dark:text-blue-400">Total Payroll</p>
        </div>
        <div className="bg-green-50 dark:bg-green-950 rounded-xl border border-green-200 dark:border-green-800 p-4 text-center">
          <p className="text-2xl font-bold text-green-700 dark:text-green-300">Rs. {totalPaid.toLocaleString()}</p>
          <p className="text-sm text-green-600 dark:text-green-400">Paid</p>
        </div>
        <div className="bg-yellow-50 dark:bg-yellow-950 rounded-xl border border-yellow-200 dark:border-yellow-800 p-4 text-center">
          <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">Rs. {totalPending.toLocaleString()}</p>
          <p className="text-sm text-yellow-600 dark:text-yellow-400">Pending</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-4">
        <select value={monthFilter} onChange={(e) => setMonthFilter(parseInt(e.target.value))} className="border rounded-lg p-2 dark:bg-gray-800 dark:border-gray-700">
          {MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
        </select>
        <Input type="number" value={yearFilter} onChange={(e) => setYearFilter(parseInt(e.target.value))} className="w-24" />
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl border dark:border-gray-800">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Teacher</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Month/Year</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Paid Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={7} className="text-center py-8 text-gray-400">Loading...</TableCell></TableRow>
            ) : !salaries?.length ? (
              <TableRow><TableCell colSpan={7} className="text-center py-8 text-gray-400">No salary records for this period</TableCell></TableRow>
            ) : (
              salaries.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">{s.user.name}</TableCell>
                  <TableCell className="text-gray-500">{s.user.email}</TableCell>
                  <TableCell className="font-semibold">Rs. {s.amount.toLocaleString()}</TableCell>
                  <TableCell>{MONTHS[s.month - 1]} {s.year}</TableCell>
                  <TableCell>
                    <Badge className={s.status === "PAID" ? "bg-green-600" : "bg-yellow-600"}>{s.status}</Badge>
                  </TableCell>
                  <TableCell>{s.paidDate ? new Date(s.paidDate).toLocaleDateString() : "—"}</TableCell>
                  <TableCell className="text-right space-x-1">
                    {s.status !== "PAID" && (
                      <Button size="sm" variant="outline" className="text-green-600" onClick={() => markPaidMut.mutate({ id: s.id })}>Mark Paid</Button>
                    )}
                    <Button size="sm" variant="destructive" onClick={() => { if (confirm("Delete?")) deleteMut.mutate({ id: s.id }); }}>Delete</Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Salary Record</DialogTitle></DialogHeader>
          <form onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            createMut.mutate({
              userId: fd.get("userId") as string,
              amount: parseFloat(fd.get("amount") as string),
              month: parseInt(fd.get("month") as string),
              year: parseInt(fd.get("year") as string),
            });
          }} className="space-y-4">
            <div>
              <Label>Teacher</Label>
              <select name="userId" className="w-full border rounded-lg p-2 dark:bg-gray-800 dark:border-gray-700" required>
                <option value="">Select teacher</option>
                {teachers?.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <div><Label>Amount (Rs.)</Label><Input name="amount" type="number" placeholder="50000" required /></div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Month</Label>
                <select name="month" className="w-full border rounded-lg p-2 dark:bg-gray-800 dark:border-gray-700" defaultValue={new Date().getMonth() + 1} required>
                  {MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
                </select>
              </div>
              <div><Label>Year</Label><Input name="year" type="number" defaultValue={new Date().getFullYear()} required /></div>
            </div>
            <Button type="submit" className="w-full" disabled={createMut.isPending}>{createMut.isPending ? "Creating..." : "Create Record"}</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
