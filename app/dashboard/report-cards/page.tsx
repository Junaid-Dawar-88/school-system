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
import { LabeledSelect } from "@/compnent/select-display";

export default function ReportCardsPage() {
  const [open, setOpen] = useState(false);
  const [classId, setClassId] = useState("");
  const [term, setTerm] = useState("");
  const [year, setYear] = useState(new Date().getFullYear().toString());

  const utils = trpc.useUtils();
  const { data: profile } = trpc.settings.getProfile.useQuery();
  const { data: classes } = trpc.class.list.useQuery();
  const { data: reportCards, isLoading } = trpc.reportCard.list.useQuery({
    classId: classId || undefined,
    term: term || undefined,
    year: year ? parseInt(year) : undefined,
  });

  const isAdmin = profile?.role === "ADMIN";

  const generateMut = trpc.reportCard.generate.useMutation({
    onSuccess: (data) => { utils.reportCard.list.invalidate(); setOpen(false); toast.success(`Generated ${data.count} report cards`); },
    onError: (e) => toast.error(e.message),
  });

  const deleteMut = trpc.reportCard.delete.useMutation({
    onSuccess: () => { utils.reportCard.list.invalidate(); toast.success("Deleted"); },
    onError: (e) => toast.error(e.message),
  });

  function getGradeColor(pct: number) {
    if (pct >= 80) return "text-green-600";
    if (pct >= 60) return "text-blue-600";
    if (pct >= 40) return "text-yellow-600";
    return "text-red-600";
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Report Cards</h1>
          <p className="text-gray-500 dark:text-gray-400">View and generate student report cards</p>
        </div>
        {isAdmin && <Button onClick={() => setOpen(true)}>Generate Report Cards</Button>}
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        <LabeledSelect value={classId} onValueChange={setClassId} placeholder="Filter by class" items={classes?.map((c) => ({ value: c.id, label: c.name })) || []} />
        <LabeledSelect value={term} onValueChange={setTerm} placeholder="Term" items={[{ value: "1st Term", label: "1st Term" }, { value: "2nd Term", label: "2nd Term" }, { value: "3rd Term", label: "3rd Term" }, { value: "Final", label: "Final" }]} />
        <Input type="number" placeholder="Year" className="w-24" value={year} onChange={(e) => setYear(e.target.value)} />
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl border dark:border-gray-800">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student</TableHead>
              <TableHead>Class</TableHead>
              <TableHead>Term</TableHead>
              <TableHead>Year</TableHead>
              <TableHead>Score</TableHead>
              <TableHead>Percentage</TableHead>
              <TableHead>Rank</TableHead>
              {isAdmin && <TableHead className="text-right">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={8} className="text-center py-8 text-gray-400">Loading...</TableCell></TableRow>
            ) : !reportCards?.length ? (
              <TableRow><TableCell colSpan={8} className="text-center py-8 text-gray-400">No report cards yet</TableCell></TableRow>
            ) : (
              reportCards.map((rc) => (
                <TableRow key={rc.id}>
                  <TableCell className="font-medium">{rc.student.name} <Badge variant="outline" className="font-mono ml-1">{rc.student.rollNumber}</Badge></TableCell>
                  <TableCell><Badge variant="secondary">{rc.class.name}</Badge></TableCell>
                  <TableCell>{rc.term}</TableCell>
                  <TableCell>{rc.year}</TableCell>
                  <TableCell className="font-semibold">{rc.totalScore}/{rc.maxTotal}</TableCell>
                  <TableCell className={`font-bold ${getGradeColor(rc.percentage)}`}>{rc.percentage}%</TableCell>
                  <TableCell>{rc.rank ? `#${rc.rank}` : "—"}</TableCell>
                  {isAdmin && (
                    <TableCell className="text-right">
                      <Button size="sm" variant="destructive" onClick={() => { if (confirm("Delete?")) deleteMut.mutate({ id: rc.id }); }}>Delete</Button>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Generate Report Cards</DialogTitle></DialogHeader>
          <form onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            const cId = fd.get("classId") as string;
            const t = fd.get("term") as string;
            const y = parseInt(fd.get("year") as string);
            if (!cId || !t || !y) { toast.error("All fields required"); return; }
            generateMut.mutate({ classId: cId, term: t, year: y });
          }} className="space-y-4">
            <div>
              <Label>Class</Label>
              <LabeledSelect value="" onValueChange={() => {}} placeholder="Select class" items={classes?.map((c) => ({ value: c.id, label: c.name })) || []} />
              <input type="hidden" name="classId" value={classId} />
            </div>
            <div>
              <Label>Term</Label>
              <select name="term" className="w-full border rounded-lg p-2 dark:bg-gray-800 dark:border-gray-700" required>
                <option value="">Select term</option>
                <option value="1st Term">1st Term</option>
                <option value="2nd Term">2nd Term</option>
                <option value="3rd Term">3rd Term</option>
                <option value="Final">Final</option>
              </select>
            </div>
            <div>
              <Label>Year</Label>
              <Input name="year" type="number" defaultValue={new Date().getFullYear()} required />
            </div>
            <Button type="submit" className="w-full" disabled={generateMut.isPending}>
              {generateMut.isPending ? "Generating..." : "Generate"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
