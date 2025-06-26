"use client";
import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();
  const returnToHome = () => {
    router.replace("/");
  };
  return (
    <div className="w-full h-full flex flex-col justify-center items-center gap-4">
      <div>Not found</div>
      <button className="border rounded p-2" onClick={() => returnToHome()}>
        Return to home
      </button>
    </div>
  );
}
