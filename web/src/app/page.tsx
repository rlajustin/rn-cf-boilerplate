"use client";
import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "@/contexts";
import { useRouter } from "next/navigation";

export default function Home() {
  const [emailInput, setEmailInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [error] = useState("");
  const passwordInputRef = useRef<HTMLInputElement>(null);
  const { signIn, isLoading, authScope } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (authScope === "user") {
      router.push("/dash");
    }
  }, [router, authScope, isLoading]);

  return (
    <div className="flex-1 p-4 bg-surface">
      <div className="justify-center items-center text-bold text-center text-lg text-accent p-2">Welcome Back</div>
      <div className="flex-1 justify-center w-full max-w-[400px] mx-auto">
        {error && <div className="text-error mb-4 text-center">{error}</div>}
        <input
          className="w-full h-12 rounded-lg px-4 mb-4 text-base bg-surface text-primary border"
          placeholder="Email"
          value={emailInput}
          onChange={(e) => setEmailInput(e.target.value)}
          autoCapitalize="none"
          type="email"
          autoFocus
          onKeyDown={(e) => {
            if (e.key === "Enter") passwordInputRef.current?.focus();
          }}
        />
        <input
          ref={passwordInputRef}
          className="w-full h-12 rounded-lg px-4 mb-4 text-base bg-surface text-primary border"
          placeholder="Password"
          value={passwordInput}
          onChange={(e) => setPasswordInput(e.target.value)}
          type="password"
          onKeyDown={(e) => {
            if (e.key === "Enter") signIn(emailInput, passwordInput);
          }}
        />
        <button
          className="w-full h-12 rounded-lg justify-center items-center my-4 bg-accent text-primary font-semibold disabled:opacity-70"
          onClick={() => signIn(emailInput, passwordInput)}
          disabled={isLoading}
        >
          {isLoading ? <span>Loading...</span> : "Log In"}
        </button>
        <div className="flex flex-row justify-center items-center pb-5">
          <a href="/reset-password" className="text-sm font-semibold text-accent">
            Forgot Password?
          </a>
        </div>
      </div>
    </div>
  );
}
