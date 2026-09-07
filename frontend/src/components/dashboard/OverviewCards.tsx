import {
  ArrowRight,
  Bot,
  CheckCircle2,
  Clock3,
  FileCheck2,
  MessageSquareText,
  MoreHorizontal,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";
import { useState } from "react";

const applications = [
  {
    logo: "N",
    role: "Senior Product Designer",
    company: "Northstar Labs",
    date: "Today",
    status: "Interview",
  },
  {
    logo: "V",
    role: "Product Designer",
    company: "Vertex Systems",
    date: "Aug 12",
    status: "Applied",
  },
  {
    logo: "A",
    role: "UX Designer",
    company: "Altitude",
    date: "Aug 10",
    status: "Wishlist",
  },
];

export function OverviewCards({ onNavigate }: { onNavigate: (section: string) => void }) {
  const [job, setJob] = useState("");
  const [message, setMessage] = useState("");
  const flash = (text: string) => {
    setMessage(text);
    window.setTimeout(() => setMessage(""), 2200);
  };
  return (
    <>
      {message && (
        <div className="dashboard-toast">
          <CheckCircle2 />
          {message}
        </div>
      )}
      <section className="dashboard-cards">
        <article className="dash-card health-card">
          <header>
            <span>
              <FileCheck2 />
            </span>
            <strong>Resume health</strong>
            <MoreHorizontal />
          </header>
          <div className="health-body">
            <div className="dash-score">
              <strong>82</strong>
              <small>/ 100</small>
            </div>
            <div>
              <em>Great foundation!</em>
              <p>
                Your resume is performing better than <b>76%</b> of candidates.
              </p>
              <button type="button" onClick={() => onNavigate("AI Toolkit")}>
                View full analysis <ArrowRight />
              </button>
            </div>
          </div>
          <footer>
            <span>
              <TrendingUp /> +8 points this month
            </span>
            <small>Updated 2h ago</small>
          </footer>
        </article>
        <article className="dash-card match-card">
          <header>
            <span>
              <Target />
            </span>
            <strong>Quick job match</strong>
            <em>
              <Sparkles /> AI powered
            </em>
          </header>
          <p>Paste a job description and see how well your resume fits.</p>
          <textarea
            className="resize-none"
            maxLength={3000}
            value={job}
            onChange={(event) => setJob(event.target.value)}
            placeholder="Paste a job description here..."
          />
          <footer>
            <small>{job.length} / 3,000</small>
            <button
              disabled={!job.trim()}
              onClick={() =>
                flash("Match complete — your resume is an 86% fit!")
              }
            >
              Analyze match <ArrowRight />
            </button>
          </footer>
        </article>
        <article className="coach-dash-card">
          <header>
            <span>
              <Bot />
            </span>
            <div>
              <strong>AI Career Coach</strong>
              <small>Online and ready to help</small>
            </div>
            <i />
          </header>
          <p>
            “What should I focus on to become a stronger candidate for senior
            roles?”
          </p>
          <button onClick={() => flash("Your AI coach conversation is ready.")}>
            <MessageSquareText /> Ask your coach <ArrowRight />
          </button>
        </article>
      </section>
      <section className="dashboard-lower">
        <article className="dash-card applications-panel">
          <header>
            <div>
              <h2>Recent applications</h2>
              <p>Keep track of your job search progress</p>
            </div>
            <button type="button" onClick={() => onNavigate("Applications")}>
              View all <ArrowRight />
            </button>
          </header>
          {applications.map((item) => (
            <div className="application-item" key={item.company}>
              <span className={`company ${item.logo.toLowerCase()}`}>
                {item.logo}
              </span>
              <div>
                <strong>{item.role}</strong>
                <span>{item.company}</span>
              </div>
              <small>
                <Clock3 />
                {item.date}
              </small>
              <em className={item.status.toLowerCase()}>{item.status}</em>
            </div>
          ))}
        </article>
        <article className="dash-card skills-panel">
          <header>
            <div>
              <h2>Skills snapshot</h2>
              <p>Based on your latest resume</p>
            </div>
            <MoreHorizontal />
          </header>
          {[
            ["Product Design", 92],
            ["User Research", 84],
            ["Prototyping", 78],
          ].map(([name, value]) => (
            <div className="dash-skill" key={name}>
              <span>
                {name}
                <b>{value}%</b>
              </span>
              <i>
                <em style={{ width: `${value}%` }} />
              </i>
            </div>
          ))}
          <button type="button" onClick={() => onNavigate("AI Toolkit")}>
            View skill analysis <ArrowRight />
          </button>
        </article>
      </section>
    </>
  );
}
