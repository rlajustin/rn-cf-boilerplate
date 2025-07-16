import { useState, useEffect } from "react";

export function usePersistentState<T>(
  key: string,
  initialValue: T
): [T, React.Dispatch<React.SetStateAction<T>>, boolean] {
  const [state, setInternalState] = useState<T>(initialValue);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const value = localStorage.getItem(key);
    if (value) setInternalState(JSON.parse(value));
    setIsLoading(false);
  }, [key]);

  const setState: React.Dispatch<React.SetStateAction<T>> = (value) => {
    const newValue = typeof value === "function" ? (value as (prevState: T) => T)(state) : value;
    localStorage.setItem(key, JSON.stringify(newValue));
    setInternalState(value);
  };

  return [state, setState, isLoading];
}
