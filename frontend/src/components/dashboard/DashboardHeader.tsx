import { Bell, LogOut, Menu, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/auth";

export function DashboardHeader({ onMenu }: { onMenu: () => void }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const initials =
    user?.name
      .split(" ")
      .map((part) => part[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "CP";

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
          onClick={() => {
            logout();
            navigate("/");
          }}
          title="Log out"
        >
          <LogOut />
        </button>
      </div>
    </header>
  );
}
