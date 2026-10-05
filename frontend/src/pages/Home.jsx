import React from "react";
import "../styles/Home.css";

function Home() {
  return (
    <div className="home">

      {/* Background College Video */}
      <video
        className="home-video"
        autoPlay
        muted
        loop
        playsInline
      >
        <source src="/campus-video.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Dark overlay */}
      <div className="video-overlay"></div>

      {/* Home Content */}
      <div className="home-content">

        {/* ================= NAVBAR ================= */}
        <nav className="home-navbar">

          <div className="college-logo">

  <img
    src="/campus-logo.png"
    alt="Geethanjali Institute of Science and Technology"
  />

  <div className="college-logo-text">
    <span>GEETHANJALI INSTITUTE</span>
    <span>OF SCIENCE AND TECHNOLOGY</span>
  </div>

</div>

          <div className="nav-links">
            <a href="#home">Home</a>
            <a href="#about">About</a>
            <a href="#features">Features</a>
            <a href="#module">Module</a>
            <a href="#team">Team</a>
            <a href="#contact">Contact</a>
          </div>

          <button className="admin-btn">
            👤 Admin Login →
          </button>

        </nav>


        {/* ================= HERO ================= */}
        <main className="hero" id="home">

          {/* IMPORTANT:
              No college-name text here.
              The hero starts directly with CAMPUS GUARD.
          */}

          <h1>
            CAMPUS <span>GUARD</span>
          </h1>

          <p className="tagline">
            SMART CAMPUS SECURITY & MONITORING SYSTEM
          </p>

          <p className="hero-description">
            Monitor&nbsp; | &nbsp;Detect&nbsp; | &nbsp;Recognize&nbsp; | &nbsp;Ensure Safety
          </p>


          {/* ================= BUTTONS ================= */}
          <div className="hero-buttons">

           <button
  className="primary-btn"
  onClick={() => {
    window.location.href = "/dashboard";
  }}
>
  🛡️ Explore System →
</button>

            <button className="secondary-btn">
              ▶ Watch Video
            </button>

          </div>


          {/* ================= FEATURE CARDS ================= */}
          <section className="feature-cards" id="features">

            <div className="feature-card">

              <div className="feature-icon blue">
                📹
              </div>

              <h3>
                Live Monitoring
              </h3>

              <p>
                Real-time campus surveillance
              </p>

            </div>


            <div className="feature-card">

              <div className="feature-icon green">
                🧠
              </div>

              <h3>
                Face Recognition
              </h3>

              <p>
                Identify registered students
              </p>

            </div>


            <div className="feature-card">

              <div className="feature-icon orange">
                🔔
              </div>

              <h3>
                Security Alerts
              </h3>

              <p>
                Instant security notifications
              </p>

            </div>


            <div className="feature-card">

              <div className="feature-icon purple">
                👥
              </div>

              <h3>
                Registered People
              </h3>

              <p>
                Manage student records
              </p>

            </div>

          </section>


          {/* ================= STATISTICS ================= */}
          <section className="stats">

            <div className="stat">

              <span>🏫</span>

              <div>
                <strong>1</strong>
                <small>Campus</small>
              </div>

            </div>


            <div className="stat">

              <span>👥</span>

              <div>
                <strong>5,000+</strong>
                <small>Students</small>
              </div>

            </div>


            <div className="stat">

              <span>📹</span>

              <div>
                <strong>100+</strong>
                <small>Cameras</small>
              </div>

            </div>


            <div className="stat">

              <span>🛡️</span>

              <div>
                <strong>24/7</strong>
                <small>Secure Campus</small>
              </div>

            </div>

          </section>

        </main>

      </div>

    </div>
  );
}

export default Home;