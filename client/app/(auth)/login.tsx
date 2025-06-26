import React, { useState, useRef } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  Keyboard,
  TouchableWithoutFeedback,
  Platform,
} from "react-native";
import { useAuth, useTheme } from "contexts";
import { router } from "expo-router";

export default function LoginScreen() {
  const { signIn, isLoading, manualSignIn, setManualSignIn } = useAuth();
  const { theme } = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const passwordInputRef = useRef<TextInput>(null);

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }
    try {
      setError("");
      await signIn(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
  };

  const handleSignUpPress = () => {
    router.replace("/signup");
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View className="flex-1 p-4 bg-background">
        <View className="flex-1 justify-center w-full max-w-[400px]">
          <Text className="text-2xl font-bold mb-6 text-center text-primary">Welcome Back</Text>

          {error ? <Text className="text-[#ff4444] mb-4 text-center">{error}</Text> : null}

          <TextInput
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
            returnKeyType="done"
            onSubmitEditing={() => {
              Keyboard.dismiss();
              handleLogin();
            }}
          />

          <TouchableOpacity
            className="w-full h-12 rounded-lg justify-center items-center my-4 bg-accent"
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white text-base font-semibold">Log In</Text>
            )}
          </TouchableOpacity>

          <View className="flex-row justify-center items-center pb-5">
            <TouchableOpacity onPress={() => router.push("/reset")}>
              <Text className="text-sm font-semibold text-accent">Forgot Password?</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View className="flex-row justify-center items-center pb-5">
          <Text className="text-sm text-secondary">Don't have an account?</Text>
          <TouchableOpacity onPress={handleSignUpPress}>
            <Text className="text-sm font-semibold ml-1 text-accent">Sign Up</Text>
          </TouchableOpacity>
        </View>
        <View className="flex-row justify-center items-center gap-2 pb-5">
          <TouchableOpacity
            onPress={() => setManualSignIn((prev) => !prev)}
            className={`w-[24px] h-[24px] border border-border ${manualSignIn ? "bg-accentLight" : "bg-background"}`}
          ></TouchableOpacity>
          <Text className="text-primary">[DEV] Manually sign in</Text>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}
