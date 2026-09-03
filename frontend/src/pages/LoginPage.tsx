import { useState, type FormEvent } from "react";
import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AuthField } from "../components/auth/AuthField";
import { AuthLayout } from "../components/auth/AuthLayout";
import { useAuth } from "../context/auth";

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      const from = (location.state as { from?: { pathname?: string } } | null)
        ?.from?.pathname;
      navigate(from || "/dashboard", { replace: true });
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to sign in.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      title="Welcome back"
      description="Sign in to continue building your career."
    >
      <form className="auth-form" onSubmit={submit}>
        {error && <p className="form-error">{error}</p>}
        <AuthField
          label="Email address"
          icon={<Mail />}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          autoComplete="email"
          required
        />
        <AuthField
          label="Password"
          icon={<LockKeyhole />}
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
          autoComplete="current-password"
          required
          action={<Link to="/login">Forgot password?</Link>}
        />
        <button
          className="password-toggle"
          type="button"
          aria-label="Show password"
          onClick={() => setShowPassword(!showPassword)}
        >
          {showPassword ? <EyeOff /> : <Eye />}
        </button>
        <label className="remember">
          <input type="checkbox" /> Remember me
        </label>
        <button className="auth-submit" disabled={loading}>
          {loading ? "Signing in..." : "Sign in"} <ArrowRight />
        </button>
      </form>
      <p className="auth-switch">
        New to CareerPilot? <Link to="/register">Create a free account</Link>
      </p>
      <div className="demo-note">
        Demo mode: use any valid email and a password with 6+ characters.
      </div>
    </AuthLayout>
  );
}
