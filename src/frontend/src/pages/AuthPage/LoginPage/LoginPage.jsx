import React from "react";
import { useNavigate } from "react-router-dom";
import AuthForm from "../../../components/auth/AuthForm.jsx";
import { login } from "../../../Services/users.js";

export default function LoginPage() {
  const navigate = useNavigate();

  const handleLogin = async (data) => {
    try {
      const res = await login(data); // gọi API thật
      const { token, role, employeeCode, employeeName, employeeId } = res;

      localStorage.setItem("token", token);
      localStorage.setItem("role", role);
      localStorage.setItem("employeeCode", employeeCode);
      localStorage.setItem("employeeName", employeeName);

      localStorage.setItem("employeeId", String(employeeId));

      // ✅ Điều hướng tùy vào vai trò
      if (role === "EMP") navigate("/employee");
      else if (role === "HR") navigate("/hr");
      else if (role === "MANAGER") navigate ("/manager");
      else navigate("/");
    } catch (err) {
      alert("Login failed: " + (err.response?.data?.message || err.message));
    }
  };

  return (
    <AuthForm
      title="Login"
      submitLabel="Login"
      fields={[
        { name: "username", label: "Username", type: "text", required: true },
        { name: "password", label: "Password", type: "password", required: true },
      ]}
      onSubmit={handleLogin}
    />
  );
}
