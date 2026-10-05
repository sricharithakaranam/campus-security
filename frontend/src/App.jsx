import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Monitoring from "./pages/Monitoring";
import Students from "./pages/Students";
import EntryLogs from "./pages/EntryLogs";

import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";

import "./styles/global.css";

function DashboardLayout({ children }) {
  return (
    <div className="app">
      <Navbar />

      <div className="app-body">
        <Sidebar />

        <main className="main-content">
          {children}
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* 🏠 Public Home Page */}
        <Route
          path="/"
          element={<Home />}
        />

        {/* 📊 Dashboard */}
        <Route
          path="/dashboard"
          element={
            <DashboardLayout>
              <Dashboard />
            </DashboardLayout>
          }
        />

        {/* 👨‍🎓 Students */}
        <Route
          path="/students"
          element={
            <DashboardLayout>
              <Students />
            </DashboardLayout>
          }
        />

        {/* 📹 Live Monitoring */}
        <Route
          path="/monitoring"
          element={
            <DashboardLayout>
              <Monitoring />
            </DashboardLayout>
          }
        />

        {/* 🕒 Entry Logs */}
        <Route
          path="/entry-logs"
          element={
            <DashboardLayout>
              <EntryLogs />
            </DashboardLayout>
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;