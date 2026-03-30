"use client";
import React, { useState, useTransition } from "react";
import { loginAction, signupAction } from "@/app/actions/auth";

type AuthView = "login" | "signup";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialView?: AuthView;
}

const AuthModal = ({ isOpen, onClose, initialView = "login" }: AuthModalProps) => {
  const [view, setView] = useState<AuthView>(initialView);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const switchView = (newView: AuthView) => {
    setView(newView);
    setError("");
  };

  React.useEffect(() => {
    if (isOpen) {
      setView(initialView);
      setError("");
    }
  }, [isOpen, initialView]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    const formData = new FormData(e.currentTarget);
    const action = view === "login" ? loginAction : signupAction;

    startTransition(async () => {
      const result = await action(formData);
      if (result?.error) {
        setError(result.error);
      }
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-8 animate-in fade-in zoom-in duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
            {error}
          </div>
        )}

        {view === "login" ? (
          <>
            <h2 className="text-2xl font-bold mb-6 text-center text-blue-600">
              Login to School System
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block mb-1 font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  name="email"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  placeholder="you@example.com"
                  required
                />
              </div>
              <div>
                <label className="block mb-1 font-medium text-gray-700">Password</label>
                <input
                  type="password"
                  name="password"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  placeholder="Enter your password"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isPending}
                className="w-full bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
              >
                {isPending ? "Logging in..." : "Login"}
              </button>
            </form>
            <p className="text-center mt-5 text-gray-600 text-sm">
              Don&apos;t have an account?{" "}
              <button
                onClick={() => switchView("signup")}
                className="text-blue-600 hover:underline font-medium"
              >
                Sign Up
              </button>
            </p>
          </>
        ) : (
          <>
            <h2 className="text-2xl font-bold mb-6 text-center text-blue-600">
              Sign Up for School System
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block mb-1 font-medium text-gray-700">Full Name</label>
                <input
                  type="text"
                  name="name"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  placeholder="John Doe"
                  required
                />
              </div>
              <div>
                <label className="block mb-1 font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  name="email"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  placeholder="you@example.com"
                  required
                />
              </div>
              <div>
                <label className="block mb-1 font-medium text-gray-700">Password</label>
                <input
                  type="password"
                  name="password"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  placeholder="Create a password"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isPending}
                className="w-full bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
              >
                {isPending ? "Creating account..." : "Sign Up"}
              </button>
            </form>
            <p className="text-center mt-5 text-gray-600 text-sm">
              Already have an account?{" "}
              <button
                onClick={() => switchView("login")}
                className="text-blue-600 hover:underline font-medium"
              >
                Login
              </button>
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default AuthModal;
