import { useEffect, useState } from "react";
import "../styles/EntryLogs.css";

function EntryLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchLogs = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/entry-logs"
      );

      if (!response.ok) {
        throw new Error("Failed to fetch entry logs");
      }

      const data = await response.json();

      setLogs(data);
      setError("");
    } catch (err) {
      console.error(err);
      setError("Unable to load entry logs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();

    const interval = setInterval(fetchLogs, 5000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (time) => {
    if (!time) return "-";

    return new Date(time).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const formatDate = (time) => {
    if (!time) return "-";

    return new Date(time).toLocaleDateString([], {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="entry-logs-page">

      <div className="page-header">
        <div>
          <h2>Entry Logs</h2>
          <p>
            Monitor recognized campus entry events.
          </p>
        </div>

        <div className="logs-count">
          {logs.length} Records
        </div>
      </div>

      {error && (
        <div className="logs-error">
          {error}
        </div>
      )}

      <div className="logs-summary">

        <div className="summary-card">
          <span>Total Entries</span>
          <strong>{logs.length}</strong>
        </div>

        <div className="summary-card">
          <span>Recognized</span>
          <strong>
            {
              logs.filter(
                (log) =>
                  log.review_status === "approved"
              ).length
            }
          </strong>
        </div>

        <div className="summary-card">
          <span>Needs Review</span>
          <strong>
            {
              logs.filter(
                (log) =>
                  log.review_status !== "approved"
              ).length
            }
          </strong>
        </div>

      </div>

      <div className="logs-container">

        <div className="logs-header">
          <h3>Recent Entry Activity</h3>

          <button
            className="refresh-btn"
            onClick={fetchLogs}
          >
            ↻ Refresh
          </button>
        </div>

        {loading ? (
          <div className="logs-empty">
            Loading entry logs...
          </div>
        ) : logs.length === 0 ? (
          <div className="logs-empty">
            <div className="empty-icon">📋</div>

            <strong>No entry logs yet</strong>

            <span>
              Recognized students will appear here
              automatically.
            </span>
          </div>
        ) : (
          <div className="table-wrapper">

            <table className="entry-logs-table">

              <thead>
                <tr>
                  <th>Student</th>
                  <th>Student ID</th>
                  <th>Department</th>
                  <th>Camera</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Confidence</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {logs.map((log) => (
                  <tr key={log.id}>

                    <td>
                      <strong>
                        {log.name || "Unknown Person"}
                      </strong>
                    </td>

                    <td>
                      {log.student_id || "-"}
                    </td>

                    <td>
                      {log.department || "-"}
                    </td>

                    <td>
                      {log.camera_name || "-"}
                    </td>

                    <td>
                      {formatDate(log.entry_time)}
                    </td>

                    <td>
                      {formatTime(log.entry_time)}
                    </td>

                    <td>
                      {log.confidence !== null &&
                      log.confidence !== undefined
                        ? `${(
                            Number(log.confidence) * 100
                          ).toFixed(1)}%`
                        : "-"}
                    </td>

                    <td>
                      <span
                        className={
                          log.review_status ===
                          "approved"
                            ? "log-status approved"
                            : "log-status review"
                        }
                      >
                        {log.review_status ===
                        "approved"
                          ? "Recognized"
                          : "Needs Review"}
                      </span>
                    </td>

                  </tr>
                ))}
              </tbody>

            </table>

          </div>
        )}

      </div>

    </div>
  );
}

export default EntryLogs;