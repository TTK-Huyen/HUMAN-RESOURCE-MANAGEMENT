HƯỚNG DẪN NGẮN CHẠY LẦN ĐẦU
===========================

Các bước tối thiểu để chạy project `HRMApi` lần đầu trên Windows (PowerShell):


## Set up

### Backend

1. Tạo môi trường ảo  
   Chỉ tạo lần đầu.

   Di chuyển vào thư mục backend và chạy:
   `py -m venv env`

   Dành cho MacOS: python3 -m venv env

2. Kích hoạt môi trường ảo  
   Kích hoạt mỗi lần phát triển backend.
   
   `.\env\Scripts\activate`

   Cho MacOS: source env/bin/activate

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

### Essential Employee Info API

GET /api/v1/employees/essential
- Lấy danh sách thông tin cơ bản của tất cả nhân viên active
- Response: Array of objects containing: id, employeeCode, fullName, dateOfBirth, gender, citizenIdNumber, phoneNumber, departmentName, jobTitleName

GET /api/v1/employees/essential?employeeCode=EMP001
- Lấy thông tin cơ bản của nhân viên cụ thể theo mã nhân viên
- Trả về 404 nếu không tìm thấy hoặc nhân viên không active
- Response: Array with single object (hoặc empty array)

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

#### Excel Template Format

Những trường và quy tắc validate tương ứng với code hiện tại:

1) Nhóm Bắt buộc (Must-have) — phải có trong file khi import:
- EmployeeCode*: Mã nhân viên (unique)
- FullName*: Họ tên đầy đủ
- Username*: Tên đăng nhập (unique)
- Password*: Mật khẩu
- DateOfBirth*: Ngày sinh (format: YYYY-MM-DD)
- Gender*: Giới tính (Male / Female / Other)
- CitizenIdNumber*: CCCD/CMND
- DepartmentCode*: Mã phòng ban (ví dụ: DPT01)
- JobTitleCode*: Mã chức danh (hoặc Id chức danh nếu dùng Id trong file)
- ContractStartDate*: Ngày bắt đầu hợp đồng (YYYY-MM-DD)
- Nationality*: Quốc tịch (ví dụ: Vietnam, USA)

2) Nhóm Bắt buộc theo điều kiện (Conditional Required)
- ContractEndDate: Bắt buộc khi ContractType = "Fixed-term" (nếu ContractType = "Indefinite" thì không cần).
- PersonalTaxCode & SocialInsuranceNumber: Không cần ngay khi tạo nhưng là bắt buộc khi làm nghiệp vụ thuế / bảo hiểm (nên cung cấp nếu có).
- DirectManagerCode: Không bắt buộc khi import nhưng nếu tổ chức có quy trình phê duyệt thì cần phải có trước khi gửi đơn (nếu có thì phải là mã quản lý hợp lệ trong hệ thống).
- CompanyEmail: Tùy công ty — nếu công ty yêu cầu sử dụng email nội bộ thì trường này phải có.

3) Nhóm Tùy chọn (Optional) — có thể để trống lúc tạo:
- PhoneNumber: Số điện thoại
- PersonalEmail: Email cá nhân
- CurrentAddress: Địa chỉ hiện tại
- MaritalStatus: Tình trạng hôn nhân (Single / Married / Other)
- HasChildren: Có con (true / false / 1 / 0 / yes / no)
- EmploymentType: Full-time / Part-time / Internship (mặc định có thể là Full-time)
- ContractType: Indefinite / Fixed-term
- RoleName: Tên role (Employee / Manager / HR) — nếu không có sẽ dùng role mặc định (Employee)

4) Định dạng & lưu ý
- Ngày: sử dụng định dạng chuẩn ISO hoặc common formats (yyyy-MM-dd, dd/MM/yyyy, dd-MM-yyyy). Ví dụ: 1990-01-15
- Gender: dùng "Male", "Female", hoặc "Other" để tránh lệch dữ liệu
- HasChildren: chấp nhận các giá trị boolean phổ biến: true/false, 1/0, yes/no
- JobTitleCode: nếu bạn lưu Id chức danh trong file thì dùng Id số; nếu dùng mã code thì phải phù hợp với dữ liệu trong DB
- Khi import: nếu EmployeeCode đã tồn tại → hệ thống sẽ cập nhật (update) dữ liệu theo dòng trong file; nếu không tồn tại → tạo mới
- Nếu một dòng có lỗi (thiếu required hoặc lookup không tìm thấy) → dòng đó sẽ bị bỏ qua và trả về lỗi chi tiết (row, employeeCode, message)

5) Header (ví dụ chuẩn để dùng làm template CSV/XLSX):
EmployeeCode,FullName,Username,Password,DateOfBirth,Gender,CitizenIdNumber,PhoneNumber,CompanyEmail,PersonalEmail,CurrentAddress,DepartmentCode,JobTitleCode,RoleName,EmploymentType,ContractType,ContractStartDate,ContractEndDate,DirectManagerCode,MaritalStatus,HasChildren,PersonalTaxCode,SocialInsuranceNumber,Nationality


dotnet add package EPPlus
### User account
Employee account
- username: employee
- password: Emp123!@

Hr account
- username: hr
- password: Hr123!@#

Manager account
- username: manager
- password: Mgr123!@#