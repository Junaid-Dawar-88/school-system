"use client";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

export default function SettingsPage() {
  const utils = trpc.useUtils();
  const { data: profile, isLoading } = trpc.settings.getProfile.useQuery();
  const { data: org } = trpc.org.get.useQuery();

  const updateMut = trpc.settings.updateProfile.useMutation({
    onSuccess: () => { utils.settings.getProfile.invalidate(); toast.success("Profile updated"); },
    onError: (e) => toast.error(e.message),
  });
  const passMut = trpc.settings.changePassword.useMutation({
    onSuccess: () => toast.success("Password changed"),
    onError: (e) => toast.error(e.message),
  });
  const updateOrgNameMut = trpc.org.updateName.useMutation({
    onSuccess: () => { utils.org.get.invalidate(); toast.success("School name updated"); },
    onError: (e) => toast.error(e.message),
  });
  const regenMut = trpc.org.regenerateInviteCode.useMutation({
    onSuccess: () => { utils.org.get.invalidate(); toast.success("Invite code regenerated"); },
    onError: (e) => toast.error(e.message),
  });

  if (isLoading) return <div className="p-4 sm:p-6 lg:p-8 text-gray-400">Loading...</div>;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto">
      <div className="mb-6"><h1 className="text-2xl font-bold">Settings</h1><p className="text-gray-500">Manage your account</p></div>
      <div className="space-y-6">
        <Card>
          <CardHeader><div className="flex items-center justify-between"><CardTitle>Profile</CardTitle><Badge variant="secondary">{profile?.role}</Badge></div></CardHeader>
          <CardContent>
            <form onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.currentTarget); updateMut.mutate({ name: fd.get("name") as string, email: fd.get("email") as string }); }} className="space-y-4">
              <div><Label>Name</Label><Input name="name" defaultValue={profile?.name} required /></div>
              <div><Label>Email</Label><Input name="email" type="email" defaultValue={profile?.email} required /></div>
              <Button type="submit" disabled={updateMut.isPending}>{updateMut.isPending ? "Saving..." : "Update Profile"}</Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Change Password</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.currentTarget); const np = fd.get("newPassword") as string; if (np !== fd.get("confirmPassword")) { toast.error("Passwords don't match"); return; } passMut.mutate({ currentPassword: fd.get("currentPassword") as string, newPassword: np }); e.currentTarget.reset(); }} className="space-y-4">
              <div><Label>Current Password</Label><Input name="currentPassword" type="password" required /></div>
              <Separator />
              <div><Label>New Password</Label><Input name="newPassword" type="password" required /></div>
              <div><Label>Confirm</Label><Input name="confirmPassword" type="password" required /></div>
              <Button type="submit" disabled={passMut.isPending}>{passMut.isPending ? "Changing..." : "Change Password"}</Button>
            </form>
          </CardContent>
        </Card>

        {profile?.role === "ADMIN" && org && (
          <Card>
            <CardHeader><CardTitle>School Management</CardTitle></CardHeader>
            <CardContent className="space-y-6">
              <form onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                updateOrgNameMut.mutate({ name: fd.get("orgName") as string });
              }} className="space-y-3">
                <div>
                  <Label>School Name</Label>
                  <Input name="orgName" defaultValue={org.name} required />
                </div>
                <Button type="submit" disabled={updateOrgNameMut.isPending}>
                  {updateOrgNameMut.isPending ? "Saving..." : "Update School Name"}
                </Button>
              </form>

              <Separator />

              <div>
                <p className="text-sm text-gray-500 mb-1">Parent Invite Code:</p>
                <p className="text-lg font-mono font-bold text-blue-600 select-all mb-4">{org.inviteCode}</p>
                <Button variant="outline" onClick={() => regenMut.mutate()} disabled={regenMut.isPending}>
                  {regenMut.isPending ? "Regenerating..." : "Regenerate Invite Code"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
