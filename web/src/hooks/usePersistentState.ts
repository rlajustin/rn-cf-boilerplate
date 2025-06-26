import { useState, useEffect } from "react";

export function usePersistentState<T>(key: string, initialValue: T): [T, (value: T) => void, boolean] {
  const [state, setInternalState] = useState<T>(initialValue);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const value = localStorage.getItem(key);
    if (value) setInternalState(JSON.parse(value));
    setIsLoading(false);
  }, [key]);

  const setState = (value: T) => {
    localStorage.setItem(key, JSON.stringify(value));
    setInternalState(value);
  };

  return [state, setState, isLoading];
}
