import axios from "axios";
import api from "./client.js";

export async function login({ username, password }) {
  const res = await api.post("/auth/login", { username, password });
  return res.data; // { token, role }
}

/**
 * === MOCK FUNCTION ===
 * Login giả lập (dùng khi chưa có backend thật)
 *
 * API thật:
 * Method: POST
 * URL:    /api/v1/auth/login
 * Request Body:
 *   {
 *     "username": "string",
 *     "password": "string"
 *   }
 * Response Body:
 *   {
 *     "token": "jwt_token_string",
 *     "role": "EMPLOYEE" | "MANAGER" | "HR"
 *   }
 * Status Code: 200 OK (Success) hoặc 401 Unauthorized (Fail)
 */
export async function loginMock({ username, password }) {
  await new Promise(res => setTimeout(res, 500)); // giả lập delay

  if (username === "admin@example.com" && password === "Password123!") {
    const token = "mocked.jwt.token.123456";
    const role = "HR"; // trả về role tương ứng: EMPLOYEE | MANAGER | HR

    // ✅ Giả lập lưu thông tin login giống thật
    localStorage.setItem("token", token);
    localStorage.setItem("role", role);

    return { token, role }; // trả về JSON như backend thật
  }

  // ❌ Giả lập lỗi xác thực
  throw new Error("Invalid username or password");
}