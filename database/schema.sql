CREATE TABLE students (
    id SERIAL PRIMARY KEY,
    student_id VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    department VARCHAR(100),
    year INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE cameras (
    id SERIAL PRIMARY KEY,
    camera_name VARCHAR(100) NOT NULL,
    location VARCHAR(255),
    status VARCHAR(20) DEFAULT 'offline'
);

CREATE TABLE entry_events (
    id SERIAL PRIMARY KEY,
    student_id INTEGER,
    camera_id INTEGER,
    event_type VARCHAR(30) NOT NULL,
    confidence DECIMAL(5,2),
    entry_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    review_status VARCHAR(30) DEFAULT 'pending',

    CONSTRAINT fk_student
        FOREIGN KEY (student_id)
        REFERENCES students(id),

    CONSTRAINT fk_camera
        FOREIGN KEY (camera_id)
        REFERENCES cameras(id)
);