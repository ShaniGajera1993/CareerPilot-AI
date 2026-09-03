import { CalendarDays, Plus } from "lucide-react";
import { useRef, useState } from "react";
import { DashboardHeader } from "../components/dashboard/DashboardHeader";
import { DashboardSidebar } from "../components/dashboard/DashboardSidebar";
import { OverviewCards } from "../components/dashboard/OverviewCards";
import { useAuth } from "../context/auth";
import "../components/dashboard/dashboard.css";

export function DashboardPage() {
  const [menu, setMenu] = useState(false);
  const [active, setActive] = useState("Overview");
  const [upload, setUpload] = useState("");
  const file = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  const firstName = user?.name.split(" ")[0] || "there";
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
          {upload && (
            <div className="dashboard-toast">
              <span>✓</span>
              {upload}
            </div>
          )}
          <section className="dashboard-welcome">
            <div>
              <span>SATURDAY, AUGUST 15</span>
              <h1>Good morning, {firstName} 👋</h1>
              <p>Let’s move your career forward today.</p>
            </div>
            <button onClick={() => file.current?.click()}>
              <Plus /> Upload new resume
            </button>
            <input
              ref={file}
              hidden
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={(event) => {
                const selected = event.target.files?.[0];
                if (selected)
                  setUpload(`${selected.name} uploaded successfully.`);
              }}
            />
          </section>
          {active === "Overview" ? (
            <OverviewCards />
          ) : (
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
