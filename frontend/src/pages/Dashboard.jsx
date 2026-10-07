import StatCard from "../components/StatCard";
import "../styles/Dashboard.css";

function Dashboard() {
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
            <strong>06 Oct 2026</strong>
            <small>
              {new Date().toLocaleTimeString("en-IN", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              })}
            </small>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="stats-grid">
        <StatCard
          icon="👥"
          title="Total Registered"
          value="1"
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
    </div>
  );
}

export default Dashboard;
