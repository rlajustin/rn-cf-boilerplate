import { Stack } from "expo-router";
import { AuthState, useAuth } from "contexts/AuthContext";
import { useEffect } from "react";
import { router } from "expo-router";

export default function AuthLayout() {
  const { authState, isLoading, email } = useAuth();

  useEffect(() => {
    if (isLoading || !email) return;
    if (authState !== AuthState.SignedOut) {
      router.replace("/");
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
        name="reset"
        options={{
          animation: "slide_from_right",
        }}
      />
    </Stack>
  );
}
