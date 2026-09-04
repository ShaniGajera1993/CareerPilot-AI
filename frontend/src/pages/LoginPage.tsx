import { useState, type FormEvent } from "react";
import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AuthField } from "../components/auth/AuthField";
import { AuthLayout } from "../components/auth/AuthLayout";
import { useAuth } from "../context/auth";
import { parseApiError, type ApiFieldErrors } from "../services/api";
import { focusFirstInvalidField } from "../utils/forms";

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<ApiFieldErrors>({});
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setFieldErrors({});
    setLoading(true);
    try {
      await login(email, password, remember);
      const from = (location.state as { from?: { pathname?: string } } | null)
        ?.from?.pathname;
      navigate(from || "/dashboard", { replace: true });
    } catch (reason) {
      const failure = parseApiError(reason, "Unable to sign in.");

      setError(failure.message);
      setFieldErrors(failure.fieldErrors);
      setPassword("");
      focusFirstInvalidField(failure.fieldErrors, "login");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      title="Welcome back"
      description="Sign in to continue building your career."
    >
      <form className="auth-form" onSubmit={submit} noValidate>
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        <AuthField
          id="login-email"
          label="Email address"
          icon={<Mail />}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          autoComplete="email"
          error={fieldErrors.email}
          required
        />
        <AuthField
          id="login-password"
          label="Password"
          icon={<LockKeyhole />}
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
          autoComplete="current-password"
          error={fieldErrors.password}
          required
          trailingAction={
            <button
              className="password-toggle"
              type="button"
              aria-label={showPassword ? "Hide password" : "Show password"}
              aria-pressed={showPassword}
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff /> : <Eye />}
            </button>
          }
        />
        <label className="remember">
          <input
            type="checkbox"
            checked={remember}
            onChange={(event) => setRemember(event.target.checked)}
          />{" "}
          Remember me
        </label>
        <button className="auth-submit" disabled={loading}>
          {loading ? "Signing in..." : "Sign in"} <ArrowRight />
        </button>
      </form>
      <p className="auth-switch">
        New to CareerPilot? <Link to="/register">Create a free account</Link>
      </p>
    </AuthLayout>
  );
}
