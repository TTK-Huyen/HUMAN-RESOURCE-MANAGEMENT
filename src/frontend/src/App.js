import "./App.css";
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import "./index.css";
import EmployeeApp from "./pages/employee/EmployeeApp";
import HrApp from "./pages/hr/HrApp"; // ➜ thêm dòng này

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/employee/*" element={<EmployeeApp />} />
        <Route path="/hr/*" element={<HrApp />} /> {/* ➜ thêm route HR */}
        <Route path="/" element={<Navigate to="/employee" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
