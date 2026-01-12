import api from './client.js';
import axios from 'axios';
// ============================================================
// REAL API SETUP (Giữ lại cấu hình này để dùng sau)

// ============================================================

export const EmployeeService = {
  // 1. Xem hồ sơ – dùng API thật (Swagger profile)
  getProfile: (employeeCode) => {
    // Trả về đúng DTO từ backend
    return api.get(`/employees/${employeeCode}/profile`);
    // Response data chính là:
    // {
    //   employeeName, employeeCode, dateOfBirth, gender, nationality, ...
    // }
  },

  // 2. Gửi yêu cầu cập nhật – dùng API thật
  // payload phải giống Swagger:
  // {
  //   reason: "string",
  //   details: [{ fieldName, oldValue, newValue }]
  // }
  sendUpdateRequest: (employeeCode, payload) => {
    return api.post(
      `/employees/${employeeCode}/profile-update-requests`,
      payload,
      { headers: { Accept: "*/*" } }
    );
    // Response data: "Profile update request sent and pending approval."
  },
};

export const HRService = {
  // Master data cho Add Employee
  getEmployeeFormMasterData() {
    return api
      .get("/master-data/employee-form", {
        headers: { Accept: "application/json" },
      })
      .then((res) => res.data);
  },
  // 3. HR lấy danh sách
  // params: { status, employeeCode }
  getUpdateRequests: (params) => {
    return api.get('/hr/profile-update-requests', {
      params,
      headers: { Accept: "application/json, text/plain, */*" },
    });
    // data: [
    //   { request_id, employee_code, full_name, created_at, request_status }, ...
    // ]
  },

  // 4. HR xem chi tiết
  getRequestDetail: (requestId) => {
    return api.get(`/hr/profile-update-requests/${requestId}`, {
      headers: { Accept: "application/json, text/plain, */*" },
    });
    // data:
    // {
    //   request_id, employee_id, request_status,
    //   details: [{ field_name, old_value, new_value }]
    // }
  },

  // 5. HR duyệt / từ chối
  updateRequestStatus: (requestId, statusData) => {
    // statusData phải có: { new_status, reject_reason, Employee_ID }
    return api.patch(
      `/hr/profile-update-requests/${requestId}/status`,
      statusData,
      { headers: { Accept: "application/json, text/plain, */*" } }
    );
    // data: { request_id, request_status }
  },

  // 6. HR lấy tất cả nhân viên
  fetchAllEmployees: (params) => { // <--- 1. Thêm tham số params vào hàm
    return api
      .get("/employees", { 
        params: params, // <--- 2. Truyền params vào cấu hình của axios
        headers: { Accept: "application/json, text/plain, */*" } 
      })
      .then((response) => response.data);
  },

  // 7. HR xem hồ sơ nhân viên theo mã
  fetchEmployeeProfileByCode: (employeeCode) => {
    return api
      .get(`/employees/${employeeCode}/profile`, { headers: { Accept: "application/json, text/plain, */*" } })
      .then((response) => response.data);
  },

  // 8. HR thêm nhân viên mới
  addNewEmployee: (employeeData) => {
    return api
      .post("/employees", employeeData, { headers: { Accept: "application/json, text/plain, */*" } })
      .then((response) => response.data);
  },   
  // 9. HR nhập danh sách nhân viên từ file Excel
  importEmployeesFromExcel: (formData) => {
    return api  
      .post("/employees/import-excel", formData, { headers: { 'Content-Type': 'multipart/form-data', Accept: "application/json, text/plain, */*" } })
      .then((response) => response.data);
  },

  // 10. HR tải file Excel import mẫu
  downloadEmployeeExcelTemplate: () => {
  return api
    .get("/employees/excel-template", {
      responseType: "blob",
      headers: { Accept: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" },
    })
    .then(async (response) => {
      const contentType = response.headers?.["content-type"] || "";

      // ✅ Nếu backend trả JSON/HTML lỗi (401/500/404...), đừng save thành .xlsx
      if (!contentType.includes("spreadsheetml")) {
        // cố đọc message lỗi từ blob
        let msg = "Không tải được file mẫu. Vui lòng thử lại.";
        try {
          const text = await response.data.text();
          // nếu là JSON {"message": "..."}
          try {
            const json = JSON.parse(text);
            msg = json?.message || msg;
          } catch {
            // nếu là HTML hoặc text thường
            if (text?.trim()) msg = text;
          }
        } catch {}
        throw new Error(msg);
      }

      // Lấy filename từ header nếu có
      const disposition = response.headers["content-disposition"] || "";
      const match = disposition.match(/filename\*=UTF-8''([^;]+)|filename="([^"]+)"/i);
      const fileName = `employee_import_template_${Date.now()}.xlsx`;

      const blob = new Blob([response.data], { type: contentType });

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      return true;
    });
  },

  // 11. Lấy danh sách nhân viên thuộc cùng phòng ban
  fetchEmployeesByDepartment: (departmentId) => {
    return api
      .get("/employees", {
        params: {
          departmentId: departmentId,
          pageSize: 1000, // Lấy tất cả trong phòng ban
          status: "active"
        },
        headers: { Accept: "application/json, text/plain, */*" }
      })
      .then((response) => {
        // Handle paginated response
        if (response.data && response.data.data && Array.isArray(response.data.data)) {
          return response.data.data;
        }
        // Handle direct array response
        if (Array.isArray(response.data)) {
          return response.data;
        }
        return [];
      });
  },
}

  
