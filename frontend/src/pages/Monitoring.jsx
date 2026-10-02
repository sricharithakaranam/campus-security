import { useState } from "react";
import "../styles/Monitoring.css";

function Monitoring() {
  const [selectedCamera, setSelectedCamera] = useState("Main Gate");

  const cameras = [
    {
      id: 1,
      name: "Main Gate",
      location: "North Entrance",
      status: "Online",
    },
    {
      id: 2,
      name: "Library Entrance",
      location: "Library Block",
      status: "Online",
    },
    {
      id: 3,
      name: "Admin Block",
      location: "Admin Building",
      status: "Offline",
    },
  ];

  return (
    <div className="monitoring-page">

      <div className="monitoring-header">
        <div>
          <h2>Live Monitoring</h2>
          <p>
            Monitor campus CCTV feeds and AI recognition activity.
          </p>
        </div>

        <div className="monitoring-status">
          <span className="live-indicator"></span>
          AI Monitoring Active
        </div>
      </div>

      <div className="monitoring-layout">

        {/* Camera List */}
        <aside className="camera-list">

          <div className="camera-list-header">
            <h3>Cameras</h3>
            <span>{cameras.length}</span>
          </div>

          {cameras.map((camera) => (
            <button
              key={camera.id}
              className={`camera-item ${
                selectedCamera === camera.name ? "selected" : ""
              }`}
              onClick={() => setSelectedCamera(camera.name)}
            >
              <div className="camera-icon">
                ▣
              </div>

              <div className="camera-info">
                <strong>{camera.name}</strong>
                <span>{camera.location}</span>

                <small
                  className={
                    camera.status === "Online"
                      ? "camera-online"
                      : "camera-offline"
                  }
                >
                  ● {camera.status}
                </small>
              </div>
            </button>
          ))}

        </aside>

        {/* Main Camera */}
        <section className="camera-view-section">

          <div className="camera-view-header">
            <div>
              <h3>{selectedCamera}</h3>
              <span>Live CCTV Feed</span>
            </div>

            <span className="recording-badge">
              ● LIVE
            </span>
          </div>

          <div className="camera-screen">

            <div className="camera-placeholder">

              <div className="camera-placeholder-icon">
                ▣
              </div>

              <h3>Camera Feed</h3>

              <p>
                CCTV stream will appear here when the camera
                service is connected.
              </p>

              <span className="camera-connection">
                Waiting for video stream...
              </span>

            </div>

            <div className="camera-overlay">
              <span>{selectedCamera}</span>
              <span>AI SECURITY SYSTEM</span>
              <span>LIVE</span>
            </div>

          </div>

        </section>

      </div>

      {/* Recognition Panel */}

      <section className="recognition-panel">

        <div className="recognition-header">
          <div>
            <h3>Latest Recognition</h3>
            <p>AI face recognition results</p>
          </div>

          <span className="recognition-active">
            ● Listening
          </span>
        </div>

        <div className="recognition-content">

          <div className="face-placeholder">
            ?
          </div>

          <div className="recognition-info">

            <span className="recognition-label">
              STATUS
            </span>

            <strong>
              Waiting for face detection
            </strong>

            <p>
              When a person enters the camera frame,
              the AI service will attempt to identify them.
            </p>

          </div>

        </div>

      </section>

    </div>
  );
}

export default Monitoring;