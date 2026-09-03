import { useState } from "react";
import { Menu, Sparkles, X } from "lucide-react";
import { Link } from "react-router-dom";

type NavbarProps = { onAction: (message: string) => void };

export function Navbar({ onAction }: NavbarProps) {
  const [open, setOpen] = useState(false);
  const links = ["Features", "How it works", "Resources", "Pricing"];

  return (
    <header className="site-header">
      <a className="brand" href="#top" aria-label="CareerPilot AI home">
        <span className="brand-mark">
          <Sparkles size={19} />
        </span>
        <span>
          CareerPilot<span>AI</span>
        </span>
      </a>
      <nav className={open ? "open" : ""} aria-label="Primary navigation">
        {links.map((link) => (
          <a
            key={link}
            href={`#${link.toLowerCase().replaceAll(" ", "-")}`}
            onClick={() => setOpen(false)}
          >
            {link}
          </a>
        ))}
        <div className="mobile-actions">
          <Link className="text-button" to="/login">
            Log in
          </Link>
          <Link
            className="nav-cta"
            to="/register"
            onClick={() => onAction("Create your free CareerPilot account.")}
          >
            Get started free
          </Link>
        </div>
      </nav>
      <div className="nav-actions">
        <Link className="text-button" to="/login">
          Log in
        </Link>
        <Link className="nav-cta" to="/register">
          Get started free
        </Link>
      </div>
      <button
        className="menu-toggle"
        onClick={() => setOpen(!open)}
        aria-label="Toggle navigation"
      >
        {open ? <X /> : <Menu />}
      </button>
    </header>
  );
}
