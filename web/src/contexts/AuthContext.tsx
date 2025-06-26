"use client";
import React, { createContext, useContext } from "react";
import { usePersistentState } from "@/hooks";
import { apiClient, hashPassword } from "@/utils";

export enum AuthState {
  SignedOut,
  SignedInButNotVerified,
  SignedIn,
}

type AuthContextType = {
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => void;
  isLoading: boolean;
  authState: AuthState | null;
  email: string | null;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState, authStateLoading] = usePersistentState<AuthState | null>("auth_state", null);
  const [email, setEmail, emailLoading] = usePersistentState<string | null>("account_email", null);
  const abortController = new AbortController();

  const isLoading = emailLoading || authStateLoading;

  async function signIn(email: string, password: string) {
    try {
      const hashedPassword = hashPassword(password);
      const response = await apiClient.post("LOGIN", abortController.signal, { email, password: hashedPassword });
      if (!response.success || !response.data.scope) {
        throw new Error("Invalid login response");
      }
      setEmail(email);
      setAuthState(response.data.scope !== "unverified" ? AuthState.SignedIn : AuthState.SignedInButNotVerified);
    } catch (error) {
      throw new Error(`Error signing in: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }

  async function signOut() {
    setAuthState(AuthState.SignedOut);
    setEmail(null);
  }

  return (
    <AuthContext.Provider value={{ signIn, signOut, isLoading, authState, email }}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
