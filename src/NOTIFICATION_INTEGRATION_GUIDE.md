# Hướng Dẫn Test Notification Integration

## 🎯 Vấn đề đã Fix

### 1. **LoginPage**
- ✅ Giờ lưu `employeeId` vào localStorage (thêm dòng `localStorage.setItem("employeeId", employeeId)`)
- ✅ MainLayout đọc `employeeId` từ localStorage

### 2. **users.js (Mock Data)**
- ✅ Mock accounts giờ trả về `employeeId`
  - employee: id=1
  - hr: id=2
  - manager: id=3
  - admin: id=4

### 3. **PendingApprovals (Manager Page)**
- ✅ Subscribe sự kiện `notification:openRequest` từ NotificationBell
- ✅ Khi có notification mới → tự động gọi `fetchDashboardData()` để reload requests

---

## 🚀 Flow Notification Hoạt Động

```
[Backend] Event xảy ra (tạo request)
    ↓
[Backend] Gửi event → Notification Service (port 8085)
    ↓
[Frontend] NotificationBell (8s/lần) gọi: GET /api/v1/users/{id}/notifications
    ↓
[Frontend] Hiển thị icon chuông & danh sách notifications
    ↓
[Frontend] User click notification
    ↓
[Frontend] NotificationBell dispatch sự kiện `notification:openRequest`
    ↓
[Frontend] PendingApprovals nghe event → reload dữ liệu → hiển thị request mới
```

---

## 🧪 Test Flow Chi Tiết

### **Step 1: Start Services**

#### Backend (.NET)
```powershell
cd F:\HCMUS_KH\Nam4\PTTK_HTTTHD\HUMAN-RESOURCE-MANAGEMENT\src\BE\HRMApi
dotnet run
# Chạy tại http://localhost:5291
```

#### Notification Service (Java)
```powershell
$env:PATH = "C:\Program Files\Java\jdk-17\bin;$env:PATH"
cd "F:\HCMUS_KH\Nam4\PTTK_HTTTHD\HUMAN-RESOURCE-MANAGEMENT\src\notification-service\notification-service"
java -jar target/notification-service-0.0.1-SNAPSHOT.jar
# Chạy tại http://localhost:8085
```

#### Frontend (React)
```powershell
cd F:\HCMUS_KH\Nam4\PTTK_HTTTHD\HUMAN-RESOURCE-MANAGEMENT\src\frontend
npm start
# Chạy tại http://localhost:3000
```

---

### **Step 2: Login with Manager Account (Real Data từ Database)**

**URL:** http://localhost:3000/login

**Credentials (Real Account từ Database):**
- Username: `manager`
- Password: `123456`

**Expected:**
- ✅ Redirect to `/manager`
- ✅ localStorage now has:
  - `token`: Real JWT token
  - `role`: MANAGER
  - `employeeCode`: MNG001
  - `employeeName`: Trần Văn Quản Lý
  - **`employeeId`: 1** ← Real employee ID from DB

**Verify in Browser Console:**
```javascript
// Open DevTools > Console
localStorage.getItem("employeeId")  // Should return "1"
```

---

### **Step 3: Check NotificationBell (Real API Calls)**

**In Manager Page:**
1. Click chuông 🔔 ở góc dưới bên phải sidebar
2. Dropdown sẽ gọi real API:
   - `GET http://localhost:8085/api/v1/users/1/notifications`
   - `GET http://localhost:8085/api/v1/users/1/notifications/unread-count`
3. Hiển thị danh sách thực tế từ Notification Service

**Backend Console (Notification Service):**
Kiểm tra log real API calls.

**Frontend Console (Browser DevTools):**
```javascript
// Mỗi 8 giây sẽ thấy log:
📬 getNotifications userId: 1
📬 getUnreadCount userId: 1
```

---

### **Step 4: Trigger New Request (Real Data)**

#### Option A: Tạo request từ Employee Account
1. Open new tab/window
2. Logout manager (clear localStorage)
3. Login as employee:
   - Username: `EMP001` (hoặc bất kỳ EMP nào)
   - Password: `123456`
4. Go `/employee/create`
5. Tạo 1 Leave Request hoặc Overtime Request
6. Submit → Backend sẽ gửi event tới Notification Service

#### Option B: Dùng Postman/cURL để POST trực tiếp
```bash
# Trước tiên lấy token từ login endpoint
# Sau đó tạo request:

POST http://localhost:5291/api/v1/leave-requests
Authorization: Bearer {token}
Content-Type: application/json

{
  "startDate": "2026-01-10",
  "endDate": "2026-01-12",
  "reason": "Test notification"
}
```

---

### **Step 5: Check Notification Appears**

#### Frontend (Manager Page)
1. **Chuông 🔔** sẽ update:
   - Badge số: `1` (1 notification chưa đọc)
   - Dropdown sẽ có item notification mới với real data

