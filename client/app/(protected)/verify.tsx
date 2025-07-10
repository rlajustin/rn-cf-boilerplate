import React, { useState, useEffect } from "react";
import { View, TextInput, TouchableOpacity, Text } from "react-native";
import { useTheme, useAuth } from "contexts";
import { apiClient } from "utils/api-util";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function EmailVerification() {
  const { email } = useLocalSearchParams<{ email: string }>();
  const [code, setCode] = useState("");
  const [resendCountdown, setResendCountdown] = useState(0);
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState("");
  const { isLoading, signOut } = useAuth();
  const abortController = new AbortController();
  const { theme } = useTheme();

  // Countdown timer for resend button
  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCountdown]);

  const handleSubmit = async () => {
    if (!email || code.length !== 6) return;

    try {
      const response = await apiClient.post({
        endpointName: "VERIFY_EMAIL",
        signal: abortController.signal,
        body: {
          code,
        },
      });
      if (response.success) {
        await signOut();
        router.replace("/");
      }
    } catch (error) {
      console.error("OTP verification failed:", error);
    }
  };

  const handleResendCode = async () => {
    if (resendCountdown > 0 || isResending) return;

    setIsResending(true);
    setResendMessage("");

    try {
      const response = await apiClient.post({
        endpointName: "RESEND_VERIFY_EMAIL",
        signal: abortController.signal,
        body: {},
      });

      if (response.success) {
        setResendMessage("Verification code sent successfully!");
        setResendCountdown(60); // 60 second cooldown
      }
    } catch (error) {
      setResendMessage(error instanceof Error ? error.message : "Failed to resend code");
    } finally {
      setIsResending(false);
    }
  };

  const handleCodeChange = (value: string) => {
    // Only allow alphanumeric characters and limit to 6 characters
    const alphanumericValue = value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
    if (alphanumericValue.length <= 6) {
      setCode(alphanumericValue);
    }
  };

  const handleBack = async () => {
    await signOut();
  };

  if (!email) {
    return (
      <View className="flex-1 px-5 py-4 bg-background">
        <Text className="text-center text-lg text-error">Email parameter is required</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 px-5 py-4 bg-background">
      <TouchableOpacity onPress={handleBack} className="absolute top-12 left-5 z-10">
        <Ionicons name="arrow-back" size={24} color={theme.primary} />
      </TouchableOpacity>

      <View className="flex-1 justify-center w-full max-w-[400px] self-center">
        <Text className="text-2xl font-bold mb-6 text-center text-primary">Enter Verification Code</Text>

        <Text className="text-base mb-2 text-center text-secondary">Please enter the 6-character code</Text>

        <Text className="text-sm mb-8 text-center text-secondary">sent to {email}</Text>

        <TextInput
          className="w-full h-12 rounded-lg px-4 mb-4 text-center text-xl tracking-widest bg-surface text-primary"
          value={code}
          onChangeText={handleCodeChange}
          placeholder="ENTER CODE"
          placeholderTextColor={theme.secondary}
          maxLength={6}
          autoCapitalize="characters"
          keyboardType="ascii-capable"
        />

        <TouchableOpacity
          className={`w-full h-12 rounded-lg justify-center items-center mt-6 ${
            code.length === 6 ? "bg-accent" : "bg-secondary opacity-50"
          }`}
          onPress={handleSubmit}
          disabled={code.length !== 6 || isLoading}
        >
          <Text className="text-white text-base font-semibold">Verify Code</Text>
        </TouchableOpacity>

        {/* Resend Code Section */}
        <View className="mt-8 items-center">
          {resendMessage && (
            <Text
              className={`text-sm mb-4 text-center ${
                resendMessage.includes("successfully") ? "text-green-500" : "text-red-500"
              }`}
            >
              {resendMessage}
            </Text>
          )}

          <TouchableOpacity
            className={`px-6 py-3 rounded-lg ${
              resendCountdown > 0 || isResending ? "bg-secondary opacity-50" : "bg-primary"
            }`}
            onPress={handleResendCode}
            disabled={resendCountdown > 0 || isResending}
          >
            <Text className="text-white text-base font-medium">
              {isResending ? "Sending..." : resendCountdown > 0 ? `Resend in ${resendCountdown}s` : "Resend Code"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
