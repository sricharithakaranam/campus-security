import "../styles/Sidebar.css";

function Sidebar() {
  return (
    <aside className="sidebar">

      <nav className="sidebar-nav">

        <div className="nav-section">
          <span className="nav-title">MAIN</span>

          <a href="/" className="nav-item active">
            <span>▦</span>
            Dashboard
          </a>

          <a href="/monitoring" className="nav-item">
            <span>◉</span>
            Live Monitoring
          </a>
        </div>

        <div className="nav-section">
          <span className="nav-title">MANAGEMENT</span>

          <a href="/students" className="nav-item">
            <span>♙</span>
            Students
          </a>

          <a href="/entry-logs" className="nav-item">
            <span>◷</span>
            Entry Logs
          </a>

          <a href="/alerts" className="nav-item">
            <span>⚠</span>
            Alerts
          </a>
        </div>

        <div className="nav-section">
          <span className="nav-title">SYSTEM</span>

          <a href="/cameras" className="nav-item">
            <span>▣</span>
            Cameras
          </a>

          <a href="/settings" className="nav-item">
            <span>⚙</span>
            Settings
          </a>
        </div>

      </nav>

      <div className="sidebar-footer">
        <div className="security-badge">
          <span>🛡️</span>
          <div>
            <strong>Security Active</strong>
            <small>AI monitoring enabled</small>
          </div>
        </div>
      </div>

    </aside>
  );
}

export default Sidebar;