2. **Click notification item** → 3 điều xảy ra:
   - ✅ Notification đánh dấu `isRead=true` (call Notification Service)
   - ✅ Event `notification:openRequest` dispatch
   - ✅ PendingApprovals reload & hiển thị request mới từ backend
   - ✅ (Optional) Modal chi tiết request mở lên

3. **Table PendingApprovals** sẽ thấy:
   - Stats update (real data từ `/api/v1/requests/dashboard/summary`)
   - Row mới xuất hiện trong table từ `/api/v1/requests/dashboard`
   - Request ở trạng thái PENDING

#### Backend Console (Notification Service)
```
2026-01-07T15:29:11.142+07:00 INFO [...] EVENT IN FROM .NET: {
  EventId=...,
  EventType=REQUEST_CREATED,
  RequestType=RESIGNATION,
  RequestId=28,
  Status=Pending,
  ...
}
```

#### Browser Console
```javascript
// Sẽ thấy logs:
📬 Notification event received: {requestId: X, requestType: "Leave"}

// PendingApprovals reload data từ backend
```

---

## ✅ Checklist Test

- [ ] **Backend**: GET http://localhost:5291/api/v1/requests/dashboard → real data (28 requests)
- [ ] **Backend**: GET http://localhost:5291/api/v1/requests/dashboard/summary → real stats
- [ ] **Backend**: POST /api/v1/auth/login (manager/123456) → real JWT + employeeId:1
- [ ] **Notification Service**: GET http://localhost:8085/api/v1/users/1/notifications → API works
- [ ] **Login**: employeeId lưu trong localStorage
- [ ] **NotificationBell**: Mỗi 8s call Notification Service API (real calls, không mock)
- [ ] **PendingApprovals**: Hiển thị real data từ backend (28 requests)
- [ ] **New Request**: Employee tạo request → Backend gửi event → Notification Service nhận
- [ ] **Notification Dropdown**: Hiển thị notification từ Notification Service
- [ ] **Click Notification**: PendingApprovals reload → request mới xuất hiện ✅
- [ ] **End-to-End**: Manager approve/reject request thành công

---

## 🐛 Troubleshooting

### Problem: Chuông 🔔 không update
**Solution:**
1. Check `employeeId` có trong localStorage không
   ```javascript
   localStorage.getItem("employeeId")  // Should return "1"
   ```
2. Check Notification Service có chạy không
   ```bash
   curl http://localhost:8085/api/v1/users/1/notifications
   ```
3. Check Network tab (F12): real API calls being made?

### Problem: Login fails (401)
**Solution:**
- Password là `123456` (mock password từ dataseeder.cs)
- Không phải `Mgr123!@#`
- Username: `manager` hoặc `EMP001`, `EMP002`, etc.

### Problem: PendingApprovals không reload
**Solution:**
1. Check browser console (F12) có error không
2. Manually trigger event:
   ```javascript
   window.dispatchEvent(
     new CustomEvent("notification:openRequest", {
       detail: { requestId: 28, requestType: "LEAVE" }
     })
   );
   ```
3. Check PendingApprovals component có subscribe event không

### Problem: Backend API trả về error
**Solution:**
- Check backend log (dotnet run terminal)
- Verify MySQL connection
- Check database `hrm` có data không
   ```javascript
   window.dispatchEvent(
     new CustomEvent("notification:openRequest", {
       detail: { requestId: 28, requestType: "Resignation" }
     })
   );
   ```
3. Check console log thấy "Notification event received" không

### Problem: Backend không gửi event
**Solution:**
1. Check Notification Service log có `EVENT IN FROM .NET` không
2. Verify backend config có `NotificationServiceUrl=http://localhost:8085` không
3. Check request response có call notification endpoint không

---

## 📝 Code Changes Summary

### Files Modified:

1. **frontend/src/pages/AuthPage/LoginPage/LoginPage.jsx**
   - Added: `localStorage.setItem("employeeId", employeeId);`

2. **frontend/src/Services/users.js**
   - Updated mock accounts: added `id` field (1, 2, 3, 4)
   - Updated response: added `employeeId: user.id`

3. **frontend/src/pages/ManagerPage/PendingApprovals.jsx**
   - Added: `useEffect` to subscribe to `notification:openRequest` event
   - Added: Auto-reload `fetchDashboardData()` when notification received

4. **Backend (Unchanged but already working)**
   - LoginResponseDto.cs: already has `EmployeeId` property
   - AuthService.cs: already returns `EmployeeId` in response

---

## 🎉 Expected Result

**Notification System End-to-End:**
1. ✅ Employee tạo request
2. ✅ Backend gửi event → Notification Service
3. ✅ Manager nghe notification (chuông update)
4. ✅ Manager click notification
5. ✅ PendingApprovals reload & hiển thị request mới
6. ✅ Manager xem chi tiết & approve/reject request

---

**Happy Testing! 🚀**
