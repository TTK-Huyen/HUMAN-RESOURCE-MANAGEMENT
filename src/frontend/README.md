src/
├── components/               # Các thành phần giao diện (dùng lại được)
│   ├── common/               # Component dùng chung (Input, Modal, Spinner...)
│   ├── auth/                 # LoginForm, ValidationMessage, ...
│   ├── hr/                   # HRHeader, RequestTableRow, ...
│   └── employee/             # EmployeeHeader, RequestFormSection, ...
│
├── pages/                    # Các trang tương ứng với route chính
│   ├── auth/                 # Login, ForgotPassword...
│   │   └── LoginPage.jsx
│   ├── hr/                   # HR quản lý yêu cầu
│   │   ├── Dashboard.jsx
│   │   ├── ProfileUpdateList.jsx
│   │   └── ProfileUpdateDetail.jsx
│   └── employee/             # Nhân viên gửi & xem yêu cầu
│       ├── MyProfile.jsx
│       ├── LeaveRequestPage.jsx
│       └── RequestStatusPage.jsx
│
├── api/                      # Gọi API đến backend
│   ├── authApi.js
│   ├── hrApi.js
│   └── requestApi.js
│
├── App.jsx                   # Root component (khai báo routes)
├── index.js                 # Điểm khởi đầu React
└── index.css


Note: chạy thì cần tải: "npm install lucide-react"