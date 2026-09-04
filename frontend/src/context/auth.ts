import { createContext, useContext } from "react";

export type AuthUser = {
  id: number;
  name: string;
  email: string;
  created_at: string;
};
export type RegisterData = {
  name: string;
  email: string;
  password: string;
};
export type AuthStatus = "loading" | "ready" | "error";
export type AuthContextValue = {
  user: AuthUser | null;
  status: AuthStatus;
  login: (email: string, password: string, remember: boolean) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
