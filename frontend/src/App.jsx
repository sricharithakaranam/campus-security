import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import EntryLogs from "./pages/EntryLogs";
import Dashboard from "./pages/Dashboard";
import Students from "./pages/Students";

import "./styles/global.css";

function App() {
  return (
    <BrowserRouter>
      <div className="app">

        <Navbar />

        <div className="app-body">

          <Sidebar />

          <main className="main-content">
            <Routes>

              <Route
                path="/"
                element={<Dashboard />}
              />

              <Route
                path="/students"
                element={<Students />}
              />
<Route
  path="/entry-logs"
  element={<EntryLogs />}
/>
            </Routes>
          </main>

        </div>

      </div>
    </BrowserRouter>
  );
}

export default App;