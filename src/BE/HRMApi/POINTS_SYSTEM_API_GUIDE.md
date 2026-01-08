# Hệ Thống Điểm Thưởng - API Hướng Dẫn

## Tổng Quan

Hệ thống điểm thưởng cho phép nhân viên:
- Xem số điểm hiện tại
- Đổi điểm sang tiền mặt (1 điểm = 1.000 VND)
- Xem lịch sử giao dịch điểm

Quản lý có thể:
- Tặng điểm cho nhân viên
- Xem lịch sử giao dịch

## Khởi Tạo Hệ Thống

Khi chạy seeder (`Dataseeder.cs`), hệ thống tự động:
- Tạo bảng điểm cho **tất cả nhân viên**
- Khởi tạo **5.000 điểm** cho mỗi nhân viên
- Ghi nhận giao dịch khởi tạo trong lịch sử

## Danh Sách API

### Base URL
```
GET/POST http://localhost:xxxx/api/v1/rewards/...
```

### 1. Đọc Điểm Theo Employee Code (Không cần xác thực)

```
GET /api/v1/rewards/balance/{employeeCode}
```

**Mô tả:** Lấy thông tin số điểm của nhân viên theo mã nhân viên

**Tham số:**
- `employeeCode` (string, path): Mã nhân viên (ví dụ: EMP001)

**Phản hồi thành công (200):**
```json
{
  "success": true,
  "data": {
    "employeeCode": "EMP001",
    "fullName": "Trần Văn IT Manager",
    "currentBalance": 5000,
    "totalEarned": 5000,
    "totalSpent": 0,
    "lastUpdated": "2026-01-08T10:30:00"
  }
}
```

**Lỗi:**
- 404: Nhân viên không tìm thấy
- 500: Lỗi hệ thống

---

### 2. Xem Ví Điểm (My Wallet)

```
GET /api/v1/rewards/wallet/my-wallet
```

**Mô tả:** Lấy thông tin ví điểm và 50 giao dịch gần nhất của nhân viên đang đăng nhập

**Yêu cầu:** Authorization token

**Phản hồi thành công (200):**
```json
{
  "success": true,
  "data": {
    "balance": 5000,
    "totalEarned": 5000,
    "totalSpent": 0,
    "transactions": [
      {
        "transactionId": 1,
        "transactionType": "INITIAL",
        "points": 5000,
        "description": "Điểm thưởng khởi tạo hệ thống",
        "createdAt": "2026-01-08T10:30:00",
        "type": "EARN",
        "amount": 5000
      }
    ]
  }
}
```

---

### 3. Xem Lịch Sử Giao Dịch Cơ Bản

```
GET /api/v1/rewards/transactions?limit=50
```

**Mô tả:** Lấy lịch sử giao dịch điểm

**Tham số:**
- `limit` (int, query, optional): Số lượng giao dịch tối đa cần lấy (mặc định: tất cả)

**Yêu cầu:** Authorization token

**Phản hồi thành công (200):**
```json
{
  "success": true,
  "data": [
    {
      "transactionId": 1,
      "employeeId": 1,
      "transactionType": "INITIAL",
      "points": 5000,
      "description": "Điểm thưởng khởi tạo hệ thống",
      "relatedId": null,
      "createdAt": "2026-01-08T10:30:00",
      "createdBy": null
    }
  ]
}
```

---

### 4. Xem Lịch Sử Giao Dịch Chi Tiết

```
GET /api/v1/rewards/transactions/detailed?limit=50
```

**Mô tả:** Lấy lịch sử giao dịch với thông tin chi tiết: người gửi, người nhận, số tiền, thời gian, trạng thái

**Tham số:**
- `limit` (int, query, optional): Số lượng giao dịch tối đa cần lấy (mặc định: tất cả)

**Yêu cầu:** Authorization token

