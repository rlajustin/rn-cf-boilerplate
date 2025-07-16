"use client";
import { useAuth } from "@/contexts";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ProtectedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { isLoading, authScope } = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (isLoading) return;
    if (authScope !== "user") router.push("/");
  }, [isLoading, authScope, router]);

  return <div className="h-full w-full bg-surface">{children}</div>;
}
