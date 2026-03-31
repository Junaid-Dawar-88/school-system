import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import Sidebar from "./sidebar/sidebar";
import { TRPCProvider } from "@/compnent/trpc-provider";
import { Toaster } from "@/components/ui/sonner";
import { NuqsAdapter } from "nuqs/adapters/next/app";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getSession();
  if (!user) redirect("/login");

  return (
    <TRPCProvider>
      <NuqsAdapter>
        <div className="flex min-h-screen bg-gray-50">
          <Sidebar user={user} />
          <main className="flex-1 overflow-auto pt-14 lg:pt-0 bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">{children}</main>
        </div>
        <Toaster richColors position="top-right" />
      </NuqsAdapter>
    </TRPCProvider>
  );
}
