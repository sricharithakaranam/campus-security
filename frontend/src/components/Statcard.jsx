import "../styles/StatCard.css";

function StatCard({ icon, title, value, description, type }) {
  return (
    <div className="stat-card">
      <div className={`stat-icon ${type || ""}`}>
        {icon}
      </div>

      <div className="stat-info">
        <span className="stat-title">{title}</span>
        <strong className="stat-value">{value}</strong>
        <span className="stat-description">{description}</span>
      </div>
    </div>
  );
}

export default StatCard;