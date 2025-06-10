import { Stack } from "expo-router";
import { AuthState, useAuth } from "@/client/contexts/AuthContext";
import { useEffect } from "react";
import { router } from "expo-router";

export default function AuthLayout() {
  const { authState, isLoading, email } = useAuth();

  useEffect(() => {
    if (!isLoading && authState === AuthState.SignedIn) {
      router.replace("/");
    } else if (!isLoading && authState === AuthState.SignedInButNotVerified) {
      router.push({
        pathname: "/verify",
        params: { email },
      });
    }
  }, [authState, isLoading, email]);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animationDuration: 200,
        contentStyle: { backgroundColor: "transparent" },
        presentation: "card",
      }}
    >
      <Stack.Screen
        name="login"
        options={{
          animation: "slide_from_right",
        }}
      />
      <Stack.Screen
        name="signup"
        options={{
          animation: "slide_from_left",
        }}
      />
      <Stack.Screen
        name="verify"
        options={{
          animation: "slide_from_right",
        }}
      />
    </Stack>
  );
}
