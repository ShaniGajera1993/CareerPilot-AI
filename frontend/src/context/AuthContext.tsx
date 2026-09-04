import axios from "axios";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import api from "../services/api";
import {
  clearAuthToken,
  getAuthToken,
  isAuthTokenStorageEvent,
  SESSION_EXPIRED_EVENT,
  storeAuthToken,
} from "../services/authStorage";
import {
  AuthContext,
  type AuthContextValue,
  type AuthStatus,
  type AuthUser,
} from "./auth";

type AuthResponse = { user: AuthUser; token: string };
type CurrentUserResponse = { data: AuthUser };

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [status, setStatus] = useState<AuthStatus>(
    getAuthToken() ? "loading" : "ready",
  );

  useEffect(() => {
    const token = getAuthToken();

    if (!token) {
      return;
    }

    const controller = new AbortController();

    api
      .get<CurrentUserResponse>("/auth/user", { signal: controller.signal })
      .then((response) => {
        setUser(response.data.data);
        setStatus("ready");
      })
      .catch((error: unknown) => {
        if (!axios.isCancel(error)) {
          setStatus(
            axios.isAxiosError(error) && error.response?.status === 401
              ? "ready"
              : "error",
          );
        }
      });

    return () => controller.abort();
  }, []);

  useEffect(() => {
    const clearSession = () => {
      setUser(null);
      setStatus("ready");
    };
    const handleStorage = (event: StorageEvent) => {
      if (isAuthTokenStorageEvent(event) && !event.newValue) {
        clearAuthToken();
        clearSession();
      }
    };

    window.addEventListener(SESSION_EXPIRED_EVENT, clearSession);
    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener(SESSION_EXPIRED_EVENT, clearSession);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      status,
      login: async (email, password, remember) => {
        const response = await api.post<AuthResponse>("/auth/login", {
          email,
          password,
        });

        storeAuthToken(response.data.token, remember);
        setUser(response.data.user);
      },
      register: async ({ name, email, password }) => {
        const response = await api.post<AuthResponse>("/auth/register", {
          name,
          email,
          password,
        });

        storeAuthToken(response.data.token);
        setUser(response.data.user);
      },
      logout: async () => {
        try {
          await api.post("/auth/logout");
        } catch {
          // Local credentials must still be removed when the server is unavailable.
        } finally {
          clearAuthToken();
          setUser(null);
        }
      },
    }),
    [status, user],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
