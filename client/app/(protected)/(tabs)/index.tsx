import { ScrollView, Text, TouchableOpacity } from "react-native";
import React from "react";
import { useTheme, useAuth, ACCESS_TOKEN_KEY } from "contexts";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { apiClient } from "../../../utils/api-util";
import * as SecureStore from "expo-secure-store";

export default function HomeScreen() {
  const { theme } = useTheme();
  const { signOut } = useAuth();
  const abortController = new AbortController();
  const testProtectedRoute = async () => {
    const res = await apiClient.post({
      endpointName: "EXAMPLE",
      signal: abortController.signal,
      body: {
        exampleData1: "test",
        exampleData2: "test@test.com",
        exampleData3: 1,
      },
    });
  };

  return (
    <SafeAreaView className="flex-1">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          flexGrow: 1,
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
        style={{ backgroundColor: theme.surface }}
      >
        <TouchableOpacity onPress={testProtectedRoute} className="px-6 py-3 rounded-lg mt-8 bg-success">
          <Text className="text-white font-semibold">Test protected route</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
          }}
          className="px-6 py-3 rounded-lg mt-8 bg-accent"
        >
          <Text className="text-white font-semibold">Delete access_token</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            router.replace("/missing");
          }}
          className="px-6 py-3 rounded-lg mt-8 bg-warning"
        >
          <Text className="text-white font-semibold">Not found screen</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => signOut()} className="px-6 py-3 rounded-lg mt-8 bg-error">
          <Text className="text-white font-semibold">Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
