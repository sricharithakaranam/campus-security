import base64
import os
import pickle

import cv2
import numpy as np
import psycopg
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

# =========================================================
# CAMPUS GUARD AI SERVICE
# =========================================================

app = FastAPI(
    title="Campus Guard AI Service",
    description="Face detection and face recognition service",
    version="1.0.0",
)

# Only ONE CORS block. Add more origins here if your frontend uses another port.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================================================
# DATABASE CONFIGURATION
# =========================================================
# The password is read from the DB_PASSWORD environment variable.
# In Windows CMD, before starting uvicorn, run:
#     set DB_PASSWORD=your_postgres_password
load_dotenv()
print("DB_PASSWORD loaded:", bool(os.getenv("DB_PASSWORD")))
DB_CONFIG = {
    "host": "localhost",
    "port": 5432,
    "dbname": "campus_security",
    "user": "postgres",
    "password": os.environ.get("DB_PASSWORD", "YOUR_POSTGRES_PASSWORD"),
}


# =========================================================
# MODEL PATHS
# =========================================================

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

DETECTOR_MODEL = os.path.join(
    BASE_DIR,
    "models",
    "face_detection_yunet_2023mar.onnx",
)

RECOGNIZER_MODEL = os.path.join(
    BASE_DIR,
    "models",
    "face_recognition_sface_2021dec.onnx",
)


# =========================================================
# LOAD MODELS
# =========================================================

detector = cv2.FaceDetectorYN.create(
    DETECTOR_MODEL,
    "",
    (320, 320),
    0.9,
    0.3,
    5000,
)

recognizer = cv2.FaceRecognizerSF.create(
    RECOGNIZER_MODEL,
    "",
)


# =========================================================
# REQUEST FORMAT
# =========================================================

class FaceRequest(BaseModel):
    image: str


# =========================================================
# DATABASE CONNECTION
# =========================================================

def get_db():
    return psycopg.connect(**DB_CONFIG)


# =========================================================
# BASE64 IMAGE -> OPENCV IMAGE
# =========================================================

def decode_image(image_data: str):
    # Remove "data:image/jpeg;base64," prefix if present
    if "," in image_data:
        image_data = image_data.split(",", 1)[1]

    try:
        raw = base64.b64decode(image_data)
    except Exception:
        raise HTTPException(
            status_code=400,
            detail="Invalid base64 image",
        )

    image = cv2.imdecode(
        np.frombuffer(raw, np.uint8),
        cv2.IMREAD_COLOR,
    )

    if image is None:
        raise HTTPException(
            status_code=400,
            detail="Unable to decode image",
        )

    return image


# =========================================================
# DETECT FACES AND CREATE EMBEDDINGS
# =========================================================

def create_embeddings(image):
    height, width = image.shape[:2]

    detector.setInputSize((width, height))
    _, faces = detector.detect(image)

    if faces is None or len(faces) == 0:
        return []

    results = []

    for face in faces:
        try:
            aligned_face = recognizer.alignCrop(image, face)
            feature = recognizer.feature(aligned_face)

            results.append({
                "box": [
                    round(float(face[0])),
                    round(float(face[1])),
                    round(float(face[2])),
                    round(float(face[3])),
                ],
                "embedding": feature,
            })
        except Exception as error:
            print("Could not process a detected face:", error)

    return results


# =========================================================
# HOME
# =========================================================

@app.get("/")
def root():
    return {
        "service": "Campus Guard AI Service",
        "status": "running",
    }


# =========================================================
# HEALTH CHECK
# =========================================================

@app.get("/health")
def health():
    return {
        "status": "healthy",
        "detector": "YuNet",
        "recognizer": "SFace",
    }


# =========================================================
# ENROLL STUDENT FACE
# =========================================================

@app.post("/enroll/{student_id}")
def enroll_face(student_id: int, request: FaceRequest):
    image = decode_image(request.image)

    faces = create_embeddings(image)

    if len(faces) == 0:
        raise HTTPException(
            status_code=400,
            detail="No face detected in the image",
        )

    if len(faces) > 1:
        raise HTTPException(
            status_code=400,
            detail="Multiple faces detected. Use a photo with one face",
        )

    embedding_bytes = pickle.dumps(faces[0]["embedding"])

    try:
        with get_db() as conn:
            with conn.cursor() as cur:
                # Check that the student exists
                cur.execute(
                    """
                    SELECT id
                    FROM students
                    WHERE id = %s
                    """,
                    (student_id,),
                )

                if not cur.fetchone():
                    raise HTTPException(
                        status_code=404,
                        detail="Student not found",
                    )

                # Store or update the embedding
                cur.execute(
                    """
                    INSERT INTO face_embeddings (student_id, embedding)
                    VALUES (%s, %s)
                    ON CONFLICT (student_id)
                    DO UPDATE SET
                        embedding = EXCLUDED.embedding,
                        created_at = CURRENT_TIMESTAMP
                    """,
                    (student_id, embedding_bytes),
                )

        return {
            "success": True,
            "student_id": student_id,
            "message": "Face enrolled successfully",
        }

    except HTTPException:
        raise

    except Exception as error:
        print("Database error:", error)
        raise HTTPException(
            status_code=500,
            detail="Failed to store face embedding",
        )


# =========================================================
# RECOGNIZE FACE
# =========================================================

@app.post("/recognize")
def recognize_face(request: FaceRequest):
    image = decode_image(request.image)

    detected_faces = create_embeddings(image)

    if not detected_faces:
        return {
            "success": True,
            "face_count": 0,
            "results": [],
            "message": "No faces detected",
        }

    try:
        with get_db() as conn:
            with conn.cursor() as cur:
                cur.execute("""
                    SELECT
                        fe.student_id,
                        fe.embedding,
                        s.student_id,
                        s.name,
                        s.department,
                        s.year
                    FROM face_embeddings fe
                    JOIN students s ON s.id = fe.student_id
                """)
                records = cur.fetchall()
    except Exception as error:
        print("Database error:", error)
        raise HTTPException(
            status_code=500,
            detail="Could not read students from the database",
        )

    known_embeddings = []

    for record in records:
        try:
            known_embeddings.append({
                "database_id": record[0],
                "embedding": pickle.loads(record[1]),
                "student_id": record[2],
                "name": record[3],
                "department": record[4],
                "year": record[5],
            })
        except Exception as error:
            print("Could not load stored embedding:", error)

    MATCH_THRESHOLD = 0.363
    results = []

    for detected in detected_faces:
        best_match = None
        best_score = -1.0

        for known in known_embeddings:
            score = recognizer.match(
                detected["embedding"],
                known["embedding"],
                cv2.FaceRecognizerSF_FR_COSINE,
            )

            if score > best_score:
                best_score = float(score)
                best_match = known

        if best_match is not None and best_score >= MATCH_THRESHOLD:
            results.append({
                "box": detected["box"],
                "recognized": True,
                "status": "recognized",
                "confidence": round(best_score, 4),
                "student": {
                    "database_id": best_match["database_id"],
                    "student_id": best_match["student_id"],
                    "name": best_match["name"],
                    "department": best_match["department"],
                    "year": best_match["year"],
                },
            })
        else:
            results.append({
                "box": detected["box"],
                "recognized": False,
                "status": "unknown",
                "confidence": (
                    round(best_score, 4)
                    if best_match is not None
                    else None
                ),
                "message": "Unknown / Needs Review",
            })

    return {
        "success": True,
        "face_count": len(results),
        "results": results,
    }