# Point System API Documentation

## Overview
Hệ thống quản lý điểm thưởng cho nhân viên với các tính năng:
- UC 2.4.5: Xem lịch sử giao dịch điểm
- UC 2.4.3: Đổi điểm sang tiền mặt (1 point = 1000 VND)
- UC 2.4.1: Cộng điểm tự động hàng tháng (1000 points/tháng)
- Dataseeder: Mỗi nhân viên được khởi tạo với 5000 điểm

## Base URL
```
http://localhost:5291/api/v1
```

## Authentication
Tất cả các endpoint yêu cầu Bearer token trong header:
```
Authorization: Bearer <your_jwt_token>
```

---

## Employee Endpoints

### 1. UC 2.4.5: Xem ví điểm và lịch sử giao dịch

**GET** `/rewards/wallet/my-wallet`

**Response:**
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
        "createdAt": "2026-01-08T10:00:00",
        "type": "EARN",
        "amount": 5000
      }
    ]
  }
}
```

### 2. Xem lịch sử giao dịch (chi tiết)

**GET** `/rewards/transactions?limit=20`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "transactionId": 1,
      "employeeId": 9,
      "transactionType": "INITIAL",
      "points": 5000,
      "description": "Điểm thưởng khởi tạo hệ thống",
      "relatedId": null,
      "createdAt": "2026-01-08T10:00:00",
      "createdBy": null
    }
  ]
}
```

### 3. UC 2.4.3: Đổi điểm sang tiền mặt

**POST** `/rewards/redeem`

**Request Body:**
```json
{
  "points": 100,
  "method": "CASH"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Yêu cầu đổi điểm thành công",
  "data": {
    "redemptionId": 1,
    "employeeId": 9,
    "pointsRedeemed": 100,
    "exchangeRate": 1000,
    "cashAmount": 100000,
    "status": "PENDING",
    "requestedAt": "2026-01-08T10:30:00",
    "processedAt": null,
    "processedBy": null,
    "notes": null
  }
}
```

### 4. Xem danh sách yêu cầu đổi điểm của tôi

**GET** `/rewards/redemptions`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "redemptionId": 1,
      "employeeId": 9,
      "pointsRedeemed": 100,
      "exchangeRate": 1000,
      "cashAmount": 100000,
      "status": "PENDING",
      "requestedAt": "2026-01-08T10:30:00"
    }
  ]
}
```

---

## Manager Endpoints

### 5. Tặng điểm cho nhân viên (Manager only)

**POST** `/rewards/manager/give-points`

**Requires:** Role = MANAGER

**Request Body:**
```json
{
  "employeeId": 10,
  "points": 50,
  "reason": "Hoàn thành xuất sắc dự án Q1"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Tặng điểm thành công"
}
```

---

## Admin/HR Endpoints

### 6. UC 2.4.1: Kích hoạt cộng điểm hàng tháng (HR only)

**POST** `/admin/rewards/monthly-allocation`

**Requires:** Role = HR

**Request Body:**
```json
{
  "targetMonth": "2026-01"
}
```
Nếu không truyền `targetMonth`, hệ thống sẽ lấy tháng hiện tại.

**Response:**
```json
{
  "success": true,
  "month": "2026-01",
  "totalEmployees": 29,
  "successCount": 29,
  "pointsPerEmployee": 1000,
  "totalPointsAllocated": 29000,
  "errors": []
}
```

---

## Transaction Types

- **INITIAL**: Điểm khởi tạo ban đầu (5000 points)
- **MONTHLY**: Điểm cộng hàng tháng (1000 points)
- **BONUS**: Điểm thưởng từ manager
- **REDEEM**: Đổi điểm sang tiền mặt (số âm)
- **CAMPAIGN**: Điểm từ campaign (nếu có)

---

## Status Values

### CashRedemption Status
- **PENDING**: Chờ xử lý
- **APPROVED**: Đã duyệt
- **REJECTED**: Từ chối
- **PAID**: Đã thanh toán

---

## Test Accounts

### Test Employee (EMP009)
```
Username: EMP009
Password: 123456
Role: EMP
Department: IT
Initial Points: 5000
```

### Test Manager (EMP001)
```
Username: EMP001
Password: 123456
Role: MANAGER
Department: IT
Can give bonus points to employees
```

### Test HR (EMP006)
```
Username: EMP006
Password: 123456
Role: HR
Department: HR
Can trigger monthly point allocation
```

---

## Example Test Flow

### 1. Login as Employee
```bash
POST /api/v1/auth/login
{
  "username": "EMP009",
  "password": "123456"
}
```

### 2. Check Wallet
```bash
GET /api/v1/rewards/wallet/my-wallet
Authorization: Bearer <token>
```

### 3. Redeem 100 Points
```bash
POST /api/v1/rewards/redeem
Authorization: Bearer <token>
{
  "points": 100,
  "method": "CASH"
}
```

### 4. Login as Manager (EMP001)
```bash
POST /api/v1/auth/login
{
  "username": "EMP001",
  "password": "123456"
}
```

### 5. Give Bonus Points to Employee
```bash
POST /api/v1/rewards/manager/give-points
Authorization: Bearer <manager_token>
{
  "employeeId": 9,
  "points": 50,
  "reason": "Excellent performance"
}
```

### 6. Login as HR (EMP006)
```bash
POST /api/v1/auth/login
{
  "username": "EMP006",
  "password": "123456"
}
```

### 7. Trigger Monthly Allocation
```bash
POST /api/v1/admin/rewards/monthly-allocation
Authorization: Bearer <hr_token>
{
  "targetMonth": "2026-01"
}
```

---

## Database Tables

### point_balances
- employee_id (PK, FK)
- current_balance
- total_earned
- total_spent
- last_updated

### point_transactions
- transaction_id (PK)
- employee_id (FK)
- transaction_type
- points (positive for earn, negative for spend)
- description
- related_id (optional reference)
- created_at
- created_by (FK to employee for BONUS type)

### cash_redemptions
- redemption_id (PK)
- employee_id (FK)
- points_redeemed
- exchange_rate (default 1000)
- cash_amount
- status
- requested_at
- processed_at
- processed_by (FK)
- notes

---

## Notes

1. **Initial Points**: Mỗi nhân viên được seed với 5000 điểm ban đầu
2. **Exchange Rate**: 1 point = 1000 VND (hard-coded)
3. **Monthly Points**: 1000 points/tháng cho nhân viên đang hoạt động
4. **Duplicate Prevention**: Hệ thống kiểm tra không cho phép cộng điểm 2 lần trong cùng 1 tháng
5. **Balance Validation**: Hệ thống kiểm tra số dư trước khi cho phép đổi điểm
6. **Auto-create Balance**: Nếu employee chưa có balance, hệ thống tự động tạo với 0 điểm
