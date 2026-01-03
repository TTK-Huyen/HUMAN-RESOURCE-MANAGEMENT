// HRAddEmployeePage.jsx
import React, { useState } from "react";
import { FormRow } from "../../components/common/FormRow";
import "../../Services/employees.js"
export default function HRAddEmployeePage() {
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    department: "",
    position: "",
  });

  const handleSubmit = () => {
    // TODO: Call backend API to save
    alert("Employee added: " + JSON.stringify(form));
  };

  return (
    <div className="card fade-in-up">
      <div className="card-header">
        <h2>Add New Employee</h2>
      </div>
      <div className="card-body">
        <div className="form-grid">
          <FormRow label="Full Name">
            <input
              value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
            />
          </FormRow>
          <FormRow label="Email">
            <input
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </FormRow>
          <FormRow label="Department">
            <input
              value={form.department}
              onChange={(e) => setForm({ ...form, department: e.target.value })}
            />
          </FormRow>
          <FormRow label="Position">
            <input
              value={form.position}
              onChange={(e) => setForm({ ...form, position: e.target.value })}
            />
          </FormRow>
        </div>
        <button className="btn" onClick={handleSubmit}>
          Add Employee
        </button>
      </div>
    </div>
  );
}
