import { createContext, useContext } from "react";

export type ProjectShort = { _id: string; name?: string; title?: string };
export type UserType = { name: string; email: string; role: string; projects?: ProjectShort[] } | null;

export const UserContext = createContext<UserType>(null);
export const UserUpdateContext = createContext<(() => Promise<void>) | null>(null);

export function useUser() {
  return useContext(UserContext);
}

export function useUserUpdate() {
  const ctx = useContext(UserUpdateContext);
  if (!ctx) throw new Error("useUserUpdate must be used within UserUpdateContext.Provider");
  return ctx;
}