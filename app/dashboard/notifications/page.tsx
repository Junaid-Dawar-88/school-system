"use client";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export default function NotificationsPage() {
  const utils = trpc.useUtils();
  const { data: notifications, isLoading } = trpc.notification.list.useQuery();

  const invalidateAll = () => { utils.notification.list.invalidate(); utils.notification.unreadCount.invalidate(); };

  const markRead = trpc.notification.markRead.useMutation({ onSuccess: invalidateAll });
  const markAll = trpc.notification.markAllRead.useMutation({ onSuccess: invalidateAll });
  const deleteMut = trpc.notification.delete.useMutation({ onSuccess: () => { invalidateAll(); toast.success("Notification deleted"); } });
  const deleteAllMut = trpc.notification.deleteAll.useMutation({ onSuccess: () => { invalidateAll(); toast.success("All notifications deleted"); } });

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-2xl font-bold">Notifications</h1><p className="text-gray-500 dark:text-gray-400">Stay updated</p></div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => markAll.mutate()} disabled={markAll.isPending}>Mark All Read</Button>
          <Button variant="destructive" onClick={() => { if (confirm("Delete all notifications?")) deleteAllMut.mutate(); }} disabled={deleteAllMut.isPending}>Delete All</Button>
        </div>
      </div>
      {isLoading ? <p className="text-gray-400">Loading...</p>
      : !notifications?.length ? <div className="bg-white dark:bg-gray-900 rounded-xl border dark:border-gray-800 p-12 text-center text-gray-400">No notifications</div>
      : <div className="space-y-3">{notifications.map((n) => (
        <Card key={n.id} className={!n.read ? "border-blue-200 bg-blue-50/30" : ""}>
          <CardContent className="flex items-start justify-between py-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="secondary">{n.type}</Badge>
                {!n.read && <Badge className="bg-blue-600 text-xs">New</Badge>}
                <span className="text-xs text-gray-400">{new Date(n.createdAt).toLocaleString()}</span>
              </div>
              <p className="font-medium text-gray-900 dark:text-gray-100">{n.title}</p>
              <p className="text-sm text-gray-500 mt-1">{n.message}</p>
            </div>
            <div className="flex gap-1 shrink-0 ml-4">
              {!n.read && <Button size="sm" variant="ghost" onClick={() => markRead.mutate({ id: n.id })}>Mark Read</Button>}
              <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => deleteMut.mutate({ id: n.id })}>Delete</Button>
            </div>
          </CardContent>
        </Card>
      ))}</div>}
    </div>
  );
}
