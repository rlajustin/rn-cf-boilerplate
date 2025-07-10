import React, { useState } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  Keyboard,
  TouchableWithoutFeedback,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import { useTheme } from "contexts";
import { apiClient } from "utils/api-util";
import { Ionicons } from "@expo/vector-icons";

export default function PasswordResetScreen() {
  const { theme } = useTheme();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const abortController = new AbortController();

  const handleReset = async () => {
    if (!email) {
      setError("Please enter your email");
      return;
    }
    setLoading(true);
    setError("");
    setMessage("");
    try {
      await apiClient.post({
        endpointName: "PASSWORD_RESET_REQUEST",
        signal: abortController.signal,
        body: { email },
      });
      setMessage("If the email exists, a reset link will be sent.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = async () => {
    router.back();
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View className="flex-1 px-5 py-4 bg-background justify-center">
        <TouchableOpacity onPress={handleBack} className="absolute top-12 left-5 z-10">
          <Ionicons name="arrow-back" size={24} color={theme.primary} />
        </TouchableOpacity>

        <View className="w-full max-w-[400px] self-center">
          <Text className="text-2xl font-bold mb-6 text-center text-primary">Reset Password</Text>
          {message ? <Text className="text-success mb-4 text-center">{message}</Text> : null}
          {error ? <Text className="text-error mb-4 text-center">{error}</Text> : null}
          <TextInput
            className="w-full h-12 rounded-lg px-4 mb-4 text-base bg-surface text-primary"
            placeholder="Email"
            placeholderTextColor={theme.secondary}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            returnKeyType="done"
            onSubmitEditing={handleReset}
          />
          <TouchableOpacity
            className="w-full h-12 rounded-lg justify-center items-center mt-2 bg-accent"
            onPress={handleReset}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white text-base font-semibold">Send Reset Link</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}
