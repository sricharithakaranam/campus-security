import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import {
  Home,
  Video,
  Users,
  FileText,
  Bell,
  BarChart3,
  Settings,
  ChevronRight,
  ShieldCheck,
  MapPin,
} from "lucide-react";

import { get } from "../api";
import campus from "../assets/college.jpg";
import "../styles/Sidebar.css";

const groups = [
  {
    title: "MAIN",
    items: [
      ["dashboard", "Dashboard", Home, "/dashboard"],
      ["monitoring", "Live Monitoring", Video, "/monitoring"],
    ],
  },
  {
    title: "MANAGEMENT",
    items: [
      ["students", "Students", Users, "/students"],
      ["logs", "Entry Logs", FileText, "/entry-logs"],
      ["alerts", "Alerts", Bell, "/alerts"],
    ],
  },
  {
    title: "SYSTEM",
    items: [
      ["cameras", "Cameras", Video, "/cameras"],
      ["reports", "Reports", BarChart3, "/reports"],
      ["settings", "Settings", Settings, "/settings"],
    ],
  },
];

export default function Sidebar() {
  const [alerts, setAlerts] = useState(0);

  useEffect(() => {
    const load = () => {
      get("/stats")
        .then((s) => setAlerts(s.unknown || 0))
        .catch(() => {
          setAlerts(0);
        });
    };

    load();

    const timer = setInterval(load, 5000);

    return () => clearInterval(timer);
  }, []);

  return (
    <aside className="sidebar">

      {/* BRAND */}
      <div className="sb-brand">
        <span className="sb-logo">
          <ShieldCheck size={26} />
        </span>

        <div>
          <b>
            CAMPUS <em>GUARD</em>
          </b>

          <small>GIST Nellore</small>
        </div>
      </div>

      {/* NAVIGATION */}
      <nav className="sb-nav">
        {groups.map((group) => (
          <div key={group.title}>
            <p className="sb-title">{group.title}</p>

            {group.items.map(([id, label, Icon, path]) => (
              <NavLink
                key={id}
                to={path}
                className={({ isActive }) =>
                  `sb-item${isActive ? " active" : ""}`
                }
              >
                <Icon size={19} />

                <span>{label}</span>

                {id === "alerts" && alerts > 0 && (
                  <>
                    <i className="sb-badge">{alerts}</i>
                    <ChevronRight
                      size={16}
                      className="sb-chev"
                    />
                  </>
                )}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      {/* CAMPUS CARD */}
      <div
        className="sb-campus"
        style={{
          backgroundImage: `url(${campus})`,
        }}
      >
        <div className="sb-campus-info">
          <span className="sb-mini-logo">
            <ShieldCheck size={22} />
          </span>

          <div>
            <b>
              Geethanjali Institute of Science and Technology
            </b>

            <small>
              <MapPin size={13} />
              Nellore, Andhra Pradesh
            </small>
          </div>
        </div>
      </div>

    </aside>
  );
}