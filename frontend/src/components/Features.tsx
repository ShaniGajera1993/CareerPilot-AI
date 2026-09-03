import {
  BookOpen,
  Bot,
  BriefcaseBusiness,
  FileCheck2,
  MessageSquareText,
  PenLine,
  Target,
} from "lucide-react";

const features = [
  {
    icon: FileCheck2,
    tone: "purple",
    title: "AI Resume Optimizer",
    text: "Get an instant ATS score, uncover missing keywords, and turn ordinary bullet points into high-impact achievements.",
  },
  {
    icon: Target,
    tone: "green",
    title: "Smart Job Matching",
    text: "Compare your resume with any job description and see exactly where you match—and what you need to improve.",
  },
  {
    icon: PenLine,
    tone: "orange",
    title: "Cover Letter Generator",
    text: "Create tailored, company-specific cover letters in seconds, with a tone that sounds authentically like you.",
  },
  {
    icon: MessageSquareText,
    tone: "blue",
    title: "Interview Preparation",
    text: "Practice technical, behavioral, and HR questions with personalized feedback from your AI interview coach.",
  },
  {
    icon: BriefcaseBusiness,
    tone: "pink",
    title: "Application Tracker",
    text: "Keep every opportunity organized from wishlist to offer, including notes, deadlines, and interview schedules.",
  },
  {
    icon: BookOpen,
    tone: "teal",
    title: "Personal Learning Path",
    text: "Close your skill gaps with a practical weekly roadmap built around your target roles and career goals.",
  },
];

export function Features() {
  return (
    <section className="features-section" id="features">
      <div className="section-heading">
        <span>EVERYTHING YOU NEED</span>
        <h2>
          One platform. Every step to <em>getting hired.</em>
        </h2>
        <p>
          From your first resume draft to your final interview, CareerPilot
          gives you the tools and guidance to move forward with confidence.
        </p>
      </div>
      <div className="feature-grid">
        {features.map(({ icon: Icon, tone, title, text }) => (
          <article className="feature-card" key={title}>
            <span className={`feature-icon ${tone}`}>
              <Icon />
            </span>
            <h3>{title}</h3>
            <p>{text}</p>
            <a href="#get-started">
              Learn more <span>→</span>
            </a>
          </article>
        ))}
      </div>
      <div className="feature-banner">
        <div className="banner-icon">
          <Bot />
        </div>
        <div>
          <span>MEET YOUR AI CAREER COACH</span>
          <h3>Answers grounded in your experience—not generic advice.</h3>
          <p>
            Ask anything about your resume, strongest projects, missing skills,
            or job fit. CareerPilot understands your background and gives you
            answers that are truly personal.
          </p>
        </div>
        <div className="chat-demo">
          <div>
            <span className="chat-avatar">You</span>
            <p>Which experience should I highlight for this role?</p>
          </div>
          <div className="ai-answer">
            <span>
              <Bot size={15} />
            </span>
            <p>
              Your fintech redesign is the strongest match. It demonstrates the
              exact research and cross-functional leadership this role needs.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
