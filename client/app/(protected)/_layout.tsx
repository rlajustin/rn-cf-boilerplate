import { router, Stack } from "expo-router";
import React, { useEffect } from "react";
import { AuthState, useAuth } from "@/client/contexts/AuthContext";

export default function ProtectedLayout() {
  const { authState, isLoading, email } = useAuth();

  useEffect(() => {
    if (isLoading) return;
    if (authState !== AuthState.SignedIn) {
      router.replace("/login");
    }
  }, [authState, isLoading, email]);

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}
