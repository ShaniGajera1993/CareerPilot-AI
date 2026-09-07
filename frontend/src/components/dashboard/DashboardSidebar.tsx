import {
  BarChart3,
  BookOpen,
  BriefcaseBusiness,
  FileSearch,
  FileText,
  LayoutDashboard,
  MessageSquareText,
  Sparkles,
  Target,
  X,
} from "lucide-react";
import { Link } from "react-router-dom";

const items = [
  { label: "Overview", icon: LayoutDashboard },
  { label: "My Resume", icon: FileText },
  { label: "Job Matcher", icon: Target },
  { label: "AI Toolkit", icon: FileSearch },
  { label: "Applications", icon: BriefcaseBusiness },
  { label: "Interview Prep", icon: MessageSquareText },
  { label: "Analytics", icon: BarChart3 },
  { label: "Learning Path", icon: BookOpen },
];

export function DashboardSidebar({
  open,
  onClose,
  active,
  onSelect,
}: {
  open: boolean;
  onClose: () => void;
  active: string;
  onSelect: (item: string) => void;
}) {
  return (
    <>
      <aside className={`dashboard-sidebar ${open ? "open" : ""}`}>
        <Link className="dashboard-brand" to="/">
          <span>
            <Sparkles />
          </span>
          CareerPilot<em>AI</em>
        </Link>
        <button
          type="button"
          className="dashboard-close"
          onClick={onClose}
          aria-label="Close menu"
        >
          <X />
        </button>
        <p>WORKSPACE</p>
        <nav>
          {items.map(({ label, icon: Icon }) => (
            <button
              type="button"
              className={active === label ? "active" : ""}
              key={label}
              aria-pressed={active === label}
              onClick={() => {
                onSelect(label);
                onClose();
              }}
            >
              <Icon />
              {label}
            </button>
          ))}
        </nav>
        <div className="dashboard-upgrade">
          <Sparkles />
          <strong>Unlock your potential</strong>
          <span>Get unlimited AI insights with CareerPilot Pro.</span>
          <button type="button" disabled title="CareerPilot Pro is coming soon">Explore Pro →</button>
        </div>
      </aside>
      {open && (
        <button
          className="dashboard-scrim"
          onClick={onClose}
          aria-label="Close menu"
        />
      )}
    </>
  );
}
