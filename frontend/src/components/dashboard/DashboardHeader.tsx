import { useState } from "react";
import { Bell, LoaderCircle, LogOut, Menu, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/auth";

export function DashboardHeader({ onMenu }: { onMenu: () => void }) {
  const { user, logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const navigate = useNavigate();
  const initials =
    user?.name
      .split(" ")
      .map((part) => part[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "CP";

  async function handleLogout() {
    if (isLoggingOut) {
      return;
    }

    setIsLoggingOut(true);
    await logout();
    navigate("/", { replace: true });
  }

  return (
    <header className="dashboard-header">
      <button className="dashboard-menu" onClick={onMenu}>
        <Menu />
      </button>
      <label className="dashboard-search">
        <Search />
        <input placeholder="Search anything..." />
        <kbd>⌘ K</kbd>
      </label>
      <div className="dashboard-user">
        <button className="notification">
          <Bell />
          <i />
        </button>
        <span className="dashboard-avatar">{initials}</span>
        <div>
          <strong>{user?.name}</strong>
          <span>{user?.email}</span>
        </div>
        <button
          className="logout"
          onClick={handleLogout}
          disabled={isLoggingOut}
          aria-label={isLoggingOut ? "Logging out" : "Log out"}
          aria-busy={isLoggingOut}
          title="Log out"
        >
          {isLoggingOut ? <LoaderCircle className="spin" /> : <LogOut />}
        </button>
      </div>
    </header>
  );
}
