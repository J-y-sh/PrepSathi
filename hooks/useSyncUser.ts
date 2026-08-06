"use client";

import { useEffect } from "react";
import { useAuth } from "@/features/auth/AuthProvider";
import { userService } from "@/services/firestore/userService";

export function useSyncUser() {
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      userService.syncUser(user).catch((error) => {
        console.error("Error syncing user to Firestore:", error);
      });
    }
  }, [user]);
}
