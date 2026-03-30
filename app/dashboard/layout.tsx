import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import Sidebar from "./sidebar/sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSession();

  if (!user) {
    redirect("/");
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar user={{ name: user.name, email: user.email, role: user.role }} />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
