import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import EmployeeApp from "./pages/EmployeePage/EmployeeApp";
import HrApp from "./pages/HRPage/HrApp";
import LoginPage from "./pages/AuthPage/LoginPage/LoginPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/employee/*" element={<RequireAuth role="EMP"><EmployeeApp /></RequireAuth>} />
        <Route path="/hr/*" element={<RequireAuth role="HR"><HrApp /></RequireAuth>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

function RequireAuth({ role, children }) {
  const token = localStorage.getItem("token");
  const storedRole = localStorage.getItem("role");

  if (!token) return <Navigate to="/" replace />;
  if (role && storedRole !== role) return <Navigate to="/" replace />;

  return children;
}

export default App;
