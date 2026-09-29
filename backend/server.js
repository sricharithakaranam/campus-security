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

// Start server
app.listen(5000, () => {
  console.log("Backend running on http://localhost:5000");
});