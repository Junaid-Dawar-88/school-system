"use client";
import { useState, useTransition } from "react";
import { registerParentAction } from "@/app/actions/auth";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function RegisterPage() {
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const fd = new FormData(e.currentTarget);
    const pw = fd.get("password") as string;
    if (pw.length < 6) { setError("Password must be at least 6 characters"); return; }
    startTransition(async () => { const res = await registerParentAction(fd); if (res?.error) setError(res.error); });
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-gray-50 via-blue-50/30 to-gray-50 px-4 py-8">
      <Card className="w-full max-w-md shadow-xl border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto w-14 h-14 bg-linear-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-blue-600/20">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
            </svg>
          </div>
          <CardTitle className="text-2xl">Create Account</CardTitle>
          <p className="text-sm text-gray-500 mt-1">Register as a parent with your school&apos;s invite code</p>
        </CardHeader>
        <CardContent className="pt-4">
          {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div><Label>Full Name</Label><Input name="name" placeholder="Your full name" className="mt-1.5" required /></div>
            <div><Label>Email</Label><Input name="email" type="email" placeholder="you@example.com" className="mt-1.5" required /></div>
            <div><Label>Password</Label><Input name="password" type="password" placeholder="Min 6 characters" className="mt-1.5" required /></div>
            <div><Label>School Invite Code</Label><Input name="inviteCode" placeholder="e.g. abc123-def456" className="mt-1.5 font-mono" required /></div>
            <Button type="submit" className="w-full h-11 text-base" disabled={isPending}>
              {isPending ? "Creating account..." : "Register"}
            </Button>
          </form>
          <p className="mt-6 text-center text-sm text-gray-500">
            Already have an account? <Link href="/login" className="text-blue-600 hover:underline font-medium">Sign in</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
