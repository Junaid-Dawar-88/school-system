"use client";
import { useState, useTransition } from "react";
import { loginAction, teacherCodeLoginAction } from "@/app/actions/auth";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function LoginPage() {
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const fd = new FormData(e.currentTarget);
    startTransition(async () => { const res = await loginAction(fd); if (res?.error) setError(res.error); });
  }

  function handleCodeLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const fd = new FormData(e.currentTarget);
    startTransition(async () => { const res = await teacherCodeLoginAction(fd); if (res?.error) setError(res.error); });
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-gray-50 via-blue-50/30 to-gray-50 px-4 py-8">
      <Card className="w-full max-w-md shadow-xl border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto w-14 h-14 bg-linear-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-blue-600/20">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
            </svg>
          </div>
          <CardTitle className="text-2xl">Welcome Back</CardTitle>
          <p className="text-sm text-gray-500 mt-1">Sign in to SchoolSystem</p>
        </CardHeader>
        <CardContent className="pt-4">
          {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl">{error}</div>}

          <Tabs defaultValue="password" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-5">
              <TabsTrigger value="password">Admin / Parent</TabsTrigger>
              <TabsTrigger value="code">Teacher</TabsTrigger>
            </TabsList>

            <TabsContent value="password">
              <form onSubmit={handleLogin} className="space-y-4">
                <div><Label>Email</Label><Input name="email" type="email" placeholder="you@example.com" className="mt-1.5" required /></div>
                <div><Label>Password</Label><Input name="password" type="password" placeholder="Enter password" className="mt-1.5" required /></div>
                <Button type="submit" className="w-full h-11 text-base" disabled={isPending}>
                  {isPending ? "Signing in..." : "Sign In"}
                </Button>
              </form>
              <div className="text-right mt-2">
                <Link href="/forgot-password" className="text-xs text-gray-400 hover:text-blue-600 transition-colors">Forgot password?</Link>
              </div>
            </TabsContent>

            <TabsContent value="code">
              <form onSubmit={handleCodeLogin} className="space-y-4">
                <div><Label>Email</Label><Input name="email" type="email" placeholder="teacher@school.com" className="mt-1.5" required /></div>
                <div><Label>Login Code</Label><Input name="code" placeholder="Enter code from email" className="mt-1.5 font-mono" required /></div>
                <Button type="submit" className="w-full h-11 text-base" disabled={isPending}>
                  {isPending ? "Signing in..." : "Sign In with Code"}
                </Button>
              </form>
              <p className="text-xs text-gray-400 mt-3 text-center">Your admin will send you a login code via email.</p>
            </TabsContent>
          </Tabs>

          <p className="mt-6 text-center text-sm text-gray-500">
            Parent? <Link href="/register" className="text-blue-600 hover:underline font-medium">Sign up here</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
