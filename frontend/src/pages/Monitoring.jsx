
import { useEffect, useRef, useState } from "react";
import "../styles/Monitoring.css";

const AI_URL = "http://127.0.0.1:8000";
const API_URL = "http://localhost:5000";
const CAMERA_ID = 1;
const COOLDOWN_MS = 30000;

function Monitoring() {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const canvasRef = useRef(null);
  const lastLoggedRef = useRef(new Map());

  const [cameraStarted, setCameraStarted] = useState(false);
  const [results, setResults] = useState([]);
  const [recognizing, setRecognizing] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const startCamera = async () => {
    try {
      setError("");
      setMessage("");

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: "user" },
        audio: false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setCameraStarted(true);
    } catch (err) {
      console.error(err);
      setError("Unable to access camera. Check browser permissions.");
    }
  };

  const recognizeFaces = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas || !video.videoWidth || !video.videoHeight) {
      setError("Camera is not ready. Please wait and try again.");
      return;
    }

    setRecognizing(true);
    setError("");
    setMessage("");

    try {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const context = canvas.getContext("2d");
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      const image = canvas.toDataURL("image/jpeg", 0.9);

      const response = await fetch(`${AI_URL}/recognize`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Face recognition failed.");
      }

      // The updated AI returns { face_count, results: [...] }.
      if (!Array.isArray(data.results)) {
        throw new Error(
          "AI response format is outdated. Check that app.py was saved and Uvicorn reloaded."
        );
      }

      setResults(data.results);
      setMessage(
        data.face_count === 0
          ? "No faces detected. Try better lighting or move closer."
          : `Detected ${data.face_count} face(s).`
      );

    
for (const [index, face] of data.results.entries()) {
  const isKnown =
    face.recognized && face.student?.database_id;

  // Known student: use database ID.
  // Unknown face: use a temporary per-camera/index cooldown.
  const logKey = isKnown
    ? `student-${face.student.database_id}`
    : `unknown-${CAMERA_ID}-${index}`;

  const now = Date.now();
  const lastLogged = lastLoggedRef.current.get(logKey) || 0;

  if (now - lastLogged < COOLDOWN_MS) {
    continue;
  }

  lastLoggedRef.current.set(logKey, now);

  try {
    const logResponse = await fetch(
      `${API_URL}/entry-events`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          student_id: isKnown
            ? face.student.database_id
            : null,
          camera_id: CAMERA_ID,
          event_type: isKnown ? "entry" : "unknown",
          confidence: face.confidence ?? null,
          review_status: isKnown ? "approved" : "pending",
        }),
      }
    );

    if (!logResponse.ok) {
      lastLoggedRef.current.delete(logKey);
      console.error(
        "Entry event failed:",
        await logResponse.text()
      );
      setError("Could not save an entry event.");
    }
  } catch (logError) {
    lastLoggedRef.current.delete(logKey);
    console.error("Failed to save entry event:", logError);
    setError("Backend unavailable. Entry event was not saved.");
  }
}

    } catch (err) {
      console.error(err);
      setError(err.message || "Recognition failed.");
    } finally {
      setRecognizing(false);
    }
  };

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  return (
    <div className="monitoring-page">
      <div className="page-header">
        <div>
          <h2>Live Monitoring</h2>
          <p>Multi-face recognition and campus entry monitoring.</p>
        </div>

        <div className="monitor-status">
          <span className="status-dot" />
          System Online
        </div>
      </div>

      {error && <div className="monitor-error">{error}</div>}
      {message && <p className="monitor-message">{message}</p>}

      <div className="monitor-grid">
        <div className="camera-panel">
          <div className="panel-header">
            <div>
              <h3>Live Camera</h3>
              <span>Camera 01 • Main Entrance</span>
            </div>

            {cameraStarted && <span className="live-badge">● LIVE</span>}
          </div>

          <div className="live-camera">
            {!cameraStarted && (
              <div className="camera-placeholder">
                <div className="camera-icon">📷</div>
                <strong>Camera not started</strong>
                <span>Start the camera to scan multiple faces.</span>
              </div>
            )}

            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="monitor-video"
            />

            <canvas ref={canvasRef} style={{ display: "none" }} />
          </div>

          <div className="camera-actions">
            {!cameraStarted ? (
              <button className="start-camera-btn" onClick={startCamera}>
                Start Camera
              </button>
            ) : (
              <button
                className="recognize-btn"
                onClick={recognizeFaces}
                disabled={recognizing}
              >
                {recognizing ? "Scanning faces..." : "Scan All Faces"}
              </button>
            )}
          </div>
        </div>

        <div className="recognition-panel">
          <div className="panel-header">
            <div>
              <h3>Recognition Results</h3>
              <span>{results.length} face result(s)</span>
            </div>
          </div>

          {results.length === 0 ? (
            <div className="no-result">
              <div>🔍</div>
              <strong>No scan results yet</strong>
              <span>Start the camera and select Scan All Faces.</span>
            </div>
          ) : (
            <div className="multi-face-results">
              {results.map((face, index) => (
                <div
                  className="face-result-card"
                  key={`${face.student?.database_id ?? "unknown"}-${index}`}
                >
                  <div className="face-result-heading">
                    <span className="face-number">Face {index + 1}</span>
                    <span
                      className={
                        face.recognized
                          ? "authorized-badge"
                          : "review-badge"
                      }
                    >
                      {face.recognized
                        ? "Recognized"
                        : "Unknown / Needs Review"}
                    </span>
                  </div>

                  {face.recognized && face.student ? (
                    <>
                      <h3>{face.student.name}</h3>
                      <div className="student-details">
                        <div>
                          <span>Student ID</span>
                          <strong>{face.student.student_id}</strong>
                        </div>
                        <div>
                          <span>Department</span>
                          <strong>{face.student.department || "-"}</strong>
                        </div>
                        <div>
                          <span>Year</span>
                          <strong>{face.student.year ?? "-"}</strong>
                        </div>
                        <div>
                          <span>Similarity score</span>
                          <strong>
                            {face.confidence != null
                              ? `${(face.confidence * 100).toFixed(1)}%`
                              : "-"}
                          </strong>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <h3>Unknown Person</h3>
                      <p>
                        No sufficiently confident match was found among
                        enrolled students. Please review this result.
                      </p>
                      {face.confidence != null && (
                        <p>
                          Similarity score:{" "}
                          {(face.confidence * 100).toFixed(1)}%
                        </p>
                      )}
                    </>
                  )}

                  {face.box && (
                    <p className="face-box-info">
                      Detected position: x={face.box[0]}, y={face.box[1]},
                      width={face.box[2]}, height={face.box[3]}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Monitoring;
