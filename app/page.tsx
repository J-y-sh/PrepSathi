"use client";

import { useAuth } from "@/features/auth/AuthProvider";
import LoginPage from "@/features/auth/LoginPage";
import { DashboardPage } from "@/features/dashboard/DashboardPage";
import { useSyncUser } from "@/hooks/useSyncUser";
import { Loader2 } from "lucide-react";

export default function Home() {
  const { user, loading } = useAuth();

  useSyncUser();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  return <DashboardPage />;
}