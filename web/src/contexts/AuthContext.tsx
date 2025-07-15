"use client";
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { usePersistentState } from "@/hooks";
import { apiClient, hashPassword } from "@/utils";
import { AuthScopeType } from "shared";
import { isAxiosError } from "axios";

type AuthContextType = {
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  isLoading: boolean;
  authScope: AuthScopeType | null;
  email: string | null;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authScope, setAuthScope, authScopeLoading] = usePersistentState<AuthScopeType | null>("auth_scope", null);
  const [accessTokenExpires, setAccessTokenExpires, accessTokenExpiresLoading] = usePersistentState<number | null>(
    "access_token_expires",
    null
  );
  const [email, setEmail, emailLoading] = usePersistentState<string | null>("account_email", null);

  const [apiClientInitialized, setApiClientInitialized] = useState(false);

  const abortController = useMemo(() => new AbortController(), []);

  const isLoading = useMemo(
    () => emailLoading || authScopeLoading || accessTokenExpiresLoading,
    [emailLoading, authScopeLoading, accessTokenExpiresLoading]
  );

  async function signIn(email: string, password: string) {
    try {
      const hashedPassword = hashPassword(password);
      const response = await apiClient.post("LOGIN", abortController.signal, { email, password: hashedPassword });
      if (!response.success || !response.data.scope) {
        throw new Error("Invalid login response");
      }

      setEmail(email);
      setAuthScope(response.data.scope);
      setAccessTokenExpires(response.data.cookies.exp.accessToken);
    } catch (error) {
      throw new Error(`Error signing in: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }

  const signOut = useCallback(async () => {
    try {
      if (apiClientInitialized) {
        const res = await apiClient.post("LOGOUT", abortController.signal, {});
        if (!res.success) {
          console.error(res.message);
        }
      }
      setAuthScope(null);
      setEmail(null);
    } catch (e) {
      if (isAxiosError(e)) {
        console.error(e.message);
      }
      console.error((e as Error).message);
    }
  }, [setAuthScope, setEmail, abortController, apiClientInitialized]);

  useEffect(() => {
    if (isLoading || apiClientInitialized) return;
    (async () => {
      await apiClient.init(signOut, accessTokenExpires, setAuthScope);
      setApiClientInitialized(true);
    })();
  }, [accessTokenExpires, isLoading, signOut, setAuthScope, apiClientInitialized]);

  return (
    <AuthContext.Provider value={{ signIn, signOut, isLoading, authScope, email }}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
