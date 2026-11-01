import { useEffect, useState } from "react";
import FaceCapture from "../components/FaceCapture";
import "../styles/Students.css";

function Students() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [faceImage, setFaceImage] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const [enrollingStudent, setEnrollingStudent] = useState(null);
  const [enrollMessage, setEnrollMessage] = useState("");
  const [enrollError, setEnrollError] = useState("");
  const [enrollImage, setEnrollImage] = useState(null);
  const [enrollLoading, setEnrollLoading] = useState(false);

  const [formData, setFormData] = useState({
    student_id: "",
    name: "",
    department: "",
    year: "",
  });

  const fetchStudents = () => {
    setLoading(true);

    fetch("http://localhost:5000/students")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch students");
        }
        return response.json();
      })
      .then((data) => {
        setStudents(data);
        setError("");
      })
      .catch((err) => {
        console.error(err);
        setError("Unable to load students. Please check the backend.");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!faceImage) {
      setError("Please capture the student's face before saving.");
      return;
    }

    setError("");

    try {
      const response = await fetch("http://localhost:5000/students", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          year: Number(formData.year),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to add student");
      }

      const student = data.student;

      if (!student?.id) {
        throw new Error(
          "Student was created, but the database ID was not returned.",
        );
      }

      const aiResponse = await fetch(
        `http://127.0.0.1:8000/enroll/${student.id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            image: faceImage,
          }),
        },
      );

      const aiData = await aiResponse.json();

      if (!aiResponse.ok) {
        const message =
          typeof aiData.detail === "string"
            ? aiData.detail
            : JSON.stringify(aiData.detail || aiData);

        throw new Error(
          message || "Student created, but face enrollment failed.",
        );
      }

      setStudents((previous) => [...previous, student]);

      setFormData({
        student_id: "",
        name: "",
        department: "",
        year: "",
      });

      setFaceImage(null);
      setShowForm(false);
      setEnrollMessage("Student registered and face enrolled successfully!");
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  const handleEnrollExisting = async () => {
    if (!enrollingStudent || !enrollImage) {
      setEnrollError("Please capture the face first.");
      return;
    }

    setEnrollLoading(true);
    setEnrollError("");
    setEnrollMessage("");

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/enroll/${enrollingStudent.id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ image: enrollImage }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          typeof data.detail === "string"
            ? data.detail
            : "Face enrollment failed.",
        );
      }

      setEnrollMessage(
        `Face enrolled successfully for ${enrollingStudent.name}!`,
      );

      setEnrollingStudent(null);
      setEnrollImage(null);
    } catch (err) {
      setEnrollError(err.message || "Face enrollment failed.");
    } finally {
      setEnrollLoading(false);
    }
  };

  const filteredStudents = students.filter((student) => {
    const query = searchQuery.toLowerCase().trim();

    return (
      String(student.student_id || "")
        .toLowerCase()
        .includes(query) ||
      String(student.name || "")
        .toLowerCase()
        .includes(query) ||
      String(student.department || "")
        .toLowerCase()
        .includes(query) ||
      String(student.year || "")
        .toLowerCase()
        .includes(query)
    );
  });

  const departmentCount = new Set(
    students
      .map((student) => student.department?.trim().toLowerCase())
      .filter(Boolean),
  ).size;

  return (
    <div className="students-page">
      {/* PAGE HEADER */}
      <div className="students-page-header">
        <div className="students-heading">
          <span className="students-eyebrow">CAMPUS GUARD / MANAGEMENT</span>

          <h2>Students Management</h2>

          <p>
            Manage student records, registration and face identity enrollment.
          </p>
        </div>

        <button
          className="add-student-btn"
          onClick={() => {
            setShowForm(!showForm);
            setError("");
            setEnrollMessage("");
          }}
        >
          <span>{showForm ? "−" : "+"}</span>
          {showForm ? "Cancel" : "Add Student"}
        </button>
      </div>

      {/* SUCCESS MESSAGE */}
      {enrollMessage && (
        <div className="students-alert success-alert">
          <span>✓</span>
          {enrollMessage}
          <button onClick={() => setEnrollMessage("")}>×</button>
        </div>
      )}

      {/* ERROR MESSAGE */}
      {error && <div className="students-alert error-alert">{error}</div>}

      {/* ADD STUDENT FORM */}
      {showForm && (
        <div className="add-student-form">
          <div className="form-title">
            <div>
              <span className="form-eyebrow">NEW REGISTRATION</span>
              <h3>Add New Student</h3>
              <p>Enter student information and register their face.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label>Student ID</label>
                <input
                  type="text"
                  name="student_id"
                  value={formData.student_id}
                  onChange={handleChange}
                  placeholder="Enter student ID"
                  required
                />
              </div>

              <div className="form-group">
                <label>Student Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter full name"
                  required
                />
              </div>

              <div className="form-group">
                <label>Department</label>
                <input
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  placeholder="Enter department"
                  required
                />
              </div>

              <div className="form-group">
                <label>Academic Year</label>
                <input
                  type="number"
                  name="year"
                  value={formData.year}
                  onChange={handleChange}
                  placeholder="Enter year (1-6)"
                  min="1"
                  max="6"
                  required
                />
              </div>
            </div>

            <div className="face-registration-section">
              <h4>Face Registration</h4>
              <p>
                Capture the student's face for AI-powered identity recognition.
              </p>

              <FaceCapture onCapture={(image) => setFaceImage(image)} />

              {faceImage && (
                <p className="capture-success">
                  ✓ Face image captured successfully
                </p>
              )}
            </div>

            <button type="submit" className="save-student-btn">
              Register Student
            </button>
          </form>
        </div>
      )}

      {/* STATISTICS */}
      <div className="students-summary">
        <div className="summary-card">
          <div className="summary-icon blue-icon">
            <span>ST</span>
          </div>
          <div>
            <span>Total Students</span>
            <strong>{students.length}</strong>
            <small>Student records</small>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon green-icon">
            <span>✓</span>
          </div>
          <div>
            <span>Registered Students</span>
            <strong>{students.length}</strong>
            <small>Available records</small>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon cyan-icon">
            <span>DP</span>
          </div>
          <div>
            <span>Departments</span>
            <strong>{departmentCount}</strong>
            <small>Unique departments</small>
          </div>
        </div>
      </div>

      {/* EXISTING STUDENT FACE ENROLLMENT */}
      {enrollingStudent && (
        <div className="add-student-form enrollment-form">
          <div className="form-title">
            <div>
              <span className="form-eyebrow">FACE ENROLLMENT</span>
              <h3>Register Face</h3>
              <p>
                Student: <strong>{enrollingStudent.name}</strong> (
                {enrollingStudent.student_id})
              </p>
            </div>
          </div>

          <FaceCapture
            onCapture={(image) => {
              setEnrollImage(image);
              setEnrollError("");
            }}
          />

          {enrollError && <p className="inline-error">{enrollError}</p>}

          <div className="enrollment-actions">
            <button
              type="button"
              className="save-student-btn"
              disabled={!enrollImage || enrollLoading}
              onClick={handleEnrollExisting}
            >
              {enrollLoading ? "Registering Face..." : "Save Face"}
            </button>

            <button
              type="button"
              className="cancel-btn"
              onClick={() => {
                setEnrollingStudent(null);
                setEnrollImage(null);
                setEnrollError("");
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* STUDENTS TABLE */}
      <div className="students-table-container">
        <div className="table-header">
          <div>
            <span className="table-eyebrow">STUDENT DIRECTORY</span>
            <h3>Registered Students</h3>
            <p>View and manage all registered student records.</p>
          </div>

          <div className="student-search-wrapper">
            <span className="search-icon">⌕</span>
            <input
              type="text"
              placeholder="Search by name, ID or department..."
              className="student-search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              aria-label="Search students"
            />
            {searchQuery && (
              <button
                type="button"
                className="clear-search"
                onClick={() => setSearchQuery("")}
                aria-label="Clear search"
              >
                ×
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="students-empty-state">
            <div className="loading-spinner"></div>
            <p>Loading student records...</p>
          </div>
        ) : (
          !error && (
            <div className="students-table-scroll">
              <table className="students-table">
                <thead>
                  <tr>
                    <th>STUDENT ID</th>
                    <th>STUDENT NAME</th>
                    <th>DEPARTMENT</th>
                    <th>YEAR</th>
                    <th>STATUS</th>
                    <th>ACTION</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredStudents.length > 0 ? (
                    filteredStudents.map((student) => (
                      <tr key={student.id ?? student.student_id}>
                        <td>
                          <strong className="student-id">
                            {student.student_id}
                          </strong>
                        </td>

                        <td>
                          <span className="student-name">{student.name}</span>
                        </td>

                        <td>{student.department}</td>

                        <td>
                          <span className="year-badge">
                            Year {student.year}
                          </span>
                        </td>

                        <td>
                          <span className="student-status">
                            <span className="status-dot"></span>
                            Registered
                          </span>
                        </td>

                        <td>
                          <button
                            type="button"
                            className="view-btn"
                            onClick={() => {
                              setEnrollingStudent(student);
                              setEnrollImage(null);
                              setEnrollMessage("");
                              setEnrollError("");
                            }}
                          >
                            Register / Update Face
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="no-students">
                        {searchQuery
                          ? "No students found matching your search."
                          : "No student records available."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )
        )}

        {!loading && !error && (
          <div className="table-footer">
            Showing <strong>{filteredStudents.length}</strong> of{" "}
            <strong>{students.length}</strong> students
          </div>
        )}
      </div>
    </div>
  );
}

export default Students;
