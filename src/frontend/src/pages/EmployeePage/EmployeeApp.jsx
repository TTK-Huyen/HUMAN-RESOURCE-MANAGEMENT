import React from "react";
import { Routes, Route, NavLink, Navigate } from "react-router-dom";
import { FileText, Clock, LogOut } from "lucide-react"; 
import LeaveRequestPage from "./LeaveRequestPage";
import OTRequestPage from "./OTRequestPage";
import ResignationRequestPage from "./ResignationRequestPage";
import RequestStatusPage from "./RequestStatusPage";
import MyProfilePage from "./MyProfilePage";
import ProfileUpdateRequestPage from "./ProfileUpdateRequestPage";
import CampaignsList from "./Campaigns/CampaignsList";
import CampaignDetail from "./Campaigns/CampaignDetail";
import "./EmployeeApp.css";

// --- COMPONENT MENU LƯỚI (DASHBOARD CỦA NHÂN VIÊN) ---
function CreateGrid() {
  const tiles = [
    {
      to: "leave",
      title: "Leave Request",
      desc: "Create annual leave, sick leave, personal leave requests...",
      icon: <FileText size={32} color="#2563eb" />,
    },
    {
      to: "ot",
      title: "Overtime Registration",
      desc: "Register for overtime work hours",
      icon: <Clock size={32} color="#f59e0b" />,
    },
    {
      to: "resignation",
      title: "Resignation",
      desc: "Submit resignation request",
      icon: <LogOut size={32} color="#ef4444" />,
    },
  ];

  return (
    <div className="employee-container fade-in-up">
      <div className="employee-header">
        <h2>What request would you like to create?</h2>
        <p>Select a request type below to start the process.</p>
      </div>

      <div className="tile-grid">
        {tiles.map((t) => (
          <NavLink key={t.to} to={t.to} className="tile-link">
            <div className="tile-card">
              <div className="tile-icon">{t.icon}</div>

              <div>
                <h3 className="tile-title">{t.title}</h3>
                <p className="tile-desc">{t.desc}</p>
              </div>
            </div>
          </NavLink>
        ))}
      </div>
    </div>
  );
}

// --- MAIN EMPLOYEE APP ---
export default function EmployeeApp() {
  return (
    <Routes>
      {/* Default /employee redirects to /employee/create */}
      <Route index element={<Navigate to="create" replace />} />

      {/* 1. Request Creation Routes (/employee/create) */}
      <Route path="create">
        <Route index element={<CreateGrid />} /> {/* /employee/create */}
        <Route path="leave" element={<LeaveRequestPage />} />{" "}
        {/* /employee/create/leave */}
        <Route path="ot" element={<OTRequestPage />} />{" "}
        {/* /employee/create/ot */}
        <Route path="resignation" element={<ResignationRequestPage />} />{" "}
        {/* /employee/create/resignation */}
      </Route>

      {/* 2. Request Status Page (/employee/status) */}
      <Route path="status" element={<RequestStatusPage />} />

      {/* 3. Profile Routes (/employee/profile) */}
      <Route path="profile">
        <Route index element={<MyProfilePage />} />
        <Route path="update-request" element={<ProfileUpdateRequestPage />} />
      </Route>

      {/* 4. Campaigns Routes (/employee/campaigns) */}
      <Route path="campaigns">
        <Route index element={<CampaignsList />} />
        <Route path=":id" element={<CampaignDetail />} />
      </Route>

      {/* Fallback: Redirect to create if path not found */}
      <Route path="*" element={<Navigate to="create" replace />} />
    </Routes>
  );
}
