import base64
import os
import pickle

import cv2
import numpy as np
import psycopg
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel


# =========================================================
# CAMPUS GUARD AI SERVICE
# =========================================================

app = FastAPI(
    title="Campus Guard AI Service",
    description="Face detection and face recognition service",
    version="1.0.0",
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================================================
# DATABASE CONFIGURATION
# =========================================================

DB_CONFIG = {
    "host": "localhost",
    "port": 5432,
    "dbname": "campus_security",
    "user": "postgres",

    # IMPORTANT:
    # Replace this with your PostgreSQL password.
    "password": "saivikranth",
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
# LOAD FACE DETECTION MODEL
# =========================================================

detector = cv2.FaceDetectorYN.create(
    DETECTOR_MODEL,
    "",
    (320, 320),
    0.9,
    0.3,
    5000,
)


# =========================================================
# LOAD FACE RECOGNITION MODEL
# =========================================================

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
# CONVERT BASE64 IMAGE → OPENCV IMAGE
# =========================================================

def decode_image(image_data: str):

    # Remove data:image/jpeg;base64,... if present
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
# CREATE FACE EMBEDDING
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
def enroll_face(
    student_id: int,
    request: FaceRequest,
):

    # Convert image
    image = decode_image(
        request.image
    )

    # Generate face embedding
    embedding = create_embedding(
        image
    )

    # Convert embedding to database bytes
    embedding_bytes = pickle.dumps(
        embedding
    )

    try:

        with get_db() as conn:

            with conn.cursor() as cur:

                # Check student exists
                cur.execute(
                    """
                    SELECT id
                    FROM students
                    WHERE id = %s
                    """,
                    (student_id,),
                )

                student = cur.fetchone()

                if not student:

                    raise HTTPException(
                        status_code=404,
                        detail="Student not found",
                    )

                # Store/update embedding
                cur.execute(
                    """
                    INSERT INTO face_embeddings
                    (
                        student_id,
                        embedding
                    )
                    VALUES (%s, %s)

                    ON CONFLICT (student_id)
                    DO UPDATE SET
                        embedding = EXCLUDED.embedding,
                        created_at = CURRENT_TIMESTAMP
                    """,
                    (
                        student_id,
                        embedding_bytes,
                    ),
                )

        return {
            "success": True,
            "student_id": student_id,
            "message": "Face enrolled successfully",
        }

    except HTTPException:
        raise

    except Exception as error:

        print(
            "Database error:",
            error,
        )

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