"use client";
import { useAuth } from "@/contexts";
import Toast from "@/shared-components/Toast";
import { apiClient } from "@/utils";
import { useState, useReducer } from "react";
import { useRouter } from "next/navigation";

export default function DashPage() {
  const { signOut } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const [deleteState, dispatch] = useReducer((prev) => (prev + 1) % 5, 0);

  const abortController = new AbortController();

  const testExampleEndpoint = async () => {
    await apiClient.post("EXAMPLE", abortController.signal, {
      exampleData1: "hi",
      exampleData2: "justin314kim@gmail.com",
      exampleData3: 5,
    });
  };

  const testChangeEmail = async () => {
    setIsLoading(true);
    const res = await apiClient.post("CHANGE_EMAIL_REQUEST", abortController.signal, {
      newEmail,
    });
    setIsLoading(false);
    if (res.success) {
      Toast.success(res.message);
      router.push(`/verify?email=${res.newEmail}`);
    } else Toast.error(res.message);
  };

  const states = ["delete account", "are you sure?", "are you sure??", "are you sure???", "confirm delete account."];

  const testDeleteAccount = async () => {
    dispatch();
    if (deleteState === 4) {
      const res = await apiClient.post("DELETE_ACCOUNT", abortController.signal, {});
      if (res.success) {
        Toast.success(res.message);
        await signOut();
      } else Toast.error(res.message);
    }
  };

  const [newEmail, setNewEmail] = useState("");
  return (
    <div className="flex flex-col justify-center items-center h-full">
      <div>dash page</div>
      <button className="p-2 border" onClick={() => testExampleEndpoint()}>
        test
      </button>
      <input value={newEmail} onChange={(e) => setNewEmail(e.target.value)} />
      <button className="p-2 border" onClick={() => testChangeEmail()} disabled={isLoading}>
        change email
      </button>
      <button className="p-2 border" onClick={() => signOut()}>
        sign out
      </button>
      <button className="p-2 border bg-error text-background" onClick={testDeleteAccount}>
        {states[deleteState]}
      </button>
    </div>
  );
}
