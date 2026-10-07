import { useEffect, useState } from "react";
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
      ["dashboard", "Dashboard", Home],
      ["monitoring", "Live Monitoring", Video],
    ],
  },
  {
    title: "MANAGEMENT",
    items: [
      ["students", "Students", Users],
      ["logs", "Entry Logs", FileText],
      ["alerts", "Alerts", Bell],
    ],
  },
  {
    title: "SYSTEM",
    items: [
      ["cameras", "Cameras", Video],
      ["reports", "Reports", BarChart3],
      ["settings", "Settings", Settings],
    ],
  },
];

export default function Sidebar({ page, setPage }) {
  const [alerts, setAlerts] = useState(0); // to preview the badge, use useState(3)

  useEffect(() => {
    const load = () =>
      get("/stats")
        .then((s) => setAlerts(s.unknown))
        .catch(() => {});
    load();
    const t = setInterval(load, 5000);
    return () => clearInterval(t);
  }, []);

  return (
    <aside className="sidebar">
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

      <nav className="sb-nav">
        {groups.map((g) => (
          <div key={g.title}>
            <p className="sb-title">{g.title}</p>
            {g.items.map(([id, label, Icon]) => (
              <button
                key={id}
                className={"sb-item" + (page === id ? " active" : "")}
                onClick={() => setPage(id)}
              >
                <Icon size={19} />
                <span>{label}</span>
                {id === "alerts" && alerts > 0 && (
                  <>
                    <i className="sb-badge">{alerts}</i>
                    <ChevronRight size={16} className="sb-chev" />
                  </>
                )}
              </button>
            ))}
          </div>
        ))}
      </nav>

      <div className="sb-campus" style={{ backgroundImage: `url(${campus})` }}>
        <div className="sb-campus-info">
          <span className="sb-mini-logo">
            <ShieldCheck size={22} />
          </span>
          <div>
            <b>Geethanjali Institute of Science and Technology</b>
            <small>
              <MapPin size={13} /> Nellore, Andhra Pradesh
            </small>
          </div>
        </div>
      </div>
    </aside>
  );
}
