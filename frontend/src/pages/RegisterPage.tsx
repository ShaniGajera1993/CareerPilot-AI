import { useState, type FormEvent } from "react";
import { ArrowRight, LockKeyhole, Mail, UserRound } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { AuthField } from "../components/auth/AuthField";
import { AuthLayout } from "../components/auth/AuthLayout";
import { useAuth } from "../context/auth";

export function RegisterPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();
  const update = (field: keyof typeof form, value: string) =>
    setForm((current) => ({ ...current, [field]: value }));

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    if (form.password !== form.confirm)
      return setError("Passwords do not match.");
    setLoading(true);
    try {
      await register(form);
      navigate("/dashboard", { replace: true });
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : "Unable to create account.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      title="Create your account"
      description="Start moving your career forward—free."
    >
      <form className="auth-form" onSubmit={submit}>
        {error && <p className="form-error">{error}</p>}
        <AuthField
          label="Full name"
          icon={<UserRound />}
          value={form.name}
          onChange={(e) => update("name", e.target.value)}
          placeholder="Your full name"
          autoComplete="name"
          required
        />
        <AuthField
          label="Email address"
          icon={<Mail />}
          type="email"
          value={form.email}
          onChange={(e) => update("email", e.target.value)}
          placeholder="you@example.com"
          autoComplete="email"
          required
        />
        <AuthField
          label="Password"
          icon={<LockKeyhole />}
          type="password"
          value={form.password}
          onChange={(e) => update("password", e.target.value)}
          placeholder="At least 6 characters"
          autoComplete="new-password"
          minLength={6}
          required
        />
        <AuthField
          label="Confirm password"
          icon={<LockKeyhole />}
          type="password"
          value={form.confirm}
          onChange={(e) => update("confirm", e.target.value)}
          placeholder="Repeat your password"
          autoComplete="new-password"
          minLength={6}
          required
        />
        <label className="terms">
          <input type="checkbox" required />
          <span>
            I agree to the <a href="#terms">Terms of Service</a> and{" "}
            <a href="#privacy">Privacy Policy</a>.
          </span>
        </label>
        <button className="auth-submit" disabled={loading}>
          {loading ? "Creating account..." : "Create free account"}{" "}
          <ArrowRight />
        </button>
      </form>
      <p className="auth-switch">
        Already have an account? <Link to="/login">Sign in</Link>
      </p>
    </AuthLayout>
  );
}
