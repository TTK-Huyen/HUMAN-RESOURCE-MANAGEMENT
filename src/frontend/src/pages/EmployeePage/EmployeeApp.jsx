import { Routes, Route, NavLink, Navigate, useLocation } from "react-router-dom";
import EmployeeLayout from "../../components/layout/EmployeeLayout";

// Import các trang cũ
import LeaveRequestPage from "./LeaveRequestPage";
import OTRequestPage from "./OTRequestPage";
import ResignationRequestPage from "./ResignationRequestPage";
import RequestStatusPage from "./RequestStatusPage";

// Import các trang Profile mới (Của Ý)
import MyProfilePage from "./MyProfilePage";
import ProfileUpdateRequestPage from "./ProfileUpdateRequestPage";
import "../../index.css";

function CreateGrid() {
  const tiles = [
    { to: "leave", title: "Leave request", desc: "Xin nghỉ phép", icon: "🏖️" },
    { to: "ot", title: "Overtime", desc: "Đăng ký OT", icon: "⏱️" },
    { to: "resignation", title: "Resignation", desc: "Nghỉ việc", icon: "📤" },
  ];

  return (
    <section className="create-section fade-in-up">
      <div className="create-header">
        <h2>Choose a request type</h2>
        <p>Quick actions for your daily HR tasks</p>
      </div>

      <div className="grid-3">
        {tiles.map((t) => (
          <NavLink key={t.to} to={t.to} className="tile-card hover-lift">
            <div className="tile-head">
              <span className="tile-emoji" aria-hidden="true">
                {t.icon}
              </span>
              <span>{t.title}</span>
            </div>
            <p className="tile-desc">{t.desc}</p>
          </NavLink>
        ))}
      </div>
    </section>
  );
}

export default function EmployeeApp() {
  return (
    <EmployeeLayout>
      <div className="container" style={{ marginTop: 24, marginBottom: 32 }}>
        <Routes>
          <Route index element={<Navigate to="create" replace />} />

          <Route path="create" element={<CreateGrid />} />
          <Route path="create/leave" element={<LeaveRequestPage />} />
          <Route path="create/ot" element={<OTRequestPage />} />
          <Route path="create/resignation" element={<ResignationRequestPage />} />

          <Route path="status" element={<RequestStatusPage />} />

          <Route path="profile" element={<MyProfilePage />} />
          <Route path="profile/update-request" element={<ProfileUpdateRequestPage />} />

          <Route path="*" element={<Navigate to="create" replace />} />
        </Routes>
      </div>
    </EmployeeLayout>
  );
}