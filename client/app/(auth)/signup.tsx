import React, { useState, useEffect, useRef } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import { hashPassword, useAuth } from "contexts/AuthContext";
import { router } from "expo-router";
import IOSAttestManager from "@/client/utils/IOSAttestManager";
import { apiClient } from "@/client/utils/ApiClient";
import { useTheme } from "contexts";

export default function SignupScreen() {
  const abortController = new AbortController();
  const { isLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [attestKeyReady, setAttestKeyReady] = useState<boolean | null>(null);
  const [displayName, setDisplayName] = useState("");
  const { theme } = useTheme();

  // Refs for keyboard navigation
  const emailInputRef = useRef<TextInput>(null);
  const passwordInputRef = useRef<TextInput>(null);
  const confirmPasswordInputRef = useRef<TextInput>(null);

  useEffect(() => {
    const initialize = async () => {
      try {
        await IOSAttestManager.initialize();
        if (!IOSAttestManager.isKeyRegistered() || !IOSAttestManager.attestationSupported()) {
          const result = await IOSAttestManager.prepareAndRegisterKey();
          setAttestKeyReady(result);
        }
      } catch (err) {
        console.error("Error initializing App Attest", err);
        setAttestKeyReady(false);
      }
    };
    initialize();
  }, []);

  const handleSignUp = async () => {
    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }
    try {
      setError("");
      const hashedPassword = hashPassword(password);
      const response = await apiClient.post({
        endpointName: "REGISTER_ACCOUNT",
        signal: abortController.signal,
        body: {
          displayName,
          email,
          password: hashedPassword,
        },
      });
      if (response.success) {
        router.replace({
          pathname: "/verify",
          params: { email },
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
  };

  const handleLoginPress = () => {
    router.replace("/login");
  };

  const disableSignup = false;

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View className="flex-1 px-5 py-4 bg-background">
        <View className="flex-1 justify-center w-full max-w-[400px] self-center">
          <Text className="text-2xl font-bold mb-6 text-center text-primary">Create Account</Text>

          {error ? <Text className="text-[#ff4444] mb-4 text-center">{error}</Text> : null}

          <TextInput
            className="w-full h-12 rounded-lg px-4 mb-4 text-base bg-surface text-primary"
            placeholder="Display Name"
            placeholderTextColor={theme.secondary}
            value={displayName}
            onChangeText={setDisplayName}
            returnKeyType="next"
            onSubmitEditing={() => {
              emailInputRef.current?.focus();
            }}
          />

          <TextInput
            ref={emailInputRef}
            className="w-full h-12 rounded-lg px-4 mb-4 text-base bg-surface text-primary"
            placeholder="Email"
            placeholderTextColor={theme.secondary}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            returnKeyType="next"
            onSubmitEditing={() => {
              passwordInputRef.current?.focus();
            }}
          />

          <TextInput
            ref={passwordInputRef}
            className="w-full h-12 rounded-lg px-4 mb-4 text-base bg-surface text-primary"
            placeholder="Password"
            placeholderTextColor={theme.secondary}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            returnKeyType="next"
            onSubmitEditing={() => {
              confirmPasswordInputRef.current?.focus();
            }}
          />

          <TextInput
            ref={confirmPasswordInputRef}
            className="w-full h-12 rounded-lg px-4 mb-4 text-base bg-surface text-primary"
            placeholder="Confirm Password"
            placeholderTextColor={theme.secondary}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            returnKeyType="done"
            onSubmitEditing={() => {
              Keyboard.dismiss();
              handleSignUp();
            }}
          />

          <TouchableOpacity
            className={`w-full h-12 rounded-lg justify-center items-center mt-2 ${
              disableSignup ? "bg-secondary" : "bg-accent"
            }`}
            onPress={handleSignUp}
            disabled={disableSignup}
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white text-base font-semibold">Sign Up</Text>
            )}
          </TouchableOpacity>

          <Text className="text-sm text-center m-4 text-secondary">
            {attestKeyReady ? "Device authorized" : "Device not authorized"}
          </Text>
        </View>

        <View className="flex-row justify-center items-center pb-5">
          <Text className="text-sm text-secondary">Already have an account?</Text>
          <TouchableOpacity onPress={handleLoginPress}>
            <Text className="text-sm font-semibold ml-1 text-accent">Log In</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}
