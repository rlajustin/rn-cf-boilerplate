"use client";
import { useAuth } from "@/contexts";
import { apiClient } from "@/utils";

export default function DashPage() {
  const { signOut } = useAuth();
  const abortController = new AbortController();
  const testExampleEndpoint = async () => {
    await apiClient.post("EXAMPLE", abortController.signal, {
      exampleData1: "hi",
      exampleData2: "justin314kim@gmail.com",
      exampleData3: 5,
    });
  };
  return (
    <div className="flex flex-col justify-center items-center h-full">
      <div>dash page</div>
      <button className="p-2 border" onClick={() => testExampleEndpoint()}>
        test
      </button>
      <button className="p-2 border" onClick={() => signOut()}>
        sign out
      </button>
    </div>
  );
}
