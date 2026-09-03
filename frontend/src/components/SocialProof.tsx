import { Star } from "lucide-react";

export function SocialProof() {
  return (
    <section className="social-proof" aria-label="Customer proof">
      <p>Trusted by ambitious professionals from</p>
      <div className="company-list">
        <span>Google</span>
        <span>amazon</span>
        <span>Microsoft</span>
        <span>Spotify</span>
        <span>airbnb</span>
      </div>
      <div className="rating">
        <div className="faces">
          <i>AM</i>
          <i>JL</i>
          <i>KR</i>
          <i>+</i>
        </div>
        <span>
          <strong>
            <Star fill="currentColor" /> 4.9
          </strong>{" "}
          from 2,000+ career wins
        </span>
      </div>
    </section>
  );
}
