"use client";
import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts";
import { apiClient } from "@/utils";

export default function EmailVerification() {
  const [code, setCode] = useState("");
  const [resendCountdown, setResendCountdown] = useState(0);
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState("");
  const { isLoading, signOut, email } = useAuth();
  const abortController = new AbortController();

  // Countdown timer for resend button
  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCountdown]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email || code.length !== 6) return;

    try {
      const response = await apiClient.post("VERIFY_EMAIL", abortController.signal, { code });
      if (response.success) {
        // trigger success toast
        await signOut();
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
      const response = await apiClient.post("RESEND_VERIFY_EMAIL", abortController.signal, {});

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

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
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
      <div className="flex-1 px-5 py-4 bg-background">
        <p className="text-center text-lg text-error">Email parameter is required</p>
      </div>
    );
  }

  return (
    <div className="flex-1 px-5 py-4 bg">
      <div className="flex-1 justify-center w-full max-w-[400px] self-center mx-auto flex flex-col items-center">
        <h2 className="text-2xl font-bold mb-6 text-center text-primary">Enter Verification Code</h2>
        <p className="text-base mb-2 text-center text-secondary">Please enter the 6-character code</p>
        <p className="text-sm mb-8 text-center text-secondary">sent to {email}</p>
        <div className="w-full flex flex-col items-center">
          <input
            className="w-full h-12 rounded-lg px-4 mb-4 text-center text-xl tracking-widest bg-surface text-primary border border-gray-300"
            value={code}
            onChange={handleCodeChange}
            placeholder="ENTER CODE"
            maxLength={6}
            autoCapitalize="characters"
            type="text"
            inputMode="text"
            autoComplete="one-time-code"
          />
          <button
            className={`w-full h-12 rounded-lg justify-center items-center mt-6 ${
              code.length === 6 ? "bg-accent" : "bg-secondary opacity-50"
            } text-white text-base font-semibold`}
            onClick={handleSubmit}
            disabled={code.length !== 6 || isLoading}
          >
            Verify Code
          </button>
        </div>
        {/* Resend Code Section */}
        <div className="mt-8 items-center flex flex-col w-full">
          {resendMessage && (
            <p
              className={`text-sm mb-4 text-center ${
                resendMessage.includes("successfully") ? "text-green-500" : "text-red-500"
              }`}
            >
              {resendMessage}
            </p>
          )}
          <button
            className={`px-6 py-3 rounded-lg ${
              resendCountdown > 0 || isResending ? "bg-secondary opacity-50" : "bg-primary"
            } text-white text-base font-medium`}
            onClick={handleResendCode}
            disabled={resendCountdown > 0 || isResending}
            type="button"
          >
            {isResending ? "Sending..." : resendCountdown > 0 ? `Resend in ${resendCountdown}s` : "Resend Code"}
          </button>
        </div>
        <button onClick={handleBack} className="bg-error p-2 m-4 rounded border cursor-pointer">
          Sign Out
        </button>
      </div>
    </div>
  );
}
