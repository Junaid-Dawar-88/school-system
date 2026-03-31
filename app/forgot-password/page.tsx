"use client";
import { useState, useTransition } from "react";
import { forgotPasswordAction } from "@/app/actions/password";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ForgotPasswordPage() {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(""); setMessage("");
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await forgotPasswordAction(fd);
      if (res.error) setError(res.error);
      if (res.success) setMessage(res.success);
    });
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-gray-50 via-blue-50/30 to-gray-50 px-4 py-8">
      <Card className="w-full max-w-md shadow-xl border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-2xl">Forgot Password</CardTitle>
          <p className="text-sm text-gray-500 mt-1">Enter your email and we&apos;ll send you a reset link</p>
        </CardHeader>
        <CardContent className="pt-4">
          {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl">{error}</div>}
          {message && <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl">{message}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div><Label>Email</Label><Input name="email" type="email" placeholder="you@example.com" className="mt-1.5" required /></div>
            <Button type="submit" className="w-full h-11" disabled={isPending}>
              {isPending ? "Sending..." : "Send Reset Link"}
            </Button>
          </form>
          <p className="mt-6 text-center text-sm text-gray-500">
            <Link href="/login" className="text-blue-600 hover:underline font-medium">Back to Login</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
