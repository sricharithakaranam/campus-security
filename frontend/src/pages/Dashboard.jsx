import StatCard from "../components/StatCard";
import "../styles/Dashboard.css";

function Dashboard() {
  return (
    <div className="dashboard">

      <div className="dashboard-header">
        <div>
          <h2>Security Dashboard</h2>
          <p>Real-time overview of campus security activity.</p>
        </div>

        <div className="dashboard-time">
          <span className="live-dot"></span>
          Live Monitoring
        </div>
      </div>

      <div className="stats-grid">

        <StatCard
          icon="♙"
          title="Registered Students"
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
          icon="▣"
          title="Active Cameras"
          value="0"
          description="Cameras online"
          type="cameras"
        />

      </div>

      <div className="dashboard-placeholder">
        <div className="placeholder-icon">◉</div>
        <h3>Live Activity</h3>
        <p>
          CCTV recognition activity will appear here once the AI service
          is connected.
        </p>
      </div>

    </div>
  );
}

export default Dashboard;