"use client";
import { useAuth } from "@/contexts";

export default function DashPage() {
  const { signOut } = useAuth();
  return (
    <div className="flex flex-col justify-center items-center h-full">
      <div>dash page</div>
      <button className="p-2 border" onClick={() => signOut()}>
        sign out
      </button>
    </div>
  );
}
