import { useMemo, useState, type ReactNode } from "react";
import { AuthContext, type AuthContextValue, type AuthUser } from "./auth";
const STORAGE_KEY = "careerpilot_user";

function storedUser(): AuthUser | null {
  try {
    return JSON.parse(
      localStorage.getItem(STORAGE_KEY) ?? "null",
    ) as AuthUser | null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(storedUser);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      login: async (email, password) => {
        if (!email || password.length < 6)
          throw new Error("Enter a valid email and password.");
        const nextUser = {
          name: email
            .split("@")[0]
            .replace(/[._-]/g, " ")
            .replace(/\b\w/g, (letter) => letter.toUpperCase()),
          email,
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(nextUser));
        setUser(nextUser);
      },
      register: async ({ name, email, password }) => {
        if (!name.trim() || !email || password.length < 6)
          throw new Error(
            "Complete all fields with a password of at least 6 characters.",
          );
        const nextUser = { name: name.trim(), email };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(nextUser));
        setUser(nextUser);
      },
      logout: () => {
        localStorage.removeItem(STORAGE_KEY);
        setUser(null);
      },
    }),
    [user],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
