import "../styles/EntryLogs.css";

function EntryLogs() {
  const logs = [
    {
      id: 1,
      studentId: "STU001",
      name: "Test Student",
      department: "Computer Science",
      time: "09:42 AM",
      date: "30 Sep 2026",
      camera: "Main Gate",
      status: "Authorized",
    },
    {
      id: 2,
      studentId: "UNKNOWN",
      name: "Unknown Person",
      department: "-",
      time: "09:51 AM",
      date: "30 Sep 2026",
      camera: "Main Gate",
      status: "Unauthorized",
    },
  ];

  return (
    <div className="entry-logs-page">

      <div className="page-header">
        <div>
          <h2>Entry Logs</h2>
          <p>
            View and track campus entry activity detected by the AI system.
          </p>
        </div>

        <button className="export-btn">
          Export Logs
        </button>
      </div>

      <div className="log-summary">

        <div className="log-summary-card">
          <span>Total Entries</span>
          <strong>2</strong>
        </div>

        <div className="log-summary-card">
          <span>Authorized</span>
          <strong>1</strong>
        </div>

        <div className="log-summary-card warning">
          <span>Unauthorized</span>
          <strong>1</strong>
        </div>

      </div>

      <div className="logs-container">

        <div className="logs-toolbar">
          <h3>Recent Entry Activity</h3>

          <div className="log-filters">
            <input
              type="date"
              className="date-filter"
            />

            <select className="status-filter">
              <option value="all">All Status</option>
              <option value="authorized">Authorized</option>
              <option value="unauthorized">Unauthorized</option>
            </select>
          </div>
        </div>

        <div className="logs-table-wrapper">

          <table className="logs-table">

            <thead>
              <tr>
                <th>Student ID</th>
                <th>Name</th>
                <th>Department</th>
                <th>Date</th>
                <th>Entry Time</th>
                <th>Camera</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>

              {logs.map((log) => (
                <tr key={log.id}>

                  <td>
                    <strong>{log.studentId}</strong>
                  </td>

                  <td>{log.name}</td>

                  <td>{log.department}</td>

                  <td>{log.date}</td>

                  <td>{log.time}</td>

                  <td>{log.camera}</td>

                  <td>
                    <span
                      className={
                        log.status === "Authorized"
                          ? "log-status authorized"
                          : "log-status unauthorized"
                      }
                    >
                      ● {log.status}
                    </span>
                  </td>

                </tr>
              ))}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
}

export default EntryLogs;