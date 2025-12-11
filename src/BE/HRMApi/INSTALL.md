HƯỚNG DẪN NGẮN CHẠY LẦN ĐẦU
===========================

Các bước tối thiểu để chạy project `HRMApi` lần đầu trên Windows (PowerShell):


## Set up

### Backend

1. Tạo môi trường ảo  
   Chỉ tạo lần đầu.

   Di chuyển vào thư mục backend và chạy:
   `py -m venv env`

2. Kích hoạt môi trường ảo  
   Kích hoạt mỗi lần phát triển backend.
   
   `.\env\Scripts\activate`  

3. Cài đặt tất cả các gói trong file `requirements.txt` vào môi trường ảo  
   `pip install -r requirements.txt`  

4. Khi muốn cài đặt một gói mới vào môi trường ảo
   - Cài đặt gói mới  
     `pip install [package]`
   - Cập nhật lại `requirements.txt`  
     `pip freeze > requirements.txt`  


5. Kết thúc làm việc, tắt môi trường ảo:
   `deactivate`


1) Chuẩn bị
- MySQL (hoặc MariaDB) đang chạy.
- PowerShell và .NET runtime/SDK tương thích (dự án đang target `net9.0`).

2) Kiểm tra .NET
```powershell
dotnet --list-sdks
dotnet --list-runtimes
```

3) Cài `dotnet-ef` phù hợp
```powershell
dotnet tool uninstall --global dotnet-ef || true
dotnet tool install --global dotnet-ef --version 9.0.0
dotnet-ef --version
```

4) Cập nhật `appsettings.json` (connection string)
Ví dụ ngắn:
```json
"ConnectionStrings": { "DefaultConnection": "Server=localhost;Port=3306;Database=HrmDb;User=root;Password=123456;" }
```

```docker
Tạo server: 
docker run -d --name mysql -e MYSQL_ROOT_PASSWORD=123456 -e MYSQL_DATABASE=HrmDb -p 3306:3306 mysql:8.0

Kiểm tra sau khi chạy: 
docker ps
```
```json
"ConnectionStrings": {
  "DefaultConnection": "Server=mysql;Port=3306;Database=HrmDb;User=root;Password=123456;"
}

```


6) Lệnh chạy (thư mục chứa `HRMApi.csproj`)

```powershell
cd ".\src\BE\HRMApi"
dotnet restore
dotnet build

# (Nếu cần tạo migration mới)
dotnet ef migrations add InitialCreate
dotnet ef database drop -f // Xóa db hiện tại - localhost
docker rm -f mysql // Xóa db hiện tại - docker
dotnet ef database update
dotnet run
```

7) Kiểm tra nhanh khi lỗi
- "You must install or update .NET" → cài runtime/SDK đúng major version
- DB connection lỗi → kiểm tra host/port/user/password và MySQL đang chạy

Ghi chú ngắn
- Không commit mật khẩu thật vào git; dùng secret manager hoặc biến môi trường cho production.
- Nếu muốn, tôi có thể: chạy `dotnet run`, commit thay đổi, hoặc cập nhật README để link tới file này.

Thực hiện đủ các bước trên là bạn sẽ có API chạy được trên máy dev.

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

Responses
Curl

curl -X 'GET' \
  'http://localhost:5291/api/v1/hr/profile-update-requests/1' \
  -H 'accept: text/plain'
Request URL
http://localhost:5291/api/v1/hr/profile-update-requests/1
Server response
Code	Details
200	
Response body
Download
{
  "request_id": 1,
  "employee_id": 1,
  "request_status": "PENDING",
  "details": [
    {
      "field_name": "Gender",
      "old_value": "Male",
      "new_value": "Female"
    }
  ]
}
Response headers
 content-type: application/json; charset=utf-8 
 date: Sat,06 Dec 2025 07:28:24 GMT 
 server: Kestrel 
 transfer-encoding: chunked 
Responses
Code	Description	Links
200	
OK

Media type

text/plain
Controls Accept header.
Example Value
Schema
{
  "request_id": 0,
  "employee_id": 0,
  "request_status": "string",
  "details": [
    {
      "field_name": "string",
      "old_value": "string",
      "new_value": "string"
    }
  ]
}


{
  "username": "user1",
  "password": "123456",
  "employeeId": 1,
  "roleId": 1
}