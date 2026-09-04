const PERSISTENT_TOKEN_STORAGE_KEY = "careerpilot_auth_token";
const SESSION_TOKEN_STORAGE_KEY = "careerpilot_session_token";
let memoryToken: string | null = null;

export const SESSION_EXPIRED_EVENT = "careerpilot:session-expired";

export function getAuthToken(): string | null {
  try {
    memoryToken =
      sessionStorage.getItem(SESSION_TOKEN_STORAGE_KEY) ??
      localStorage.getItem(PERSISTENT_TOKEN_STORAGE_KEY) ??
      memoryToken;
  } catch {
    // Storage may be unavailable in privacy-restricted browser contexts.
  }

  return memoryToken;
}

export function storeAuthToken(token: string, persistent = false): void {
  memoryToken = token;

  try {
    if (persistent) {
      localStorage.setItem(PERSISTENT_TOKEN_STORAGE_KEY, token);
      sessionStorage.removeItem(SESSION_TOKEN_STORAGE_KEY);
    } else {
      sessionStorage.setItem(SESSION_TOKEN_STORAGE_KEY, token);
      localStorage.removeItem(PERSISTENT_TOKEN_STORAGE_KEY);
    }
  } catch {
    // The token remains available in memory for the active tab.
  }
}

export function clearAuthToken(): void {
  memoryToken = null;

  try {
    localStorage.removeItem(PERSISTENT_TOKEN_STORAGE_KEY);
    sessionStorage.removeItem(SESSION_TOKEN_STORAGE_KEY);
  } catch {
    // Storage may be unavailable in privacy-restricted browser contexts.
  }
}

export function isAuthTokenStorageEvent(event: StorageEvent): boolean {
  return (
    event.key === PERSISTENT_TOKEN_STORAGE_KEY ||
    event.key === SESSION_TOKEN_STORAGE_KEY
  );
}
