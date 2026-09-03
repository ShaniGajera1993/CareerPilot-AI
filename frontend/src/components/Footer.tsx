import { CodeXml, Link, Sparkles } from "lucide-react";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-main">
        <div className="footer-brand">
          <a className="brand" href="#top">
            <span className="brand-mark">
              <Sparkles size={19} />
            </span>
            <span>
              CareerPilot<span>AI</span>
            </span>
          </a>
          <p>
            Your AI career coach for every step of the journey. Optimize. Match.
            Prepare. Get hired.
          </p>
          <div>
            <a href="#linkedin" aria-label="LinkedIn">
              <Link />
            </a>
            <a href="#github" aria-label="GitHub">
              <CodeXml />
            </a>
          </div>
        </div>
        <div>
          <strong>Product</strong>
          <a href="#features">Features</a>
          <a href="#pricing">Pricing</a>
          <a href="#how-it-works">How it works</a>
          <a href="#get-started">Career Coach</a>
        </div>
        <div>
          <strong>Resources</strong>
          <a href="#blog">Career Blog</a>
          <a href="#resume">Resume Guide</a>
          <a href="#interview">Interview Tips</a>
          <a href="#help">Help Center</a>
        </div>
        <div>
          <strong>Company</strong>
          <a href="#about">About</a>
          <a href="#privacy">Privacy</a>
          <a href="#terms">Terms</a>
          <a href="#contact">Contact</a>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© 2026 CareerPilot AI. All rights reserved.</span>
        <span>Made with ambition for ambitious people.</span>
      </div>
    </footer>
  );
}
