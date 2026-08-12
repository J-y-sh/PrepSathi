"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
  signOut,
} from "firebase/auth";

import { auth } from "@/firebase/firebase";

interface AuthContextType {
  user: User | null;
  loading: boolean;

  login: (
    email?: string,
    password?: string
  ) => Promise<void>;

  register: (
    email: string,
    password: string
  ) => Promise<void>;

  logout: () => Promise<void>;
}

const AuthContext =
  createContext<AuthContextType | undefined>(
    undefined
  );

export function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] =
    useState<User | null>(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    let mounted = true;

    /*
     * =====================================================
     * HANDLE GOOGLE REDIRECT
     * =====================================================
     *
     * After Google authentication, Firebase redirects the
     * browser back to PrepSathi.
     *
     * getRedirectResult() processes that result.
     */

    const handleRedirectResult = async () => {
      try {
        await getRedirectResult(auth);
      } catch (error) {
        console.error(
          "Google redirect authentication failed:",
          error
        );
      }
    };

    handleRedirectResult();

    /*
     * =====================================================
     * AUTH STATE LISTENER
     * =====================================================
     */

    const unsubscribe =
      onAuthStateChanged(
        auth,
        (firebaseUser) => {
          if (!mounted) return;

          setUser(firebaseUser);
          setLoading(false);
        }
      );

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  /*
   * =======================================================
   * LOGIN
   * =======================================================
   *
   * Supports:
   *
   * 1. Email + password
   * 2. Google redirect
   *
   * EmailAuthForm calls:
   *
   * login(email, password)
   *
   * GoogleSignInButton calls:
   *
   * login()
   */

  const login = async (
    email?: string,
    password?: string
  ): Promise<void> => {
    /*
     * EMAIL LOGIN
     */

    if (email !== undefined) {
      if (!password) {
        throw new Error(
          "Password is required."
        );
      }

      await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      return;
    }

    /*
     * GOOGLE LOGIN
     *
     * Redirect is intentionally used instead of
     * signInWithPopup because it works better across
     * deployed environments and mobile browsers.
     */

    const provider =
      new GoogleAuthProvider();

    provider.setCustomParameters({
      prompt: "select_account",
    });

    await signInWithRedirect(
      auth,
      provider
    );
  };

  /*
   * =======================================================
   * REGISTER
   * =======================================================
   */

  const register = async (
    email: string,
    password: string
  ): Promise<void> => {
    await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
  };

  /*
   * =======================================================
   * LOGOUT
   * =======================================================
   */

  const logout = async (): Promise<void> => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/*
 * =========================================================
 * AUTH HOOK
 * =========================================================
 */

export function useAuth() {
  const context =
    useContext(AuthContext);

  if (context === undefined) {
    throw new Error(
      "useAuth must be used within an AuthProvider"
    );
  }

  return context;
}