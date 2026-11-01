import { useEffect, useState } from "react";
import { get } from "../api";


export default function Alerts() {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    const loadAlerts = () => {
      get("/alerts")
        .then((data) => setAlerts(Array.isArray(data) ? data : []))
        .catch((error) => console.error("Failed to load alerts:", error));
    };

    loadAlerts();
    const timer = setInterval(loadAlerts, 5000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="alerts-page">
      <h1>Security Alerts</h1>
      <p>Unknown person detection alerts</p>

      {alerts.length === 0 ? (
        <div className="no-alerts">No alerts available.</div>
      ) : (
        alerts.map((alert) => (
          <div className="alert-card" key={alert.id}>
            <h3>⚠️ Unknown Person Detected</h3>
            <p>Camera: {alert.camera_name || "Unknown Camera"}</p>
            <p>
              Time:{" "}
              {alert.entry_time
                ? new Date(alert.entry_time).toLocaleString()
                : "Time unavailable"}
            </p>
            <p>Status: {alert.review_status || "Pending review"}</p>
          </div>
        ))
      )}
    </div>
  );
}
