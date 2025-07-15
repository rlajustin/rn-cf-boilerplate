import { router, Stack } from "expo-router";
import React, { useEffect } from "react";
import { useAuth } from "contexts/AuthContext";

export default function ProtectedLayout() {
  const { authScope, isLoading, email } = useAuth();

  useEffect(() => {
    if (isLoading) return;
    if (authScope === null) {
      router.replace("/login");
    } else if (authScope === "unverified") {
      router.replace({
        pathname: "/verify",
        params: { email },
      });
    } else {
      router.replace("/");
    }
  }, [authScope, isLoading, email]);

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="verify" options={{ headerShown: false, animation: "slide_from_right" }} />
    </Stack>
  );
}
