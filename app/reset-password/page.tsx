"use client";
import { useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import { resetPasswordAction } from "@/app/actions/password";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Suspense } from "react";

function ResetForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(""); setMessage("");
    const fd = new FormData(e.currentTarget);
    fd.set("token", token);
    startTransition(async () => {
      const res = await resetPasswordAction(fd);
      if (res.error) setError(res.error);
      if (res.success) setMessage(res.success);
    });
  }

  if (!token) return (
    <div className="text-center">
      <p className="text-red-600 mb-4">Invalid reset link. No token provided.</p>
      <Link href="/forgot-password" className="text-blue-600 hover:underline">Request a new link</Link>
    </div>
  );

  return (
    <>
      {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl">{error}</div>}
      {message ? (
        <div className="text-center">
          <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl">{message}</div>
          <Link href="/login" className="text-blue-600 hover:underline font-medium">Go to Login</Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><Label>New Password</Label><Input name="password" type="password" placeholder="Min 6 characters" className="mt-1.5" required /></div>
          <div><Label>Confirm Password</Label><Input name="confirm" type="password" className="mt-1.5" required /></div>
          <Button type="submit" className="w-full h-11" disabled={isPending}>
            {isPending ? "Resetting..." : "Reset Password"}
          </Button>
        </form>
      )}
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-gray-50 via-blue-50/30 to-gray-50 px-4 py-8">
      <Card className="w-full max-w-md shadow-xl border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-2xl">Reset Password</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <Suspense fallback={<p className="text-center text-gray-400">Loading...</p>}>
            <ResetForm />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
