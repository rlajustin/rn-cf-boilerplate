import React from "react";
import { Link, Stack } from "expo-router";
import { View, Text } from "react-native";

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Oops!" }} />
      <View className="flex flex-col justify-center items-center g-4">
        <Text>This screen doesn't exist.</Text>
        <Link className="p-3 bg-error" href="/">
          <Text>Go to home screen!</Text>
        </Link>
      </View>
    </>
  );
}
