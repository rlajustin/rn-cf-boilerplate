import "../global.css";
import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { ThemeProvider, AuthProvider } from "contexts";
import { verifyInstallation } from "nativewind";

function ThemedLayout() {
  return (
    <Stack>
      <Stack.Screen name="(protected)" options={{ headerShown: false, animation: "none" }} />
      <Stack.Screen name="(auth)" options={{ headerShown: false, animation: "none" }} />
    </Stack>
  );
}

export default function RootLayout() {
  verifyInstallation();
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <ThemeProvider>
          <ThemedLayout />
        </ThemeProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
