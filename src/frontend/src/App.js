import './App.css';
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, NavLink } from "react-router-dom";
import "./index.css";
import EmployeeApp from "./pages/employee/EmployeeApp";

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/employee/*" element={<EmployeeApp />} />
                <Route path="/" element={<Navigate to="/employee" replace />} />
            </Routes>
        </Router>
    );
}

export default App;