const express = require("express");
const cors = require("cors");
const db = require("./db");

const app = express();

app.use(cors());
app.use(express.json());

// Home
app.get("/", (req, res) => {
  res.send("Campus Security Backend is running!");
});

// Get all students
app.get("/students", async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM students");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Add a student
app.post("/students", async (req, res) => {
  try {
    const { student_id, name, department, year } = req.body;

    const result = await db.query(
      `INSERT INTO students (student_id, name, department, year)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [student_id, name, department, year]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// TEMPORARY: Add test student
app.get("/add-test-student", async (req, res) => {
  try {
    const result = await db.query(
      `INSERT INTO students (student_id, name, department, year)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      ["STU001", "Test Student", "Computer Science", 3]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});
// Get entry logs
app.get("/entry-logs", async (req, res) => {
  try {
    const result = await db.query(`
      SELECT
        ee.id,
        s.student_id,
        s.name,
        s.department,
        s.year,
        ee.event_type,
        ee.confidence,
        ee.entry_time,
        ee.review_status,
        c.camera_name,
        c.location
      FROM entry_events ee
      LEFT JOIN students s ON ee.student_id = s.id
      LEFT JOIN cameras c ON ee.camera_id = c.id
      ORDER BY ee.entry_time DESC
    `);

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});
// Create an entry event
app.post("/entry-events", async (req, res) => {
  try {
    const {
      student_id,
      camera_id,
      event_type,
      confidence,
      review_status,
    } = req.body;

    const result = await db.query(
      `INSERT INTO entry_events
       (student_id, camera_id, event_type, confidence, review_status)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        student_id || null,
        camera_id || null,
        event_type,
        confidence || null,
        review_status || "pending",
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
})
// Start server
app.listen(5000, () => {
  console.log("Backend running on http://localhost:5000");
});