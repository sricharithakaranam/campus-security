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
app.get("/alerts", async (req, res) => {
  try {
    const result = await db.query(`
      SELECT
        e.id,
        e.event_type,
        e.confidence,
        e.entry_time,
        e.review_status,
        c.camera_name
      FROM entry_events e
      LEFT JOIN cameras c ON e.camera_id = c.id
      WHERE LOWER(e.event_type) = 'unknown'
      ORDER BY e.entry_time DESC
    `);

    res.json(result.rows);
  } catch (err) {
    console.error("Alerts error:", err);
    res.status(500).json({ error: err.message });
  }
});
// Add a student

// Add a student
app.post("/students", async (req, res) => {
  try {
    const { student_id, name, department, year } = req.body;

    // Validate required fields
    if (
      !student_id ||
      !name ||
      !department ||
      year === undefined ||
      year === null
    ) {
      return res.status(400).json({
        success: false,
        error: "Student ID, name, department, and year are required",
      });
    }

    // Check whether this Student ID already exists
    const existing = await db.query(
      "SELECT id FROM students WHERE student_id = $1",
      [student_id],
    );

    if (existing.rows.length > 0) {
      return res.status(409).json({
        success: false,
        error:
          "This Student ID is already registered. Please use a unique Student ID.",
      });
    }

    // Register the student
    const result = await db.query(
      `INSERT INTO students (student_id, name, department, year)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [student_id, name, department, year],
    );

    return res.status(201).json({
      success: true,
      message: "Student registered successfully",
      student: result.rows[0],
    });
  } catch (err) {
    console.error("Student registration error:", err);

    // Handle duplicate IDs even if two requests arrive together
    if (err.code === "23505") {
      return res.status(409).json({
        success: false,
        error: "This Student ID already exists. Please use a unique ID.",
      });
    }

    return res.status(500).json({
      success: false,
      error: "Failed to register student",
    });
  }
});

// TEMPORARY: Add test student

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
// Create an entry event with server-side duplicate prevention
app.post("/entry-events", async (req, res) => {
  try {
    const { student_id, camera_id, event_type, confidence, review_status } =
      req.body;

    if (!event_type) {
      return res.status(400).json({
        error: "event_type is required",
      });
    }

    // Apply cooldown only to recognized student entries.
    // Unknown/review events can be recorded separately later.
    if (student_id && event_type === "entry") {
      const recent = await db.query(
        `SELECT id, entry_time
         FROM entry_events
         WHERE student_id = $1
           AND camera_id IS NOT DISTINCT FROM $2
           AND event_type = 'entry'
           AND entry_time > NOW() - INTERVAL '30 seconds'
         ORDER BY entry_time DESC
         LIMIT 1`,
        [student_id, camera_id ?? null],
      );

      if (recent.rows.length > 0) {
        return res.status(200).json({
          success: true,
          duplicate: true,
          message: "Entry already recorded recently",
          event: recent.rows[0],
        });
      }
    }

    const result = await db.query(
      `INSERT INTO entry_events
       (student_id, camera_id, event_type, confidence, review_status)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        student_id ?? null,
        camera_id ?? null,
        event_type,
        confidence ?? null,
        review_status ?? "pending",
      ],
    );

    res.status(201).json({
      success: true,
      duplicate: false,
      event: result.rows[0],
    });
  } catch (err) {
    console.error("Entry event error:", err);
    res.status(500).json({
      error: "Failed to save entry event",
    });
  }
});


app.get("/stats", async (req, res) => {
  try {
    const studentsResult = await db.query(
      "SELECT COUNT(*) FROM students"
    );

    const entriesResult = await db.query(
      "SELECT COUNT(*) FROM entry_events"
    );

    const unknownResult = await db.query(
      "SELECT COUNT(*) FROM entry_events WHERE LOWER(event_type) = 'unknown'"
    );

    const camerasResult = await db.query(
      "SELECT COUNT(*) FROM cameras"
    );

    res.json({
      totalStudents: Number(studentsResult.rows[0].count),
      totalEntries: Number(entriesResult.rows[0].count),
      unknownPersons: Number(unknownResult.rows[0].count),
      activeCameras: Number(camerasResult.rows[0].count)
    });
  } catch (error) {
    console.error("Stats error:", error.message);
    res.status(500).json({
      error: "Failed to fetch dashboard statistics"
    });
  }
});


// Start server
app.listen(5000, () => {
  console.log("Backend running on http://localhost:5173");
});
