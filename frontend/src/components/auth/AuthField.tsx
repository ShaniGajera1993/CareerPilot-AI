import type { InputHTMLAttributes, ReactNode } from "react";

type AuthFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  icon: ReactNode;
  action?: ReactNode;
};

export function AuthField({ label, icon, action, ...props }: AuthFieldProps) {
  return (
    <label className="auth-field">
      <span>
        {label}
        {action}
      </span>
      <div>
        {icon}
        <input {...props} />
      </div>
    </label>
  );
}
