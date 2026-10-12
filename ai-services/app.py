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

def create_embedding(image):

    height, width = image.shape[:2]

    detector.setInputSize(
        (width, height)
    )

    _, faces = detector.detect(image)

    if faces is None or len(faces) == 0:

        raise HTTPException(
            status_code=400,
            detail="No face detected",
        )

    # Select largest detected face
    face = max(
        faces,
        key=lambda f: f[2] * f[3],
    )

    # Align face
    aligned_face = recognizer.alignCrop(
        image,
        face,
    )

    # Generate embedding
    feature = recognizer.feature(
        aligned_face
    )

    return feature


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
def recognize_face(
    request: FaceRequest,
):

    # Decode image
    image = decode_image(
        request.image
    )

    try:

        # Create embedding
        detected_embedding = create_embedding(
            image
        )

    except HTTPException:

        return {
            "recognized": False,
            "status": "unknown",
            "message": "Unknown / Needs Review",
        }

    # Get enrolled faces
    with get_db() as conn:

        with conn.cursor() as cur:

            cur.execute(
                """
                SELECT
                    fe.student_id,
                    fe.embedding,
                    s.student_id,
                    s.name,
                    s.department,
                    s.year

                FROM face_embeddings fe

                JOIN students s
                    ON s.id = fe.student_id
                """
            )

            records = cur.fetchall()

    best_match = None
    best_score = -1


    # Compare detected face
    # with every registered face
    for record in records:

        database_student_id = record[0]

        stored_embedding = pickle.loads(
            record[1]
        )

        score = recognizer.match(
            detected_embedding,
            stored_embedding,
            cv2.FaceRecognizerSF_FR_COSINE,
        )

        if score > best_score:

            best_score = score

            best_match = {
                "database_id":
                    database_student_id,

                "student_id":
                    record[2],

                "name":
                    record[3],

                "department":
                    record[4],

                "year":
                    record[5],
            }


    # Initial recognition threshold.
    # We will test and tune this with
    # your actual student/camera conditions.
    MATCH_THRESHOLD = 0.363


    # No reliable match
    if (
        best_match is None
        or best_score < MATCH_THRESHOLD
    ):

        return {
            "recognized": False,
            "status": "unknown",
            "confidence":
                round(
                    float(best_score),
                    4,
                ),
            "message":
                "Unknown / Needs Review",
        }


    # Successful match
    return {

        "recognized": True,

        "status": "authorized",

        "confidence":
            round(
                float(best_score),
                4,
            ),

        "student":
            best_match,
    }