import { ArrowRight, CheckCircle2, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

type CallToActionProps = { onAction: (message: string) => void };

export function CallToAction({ onAction }: CallToActionProps) {
  const navigate = useNavigate();
  return (
    <section className="cta-section" id="get-started">
      <div className="cta-glow" />
      <Sparkles className="cta-spark one" />
      <Sparkles className="cta-spark two" />
      <span className="cta-label">YOUR NEXT OPPORTUNITY STARTS HERE</span>
      <h2>
        Ready to build a career
        <br />
        you’re proud of?
      </h2>
      <p>
        Join thousands of professionals using CareerPilot to get noticed, get
        prepared, and get hired.
      </p>
      <button
        onClick={() => {
          onAction("Welcome to CareerPilot—your journey starts now!");
          navigate("/register");
        }}
      >
        Start your journey free <ArrowRight />
      </button>
      <div>
        <span>
          <CheckCircle2 /> No credit card
        </span>
        <span>
          <CheckCircle2 /> Set up in 2 minutes
        </span>
        <span>
          <CheckCircle2 /> Cancel anytime
        </span>
      </div>
    </section>
  );
}
