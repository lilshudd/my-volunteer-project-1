import { createContext, useContext } from "react";

export type UserType = { name: string; email: string; role: string } | null;

export const UserContext = createContext<UserType>(null);
export const UserUpdateContext = createContext<((user: UserType) => void) | null>(null);

export function useUser() {
  return useContext(UserContext);
}

export function useUserUpdate() {
  const ctx = useContext(UserUpdateContext);
  if (!ctx) throw new Error("useUserUpdate must be used within UserUpdateContext.Provider");
  return ctx;
}