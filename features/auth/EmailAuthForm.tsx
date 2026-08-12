"use client";

import React, { useState } from "react";
import {
  Loader2,
  Mail,
  Lock,
  UserPlus,
  LogIn,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { useAuth } from "./AuthProvider";

export default function EmailAuthForm() {
  const {
    login,
    register,
  } = useAuth();

  const [mode, setMode] =
    useState<"login" | "register">(
      "login"
    );

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [isPending, setIsPending] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const handleSubmit = async (
    event: React.FormEvent
  ) => {
    event.preventDefault();

    setError(null);

    const cleanEmail =
      email.trim();

    if (!cleanEmail) {
      setError(
        "Please enter your email address."
      );
      return;
    }

    if (password.length < 6) {
      setError(
        "Password must be at least 6 characters."
      );
      return;
    }

    setIsPending(true);

    try {
      if (mode === "login") {
        await login(
          cleanEmail,
          password
        );
      } else {
        await register(
          cleanEmail,
          password
        );
      }
    } catch (err: any) {
      console.error(
        "Authentication error:",
        err
      );

      switch (err?.code) {
        case "auth/invalid-credential":
          setError(
            "Incorrect email or password."
          );
          break;

        case "auth/user-not-found":
          setError(
            "No account exists with this email."
          );
          break;

        case "auth/wrong-password":
          setError(
            "Incorrect password."
          );
          break;

        case "auth/email-already-in-use":
          setError(
            "An account already exists with this email."
          );
          break;

        case "auth/invalid-email":
          setError(
            "Please enter a valid email address."
          );
          break;

        case "auth/weak-password":
          setError(
            "Password must be at least 6 characters."
          );
          break;

        case "auth/too-many-requests":
          setError(
            "Too many attempts. Please try again later."
          );
          break;

        default:
          setError(
            err?.message ||
              "Authentication failed. Please try again."
          );
      }
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="w-full space-y-5">
      <form
        onSubmit={handleSubmit}
        className="space-y-4"
      >
        {/* Email */}

        <div className="space-y-2">
          <label
            htmlFor="email"
            className="text-xs font-semibold text-white/50 uppercase tracking-wider"
          >
            Email
          </label>

          <div className="relative">
            <Mail
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30"
            />

            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(event) =>
                setEmail(
                  event.target.value
                )
              }
              disabled={isPending}
              className="w-full h-12 rounded-xl bg-white/5 border border-white/10 pl-11 pr-4 text-white placeholder:text-white/20 outline-none transition focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/10 disabled:opacity-50"
            />
          </div>
        </div>

        {/* Password */}

        <div className="space-y-2">
          <label
            htmlFor="password"
            className="text-xs font-semibold text-white/50 uppercase tracking-wider"
          >
            Password
          </label>

          <div className="relative">
            <Lock
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30"
            />

            <input
              id="password"
              type="password"
              autoComplete={
                mode === "login"
                  ? "current-password"
                  : "new-password"
              }
              placeholder="••••••••"
              value={password}
              onChange={(event) =>
                setPassword(
                  event.target.value
                )
              }
              disabled={isPending}
              className="w-full h-12 rounded-xl bg-white/5 border border-white/10 pl-11 pr-4 text-white placeholder:text-white/20 outline-none transition focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/10 disabled:opacity-50"
            />
          </div>

          {mode === "register" && (
            <p className="text-[10px] text-white/30">
              Password must contain at least
              6 characters.
            </p>
          )}
        </div>

        {/* Error */}

        {error && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3">
            <p className="text-xs text-red-400">
              {error}
            </p>
          </div>
        )}

        {/* Submit */}

        <Button
          type="submit"
          disabled={isPending}
          className="w-full h-12 rounded-xl bg-amber-500 hover:bg-amber-600 text-[#020617] font-bold shadow-lg shadow-amber-500/20"
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />

              {mode === "login"
                ? "Signing in..."
                : "Creating account..."}
            </>
          ) : mode === "login" ? (
            <>
              <LogIn
                size={18}
                className="mr-2"
              />

              Sign In
            </>
          ) : (
            <>
              <UserPlus
                size={18}
                className="mr-2"
              />

              Create Account
            </>
          )}
        </Button>
      </form>

      {/* Mode switch */}

      <div className="text-center">
        <button
          type="button"
          disabled={isPending}
          onClick={() => {
            setMode(
              mode === "login"
                ? "register"
                : "login"
            );

            setError(null);
          }}
          className="text-sm text-white/50 hover:text-amber-500 transition-colors disabled:opacity-50"
        >
          {mode === "login"
            ? "Don't have an account? Create one"
            : "Already have an account? Sign in"}
        </button>
      </div>
    </div>
  );
}