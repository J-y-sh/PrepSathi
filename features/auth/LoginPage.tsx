"use client";

import React from "react";
import EmailAuthForm from "./EmailAuthForm";
import { useAuth } from "./AuthProvider";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center p-4">
        <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col items-center justify-center p-6 sm:p-8">
      <div className="relative w-full max-w-sm flex flex-col items-center space-y-8">

        {/* Logo Section */}

        <div className="flex flex-col items-center space-y-2 text-center">
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent">
            PrepSathi
          </h1>

          <p className="text-white/60 text-sm sm:text-base font-medium">
            Your AI Companion for UPSC CSE 2028
          </p>
        </div>

        {/* Authentication Card */}

        <div className="w-full bg-[#1E293B]/60 border border-white/5 rounded-3xl p-6 sm:p-7 backdrop-blur-sm shadow-2xl">
          <EmailAuthForm />
        </div>

        {/* Terms */}

        <p className="text-[10px] text-center text-white/30 px-4 leading-relaxed">
          By continuing, you agree to
          PrepSathi's Terms of Service and
          Privacy Policy.
        </p>

        {/* Decorative background */}

        <div className="fixed inset-0 -z-10 h-full w-full bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]" />

      </div>
    </div>
  );
}