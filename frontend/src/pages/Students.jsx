import { useEffect, useState } from "react";
import FaceCapture from "../components/FaceCapture";
import "../styles/Students.css";

function Students() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [faceImage, setFaceImage] = useState(null);

  const [formData, setFormData] = useState({
    student_id: "",
    name: "",
    department: "",
    year: "",
  });

  const fetchStudents = () => {
    fetch("http://localhost:5000/students")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch students");
        }

        return response.json();
      })
      .then((data) => {
        setStudents(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Unable to load students");
        setLoading(false);
      });
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

    // For now, require a face capture
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

      setStudents([...students, data]);

      setFormData({
        student_id: "",
        name: "",
        department: "",
        year: "",
      });

      setFaceImage(null);
      setShowForm(false);
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  return (
    <div className="students-page">

      {/* PAGE HEADER */}
      <div className="page-header">
        <div>
          <h2>Students</h2>

          <p>
            Manage registered students and their identity information.
          </p>
        </div>

        <button
          className="add-student-btn"
          onClick={() => {
            setShowForm(!showForm);
            setError("");
          }}
        >
          {showForm ? "Cancel" : "+ Add Student"}
        </button>
      </div>

      {/* ADD STUDENT FORM */}
      {showForm && (
        <div className="add-student-form">

          <h3>Add New Student</h3>

          <form onSubmit={handleSubmit}>

            <div className="form-grid">

              {/* STUDENT ID */}
              <div className="form-group">
                <label>Student ID</label>

                <input
                  type="text"
                  name="student_id"
                  value={formData.student_id}
                  onChange={handleChange}
                  placeholder="STU002"
                  required
                />
              </div>

              {/* NAME */}
              <div className="form-group">
                <label>Name</label>

                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Student Name"
                  required
                />
              </div>

              {/* DEPARTMENT */}
              <div className="form-group">
                <label>Department</label>

                <input
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  placeholder="Computer Science"
                  required
                />
              </div>

              {/* YEAR */}
              <div className="form-group">
                <label>Year</label>

                <input
                  type="number"
                  name="year"
                  value={formData.year}
                  onChange={handleChange}
                  placeholder="3"
                  min="1"
                  max="6"
                  required
                />
              </div>

            </div>

            {/* FACE REGISTRATION */}
            <div className="face-registration-section">

              <h4>Face Registration</h4>

              <p>
                Capture the student's face for identity verification.
              </p>

              <FaceCapture
                onCapture={(image) => {
                  setFaceImage(image);
                }}
              />

            </div>

            {/* SAVE BUTTON */}
            <button
              type="submit"
              className="save-student-btn"
            >
              Register Student
            </button>

          </form>
        </div>
      )}

      {/* SUMMARY */}
      <div className="students-summary">

        <div>
          <span>Total Students</span>
          <strong>{students.length}</strong>
        </div>

        <div>
          <span>Registered</span>
          <strong>{students.length}</strong>
        </div>

        <div>
          <span>Identity Verified</span>
          <strong>{students.length}</strong>
        </div>

      </div>

      {/* ERROR */}
      {error && (
        <p
          style={{
            padding: "10px",
            color: "red",
            textAlign: "center",
          }}
        >
          {error}
        </p>
      )}

      {/* STUDENTS TABLE */}
      <div className="students-table-container">

        <div className="table-header">

          <h3>Registered Students</h3>

          <input
            type="text"
            placeholder="Search students..."
            className="student-search"
          />

        </div>

        {loading && (
          <p style={{ padding: "20px" }}>
            Loading students...
          </p>
        )}

        {!loading && !error && (
          <table className="students-table">

            <thead>
              <tr>
                <th>Student ID</th>
                <th>Name</th>
                <th>Department</th>
                <th>Year</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>

              {students.map((student) => (

                <tr key={student.id}>

                  <td>
                    <strong>
                      {student.student_id}
                    </strong>
                  </td>

                  <td>
                    {student.name}
                  </td>

                  <td>
                    {student.department}
                  </td>

                  <td>
                    Year {student.year}
                  </td>

                  <td>
                    <span className="student-status">
                      ● Registered
                    </span>
                  </td>

                  <td>
                    <button className="view-btn">
                      View
                    </button>
                  </td>

                </tr>

              ))}

            </tbody>

          </table>
        )}

      </div>

    </div>
  );
}

export default Students;