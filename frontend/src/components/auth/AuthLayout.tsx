import type { ReactNode } from "react";
import { ArrowLeft, CheckCircle2, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import "./auth.css";

export function AuthLayout({
  children,
  title,
  description,
}: {
  children: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <main className="auth-page">
      <section className="auth-showcase">
        <Link className="auth-brand" to="/">
          <span>
            <Sparkles />
          </span>
          CareerPilot<em>AI</em>
        </Link>
        <div className="auth-message">
          <span className="auth-kicker">YOUR CAREER, ACCELERATED</span>
          <h1>Make every application your strongest one yet.</h1>
          <p>
            AI-powered tools that help you stand out, prepare with confidence,
            and land the role you deserve.
          </p>
          <div className="auth-benefits">
            <span>
              <CheckCircle2 /> ATS-ready resume insights
            </span>
            <span>
              <CheckCircle2 /> Personalized job matching
            </span>
            <span>
              <CheckCircle2 /> AI interview coaching
            </span>
          </div>
        </div>
        <p className="auth-quote">
          “CareerPilot gave me the confidence and clarity I needed to land my
          next role.”
        </p>
      </section>
      <section className="auth-form-side">
        <div className="auth-form-wrap">
          <Link className="back-link" to="/">
            <ArrowLeft /> Back to home
          </Link>
          <div className="auth-title">
            <h2>{title}</h2>
            <p>{description}</p>
          </div>
          {children}
        </div>
      </section>
    </main>
  );
}
