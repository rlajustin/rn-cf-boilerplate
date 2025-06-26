"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "@/utils/api-util";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const abortController = new AbortController();

  const handleSubmit = async () => {
    if (!email) {
      setError("Please enter your email");
      return;
    }
    setLoading(true);
    setError("");
    setMessage("");
    try {
      await apiClient.post("PASSWORD_RESET_REQUEST", abortController.signal, { email });
      setMessage("If the email exists, a reset link will be sent.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
      setEmail("");
    }
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-5 py-4">
      <button
        onClick={handleBack}
        className="absolute top-12 left-5 z-10 p-2 rounded-full hover:bg-surface"
        aria-label="Go back"
        type="button"
      >
        Go back
      </button>
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8 flex flex-col gap-4">
        <span className="text-2xl font-bold mb-2 text-center text-primary">Reset Password</span>
        {message ? <div className="text-success mb-2 text-center">{message}</div> : null}
        {error ? <div className="text-error mb-2 text-center">{error}</div> : null}
        <input
          className="w-full h-12 rounded-lg px-4 mb-2 text-base bg-surface text-primary border border-gray-200 focus:outline-none focus:ring-2 focus:ring-accent"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoCapitalize="none"
          type="email"
          required
        />
        <button
          className="w-full h-12 rounded-lg justify-center items-center mt-2 bg-accent text-white text-base font-semibold disabled:opacity-60 flex"
          onClick={() => handleSubmit()}
          disabled={loading}
        >
          {loading ? (
            <span className="mx-auto animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>
          ) : (
            "Send Reset Link"
          )}
        </button>
      </div>
    </div>
  );
}
