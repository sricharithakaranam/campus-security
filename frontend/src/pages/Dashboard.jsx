import StatCard from "../components/StatCard";
import "../styles/Dashboard.css";
import { useEffect, useState } from "react";

function Dashboard() {
  const [totalStudents, setTotalStudents] = useState(0);

  useEffect(() => {
    fetch("http://localhost:5000/stats")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch dashboard stats");
        }
        return response.json();
      })
      .then((data) => {
        setTotalStudents(data.totalStudents);
      })
      .catch((error) => {
        console.error("Dashboard stats error:", error);
      });
  }, []);

  return (
    <div className="dashboard">
      {/* Dashboard Header */}
      <div className="dashboard-header">
        <div className="welcome-content">
          <div>
            <h2>Welcome Back, Admin!</h2>
            <p>
              Here's what's happening with your campus security system today.
            </p>
          </div>
        </div>

        <div className="dashboard-date">
          <span className="calendar-icon">📅</span>
          <div>
            <strong>
              {new Date().toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </strong>
            <small>
              {new Date().toLocaleTimeString("en-IN", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              })}
            </small>
          </div>
        </div>
      </div>{" "}
      {/* Closed dashboard-header */}
      {/* Statistics Cards */}
      <div className="stats-grid">
        <StatCard
          icon="👥"
          title="Total Registered"
          value={totalStudents}
          description="Currently registered"
          type="students"
        />

        <StatCard
          icon="↪"
          title="Today's Entries"
          value="0"
          description="Entries recorded today"
          type="entries"
        />

        <StatCard
          icon="⚠"
          title="Unknown Persons"
          value="0"
          description="Needs review"
          type="alerts"
        />

        <StatCard
          icon="📹"
          title="Active Cameras"
          value="0"
          description="Cameras online"
          type="cameras"
        />
      </div>
    </div> // Closed dashboard main wrapper
  );
}

export default Dashboard;
