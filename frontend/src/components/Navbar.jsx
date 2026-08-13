import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useActiveUser } from "../context/UserContext.jsx";
import Avatar from "./Avatar.jsx";

const LINKS = [
  { to: "/", label: "Dashboard" },
  { to: "/explore", label: "Explore" },
  { to: "/skills/new", label: "Add Skill" },
  { to: "/requests", label: "My Requests" },
  { to: "/profile", label: "Profile" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { allUsers, activeUser, switchUser, loading } = useActiveUser();
  const navigate = useNavigate();

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <NavLink to="/" className="brand" onClick={() => setOpen(false)}>
          <span className="brand-mark">SS</span>
          SkillSwap
        </NavLink>

        <nav className={`nav-links ${open ? "open" : ""}`}>
          {LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === "/"}
              className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
              onClick={() => setOpen(false)}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="nav-right">
          {!loading && activeUser && (
            <div className="user-switcher" title="Switch active student">
              <Avatar name={activeUser.name} color={activeUser.avatarColor} size="sm" />
              <select
                value={activeUser._id}
                onChange={(e) => {
                  switchUser(e.target.value);
                  navigate("/");
                }}
              >
                {allUsers.map((u) => (
                  <option key={u._id} value={u._id}>
                    {u.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          <button
            className="nav-toggle"
            onClick={() => setOpen((o) => !o)}
            aria-label="Toggle navigation menu"
          >
            {open ? "✕" : "☰"}
          </button>
        </div>
      </div>
    </header>
  );
}
