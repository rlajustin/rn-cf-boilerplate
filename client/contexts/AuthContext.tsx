import React, { createContext, useContext, useState, useEffect } from "react";
import * as SecureStore from "expo-secure-store";
import { apiClient } from "utils/api-util";
import { Platform } from "react-native";
import { Sha256 } from "@aws-crypto/sha256-js";
import { type AccessTokenBody } from "shared";

type AuthContextType = {
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => void;
  isLoading: boolean;
  authState: AuthState;
  email: string | null;
  // @dev remove this in production
  manualSignIn: boolean;
  setManualSignIn: React.Dispatch<React.SetStateAction<boolean>>;
};

export enum AuthState {
  SignedOut,
  SignedInButNotVerified,
  SignedIn,
}

const AuthContext = createContext<AuthContextType | null>(null);

function arrayBufferToBase64(buffer: Uint8Array): string {
  const binary = Array.from(buffer)
    .map((byte) => String.fromCharCode(byte))
    .join("");
  return btoa(binary);
}

async function getAuthState(token: string): Promise<{
  authState: AuthState;
  email: string | null;
}> {
  const [, payload] = token.split(".");
  const { exp, scope, email } = JSON.parse(atob(payload)) as AccessTokenBody;
  let authState = null;
  if (exp && Date.now() / 1000 < exp) {
    if (scope && scope === "user") {
      authState = AuthState.SignedIn;
    } else {
      authState = AuthState.SignedInButNotVerified;
    }
  } else {
    authState = AuthState.SignedOut;
  }
  return { authState, email };
}

export function hashPassword(password: string): string {
  const hash = new Sha256();
  hash.update(password);
  const hashBytes = hash.digestSync();
  return arrayBufferToBase64(hashBytes);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [authState, setAuthState] = useState(AuthState.SignedOut);
  const [manualSignIn, setManualSignIn] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const controller = new AbortController();

  useEffect(() => {
    setAuthState(AuthState.SignedIn);
  }, [manualSignIn]);

  useEffect(() => {
    checkAuthState();
    return () => controller.abort();
  }, []);

  async function checkAuthState() {
    try {
      if (Platform.OS === "web") {
        setAuthState(AuthState.SignedOut);
      } else {
        const token = await SecureStore.getItemAsync("auth_token");
        if (!token) {
          setAuthState(AuthState.SignedOut);
          return;
        }
        const { authState, email } = await getAuthState(token);
        setAuthState(authState);
        setEmail(email);
      }
    } catch (error) {
      await signOut();
    } finally {
      setIsLoading(false);
    }
  }

  async function signIn(email: string, password: string) {
    try {
      const hashedPassword = hashPassword(password);
      const response = await apiClient.post({
        endpointName: "LOGIN",
        signal: controller.signal,
        body: { email, password: hashedPassword },
      });
      console.log("response", response);

      if (Platform.OS === "ios") {
        if (!response.success || !response.data.accessToken) {
          throw new Error("Invalid response format");
        }
        const { accessToken } = response.data;
        await SecureStore.setItemAsync("auth_token", accessToken);
        const { authState, email } = await getAuthState(accessToken);
        setEmail(email);
        setAuthState(authState);
      }
    } catch (error) {
      throw new Error(`Error signing in: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }

  async function signOut() {
    // @dev should toast something?
    setAuthState(AuthState.SignedOut);
    await SecureStore.deleteItemAsync("auth_token");
  }
  apiClient.registerSignOut(signOut);

  return (
    <AuthContext.Provider value={{ signIn, signOut, isLoading, authState, email, manualSignIn, setManualSignIn }}>
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
