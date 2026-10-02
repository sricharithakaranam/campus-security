import { useEffect, useRef, useState } from "react";
import "../styles/FaceCapture.css";

function FaceCapture({ onCapture }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const [cameraStarted, setCameraStarted] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [cameraError, setCameraError] = useState("");

  const startCamera = async () => {
    try {
      setCameraError("");

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
    } catch (error) {
      console.error(error);
      setCameraError(
        "Camera access was denied or the camera is unavailable."
      );
    }
  };

  const captureFace = () => {
    if (!videoRef.current) return;

    const video = videoRef.current;

    const canvas = document.createElement("canvas");

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

    setCapturedImage(image);

    if (onCapture) {
      onCapture(image);
    }
  };

  const retakeFace = () => {
    setCapturedImage(null);

    if (onCapture) {
      onCapture(null);
    }
  };

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => {
          track.stop();
        });
      }
    };
  }, []);

  return (
    <div className="face-capture">

      <div className="face-camera">

        {!capturedImage && (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="camera-video"
          />
        )}

        {capturedImage && (
          <img
            src={capturedImage}
            alt="Captured face"
            className="captured-face"
          />
        )}

        {!cameraStarted && !capturedImage && (
          <div className="camera-message">
            <div className="camera-message-icon">
              📷
            </div>

            <strong>Camera not started</strong>

            <span>
              Start the camera to capture the student's face.
            </span>
          </div>
        )}

      </div>

      {cameraError && (
        <div className="camera-error">
          {cameraError}
        </div>
      )}

      <div className="face-capture-actions">

        {!cameraStarted && !capturedImage && (
          <button
            type="button"
            className="camera-button"
            onClick={startCamera}
          >
            Start Camera
          </button>
        )}

        {cameraStarted && !capturedImage && (
          <button
            type="button"
            className="capture-button"
            onClick={captureFace}
          >
            Capture Face
          </button>
        )}

        {capturedImage && (
          <button
            type="button"
            className="retake-button"
            onClick={retakeFace}
          >
            Retake Face
          </button>
        )}

      </div>

      {capturedImage && (
        <div className="capture-success">
          ✓ Face captured successfully
        </div>
      )}

    </div>
  );
}

export default FaceCapture;