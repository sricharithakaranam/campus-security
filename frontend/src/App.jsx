import { BrowserRouter, Routes, Route } from "react-router-dom";
import Alerts from "./pages/Alerts";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Monitoring from "./pages/Monitoring";
import Students from "./pages/Students";
import EntryLogs from "./pages/EntryLogs";
import Chatbot from "./components/Chatbot";

import "./styles/Alerts.css";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import Login from "./pages/Login";

import "./styles/global.css";

function DashboardLayout({ children }) {
  return (
    <div className="app">
      <Navbar />

      <div className="app-body">
        <Sidebar />

        <main className="main-content">{children}</main>
      </div>

      <Chatbot />
    </div>
  );
}

/* Temporary pages for modules that don't have page files yet */



function Cameras() {
  return (
    <div>
      <h2>Cameras</h2>
      <p>Camera information will appear here.</p>
    </div>
  );
}



function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* HOME */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        {/* DASHBOARD */}

        <Route
          path="/dashboard"
          element={
            <DashboardLayout>
              <Dashboard />
            </DashboardLayout>
          }
          

        />
        <Route
  path="/alerts"
  element={
    <DashboardLayout>
      <Alerts />
    </DashboardLayout>
  }
/>

        {/* LIVE MONITORING */}
        <Route
          path="/monitoring"
          element={
            <DashboardLayout>
              <Monitoring />
            </DashboardLayout>
          }
        />

        {/* STUDENTS */}
        <Route
          path="/students"
          element={
            <DashboardLayout>
              <Students />
            </DashboardLayout>
          }
        />

        {/* ENTRY LOGS */}
        <Route
          path="/entry-logs"
          element={
            <DashboardLayout>
              <EntryLogs />
            </DashboardLayout>
          }
        />

       

        {/* CAMERAS */}
        <Route
          path="/cameras"
          element={
            <DashboardLayout>
              <Cameras />
            </DashboardLayout>
          }
        />

       
      </Routes>
    </BrowserRouter>
  );
}

export default App;
