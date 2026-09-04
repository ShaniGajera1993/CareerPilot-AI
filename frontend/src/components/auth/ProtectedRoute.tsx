import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/auth";

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { status, user } = useAuth();
  const location = useLocation();

  if (status === "loading") {
    return (
      <main
        className="auth-session-loading"
        aria-live="polite"
        aria-busy="true"
      >
        <span className="auth-spinner" aria-hidden="true" />
        <p>Restoring your CareerPilot workspace…</p>
      </main>
    );
  }

  if (status === "error") {
    return (
      <main className="auth-session-loading" role="alert">
        <p>CareerPilot could not restore your session.</p>
        <button type="button" onClick={() => window.location.reload()}>
          Try again
        </button>
      </main>
    );
  }

  return user ? (
    children
  ) : (
    <Navigate to="/login" state={{ from: location }} replace />
  );
}
