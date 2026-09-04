import { useId, type InputHTMLAttributes, type ReactNode } from "react";

type AuthFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  icon: ReactNode;
  action?: ReactNode;
  trailingAction?: ReactNode;
  error?: string;
};

export function AuthField({
  label,
  icon,
  action,
  trailingAction,
  error,
  id,
  ...props
}: AuthFieldProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const errorId = `${inputId}-error`;

  return (
    <label
      className={`auth-field${error ? " has-error" : ""}`}
      htmlFor={inputId}
    >
      <span>
        {label}
        {action}
      </span>
      <div>
        {icon}
        <input
          {...props}
          id={inputId}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : props["aria-describedby"]}
        />
        {trailingAction}
      </div>
      <small
        className="auth-field-error"
        id={errorId}
        aria-hidden={error ? undefined : true}
      >
        {error ?? ""}
      </small>
    </label>
  );
}
