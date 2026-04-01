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

export default function TransportPage() {
  const [vehOpen, setVehOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<string>("");
  const [editingVehicle, setEditingVehicle] = useState<{ id: string; vehicleNumber: string; driverName: string; driverPhone: string; capacity: number; route: string } | null>(null);

  const utils = trpc.useUtils();
  const { data: profile } = trpc.settings.getProfile.useQuery();
  const { data: vehicles, isLoading } = trpc.transport.vehicles.useQuery();
  const { data: students } = trpc.student.list.useQuery();

  const isAdmin = profile?.role === "ADMIN";

  const createVehMut = trpc.transport.createVehicle.useMutation({
    onSuccess: () => { utils.transport.vehicles.invalidate(); setVehOpen(false); setEditingVehicle(null); toast.success("Vehicle saved"); },
    onError: (e) => toast.error(e.message),
  });

  const updateVehMut = trpc.transport.updateVehicle.useMutation({
    onSuccess: () => { utils.transport.vehicles.invalidate(); setVehOpen(false); setEditingVehicle(null); toast.success("Vehicle updated"); },
    onError: (e) => toast.error(e.message),
  });

  const deleteVehMut = trpc.transport.deleteVehicle.useMutation({
    onSuccess: () => { utils.transport.vehicles.invalidate(); toast.success("Deleted"); },
    onError: (e) => toast.error(e.message),
  });

  const assignMut = trpc.transport.assignStudent.useMutation({
    onSuccess: () => { utils.transport.vehicles.invalidate(); setAssignOpen(false); toast.success("Student assigned"); },
    onError: (e) => toast.error(e.message),
  });

  const removeAssignMut = trpc.transport.removeAssignment.useMutation({
    onSuccess: () => { utils.transport.vehicles.invalidate(); toast.success("Removed"); },
    onError: (e) => toast.error(e.message),
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Transport</h1>
          <p className="text-gray-500 dark:text-gray-400">Manage vehicles and student transport assignments</p>
        </div>
        {isAdmin && (
          <div className="flex gap-2">
            <Button onClick={() => { setEditingVehicle(null); setVehOpen(true); }}>+ Add Vehicle</Button>
            <Button variant="outline" onClick={() => setAssignOpen(true)}>Assign Student</Button>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-gray-400">Loading...</div>
      ) : !vehicles?.length ? (
        <div className="bg-white dark:bg-gray-900 rounded-xl border dark:border-gray-800 p-12 text-center text-gray-400">No vehicles added yet</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {vehicles.map((v) => (
            <div key={v.id} className="bg-white dark:bg-gray-900 rounded-xl border dark:border-gray-800 p-5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{v.vehicleNumber}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{v.route}</p>
                </div>
                <Badge variant="secondary">{v.assignments.length}/{v.capacity} seats</Badge>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm mb-4">
                <div><span className="text-gray-500 dark:text-gray-400">Driver:</span> <span className="font-medium">{v.driverName}</span></div>
                <div><span className="text-gray-500 dark:text-gray-400">Phone:</span> <span className="font-medium">{v.driverPhone}</span></div>
              </div>
              {v.assignments.length > 0 && (
                <div className="border-t dark:border-gray-800 pt-3">
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">PASSENGERS</p>
                  <div className="space-y-1">
                    {v.assignments.map((a) => (
                      <div key={a.id} className="flex items-center justify-between text-sm">
                        <span>{a.student.name} <span className="text-gray-400">({a.student.class.name})</span> — {a.stopName}</span>
                        {isAdmin && <Button size="sm" variant="ghost" className="h-5 text-red-500 text-xs p-0" onClick={() => removeAssignMut.mutate({ id: a.id })}>Remove</Button>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {isAdmin && (
                <div className="flex gap-2 mt-4 pt-3 border-t dark:border-gray-800">
                  <Button size="sm" variant="outline" onClick={() => { setEditingVehicle({ id: v.id, vehicleNumber: v.vehicleNumber, driverName: v.driverName, driverPhone: v.driverPhone, capacity: v.capacity, route: v.route }); setVehOpen(true); }}>Edit</Button>
                  <Button size="sm" variant="destructive" onClick={() => { if (confirm("Delete vehicle?")) deleteVehMut.mutate({ id: v.id }); }}>Delete</Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Vehicle Dialog */}
      <Dialog open={vehOpen} onOpenChange={setVehOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editingVehicle ? "Edit Vehicle" : "Add Vehicle"}</DialogTitle></DialogHeader>
          <form onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            const data = {
              vehicleNumber: fd.get("vehicleNumber") as string,
              driverName: fd.get("driverName") as string,
              driverPhone: fd.get("driverPhone") as string,
              capacity: parseInt(fd.get("capacity") as string),
              route: fd.get("route") as string,
            };
            if (editingVehicle) updateVehMut.mutate({ id: editingVehicle.id, ...data });
            else createVehMut.mutate(data);
          }} className="space-y-4">
            <div><Label>Vehicle Number</Label><Input name="vehicleNumber" defaultValue={editingVehicle?.vehicleNumber} required /></div>
            <div><Label>Driver Name</Label><Input name="driverName" defaultValue={editingVehicle?.driverName} required /></div>
            <div><Label>Driver Phone</Label><Input name="driverPhone" defaultValue={editingVehicle?.driverPhone} required /></div>
            <div><Label>Capacity</Label><Input name="capacity" type="number" defaultValue={editingVehicle?.capacity || 30} min={1} required /></div>
            <div><Label>Route</Label><Input name="route" placeholder="e.g. Route A - Downtown" defaultValue={editingVehicle?.route} required /></div>
            <Button type="submit" className="w-full">{editingVehicle ? "Update" : "Add Vehicle"}</Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Assign Student Dialog */}
      <Dialog open={assignOpen} onOpenChange={setAssignOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Assign Student to Vehicle</DialogTitle></DialogHeader>
          <form onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            assignMut.mutate({
              vehicleId: fd.get("vehicleId") as string,
              studentId: fd.get("studentId") as string,
              stopName: fd.get("stopName") as string,
            });
          }} className="space-y-4">
            <div>
              <Label>Vehicle</Label>
              <select name="vehicleId" className="w-full border rounded-lg p-2 dark:bg-gray-800 dark:border-gray-700" required>
                <option value="">Select vehicle</option>
                {vehicles?.map((v) => <option key={v.id} value={v.id}>{v.vehicleNumber} — {v.route}</option>)}
              </select>
            </div>
            <div>
              <Label>Student</Label>
              <select name="studentId" className="w-full border rounded-lg p-2 dark:bg-gray-800 dark:border-gray-700" required>
                <option value="">Select student</option>
                {students?.map((s) => <option key={s.id} value={s.id}>{s.name} ({s.rollNumber})</option>)}
              </select>
            </div>
            <div><Label>Stop Name</Label><Input name="stopName" placeholder="e.g. Main Gate, Block A" required /></div>
            <Button type="submit" className="w-full" disabled={assignMut.isPending}>{assignMut.isPending ? "Assigning..." : "Assign"}</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
