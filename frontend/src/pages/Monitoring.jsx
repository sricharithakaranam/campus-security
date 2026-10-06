import React, { useEffect, useRef, useState } from "react";
import "../styles/Monitoring.css";

function Monitoring() {
  const videoRef = useRef(null);
  const [cameraError, setCameraError] = useState("");

  useEffect(() => {
    let stream;

    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error("Camera error:", error);
        setCameraError(
          "Camera access denied or unavailable. Please allow camera access."
        );
      }
    };

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  return (
    <div className="monitoring-page">

      {/* HEADER */}
      <div className="monitoring-header">
        <div>
          <h1>Live Monitoring</h1>
          <p>AI-powered campus security monitoring</p>
        </div>

        <div className="live-status">
          <span className="live-dot"></span>
          LIVE
        </div>
      </div>


      {/* CAMERA + RECOGNITION */}
      <div className="monitoring-grid">

        {/* CAMERA */}
        <div className="camera-card">

          <div className="camera-header">
            <div>
              <h2>Main Gate Camera</h2>
              <span>Camera 01</span>
            </div>

            <div className="camera-status">
              ● Online
            </div>
          </div>

          <div className="camera-feed">

            <video
              ref={videoRef}
              className="live-camera"
              autoPlay
              muted
              playsInline
            />

            {cameraError && (
              <div className="camera-error">
                ⚠️ {cameraError}
              </div>
            )}

            <div className="camera-time">
              LIVE
            </div>

            <div className="camera-label">
              MAIN GATE • CAMERA 01
            </div>

          </div>

        </div>


        {/* AI RECOGNITION */}
        <div className="recognition-card">

          <div className="card-title">
            <h2>Person Detected</h2>
            <span>AI Recognition</span>
          </div>


          {/* CURRENT RESULT */}
          <div className="recognition-result authorized">

            <div className="status-icon">
              ✓
            </div>

            <div className="status-content">

              <span className="status-label">
                AUTHORIZED
              </span>

              <h2>
                Test Student
              </h2>

              <p>
                Student ID: <strong>STU001</strong>
              </p>

            </div>

          </div>


          {/* STUDENT DETAILS */}
          <div className="student-details">

            <div className="detail-item">
              <span>Name</span>
              <strong>Test Student</strong>
            </div>

            <div className="detail-item">
              <span>Student ID</span>
              <strong>STU001</strong>
            </div>

            <div className="detail-item">
              <span>Department</span>
              <strong>Computer Science</strong>
            </div>

            <div className="detail-item">
              <span>Year</span>
              <strong>3</strong>
            </div>

            <div className="detail-item">
              <span>Entry Time</span>
              <strong>10:32:18 AM</strong>
            </div>

            <div className="detail-item">
              <span>Status</span>
              <strong>Authorized</strong>
            </div>

          </div>


          <button className="view-student-btn">
            View Student Details →
          </button>

        </div>

      </div>


      {/* TODAY'S ENTRIES */}
      <div className="entries-card">

        <div className="entries-header">

          <div>
            <h2>Today's Entries</h2>
            <p>Recent campus entry activity</p>
          </div>

          <button className="refresh-btn">
            ↻ Refresh
          </button>

        </div>


        <div className="table-wrapper">

          <table>

            <thead>
              <tr>
                <th>Person</th>
                <th>Student ID</th>
                <th>Department</th>
                <th>Status</th>
                <th>Entry Time</th>
                <th>Camera</th>
              </tr>
            </thead>

            <tbody>

              <tr>

                <td>
                  <div className="person-cell">

                    <div className="person-avatar">
                      TS
                    </div>

                    <strong>
                      Test Student
                    </strong>

                  </div>
                </td>

                <td>STU001</td>

                <td>Computer Science</td>

                <td>
                  <span className="status-badge authorized-badge">
                    ✓ Authorized
                  </span>
                </td>

                <td>10:32:18 AM</td>

                <td>Main Gate</td>

              </tr>


              <tr>

                <td>
                  <div className="person-cell">

                    <div className="person-avatar">
                      ST
                    </div>

                    <strong>
                      Student Two
                    </strong>

                  </div>
                </td>

                <td>STU002</td>

                <td>Information Technology</td>

                <td>
                  <span className="status-badge authorized-badge">
                    ✓ Authorized
                  </span>
                </td>

                <td>10:29:41 AM</td>

                <td>Main Gate</td>

              </tr>


              <tr>

                <td>
                  <div className="person-cell">

                    <div className="unknown-avatar">
                      ?
                    </div>

                    <strong>
                      Unknown Person
                    </strong>

                  </div>
                </td>

                <td>—</td>

                <td>—</td>

                <td>
                  <span className="status-badge unauthorized-badge">
                    ⚠ Unauthorized
                  </span>
                </td>

                <td>10:27:09 AM</td>

                <td>Main Gate</td>

              </tr>

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
}

export default Monitoring;