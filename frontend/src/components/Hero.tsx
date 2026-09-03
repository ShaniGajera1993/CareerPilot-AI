import {
  ArrowRight,
  CheckCircle2,
  FileText,
  Sparkles,
  Target,
  WandSparkles,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

type HeroProps = { onAction: (message: string) => void };

export function Hero({ onAction }: HeroProps) {
  const navigate = useNavigate();
  return (
    <section className="hero-section" id="top">
      <div className="hero-glow glow-one" />
      <div className="hero-glow glow-two" />
      <div className="hero-copy">
        <div className="announcement">
          <Sparkles size={14} /> Your AI-powered career copilot{" "}
          <ArrowRight size={14} />
        </div>
        <h1>
          Land your next role with <span>AI on your side.</span>
        </h1>
        <p>
          Optimize your resume, discover your best-fit jobs, and prepare for
          every interview—all with personalized AI guidance.
        </p>
        <div className="hero-actions">
          <button
            className="primary-cta"
            onClick={() => {
              onAction("Let’s build your winning resume!");
              navigate("/register");
            }}
          >
            Build my resume free <ArrowRight size={17} />
          </button>
          <a className="secondary-cta" href="#how-it-works">
            <span>▶</span> See how it works
          </a>
        </div>
        <div className="hero-note">
          <span>
            <CheckCircle2 /> No credit card required
          </span>
          <span>
            <CheckCircle2 /> Free to get started
          </span>
        </div>
      </div>
      <div
        className="hero-visual"
        aria-label="CareerPilot resume analysis preview"
      >
        <div className="orb orb-one" />
        <div className="orb orb-two" />
        <div className="app-preview">
          <div className="preview-top">
            <span className="preview-logo">
              <WandSparkles size={15} />
            </span>
            <strong>Resume Analysis</strong>
            <span className="window-dots">•••</span>
          </div>
          <div className="preview-body">
            <div className="resume-mini">
              <div className="resume-head">
                <div className="person-avatar">SG</div>
                <div>
                  <i />
                  <i />
                </div>
              </div>
              <div className="resume-lines">
                <i />
                <i />
                <i />
                <strong>EXPERIENCE</strong>
                <i />
                <i />
                <i />
                <strong>SKILLS</strong>
                <div className="skill-chips">
                  <span />
                  <span />
                  <span />
                </div>
              </div>
            </div>
            <div className="analysis-panel">
              <div className="score-row">
                <div className="landing-score">
                  <strong>92</strong>
                  <span>ATS SCORE</span>
                </div>
                <div>
                  <span className="excellent">
                    <Sparkles size={11} /> Excellent
                  </span>
                  <p>Top 8% of resumes</p>
                </div>
              </div>
              <div className="insight">
                <CheckCircle2 />
                <div>
                  <strong>Strong impact statements</strong>
                  <span>Your achievements are clear and measurable.</span>
                </div>
              </div>
              <div className="insight">
                <CheckCircle2 />
                <div>
                  <strong>Great keyword coverage</strong>
                  <span>18 of 20 key skills detected.</span>
                </div>
              </div>
              <button
                onClick={() =>
                  onAction("Full analysis is ready for your resume.")
                }
              >
                View full analysis <ArrowRight size={13} />
              </button>
            </div>
          </div>
        </div>
        <div className="floating-card match-float">
          <span>
            <Target />
          </span>
          <div>
            <small>JOB MATCH</small>
            <strong>89% match</strong>
          </div>
          <CheckCircle2 />
        </div>
        <div className="floating-card improve-float">
          <span>
            <FileText />
          </span>
          <div>
            <small>AI SUGGESTION</small>
            <strong>3 improvements found</strong>
          </div>
        </div>
      </div>
    </section>
  );
}
