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

export default function LibraryPage() {
  const [bookOpen, setBookOpen] = useState(false);
  const [issueOpen, setIssueOpen] = useState(false);
  const [search, setSearch] = useState("");

  const utils = trpc.useUtils();
  const { data: profile } = trpc.settings.getProfile.useQuery();
  const { data: books, isLoading } = trpc.library.books.useQuery();
  const { data: issues } = trpc.library.issues.useQuery();
  const { data: students } = trpc.student.list.useQuery();

  const isAdmin = profile?.role === "ADMIN";

  const addBookMut = trpc.library.addBook.useMutation({
    onSuccess: () => { utils.library.books.invalidate(); setBookOpen(false); toast.success("Book added"); },
    onError: (e) => toast.error(e.message),
  });

  const deleteBookMut = trpc.library.deleteBook.useMutation({
    onSuccess: () => { utils.library.books.invalidate(); toast.success("Deleted"); },
    onError: (e) => toast.error(e.message),
  });

  const issueMut = trpc.library.issueBook.useMutation({
    onSuccess: () => { utils.library.books.invalidate(); utils.library.issues.invalidate(); setIssueOpen(false); toast.success("Book issued"); },
    onError: (e) => toast.error(e.message),
  });

  const returnMut = trpc.library.returnBook.useMutation({
    onSuccess: () => { utils.library.books.invalidate(); utils.library.issues.invalidate(); toast.success("Book returned"); },
    onError: (e) => toast.error(e.message),
  });

  const filteredBooks = books?.filter((b) =>
    !search || b.title.toLowerCase().includes(search.toLowerCase()) || b.author.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Library</h1>
          <p className="text-gray-500 dark:text-gray-400">Manage books and track issues</p>
        </div>
        {isAdmin && (
          <div className="flex gap-2">
            <Button onClick={() => setBookOpen(true)}>+ Add Book</Button>
            <Button variant="outline" onClick={() => setIssueOpen(true)}>Issue Book</Button>
          </div>
        )}
      </div>

      <Input placeholder="Search books..." value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-sm mb-4" />

      <Tabs defaultValue="books">
        <TabsList className="mb-4">
          <TabsTrigger value="books">Books ({books?.length || 0})</TabsTrigger>
          <TabsTrigger value="issues">Issues ({issues?.filter((i) => !i.returnDate).length || 0} active)</TabsTrigger>
        </TabsList>

        <TabsContent value="books">
          <div className="bg-white dark:bg-gray-900 rounded-xl border dark:border-gray-800">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Author</TableHead>
                  <TableHead>ISBN</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Available</TableHead>
                  <TableHead>Issued To</TableHead>
                  {isAdmin && <TableHead className="text-right">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow><TableCell colSpan={7} className="text-center py-8 text-gray-400">Loading...</TableCell></TableRow>
                ) : !filteredBooks?.length ? (
                  <TableRow><TableCell colSpan={7} className="text-center py-8 text-gray-400">No books found</TableCell></TableRow>
                ) : (
                  filteredBooks.map((b) => (
                    <TableRow key={b.id}>
                      <TableCell className="font-medium">{b.title}</TableCell>
                      <TableCell>{b.author}</TableCell>
                      <TableCell className="font-mono text-xs">{b.isbn || "—"}</TableCell>
                      <TableCell>{b.category ? <Badge variant="secondary">{b.category}</Badge> : "—"}</TableCell>
                      <TableCell>
                        <span className={b.availableCopies > 0 ? "text-green-600 font-semibold" : "text-red-600 font-semibold"}>
                          {b.availableCopies}/{b.totalCopies}
                        </span>
                      </TableCell>
                      <TableCell>
                        {b.issues.length > 0 ? b.issues.map((i) => <Badge key={i.student.name} variant="outline" className="mr-1">{i.student.name}</Badge>) : "—"}
                      </TableCell>
                      {isAdmin && (
                        <TableCell className="text-right">
                          <Button size="sm" variant="destructive" onClick={() => { if (confirm("Delete?")) deleteBookMut.mutate({ id: b.id }); }}>Delete</Button>
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="issues">
          <div className="bg-white dark:bg-gray-900 rounded-xl border dark:border-gray-800">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Book</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead>Issue Date</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Fine</TableHead>
                  {isAdmin && <TableHead className="text-right">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {!issues?.length ? (
                  <TableRow><TableCell colSpan={7} className="text-center py-8 text-gray-400">No issues</TableCell></TableRow>
                ) : (
                  issues.map((i) => (
                    <TableRow key={i.id}>
                      <TableCell className="font-medium">{i.book.title}</TableCell>
                      <TableCell>{i.student.name}</TableCell>
                      <TableCell>{new Date(i.issueDate).toLocaleDateString()}</TableCell>
                      <TableCell className={!i.returnDate && new Date(i.dueDate) < new Date() ? "text-red-600 font-semibold" : ""}>{new Date(i.dueDate).toLocaleDateString()}</TableCell>
                      <TableCell>
                        {i.returnDate ? <Badge className="bg-green-600">Returned</Badge> : <Badge className="bg-yellow-600">Issued</Badge>}
                      </TableCell>
                      <TableCell>{i.fine ? `Rs. ${i.fine}` : "—"}</TableCell>
                      {isAdmin && (
                        <TableCell className="text-right">
                          {!i.returnDate && (
                            <Button size="sm" variant="outline" onClick={() => {
                              const fine = new Date(i.dueDate) < new Date() ? prompt("Enter fine amount (or 0):") : "0";
                              if (fine !== null) returnMut.mutate({ issueId: i.id, fine: parseFloat(fine) || 0 });
                            }}>Return</Button>
                          )}
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>

      {/* Add Book Dialog */}
      <Dialog open={bookOpen} onOpenChange={setBookOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Book</DialogTitle></DialogHeader>
          <form onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            addBookMut.mutate({
              title: fd.get("title") as string,
              author: fd.get("author") as string,
              isbn: (fd.get("isbn") as string) || undefined,
              category: (fd.get("category") as string) || undefined,
              totalCopies: parseInt(fd.get("totalCopies") as string) || 1,
            });
          }} className="space-y-4">
            <div><Label>Title</Label><Input name="title" required /></div>
            <div><Label>Author</Label><Input name="author" required /></div>
            <div><Label>ISBN</Label><Input name="isbn" /></div>
            <div><Label>Category</Label><Input name="category" placeholder="e.g. Fiction, Science, History" /></div>
            <div><Label>Total Copies</Label><Input name="totalCopies" type="number" defaultValue={1} min={1} /></div>
            <Button type="submit" className="w-full" disabled={addBookMut.isPending}>{addBookMut.isPending ? "Adding..." : "Add Book"}</Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Issue Book Dialog */}
      <Dialog open={issueOpen} onOpenChange={setIssueOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Issue Book</DialogTitle></DialogHeader>
          <form onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            issueMut.mutate({
              bookId: fd.get("bookId") as string,
              studentId: fd.get("studentId") as string,
              dueDate: fd.get("dueDate") as string,
            });
          }} className="space-y-4">
            <div>
              <Label>Book</Label>
              <select name="bookId" className="w-full border rounded-lg p-2 dark:bg-gray-800 dark:border-gray-700" required>
                <option value="">Select book</option>
                {books?.filter((b) => b.availableCopies > 0).map((b) => <option key={b.id} value={b.id}>{b.title} ({b.availableCopies} available)</option>)}
              </select>
            </div>
            <div>
              <Label>Student</Label>
              <select name="studentId" className="w-full border rounded-lg p-2 dark:bg-gray-800 dark:border-gray-700" required>
                <option value="">Select student</option>
                {students?.map((s) => <option key={s.id} value={s.id}>{s.name} ({s.rollNumber})</option>)}
              </select>
            </div>
            <div><Label>Due Date</Label><Input name="dueDate" type="date" required /></div>
            <Button type="submit" className="w-full" disabled={issueMut.isPending}>{issueMut.isPending ? "Issuing..." : "Issue Book"}</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
