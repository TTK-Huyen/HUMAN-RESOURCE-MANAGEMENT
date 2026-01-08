### Test postman
/api/v1/employees/{employeeCode}/requests/leave
{
  "leaveType": "Paid",
  "startDate": "2025-12-10T00:00:00",
  "endDate": "2025-12-12T00:00:00",
  "reason": "Family vacation",
  "handoverPersonId": 2,
  "attachmentsBase64": "SGVsbG8gV29ybGQ=" 
}

/api/v1/employees/{employeeCode}/requests/overtime
{
  "date": "2025-03-05",
  "startTime": "18:00",
  "endTime": "21:00",
  "reason": "Urgent feature deployment",
  "projectId": "PRJ001"
}


/api/v1/employees/{employeeCode}/requests/resignation
{
  "resignationDate": "2025-06-01",
  "reason": "Pursuing new career opportunities",
  "handoverToHr": 2
}

/api/v1/employees/{employeeCode}/profile-update-requests
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

### Excel Import API

POST /api/v1/employees/import-excel
- Import danh sách nhân viên từ file Excel
- Nếu mã nhân viên đã tồn tại thì cập nhật thông tin
- Content-Type: multipart/form-data
- Body: file (Excel file)
- Response: 
```json
{
  "message": "Import hoàn tất",
  "data": {
    "totalRows": 100,
    "processedRows": 95,
    "createdCount": 80,
    "updatedCount": 15,
    "skippedCount": 5,
    "errors": [
      {
        "row": 10,
        "employeeCode": "EMP010",
        "error": "Username 'existing' đã tồn tại",
        "field": "Username"
      }
    ],
    "warnings": []
  }
}
```

GET /api/v1/employees/excel-template
- Download file Excel template để import
- Response: File Excel (.xlsx)

POST /api/v1/employees/validate-excel
- Validate file Excel trước khi import
- Content-Type: multipart/form-data
- Body: file (Excel file)
- Response: { "message": "File hợp lệ", "isValid": true }

