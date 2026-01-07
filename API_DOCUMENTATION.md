# API Documentation & Examples

## Employee Management API Reference

### Base URL
```
http://localhost:5291/api/v1
```

---

## 1. Create Employee (Single)

### Endpoint
```
POST /employees
```

### Request Headers
```
Authorization: Bearer {token}
Content-Type: application/json
```

### Request Body
```json
{
  "employeeName": "Nguyễn Văn An",
  "dateOfBirth": "1995-03-20",
  "gender": "Nam",
  "nationality": "Việt Nam",
  "maritalStatus": "Độc thân",
  "hasChildren": false,
  "citizenIdNumber": "0123456789012",
  "personalTaxCode": "0945123456",
  "socialInsuranceNumber": "9501234567",
  "companyEmail": "nguyenvana@company.com",
  "personalEmail": "nguyenvana@personal.com",
  "phoneNumbers": [
    {
      "phoneNumber": "0912345678",
      "description": "Cá nhân"
    },
    {
      "phoneNumber": "0987654321",
      "description": "Liên hệ"
    }
  ],
  "birthPlace": {
    "province": "Hồ Chí Minh",
    "district": "Quận 9"
  },
  "currentAddress": {
    "province": "Hồ Chí Minh",
    "district": "Quận 9"
  },
  "bankAccount": {
    "bankName": "TECHCOMBANK",
    "accountNumber": "1234567890123",
    "accountHolderName": "Nguyễn Văn An"
  },
  "departmentId": 1,
  "jobTitleId": 5,
  "directManagerId": null,
  "employmentType": "Toàn thời gian",
  "contractType": "Vĩnh viễn",
  "contractStartDate": "2023-06-01",
  "contractEndDate": null,
  "roleId": 3
}
```

### Response (201 Created)
```json
{
  "message": "Thêm nhân viên thành công",
  "data": {
    "id": 1,
    "employeeCode": "NV001",
    "employeeName": "Nguyễn Văn An",
    "dateOfBirth": "1995-03-20",
    "initialPassword": "NV00193"
  }
}
```

### Response (400 Bad Request)
```json
{
  "message": "Validation failed",
  "errors": {
    "citizenIdNumber": "CCCD already exists",
    "phoneNumbers": "At least one phone number required"
  }
}
```

---

## 2. Download Excel Template

### Endpoint
```
GET /employees/excel-template
```

### Request Headers
```
Authorization: Bearer {token}
```

### Response (200 OK)
```
Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
Content-Disposition: attachment; filename=Employee_Import_Template_20240115.xlsx
```

**File Content**: Excel workbook with:
- **Sheet 1 "Employee Template"**: 32 columns with sample data
- **Sheet 2 "Lookup"**: Reference data for departments, job titles, roles
- Formatted headers with gray background
- Sample row with Vietnamese data

### Excel Template Columns

```
A: EmployeeCode*           B: FullName*              C: Username*              D: Password*
E: DateOfBirth*            F: Gender*                G: CitizenIdNumber*       H: PhoneNumber1*
I: PhoneNumber1Description J: PhoneNumber2           K: PhoneNumber2Description L: BirthPlaceProvince*
M: BirthPlaceDistrict*     N: PersonalEmail          O: CompanyEmail           P: CurrentAddress
Q: BankName*               R: BankAccountNumber*     S: BankAccountHolderName  T: DepartmentCode*
U: JobTitleCode*           V: RoleName               W: EmploymentType         X: ContractType
Y: ContractStartDate*      Z: ContractEndDate        AA: DirectManagerCode     AB: MaritalStatus
AC: HasChildren            AD: PersonalTaxCode       AE: SocialInsuranceNumber  AF: Nationality*
```

---

## 3. Import Employees from Excel

### Endpoint
```
POST /employees/import-excel
```

### Request Headers
```
Authorization: Bearer {token}
Content-Type: multipart/form-data
```

### Request Body
```
form-data:
  file: [Excel file binary data]
```

### Response (200 OK)
```json
{
  "message": "Import hoàn tất",
  "data": {
    "totalRows": 10,
    "processedRows": 9,
    "createdCount": 7,
    "updatedCount": 2,
    "skippedCount": 1,
    "errors": [
      {
        "row": 5,
        "employeeCode": "NV005",
        "message": "Department 'HR' not found"
      }
    ]
  }
}
```

