import { Stack, router } from "expo-router";
import { useAuth } from "contexts/AuthContext";
import { useEffect } from "react";

export default function AuthLayout() {
  const { authScope, isLoading, email } = useAuth();

  useEffect(() => {
    if (isLoading || !email) return;
    if (authScope) {
      router.replace("/");
    }
  }, [authScope, isLoading, email]);

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
