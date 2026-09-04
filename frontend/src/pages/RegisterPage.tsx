import { useState, type FormEvent } from "react";
import {
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  UserRound,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { AuthField } from "../components/auth/AuthField";
import { AuthLayout } from "../components/auth/AuthLayout";
import { useAuth } from "../context/auth";
import { parseApiError, type ApiFieldErrors } from "../services/api";
import { focusFirstInvalidField } from "../utils/forms";

export function RegisterPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<ApiFieldErrors>({});
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();
  const update = (field: keyof typeof form, value: string) =>
    setForm((current) => ({ ...current, [field]: value }));

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setFieldErrors({});

    const clientErrors: ApiFieldErrors = {};

    if (form.password !== form.confirm) {
      clientErrors.confirm = "Passwords do not match.";
    }

    if (!acceptedTerms) {
      clientErrors.terms = "Accept the terms and privacy policy to continue.";
    }

    if (Object.keys(clientErrors).length > 0) {
      setError(Object.values(clientErrors)[0]);
      setFieldErrors(clientErrors);
      focusFirstInvalidField(clientErrors, "register");
      return;
    }

    setLoading(true);
    try {
      await register(form);
      navigate("/dashboard", { replace: true });
    } catch (reason) {
      const failure = parseApiError(reason, "Unable to create account.");

      setError(failure.message);
      setFieldErrors(failure.fieldErrors);
      focusFirstInvalidField(failure.fieldErrors, "register");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      title="Create your account"
      description="Start moving your career forward—free."
    >
      <form className="auth-form" onSubmit={submit} noValidate>
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        <AuthField
          id="register-name"
          label="Full name"
          icon={<UserRound />}
          value={form.name}
          onChange={(e) => update("name", e.target.value)}
          placeholder="Your full name"
          autoComplete="name"
          error={fieldErrors.name}
          required
        />
        <AuthField
          id="register-email"
          label="Email address"
          icon={<Mail />}
          type="email"
          value={form.email}
          onChange={(e) => update("email", e.target.value)}
          placeholder="you@example.com"
          autoComplete="email"
          error={fieldErrors.email}
          required
        />
        <AuthField
          id="register-password"
          label="Password"
          icon={<LockKeyhole />}
          type={showPassword ? "text" : "password"}
          value={form.password}
          onChange={(e) => update("password", e.target.value)}
          placeholder="At least 6 characters"
          autoComplete="new-password"
          error={fieldErrors.password}
          minLength={6}
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
        <AuthField
          id="register-confirm"
          label="Confirm password"
          icon={<LockKeyhole />}
          type={showConfirmation ? "text" : "password"}
          value={form.confirm}
          onChange={(e) => update("confirm", e.target.value)}
          placeholder="Repeat your password"
          autoComplete="new-password"
          error={fieldErrors.confirm}
          minLength={6}
          required
          trailingAction={
            <button
              className="password-toggle"
              type="button"
              aria-label={
                showConfirmation ? "Hide confirmation" : "Show confirmation"
              }
              aria-pressed={showConfirmation}
              onClick={() => setShowConfirmation(!showConfirmation)}
            >
              {showConfirmation ? <EyeOff /> : <Eye />}
            </button>
          }
        />
        <div className="terms-wrap">
          <label className="terms" htmlFor="register-terms">
            <input
              id="register-terms"
              type="checkbox"
              checked={acceptedTerms}
              onChange={(event) => setAcceptedTerms(event.target.checked)}
              aria-invalid={fieldErrors.terms ? true : undefined}
              aria-describedby={
                fieldErrors.terms ? "register-terms-error" : undefined
              }
              required
            />
            <span>
              I agree to the <a href="#terms">Terms of Service</a> and{" "}
              <a href="#privacy">Privacy Policy</a>.
            </span>
          </label>
          <small
            className="auth-field-error"
            id="register-terms-error"
            aria-hidden={fieldErrors.terms ? undefined : true}
          >
            {fieldErrors.terms ?? ""}
          </small>
        </div>
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
