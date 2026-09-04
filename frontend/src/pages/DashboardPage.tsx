import { CalendarDays, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { DashboardHeader } from "../components/dashboard/DashboardHeader";
import { DashboardSidebar } from "../components/dashboard/DashboardSidebar";
import { OverviewCards } from "../components/dashboard/OverviewCards";
import { ResumeWorkspace } from "../components/resume/ResumeWorkspace";
import { useAuth } from "../context/auth";
import "../components/dashboard/dashboard.css";

export function DashboardPage() {
  const [menu, setMenu] = useState(false);
  const [active, setActive] = useState("Overview");
  const { user } = useAuth();
  const firstName = user?.name.split(" ")[0] || "there";

  useEffect(() => {
    const previousTitle = document.title;
    document.title = `${active} | CareerPilot AI`;

    return () => {
      document.title = previousTitle;
    };
  }, [active]);

  return (
    <div className="dashboard-shell">
      <DashboardSidebar
        open={menu}
        onClose={() => setMenu(false)}
        active={active}
        onSelect={setActive}
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
              ) : (
                <>
                  <span>CAREERPILOT WORKSPACE</span>
                  <h1>{active}</h1>
                  <p>This part of your workspace is coming together.</p>
                </>
              )}
            </div>
            {active === "Overview" && (
              <button type="button" onClick={() => setActive("My Resume")}>
                <Plus /> Upload new resume
              </button>
            )}
          </section>
          <div hidden={active !== "Overview"}>
            <OverviewCards />
          </div>
          <div hidden={active !== "My Resume"}>
            <ResumeWorkspace />
          </div>
          {active !== "Overview" && active !== "My Resume" && (
            <section className="workspace-placeholder">
              <CalendarDays />
              <h2>{active}</h2>
              <p>This workspace is ready to connect to your Laravel API.</p>
              <button onClick={() => setActive("Overview")}>
                Return to overview
              </button>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}
