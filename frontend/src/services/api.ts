import axios from "axios";
import {
  clearAuthToken,
  getAuthToken,
  SESSION_EXPIRED_EVENT,
} from "./authStorage";

export type ApiFieldErrors = Record<string, string>;

type ApiErrorPayload = {
  message?: string;
  errors?: Record<string, string[]>;
};

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:8000/api/v1",
  timeout: 10_000,
  headers: {
    Accept: "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = getAuthToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(undefined, (error: unknown) => {
  if (
    axios.isAxiosError(error) &&
    error.response?.status === 401 &&
    getAuthToken()
  ) {
    clearAuthToken();
    window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
  }

  return Promise.reject(error);
});

export function parseApiError(
  error: unknown,
  fallbackMessage: string,
): { message: string; fieldErrors: ApiFieldErrors } {
  if (!axios.isAxiosError<ApiErrorPayload>(error)) {
    return { message: fallbackMessage, fieldErrors: {} };
  }

  if (!error.response) {
    return {
      message:
        "CareerPilot could not reach the server. Check your connection and try again.",
      fieldErrors: {},
    };
  }

  if (error.response.status === 429) {
    return {
      message: "Too many attempts. Wait a minute, then try again.",
      fieldErrors: {},
    };
  }

  if (error.response.status >= 500) {
    return {
      message: "CareerPilot could not complete that request. Try again shortly.",
      fieldErrors: {},
    };
  }

  const fieldErrors = Object.fromEntries(
    Object.entries(error.response.data?.errors ?? {}).map(
      ([field, messages]) => [field, messages[0]],
    ),
  );

  return {
    message:
      Object.values(fieldErrors)[0] ??
      error.response.data?.message ??
      fallbackMessage,
    fieldErrors,
  };
}

export default api;
