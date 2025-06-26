"use client";
import { useAuth, AuthState } from "@/contexts";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ProtectedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { isLoading, authState } = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (isLoading) return;
    if (authState !== AuthState.SignedIn) router.push("/");
  }, [isLoading, authState, router]);

  return <div className="h-full w-full bg-surface">{children}</div>;
}