**Phản hồi thành công (200):**
```json
{
  "success": true,
  "data": [
    {
      "transactionId": 1,
      "transactionType": "INITIAL",
      "points": 5000,
      "amount": 5000000,
      "pointAmount": 5000,
      "description": "Điểm thưởng khởi tạo hệ thống",
      "createdAt": "2026-01-08T10:30:00",
      "transactionStatus": "EARN",
      "fromEmployee": {
        "employeeId": 1,
        "employeeCode": "EMP001",
        "fullName": "Trần Văn IT Manager",
        "companyEmail": "it.manager@company.com"
      },
      "toEmployee": {
        "employeeId": 1,
        "employeeCode": "EMP001",
        "fullName": "Trần Văn IT Manager",
        "companyEmail": "it.manager@company.com"
      },
      "processedBy": null,
      "relatedId": null,
      "exchangeRate": 1000
    }
  ]
}
```

**Chi tiết trường:**
- `transactionType`: Loại giao dịch (INITIAL, BONUS, REDEEM, MONTHLY, CAMPAIGN)
- `points`: Số điểm (âm = trừ, dương = cộng)
- `amount`: Giá trị tiền tệ (points × exchangeRate)
- `transactionStatus`: EARN (cộng điểm) hoặc REDEEM (trừ điểm)
- `fromEmployee`: Nhân viên gửi điểm (nếu có)
- `toEmployee`: Nhân viên nhận điểm (nếu có)
- `processedBy`: Người xử lý giao dịch (quản lý)
- `exchangeRate`: Tỷ giá (1 điểm = 1.000 VND)

---

### 5. Đổi Điểm Sang Tiền Mặt

```
POST /api/v1/rewards/redeem
```

**Mô tả:** Tạo yêu cầu đổi điểm sang tiền mặt

**Yêu cầu:** Authorization token

**Body:**
```json
{
  "points": 100,
  "method": "CASH"
}
```

**Tham số:**
- `points` (int): Số điểm cần đổi (phải > 0)
- `method` (string, optional): Phương thức đổi (mặc định: CASH)

**Phản hồi thành công (200):**
```json
{
  "success": true,
  "message": "Yêu cầu đổi điểm thành công",
  "data": {
    "redemptionId": 1,
    "employeeId": 1,
    "pointsRedeemed": 100,
    "exchangeRate": 1000,
    "cashAmount": 100000,
    "status": "PENDING",
    "requestedAt": "2026-01-08T10:35:00",
    "processedAt": null,
    "processedBy": null,
    "notes": null
  }
}
```

**Lỗi:**
- 400: Số điểm không hợp lệ hoặc không đủ điểm
- 404: Nhân viên không tìm thấy
- 500: Lỗi hệ thống

---

### 6. Xem Danh Sách Yêu Cầu Đổi Điểm

```
GET /api/v1/rewards/redemptions
```

**Mô tả:** Lấy danh sách các yêu cầu đổi điểm của nhân viên đang đăng nhập

**Yêu cầu:** Authorization token

**Phản hồi thành công (200):**
```json
{
  "success": true,
  "data": [
    {
      "redemptionId": 1,
      "employeeId": 1,
      "pointsRedeemed": 100,
      "exchangeRate": 1000,
      "cashAmount": 100000,
      "status": "PENDING",
      "requestedAt": "2026-01-08T10:35:00",
      "processedAt": null,
      "processedBy": null,
      "notes": null
    }
  ]
}
```

**Trạng thái yêu cầu:**
- `PENDING`: Chờ xử lý
- `APPROVED`: Được phê duyệt
- `REJECTED`: Bị từ chối
- `PAID`: Đã thanh toán

---

### 7. Tặng Điểm (Quản Lý)

```
POST /api/v1/rewards/manager/give-points
```

**Mô tả:** Quản lý tặng điểm cho nhân viên

**Yêu cầu:** 
- Authorization token
- Role: MANAGER

