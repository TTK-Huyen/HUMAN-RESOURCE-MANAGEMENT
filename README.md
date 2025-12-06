# 🧑‍💼 Human Resource Management System

## 📖 Introduction
This project is a **Human Resource Management System (HRMS)** designed to streamline employee data management, request handling, activity tracking, and reward distribution within an organization.  
The system aims to digitalize HR processes, reduce manual work, and improve transparency between employees and management.

---

## 🎯 Project Objectives
- Centralize all employee information in one unified system.
- Automate common HR workflows such as leave requests, timesheet updates, and approvals.
- Encourage employee participation through activity tracking and gamification (reward points).
- Support fair and transparent reward management.

---

## ⚙️ Functional Requirements

### 1. Employee Profile Management
### 2. Employee Requests Management
### 3. Employee Activities Management
### 4. Reward Management

---

## 🚀 How to Run the Project
# HRMApi (Backend)

Hướng dẫn chạy backend lần đầu trên **Windows (PowerShell)**.

---

## 1️ Yêu cầu môi trường

- MySQL hoặc MariaDB đang chạy  
- PowerShell  
- .NET SDK phù hợp (target **.NET 9.0**)

Kiểm tra phiên bản:
```powershell
dotnet --list-sdks
dotnet --list-runtimes
```

---

## 2️ Cài đặt `dotnet-ef`

```powershell
dotnet tool uninstall --global dotnet-ef || true
dotnet tool install --global dotnet-ef --version 9.0.0
dotnet-ef --version
```

---

## 3️ Cấu hình database

### Tùy chọn A: Localhost MySQL
Cập nhật `appsettings.json`:
```json
"ConnectionStrings": {
  "DefaultConnection": "Server=localhost;Port=3306;Database=HrmDb;User=root;Password=123456;"
}
```

### Tùy chọn B: Docker MySQL
```powershell
docker run -d --name mysql -e MYSQL_ROOT_PASSWORD=123456 -e MYSQL_DATABASE=HrmDb -p 3306:3306 mysql:8.0
docker ps
```

Cấu hình kết nối:
```json
"ConnectionStrings": {
  "DefaultConnection": "Server=mysql;Port=3306;Database=HrmDb;User=root;Password=123456;"
}
```

---

## 4️ Chạy Backend

Đi đến thư mục dự án:
```powershell
cd ".\src\BE\HRMApi"
dotnet restore
dotnet build
```

Tạo DB (nếu chưa có):
```powershell
dotnet ef migrations add InitialCreate
dotnet ef database update
```

Chạy API:
```powershell
dotnet run
```

---

## 5️ Lệnh xử lý nhanh

Xóa database cũ:
```powershell
dotnet ef database drop -f        # localhost
docker rm -f mysql                # docker db
```

---

## 6️ Kiểm thử nhanh bằng Postman

Ví dụ request:

📌 Nghỉ phép
```
POST /api/v1/employees/{employeeCode}/requests/leave
{
  "leaveType": "Paid",
  "startDate": "2025-12-10T00:00:00",
  "endDate": "2025-12-12T00:00:00",
  "reason": "Family vacation",
  "handoverPersonId": 2,
  "attachmentsBase64": "SGVsbG8gV29ybGQ="
}
```

📌 Tăng ca
```
POST /api/v1/employees/{employeeCode}/requests/overtime
{
  "date": "2025-03-05",
  "startTime": "18:00",
  "endTime": "21:00",
  "reason": "Urgent feature deployment",
  "projectId": "PRJ001"
}
```

📌 Xin nghỉ việc
```
POST /api/v1/employees/{employeeCode}/requests/resignation
{
  "resignationDate": "2025-06-01",
  "reason": "Pursuing new career opportunities",
  "handoverToHr": 2
}
```

📌 Cập nhật thông tin cá nhân
```
POST /api/v1/employees/{employeeCode}/profile-update-requests
{
  "reason": "string",
  "details": [
    {
      "fieldName": "Gender",
      "oldValue": "Male",
      "newValue": "Female"
    }
  ]
}
```

---

## Ghi chú


- Không commit password thật vào Git
- Production nên dùng biến môi trường hoặc secret manager


---

## 👥 Team Members & Responsibilities

| Student ID | Member Name | Role | Responsibilities |
|-------------|--------------|------|------------------|
| 22127236 | Nguyễn Tấn Lộc | Backend Developer |  |
| 22127169 | Thái Thị Kim Huyền | Backend Developer |  |
| 22127278 | Vũ Thu Minh | Frontend Developer |  |
| 22127468 | Trần Thị Mỹ Ý | Frontend Developer |  |
| 22127479 | Lê Hoàng Lĩnh | Frontend Developer |  |

---

## 🧠 Technologies Used

- **Backend:** Web API using Java Spring MVC and .NET Core  
- **Frontend:** ReactJS  

---

## 📅 Development Timeline
> _To be added later._




### Frontend

1. Cài đặt các gói cần thiết từ `package.json` 
   Di chuyển vào thư mục frontend và chạy:  
   `npm install`  

2. Chạy frontend
   `npm start`  
