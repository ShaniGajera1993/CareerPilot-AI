import { FileSearch, Rocket, UploadCloud } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: UploadCloud,
    title: "Upload your resume",
    text: "Add your PDF or DOCX. CareerPilot securely parses your experience, skills, and achievements.",
  },
  {
    number: "02",
    icon: FileSearch,
    title: "Get personalized insights",
    text: "Our AI analyzes your resume, compares it with target roles, and identifies your biggest opportunities.",
  },
  {
    number: "03",
    icon: Rocket,
    title: "Apply with confidence",
    text: "Use tailored resumes, cover letters, and interview prep to stand out and land the right role.",
  },
];

export function HowItWorks() {
  return (
    <section className="how-section" id="how-it-works">
      <div className="section-heading">
        <span>HOW IT WORKS</span>
        <h2>
          From resume to ready in <em>three simple steps.</em>
        </h2>
      </div>
      <div className="steps">
        {steps.map(({ number, icon: Icon, title, text }, index) => (
          <article className="step" key={title}>
            <span className="step-number">{number}</span>
            <div className="step-icon">
              <Icon />
            </div>
            <h3>{title}</h3>
            <p>{text}</p>
            {index < steps.length - 1 && <i className="step-line" />}
          </article>
        ))}
      </div>
    </section>
  );
}
