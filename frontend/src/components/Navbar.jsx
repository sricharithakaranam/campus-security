import "../styles/Navbar.css";

function Navbar() {
  return (
    <header className="navbar">
      <div className="navbar-brand">
        <div className="brand-icon">🛡️</div>
        <div>
          <h1>Campus Secure</h1>
          <span>AI Campus Monitoring</span>
        </div>
      </div>

      <div className="navbar-right">
        <div className="system-status">
          <span className="status-dot"></span>
          System Online
        </div>

        <div className="admin-profile">
          <div className="admin-avatar">A</div>
          <div>
            <strong>Admin</strong>
            <span>Security Officer</span>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Navbar;