### Response (400 Bad Request)
```json
{
  "message": "Unable to process file",
  "errors": [
    {
      "row": 0,
      "error": "File Excel không có dữ liệu (chỉ có header)"
    }
  ]
}
```

---

## 4. Validate Excel File

### Endpoint
```
POST /employees/validate-excel
```

### Request Headers
```
Authorization: Bearer {token}
Content-Type: multipart/form-data
```

### Request Body
```
form-data:
  file: [Excel file binary data]
```

### Response (200 OK - Valid)
```json
{
  "message": "File hợp lệ",
  "isValid": true
}
```

### Response (400 Bad Request - Invalid)
```json
{
  "message": "Chỉ chấp nhận file Excel (.xlsx, .xls)",
  "isValid": false
}
```

---

## 5. Retrieve Employee Details

### Endpoint
```
GET /employees/{employeeId}
```

### Request Headers
```
Authorization: Bearer {token}
```

### Response (200 OK)
```json
{
  "id": 1,
  "employeeCode": "NV001",
  "employeeName": "Nguyễn Văn An",
  "dateOfBirth": "1995-03-20",
  "gender": "Nam",
  "citizenIdNumber": "0123456789012",
  "birthPlaceProvince": "Hồ Chí Minh",
  "birthPlaceDistrict": "Quận 9",
  "currentAddress": "Quận 9, Hồ Chí Minh",
  "phoneNumbers": [
    {
      "id": 1,
      "phoneNumber": "0912345678",
      "description": "Cá nhân"
    },
    {
      "id": 2,
      "phoneNumber": "0987654321",
      "description": "Liên hệ"
    }
  ],
  "bankAccount": {
    "id": 1,
    "bankName": "TECHCOMBANK",
    "accountNumber": "1234567890123",
    "accountHolderName": "Nguyễn Văn An"
  }
}
```

---

## 6. Update Employee

### Endpoint
```
PUT /employees/{employeeId}
```

### Request Headers
```
Authorization: Bearer {token}
Content-Type: application/json
```

### Request Body
```json
{
  "employeeName": "Nguyễn Văn An (Updated)",
  "phoneNumbers": [
    {
      "phoneNumber": "0912345679",
      "description": "Cá nhân"
    }
  ],
  "birthPlace": {
    "province": "Hà Nội",
    "district": "Quận 1"
  },
  "bankAccount": {
    "bankName": "VIETCOMBANK",
    "accountNumber": "9876543210123",
    "accountHolderName": "Nguyễn Văn An"
  }
}
```

### Response (200 OK)
```json
{
  "message": "Cập nhật nhân viên thành công",
  "data": {
    "id": 1,
    "employeeCode": "NV001",
    "employeeName": "Nguyễn Văn An (Updated)"
  }
}
```

---

## 7. List All Employees

### Endpoint
```
GET /employees?pageNumber=1&pageSize=10&searchText=Nguyễn
```

### Query Parameters
- `pageNumber` (int): Page number (1-based)
- `pageSize` (int): Records per page (default: 10)
- `searchText` (string): Filter by employee name or code

### Request Headers
```
Authorization: Bearer {token}
```

### Response (200 OK)
```json
{
  "items": [
    {
      "id": 1,
      "employeeCode": "NV001",
      "employeeName": "Nguyễn Văn An",
      "dateOfBirth": "1995-03-20",
      "departmentName": "IT",
      "jobTitleName": "Senior Developer",
      "phoneNumbers": ["0912345678", "0987654321"],
      "birthPlaceProvince": "Hồ Chí Minh"
    }
  ],
  "totalRecords": 50,
  "totalPages": 5,
  "pageNumber": 1,
  "pageSize": 10
}
```

---

## Excel File Format Examples

