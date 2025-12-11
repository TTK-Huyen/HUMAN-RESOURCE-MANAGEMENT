import React from "react";
import { useNavigate } from "react-router-dom";
import AuthForm from "../../../components/auth/AuthForm.jsx";
import { loginMock } from "../../../Services/users.js";

export default function LoginPage() {
  const navigate = useNavigate();

  const handleLogin = async (data) => {
    try {
      const res = await loginMock(data); // giả lập API
      const { token, role } = res;

      localStorage.setItem("token", token);
      localStorage.setItem("role", role);

      // ✅ Điều hướng tùy vào vai trò
      if (role === "EMPLOYEE") navigate("/employee");
      else if (role === "HR") navigate("/hr");
      else navigate("/");
    } catch (err) {
      alert("Login failed: " + err.message);
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
