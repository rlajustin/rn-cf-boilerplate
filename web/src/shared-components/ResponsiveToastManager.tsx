"use client";

import { Toaster, toast } from "react-hot-toast";
import { useEffect, useRef, useState } from "react";

export function ResponsiveToastManager() {
  const initialized = useRef(false);
  const [duration, setDuration] = useState(5000);

  // Set the values after initial render to avoid SSR/hydration mismatch
  useEffect(() => {
    // Update padding and duration based on device type
    setDuration(5000);
  }, []);

  // Apply event handlers
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    // This clears any existing toasts on component mount
    toast.dismiss();
  }, []);

  // Manage toast queue and limit to 5 toasts
  useEffect(() => {
    // Store original toast function
    const originalToast = toast;

    // Create a queue to track active toasts
    let toastQueue: string[] = [];
    const MAX_TOASTS = 5;

    // Override toast methods to limit visible toasts
    const limitToasts = (toastId: string) => {
      // Add new toast ID to queue
      toastQueue = toastQueue.filter((id) => id !== toastId);
      toastQueue.push(toastId);

      // If we exceed max toasts, remove oldest
      if (toastQueue.length > MAX_TOASTS) {
        const oldestToastId = toastQueue.shift();
        if (oldestToastId) {
          originalToast.dismiss(oldestToastId);
        }
      }
    };

    // Override each toast method to track IDs
    const originalCustom = toast.custom;
    toast.custom = (component, options) => {
      const id = originalCustom(component, options);
      limitToasts(id);
      return id;
    };

    // Clean up on unmount
    return () => {
      toast.custom = originalCustom;
    };
  }, []);

  return (
    <Toaster
      containerStyle={{
        top: "16px",
        zIndex: 9999,
      }}
      toastOptions={{
        duration: duration,
      }}
    />
  );
}
