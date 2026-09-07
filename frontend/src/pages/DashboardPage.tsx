import { CalendarDays, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { DashboardHeader } from "../components/dashboard/DashboardHeader";
import { DashboardSidebar } from "../components/dashboard/DashboardSidebar";
import { OverviewCards } from "../components/dashboard/OverviewCards";
import { ResumeWorkspace } from "../components/resume/ResumeWorkspace";
import { JobDescriptionWorkspace } from "../components/job/JobDescriptionWorkspace";
import { CareerAnalysisWorkspace } from "../components/analysis/CareerAnalysisWorkspace";
import { ApplicationTracker } from "../components/applications/ApplicationTracker";
import { InterviewWorkspace } from "../components/interviews/InterviewWorkspace";
import { AnalyticsWorkspace } from "../components/analytics/AnalyticsWorkspace";
import { useAuth } from "../context/auth";
import "../components/dashboard/dashboard.css";

export function DashboardPage() {
  const [menu, setMenu] = useState(false);
  const [active, setActive] = useState("Overview");
  const [resumeDirty, setResumeDirty] = useState(false);
  const [jobDirty, setJobDirty] = useState(false);
  const [applicationDirty, setApplicationDirty] = useState(false);
  const [interviewDirty, setInterviewDirty] = useState(false);
  const { user } = useAuth();
  const firstName = user?.name.split(" ")[0] || "there";

  useEffect(() => {
    const previousTitle = document.title;
    document.title = `${active} | CareerPilot AI`;

    return () => {
      document.title = previousTitle;
    };
  }, [active]);

  const hasUnsavedChanges = resumeDirty || jobDirty || applicationDirty || interviewDirty;

  useEffect(() => {
    if (!hasUnsavedChanges) return;
    const warnBeforeUnload = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ""; };
    window.addEventListener("beforeunload", warnBeforeUnload);
    return () => window.removeEventListener("beforeunload", warnBeforeUnload);
  }, [hasUnsavedChanges]);

  function selectSection(section: string) {
    if (section === active) return;
    setActive(section);
  }

  return (
    <div className="dashboard-shell">
      <DashboardSidebar
        open={menu}
        onClose={() => setMenu(false)}
        active={active}
        onSelect={selectSection}
      />
      <main className="dashboard-main">
        <DashboardHeader onMenu={() => setMenu(true)} />
        <div className="dashboard-content">
          <section className="dashboard-welcome">
            <div>
              {active === "Overview" ? (
                <>
                  <span>YOUR CAREER WORKSPACE</span>
                  <h1>Good to see you, {firstName}</h1>
                  <p>Let’s move your career forward today.</p>
                </>
              ) : active === "My Resume" ? (
                <>
                  <span>RESUME WORKSPACE</span>
                  <h1>My resume</h1>
                  <p>
                    Keep your strongest career story ready for every opportunity.
                  </p>
                </>
              ) : active === "Job Matcher" ? (
                <>
                  <h1>Target roles</h1>
                  <p>Save the job descriptions you want to compare with your resume.</p>
                </>
              ) : active === "AI Toolkit" ? (
                <>
                  <span>APPLICATION LAB</span>
                  <h1>AI toolkit</h1>
                  <p>Measure the match, strengthen your evidence, and draft the introduction.</p>
                </>
              ) : active === "Applications" ? (
                <><span>OPPORTUNITY PIPELINE</span><h1>Job tracker</h1><p>Keep every application, next step, and interview date in one place.</p></>
              ) : active === "Interview Prep" ? (
                <><span>LOCAL PRACTICE STUDIO</span><h1>Interview preparation</h1><p>Practice role-specific questions and improve each answer with private AI feedback.</p></>
              ) : active === "Analytics" ? (
                <><span>CAREER SIGNALS</span><h1>Progress analytics</h1><p>See how resume evidence, interview practice, and applications move together.</p></>
              ) : (
                <>
                  <span>CAREERPILOT WORKSPACE</span>
                  <h1>{active}</h1>
                  <p>This part of your workspace is coming together.</p>
                </>
              )}
            </div>
            {active === "Overview" && (
              <button type="button" onClick={() => selectSection("My Resume")}>
                <Plus /> Upload new resume
              </button>
            )}
          </section>
          {active === "Overview" && <OverviewCards onNavigate={selectSection} />}
          {active === "My Resume" && <ResumeWorkspace onDirtyChange={setResumeDirty} />}
          {active === "Job Matcher" && <JobDescriptionWorkspace onDirtyChange={setJobDirty} />}
          {active === "AI Toolkit" && <CareerAnalysisWorkspace />}
          {active === "Applications" && <ApplicationTracker onDirtyChange={setApplicationDirty} />}
          {active === "Interview Prep" && <InterviewWorkspace onDirtyChange={setInterviewDirty} />}
          {active === "Analytics" && <AnalyticsWorkspace />}
          {active !== "Overview" && active !== "My Resume" && active !== "Job Matcher" && active !== "AI Toolkit" && active !== "Applications" && active !== "Interview Prep" && active !== "Analytics" && (
            <section className="workspace-placeholder">
              <CalendarDays />
              <h2>{active}</h2>
              <p>This workspace is ready to connect to your Laravel API.</p>
              <button onClick={() => selectSection("Overview")}>
                Return to overview
              </button>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}
