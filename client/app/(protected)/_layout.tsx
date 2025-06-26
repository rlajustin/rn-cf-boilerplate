import { router, Stack } from "expo-router";
import React, { useEffect } from "react";
import { AuthState, useAuth } from "contexts/AuthContext";

export default function ProtectedLayout() {
  const { authState, isLoading, email } = useAuth();

  useEffect(() => {
    if (isLoading) return;
    if (authState === AuthState.SignedOut) {
      router.replace("/login");
    } else if (authState === AuthState.SignedInButNotVerified) {
      router.replace({
        pathname: "/verify",
        params: { email },
      });
    } else if (authState === AuthState.SignedIn) {
      router.replace("/");
    }
  }, [authState, isLoading, email]);

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="verify" options={{ headerShown: false, animation: "slide_from_right" }} />
    </Stack>
  );
}
