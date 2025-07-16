import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import * as SecureStore from "expo-secure-store";
import { apiClient } from "utils/api-util";
import { Sha256 } from "@aws-crypto/sha256-js";
import { AuthScopeType, type AccessTokenBody } from "shared";
import { isAxiosError } from "axios";

export const CLIENT_ID_KEY = "client_id";
export const ACCESS_TOKEN_KEY = "access_token";
export const REFRESH_TOKEN_KEY = "refresh_token";

export type SignOutFunction = (args?: { force: boolean }) => Promise<void>;

type AuthContextType = {
  signIn: (email: string, password: string) => Promise<void>;
  signOut: SignOutFunction;
  isLoading: boolean;
  authScope: AuthScopeType;
  setAuthScope: React.Dispatch<React.SetStateAction<AuthScopeType>>;
  email: string | null;
  // @dev remove this in production (it might be broken already lol)
  manualSignIn: boolean;
  setManualSignIn: React.Dispatch<React.SetStateAction<boolean>>;
};

const AuthContext = createContext<AuthContextType | null>(null);

function arrayBufferToBase64(buffer: Uint8Array): string {
  const binary = Array.from(buffer)
    .map((byte) => String.fromCharCode(byte))
    .join("");
  return btoa(binary);
}

export async function getAuthScope(token: string): Promise<{
  authScope: AuthScopeType;
  email: string;
}> {
  const [, payload] = token.split(".");
  const { exp, scope, email } = JSON.parse(atob(payload)) as AccessTokenBody;
  let authScope: AuthScopeType = null;
  if (exp && Date.now() < exp) {
    authScope = scope;
  }
  return { authScope, email };
}

export function hashPassword(password: string): string {
  const hash = new Sha256();
  hash.update(password);
  const hashBytes = hash.digestSync();
  return arrayBufferToBase64(hashBytes);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [authScope, setAuthScope] = useState<AuthScopeType>(null);
  const [manualSignIn, setManualSignIn] = useState<boolean>(false);
  const [email, setEmail] = useState<string | null>(null);
  const controller = new AbortController();

  async function signIn(email: string, password: string) {
    try {
      const hashedPassword = hashPassword(password);
      const response = await apiClient.post({
        endpointName: "LOGIN",
        signal: controller.signal,
        body: { email, password: hashedPassword },
      });

      if (response.success && response.data.cookies.tokens) {
        const { tokens } = response.data.cookies;
        await Promise.all([
          SecureStore.setItemAsync(ACCESS_TOKEN_KEY, tokens.accessToken),
          SecureStore.setItemAsync(REFRESH_TOKEN_KEY, tokens.refreshToken),
        ]);
        const { authScope, email } = await getAuthScope(tokens.accessToken);
        setEmail(email);
        setAuthScope(authScope);
      } else {
        if (!response.success) throw new Error(response.message);
        else throw new Error("Error signing in, contact administrator"); // @dev REALLY should not happen, indicates mobile headers not being used
      }
    } catch (error) {
      throw new Error(`Error signing in: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }

  const signOut: SignOutFunction = async (args = { force: false }) => {
    // @dev should toast something?
    try {
      if (!args.force) {
        const res = await apiClient.post({ endpointName: "LOGOUT", signal: controller.signal, body: {} });
        if (!res.success) console.error(res.message);
      }
      setAuthScope(null);
      await Promise.all([
        SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY),
        SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY),
      ]);
    } catch (e) {
      if (isAxiosError(e)) {
        console.error(e.message);
      }
    }
  };

  useEffect(() => {
    if (manualSignIn) setAuthScope("admin");
    else setAuthScope(null);
  }, [manualSignIn]);

  useEffect(() => {
    (async () => {
      try {
        // performs initial access token refresh
        await apiClient.init(signOut);
        const token = await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
        if (!token) {
          setAuthScope(null);
          return;
        }
        const { authScope, email } = await getAuthScope(token);
        setAuthScope(authScope);
        setEmail(email);
      } catch (error) {
        await signOut();
      } finally {
        setIsLoading(false);
      }
    })();
    return () => controller.abort();
  }, []);

  return (
    <AuthContext.Provider
      value={{ signIn, signOut, isLoading, authScope, setAuthScope, email, manualSignIn, setManualSignIn }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
