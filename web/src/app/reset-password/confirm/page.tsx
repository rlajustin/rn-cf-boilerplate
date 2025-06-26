"use client";
import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { apiClient, hashPassword } from "@/utils";
import * as jose from "jose";
import Link from "next/link";

export default function ResetPasswordConfirmPage() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [valid, setValid] = useState<boolean | null>(null);
  const [email, setEmail] = useState<string>("");
  const [error, setError] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      setError("Missing token in URL.");
      setLoading(false);
      return;
    }
    const { email } = jose.decodeJwt(token);
    setEmail(email as string);
    const abortController = new AbortController();
    apiClient
      .get("PASSWORD_RESET_VALIDATE", abortController.signal, { token })
      .then((res) => {
        setValid(res.valid);
        setLoading(false);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Invalid or expired token.");
        setLoading(false);
      });
    return () => abortController.abort();
  }, [searchParams]);

  const passwordsMatch = password && password2 && password === password2;

  const handleSubmit = async () => {
    setSubmitLoading(true);
    setSubmitError("");
    setSubmitSuccess(false);
    const token = searchParams.get("token");
    if (!token) {
      setSubmitError("Missing token in URL.");
      setSubmitLoading(false);
      return;
    }
    try {
      const res = await apiClient.post("PASSWORD_RESET_CONFIRM", new AbortController().signal, {
        token,
        newPassword: hashPassword(password),
      });
      if (res.success) {
        setSubmitSuccess(true);
      } else {
        setSubmitError(res.message || "Failed to reset password.");
      }
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Failed to reset password.");
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-5 py-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8 flex flex-col gap-4 text-center">
        <span className="text-2xl font-bold mb-2 text-primary">Reset Password</span>
        {loading && <span className="text-base">Validating link...</span>}
        {!loading && error && <span className="text-error">{error}</span>}
        {!loading && valid && !submitSuccess && (
          <div className="flex flex-col gap-4">
            {email && (
              <span className="text-base text-gray-700">
                Resetting password for <b>{email}</b>
              </span>
            )}
            <input
              className="w-full h-12 rounded-lg px-4 text-base bg-surface text-primary border border-gray-200 focus:outline-none focus:ring-2 focus:ring-accent"
              type="password"
              placeholder="New password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={submitLoading}
              required
            />
            <input
              className="w-full h-12 rounded-lg px-4 text-base bg-surface text-primary border border-gray-200 focus:outline-none focus:ring-2 focus:ring-accent"
              type="password"
              placeholder="Confirm new password"
              value={password2}
              onChange={(e) => setPassword2(e.target.value)}
              disabled={submitLoading}
              required
            />
            {password && password2 && password !== password2 && (
              <span className="text-error">Passwords do not match.</span>
            )}
            <button
              className="w-full h-12 rounded-lg justify-center items-center bg-accent text-white text-base font-semibold disabled:opacity-60 flex"
              onClick={handleSubmit}
              disabled={submitLoading || !passwordsMatch}
            >
              {submitLoading ? (
                <span className="mx-auto animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>
              ) : (
                "Set New Password"
              )}
            </button>
            {submitError && <span className="text-error">{submitError}</span>}
          </div>
        )}
        {!loading && valid && submitSuccess && (
          <span className="text-success">
            Your password has been reset successfully. Return to{" "}
            <Link className="text-accent" href="/">
              log in
            </Link>
            .
          </span>
        )}
        {!loading && valid === false && !error && <span className="text-error">Invalid or expired token.</span>}
      </div>
    </div>
  );
}
