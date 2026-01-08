# Fix: Employee DirectManagerId Missing

## Vấn đề
- Employee 39 (EMP037 - Lê Lĩnh) không có DirectManagerId
- Backend gửi event với ManagerUserId=null
- Notification Service không tạo notification cho manager

## Nguyên nhân
Database: Cột `DirectManagerId` của employee 39 là NULL

## Solution

### Quick Fix (SQL)
```sql
-- Update employee 39 to have manager (employeeId=1)
UPDATE Employees 
SET DirectManagerId = 1 
WHERE Id = 39;

-- Verify
SELECT Id, EmployeeCode, FullName, DirectManagerId 
FROM Employees 
WHERE Id = 39;
```

### Hoặc update tất cả employees không có manager
```sql
-- Set manager=1 cho tất cả employees trong phòng IT (không phải manager)
UPDATE Employees 
SET DirectManagerId = 1 
WHERE DepartmentId = 2  -- IT department
  AND Id != 1           -- Không phải chính manager
  AND DirectManagerId IS NULL;
```

### Permanent Fix (DataSeeder.cs)
File: `BE/HRMApi/Dataseeder.cs`

Tìm đoạn tạo employee và thêm:
```csharp
DirectManagerId = manager.Id,  // Thêm dòng này
```

Ví dụ:
```csharp
var hr = new Employee
{
    EmployeeCode = "HR001",
    FullName = "Nguyễn Thị Nhân Sự",
    ...
    DirectManagerId = manager.Id,  // ✅ Set manager
    Status = "Đang làm việc",
    ...
};
```

## Test sau khi fix

1. Restart backend (dotnet run)
2. Tạo resignation request mới
3. Check notification service log → phải thấy ManagerUserId=1
4. Frontend: http://localhost:3000/manager → Chuông 🔔 phải có badge
5. GET http://localhost:8085/api/v1/users/1/notifications → phải có notifications

## Backend Log mong đợi
```
EVENT IN FROM .NET: {
  EventType=REQUEST_CREATED, 
  RequestType=RESIGNATION, 
  RequestId=35, 
  RequesterUserId=39, 
  ManagerUserId=1,    ← ✅ Phải có value, không null
  Status=Pending, 
  ...
}
```

## Frontend Test
```javascript
// DevTools Console
localStorage.getItem("employeeId")  // Should return employee ID
```

Login as manager → Create request as employee → Check notifications
