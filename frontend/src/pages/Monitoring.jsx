import { useEffect, useRef, useState } from "react";
import "../styles/Monitoring.css";

function Monitoring() {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const canvasRef = useRef(null);

  const [cameraStarted, setCameraStarted] = useState(false);
  const [result, setResult] = useState(null);
  const [recognizing, setRecognizing] = useState(false);
  const [error, setError] = useState("");

  const startCamera = async () => {
    try {
      setError("");

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: 640,
          height: 480,
          facingMode: "user",
        },
        audio: false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      setCameraStarted(true);
    } catch (err) {
      console.error(err);
      setError("Unable to access camera.");
    }
  };

  const recognizeFace = async () => {
    const video = videoRef.current;

    if (!video || !video.videoWidth || !video.videoHeight) {
      setError("Camera is not ready.");
      return;
    }

    setRecognizing(true);
    setError("");

    try {
      const canvas = canvasRef.current;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const context = canvas.getContext("2d");

      context.drawImage(
        video,
        0,
        0,
        canvas.width,
        canvas.height
      );

      const image = canvas.toDataURL("image/jpeg", 0.9);

      // Send image to AI recognition service
      const response = await fetch(
        "http://127.0.0.1:8000/recognize",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            image,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Recognition failed."
        );
      }

      setResult(data);

      // Create entry log for recognized student
      if (data.recognized && data.student) {
        try {
          const logResponse = await fetch(
            "http://localhost:5000/entry-events",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                student_id: data.student.database_id,
                camera_id: 1,
                event_type: "entry",
                confidence: data.confidence,
                review_status: "approved",
              }),
            }
          );

          if (!logResponse.ok) {
            console.error(
              "Entry log failed:",
              await logResponse.text()
            );
          }
        } catch (logError) {
          console.error(
            "Failed to create entry log:",
            logError
          );
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
        streamRef.current
          .getTracks()
          .forEach((track) => track.stop());
      }
    };
  }, []);

  return (
    <div className="monitoring-page">

      <div className="page-header">
        <div>
          <h2>Live Monitoring</h2>
          <p>
            AI-powered face recognition and campus monitoring.
          </p>
        </div>

        <div className="monitor-status">
          <span className="status-dot"></span>
          System Online
        </div>
      </div>

      {error && (
        <div className="monitor-error">
          {error}
        </div>
      )}

      <div className="monitor-grid">

        {/* CAMERA */}
        <div className="camera-panel">

          <div className="panel-header">
            <div>
              <h3>Live Camera</h3>
              <span>Camera 01 • Main Entrance</span>
            </div>

            {cameraStarted && (
              <span className="live-badge">
                ● LIVE
              </span>
            )}
          </div>

          <div className="live-camera">

            {!cameraStarted && (
              <div className="camera-placeholder">
                <div className="camera-icon">📷</div>

                <strong>Camera not started</strong>

                <span>
                  Start the camera to begin recognition.
                </span>
              </div>
            )}

            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="monitor-video"
            />

            <canvas
              ref={canvasRef}
              style={{ display: "none" }}
            />

          </div>

          <div className="camera-actions">

            {!cameraStarted ? (
              <button
                className="start-camera-btn"
                onClick={startCamera}
              >
                Start Camera
              </button>
            ) : (
              <button
                className="recognize-btn"
                onClick={recognizeFace}
                disabled={recognizing}
              >
                {recognizing
                  ? "Recognizing..."
                  : "Recognize Face"}
              </button>
            )}

          </div>

        </div>

        {/* RECOGNITION */}
        <div className="recognition-panel">

          <div className="panel-header">
            <div>
              <h3>Recognition Result</h3>
              <span>Latest AI analysis</span>
            </div>
          </div>

          {!result && (
            <div className="no-result">
              <div>🔍</div>

              <strong>No recognition yet</strong>

              <span>
                Capture a face to identify the person.
              </span>
            </div>
          )}

          {result && result.recognized && (
            <div className="recognized-result">

              <div className="recognized-icon">
                ✓
              </div>

              <h2>{result.student.name}</h2>

              <span className="authorized-badge">
                Authorized Student
              </span>

              <div className="student-details">

                <div>
                  <span>Student ID</span>
                  <strong>
                    {result.student.student_id}
                  </strong>
                </div>

                <div>
                  <span>Department</span>
                  <strong>
                    {result.student.department}
                  </strong>
                </div>

                <div>
                  <span>Year</span>
                  <strong>
                    {result.student.year}
                  </strong>
                </div>

                <div>
                  <span>Confidence</span>
                  <strong>
                    {(result.confidence * 100).toFixed(1)}%
                  </strong>
                </div>

              </div>

            </div>
          )}

          {result && !result.recognized && (
            <div className="unknown-result">

              <div className="unknown-icon">
                ?
              </div>

              <h2>Unknown Person</h2>

              <span className="review-badge">
                Needs Review
              </span>

              <p>
                No sufficiently confident match was found
                among registered students.
              </p>

              {result.confidence !== undefined && (
                <div className="confidence">
                  Similarity:{" "}
                  {(result.confidence * 100).toFixed(1)}%
                </div>
              )}

            </div>
          )}

        </div>

      </div>

    </div>
  );
}

export default Monitoring;