**Body:**
```json
{
  "employeeId": 2,
  "points": 500,
  "reason": "Thành tích xuất sắc"
}
```

**Tham số:**
- `employeeId` (int): ID nhân viên nhận điểm
- `points` (int): Số điểm tặng (phải > 0)
- `reason` (string, optional): Lý do tặng điểm

**Phản hồi thành công (200):**
```json
{
  "success": true,
  "message": "Tặng điểm thành công"
}
```

**Lỗi:**
- 400: Số điểm không hợp lệ
- 401: Không có quyền (không phải quản lý)
- 404: Quản lý hoặc nhân viên không tìm thấy
- 500: Lỗi hệ thống

---

## Cấu Trúc Dữ Liệu

### PointBalance
```csharp
{
  EmployeeId: int,           // ID nhân viên
  CurrentBalance: int,       // Số điểm hiện tại
  TotalEarned: int,          // Tổng điểm kiếm được
  TotalSpent: int,           // Tổng điểm đã dùng
  LastUpdated: DateTime      // Cập nhật lần cuối
}
```

### PointTransaction
```csharp
{
  TransactionId: int,        // ID giao dịch
  EmployeeId: int,           // Nhân viên
  TransactionType: string,   // INITIAL, BONUS, REDEEM, MONTHLY, CAMPAIGN
  Points: int,               // Số điểm (+ hoặc -)
  Description: string,       // Mô tả
  RelatedId: int?,           // ID liên quan (campaign_id, redemption_id)
  CreatedAt: DateTime,       // Thời gian
  CreatedBy: int?            // Người tạo (quản lý)
}
```

### CashRedemption
```csharp
{
  RedemptionId: int,         // ID yêu cầu
  EmployeeId: int,           // Nhân viên
  PointsRedeemed: int,       // Số điểm đổi
  ExchangeRate: decimal,     // Tỷ giá (1000 VND/điểm)
  CashAmount: decimal,       // Số tiền (đồng)
  Status: string,            // PENDING, APPROVED, REJECTED, PAID
  RequestedAt: DateTime,     // Thời gian yêu cầu
  ProcessedAt: DateTime?,    // Thời gian xử lý
  ProcessedBy: int?,         // Người xử lý
  Notes: string?             // Ghi chú
}
```

---

## Ví Dụ Sử Dụng

### 1. Lấy điểm của nhân viên EMP001

```bash
curl -X GET "http://localhost:5000/api/v1/rewards/balance/EMP001"
```

### 2. Đăng nhập và xem ví điểm

```bash
# 1. Lấy token
curl -X POST "http://localhost:5000/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"EMP001","password":"123456"}'

# 2. Dùng token để xem ví
curl -X GET "http://localhost:5000/api/v1/rewards/wallet/my-wallet" \
  -H "Authorization: Bearer {token}"
```

### 3. Đổi 100 điểm sang tiền mặt

```bash
curl -X POST "http://localhost:5000/api/v1/rewards/redeem" \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"points":100,"method":"CASH"}'
```

### 4. Quản lý tặng 500 điểm cho nhân viên

```bash
curl -X POST "http://localhost:5000/api/v1/rewards/manager/give-points" \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"employeeId":2,"points":500,"reason":"Thành tích xuất sắc"}'
```

---

## Ghi Chú

- **Tỷ giá:** 1 điểm = 1.000 VND (có thể thay đổi trong `PointService.cs`)
- **Khởi tạo:** Mỗi nhân viên được khởi tạo 5.000 điểm
- **Bảo mật:** Hầu hết API yêu cầu token xác thực
- **Lỗi:** Xem mã lỗi HTTP để xác định vấn đề

---

## Lịch Sử Thay Đổi

- **v1.0** (2026-01-08): 
  - Thêm API đọc điểm theo employee code
  - Thêm API lịch sử giao dịch chi tiết
  - Tự động khởi tạo 5.000 điểm cho mỗi nhân viên
