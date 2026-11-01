import { useEffect, useRef, useState } from "react";
import "../styles/Monitoring.css";

// Service URLs
const AI_URL = "http://127.0.0.1:8000";
const API_URL = "http://localhost:5000";

const CAMERA_ID = 1;
const COOLDOWN_MS = 30000;

// Safely read JSON responses
async function readResponse(response) {
  const text = await response.text();

  let data = {};

  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      throw new Error(
        `Server returned an invalid response (HTTP ${response.status}).`,
      );
    }
  }

  if (!response.ok) {
    throw new Error(
      data.detail ||
        data.error ||
        data.message ||
        `Request failed (HTTP ${response.status}).`,
    );
  }

  return data;
}

function Monitoring() {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const canvasRef = useRef(null);
  const lastLoggedRef = useRef(new Map());
  const busyRef = useRef(false);

  const [cameraStarted, setCameraStarted] = useState(false);
  const [results, setResults] = useState([]);
  const [recognizing, setRecognizing] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // Start the camera
  const startCamera = async () => {
    try {
      setError("");
      setMessage("");

      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error(
          "Camera access is unavailable. Open the app on localhost or HTTPS.",
        );
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: "user",
        },
        audio: false,
      });

      streamRef.current = stream;

      const video = videoRef.current;

      if (!video) {
        stream.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
        throw new Error("Camera preview could not be initialized.");
      }

      video.srcObject = stream;
      await video.play();

      setCameraStarted(true);
      setMessage("Camera started. You can now scan faces.");
    } catch (err) {
      console.error("Camera error:", err);
      setError(err.message || "Unable to access camera.");
    }
  };

  // Stop the camera
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setCameraStarted(false);
    setMessage("Camera stopped.");
  };

  // Send a recognized face event to Express
  const saveEntryEvent = async (face, index) => {
    const isKnown =
      Boolean(face.recognized) && face.student?.database_id != null;

    const logKey = isKnown
      ? `student-${face.student.database_id}`
      : `unknown-${CAMERA_ID}-${index}`;

    const now = Date.now();
    const lastLogged = lastLoggedRef.current.get(logKey) || 0;

    // Avoid repeatedly logging the same result
    if (now - lastLogged < COOLDOWN_MS) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/entry-events`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          student_id: isKnown ? face.student.database_id : null,
          camera_id: CAMERA_ID,
          event_type: isKnown ? "entry" : "unknown",
          confidence: face.confidence ?? null,
          review_status: isKnown ? "approved" : "pending",
        }),
      });

      await readResponse(response);

      // Start cooldown only after a successful save
      lastLoggedRef.current.set(logKey, Date.now());

      console.log(
        "Entry event saved:",
        isKnown ? face.student.name : "Unknown person",
      );
    } catch (err) {
      console.error("Entry event save failed:", err);

      setError(
        `Recognition completed, but saving the entry failed: ${err.message}`,
      );
    }
  };

  // Scan all faces in the current camera frame
  const recognizeFaces = async () => {
    if (busyRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas || !video.videoWidth || !video.videoHeight) {
      setError("Camera is not ready. Please wait and try again.");
      return;
    }

    busyRef.current = true;
    setRecognizing(true);
    setError("");
    setMessage("");

    try {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const context = canvas.getContext("2d");

      if (!context) {
        throw new Error("Unable to capture the camera frame.");
      }

      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      const image = canvas.toDataURL("image/jpeg", 0.9);

      let aiResponse;

      try {
        const response = await fetch(`${AI_URL}/recognize`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ image }),
        });

        aiResponse = await readResponse(response);
      } catch (err) {
        throw new Error(
          `AI service connection failed. Check that Uvicorn is running on port 8000. ${err.message}`,
        );
      }

      if (!Array.isArray(aiResponse.results)) {
        throw new Error(
          "Unexpected AI response. Expected an object containing a results array.",
        );
      }

      setResults(aiResponse.results);

      const count = aiResponse.results.length;

      setMessage(
        count === 0
          ? "No faces detected. Try better lighting or move closer."
          : `Detected ${count} face(s).`,
      );

      // Save each detected face independently
      for (const [index, face] of aiResponse.results.entries()) {
        await saveEntryEvent(face, index);
      }
    } catch (err) {
      console.error("Face recognition error:", err);
      setError(err.message || "Face recognition failed.");
    } finally {
      busyRef.current = false;
      setRecognizing(false);
    }
  };

  // Clean up the camera when leaving the page
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
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

      {error && (
        <div className="monitor-error" role="alert">
          {error}
        </div>
      )}

      {message && (
        <p className="monitor-message" role="status">
          {message}
        </p>
      )}

      <div className="monitor-grid">
        {/* Camera panel */}
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
              <button
                type="button"
                className="start-camera-btn"
                onClick={startCamera}
              >
                Start Camera
              </button>
            ) : (
              <>
                <button
                  type="button"
                  className="recognize-btn"
                  onClick={recognizeFaces}
                  disabled={recognizing}
                >
                  {recognizing ? "Scanning faces..." : "Scan All Faces"}
                </button>

                <button
                  type="button"
                  className="start-camera-btn"
                  onClick={stopCamera}
                  disabled={recognizing}
                >
                  Stop Camera
                </button>
              </>
            )}
          </div>
        </div>

        {/* Recognition results */}
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
                        face.recognized && face.student
                          ? "authorized-badge"
                          : "review-badge"
                      }
                    >
                      {face.recognized && face.student
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
                          <strong>{face.student.student_id ?? "-"}</strong>
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
                        No sufficiently confident match was found among enrolled
                        students. Please review this result.
                      </p>

                      {face.confidence != null && (
                        <p>
                          Similarity score: {(face.confidence * 100).toFixed(1)}
                          %
                        </p>
                      )}
                    </>
                  )}

                  {face.box && (
                    <p className="face-box-info">
                      Detected position: x={face.box[0]}, y=
                      {face.box[1]}, width={face.box[2]}, height=
                      {face.box[3]}
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