### Sample Row - Minimal Data
```
EmployeeCode: NV001
FullName: Nguyễn Văn An
Username: nguyenvana
Password: Secure@123
DateOfBirth: 1995-03-20
Gender: Nam
CitizenIdNumber: 0123456789012
PhoneNumber1: 0912345678
PhoneNumber1Description: Cá nhân
BirthPlaceProvince: Hồ Chí Minh
BirthPlaceDistrict: Quận 9
BankName: TECHCOMBANK
BankAccountNumber: 1234567890123
DepartmentCode: IT
JobTitleCode: 5
ContractStartDate: 2023-06-01
Nationality: Việt Nam
```

### Sample Row - Complete Data
```
EmployeeCode: NV002
FullName: Trần Thị Bình
Username: tranthihibh
Password: Secure@456
DateOfBirth: 1998-07-15
Gender: Nữ
CitizenIdNumber: 0987654321098
PhoneNumber1: 0901111111
PhoneNumber1Description: Công ty
PhoneNumber2: 0909999999
PhoneNumber2Description: Liên hệ
BirthPlaceProvince: Hà Nội
BirthPlaceDistrict: Quận Ba Đình
PersonalEmail: tranthib@personal.com
CompanyEmail: tranthib@company.com
CurrentAddress: 123 Ngõ Hàng Bạc, Hà Nội
BankName: VIETCOMBANK
BankAccountNumber: 9876543210123
BankAccountHolderName: Trần Thị Bình
DepartmentCode: HR
JobTitleCode: 3
RoleName: Nhân viên
EmploymentType: Toàn thời gian
ContractType: Vĩnh viễn
ContractStartDate: 2023-01-01
DirectManagerCode: NV001
MaritalStatus: Độc thân
HasChildren: Không
PersonalTaxCode: 1234567890
SocialInsuranceNumber: 9876543210
Nationality: Việt Nam
```

---

## Error Response Codes

| Code | Meaning | Example |
|------|---------|---------|
| 200 | Success | Employee created/retrieved |
| 201 | Created | New employee added |
| 400 | Bad Request | Invalid data format |
| 401 | Unauthorized | Missing/invalid token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Employee doesn't exist |
| 409 | Conflict | Duplicate CCCD/Username |
| 422 | Unprocessable | Validation error |
| 500 | Server Error | Database error |

---

## Common Validation Errors

### Phone Numbers
- ❌ Error: "At least one phone number required"
  - Fix: Add PhoneNumber1
- ❌ Error: "Maximum 2 phone numbers allowed"
  - Fix: Remove extra phone entries
- ❌ Error: "Phone number format invalid"
  - Fix: Use numeric format, no spaces

### Address Fields
- ❌ Error: "BirthPlaceProvince is required"
  - Fix: Select from provinces dropdown
- ❌ Error: "BirthPlaceDistrict is required"
  - Fix: Select from districts dropdown
- ❌ Error: "Province not found"
  - Fix: Verify exact spelling matches PROVINCES array

### Bank Account
- ❌ Error: "BankAccountNumber must be numeric"
  - Fix: Remove spaces/dashes
- ❌ Error: "Account length must be 10-20 digits"
  - Fix: Adjust account number length
- ❌ Error: "BankAccountHolderName is required"
  - Fix: Add account holder name

### Employee Info
- ❌ Error: "CitizenIdNumber already exists"
  - Fix: Use unique CCCD
- ❌ Error: "Username already exists"
  - Fix: Choose different username
- ❌ Error: "DepartmentCode not found"
  - Fix: Verify department exists in database

---

## Testing with cURL

### Download Template
```bash
curl -X GET "http://localhost:5291/api/v1/employees/excel-template" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -o template.xlsx
```

### Validate Excel
```bash
curl -X POST "http://localhost:5291/api/v1/employees/validate-excel" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@employees.xlsx"
```

### Import Excel
```bash
curl -X POST "http://localhost:5291/api/v1/employees/import-excel" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@employees.xlsx"
```

### Create Single Employee
```bash
curl -X POST "http://localhost:5291/api/v1/employees" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d @employee.json
```

---

## Notes

- All dates should be in `YYYY-MM-DD` format
- All numeric fields (CCCD, account numbers) should be strings
- Boolean fields: use `true`/`false` or `1`/`0`
- Required fields marked with `*`
- Phone numbers are validated for numeric format only
- Excel import updates existing records if EmployeeCode matches
- Transactions ensure data consistency across all related tables
