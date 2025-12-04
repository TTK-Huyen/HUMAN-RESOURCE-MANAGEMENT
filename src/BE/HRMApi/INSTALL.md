HƯỚNG DẪN NGẮN CHẠY LẦN ĐẦU
===========================

Các bước tối thiểu để chạy project `HRMApi` lần đầu trên Windows (PowerShell):

1) Chuẩn bị
- MySQL (hoặc MariaDB) đang chạy.
- PowerShell và .NET runtime/SDK tương thích (dự án đang target `net8.0`).

2) Kiểm tra .NET
```powershell
dotnet --list-sdks
dotnet --list-runtimes
```

3) (Nếu cần) Cài .NET 8 không cần quyền admin
```powershell
Invoke-WebRequest -Uri "https://dot.net/v1/dotnet-install.ps1" -OutFile "$env:TEMP\dotnet-install.ps1"
& "$env:TEMP\dotnet-install.ps1" -Channel 8.0 -InstallDir "$env:USERPROFILE\.dotnet"
# Thêm tạm thời vào PATH cho cửa sổ hiện tại
$env:PATH = "$env:USERPROFILE\.dotnet;$env:PATH"
```

4) Cài `dotnet-ef` phù hợp
```powershell
dotnet tool uninstall --global dotnet-ef || true
dotnet tool install --global dotnet-ef --version 8.0.0
dotnet-ef --version
```

5) Cập nhật `appsettings.json` (connection string)
Ví dụ ngắn:
```json
"ConnectionStrings": { "DefaultConnection": "Server=localhost;Port=3306;Database=HrmDb;User=root;Password=123456;" }
```

6) Lệnh chạy (thư mục chứa `HRMApi.csproj`)
```powershell
cd "F:\HCMUS_KH\Nam4\PTTK HTTTHD\HUMAN-RESOURCE-MANAGEMENT\src\BE\HRMApi"
dotnet restore
dotnet build
# (Nếu cần tạo migration mới)
dotnet ef migrations add InitialCreate
dotnet ef database drop -f // Xóa db hiện tại
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
Hướng dẫn cài đặt & chạy dự án HRMApi (Windows - PowerShell)
=============================================

Mục đích
-------
Tài liệu này hướng dẫn người mới cách chuẩn bị môi trường, cài các công cụ cần thiết, restore package, tạo và áp dụng migration, và chạy ứng dụng `HRMApi` trên Windows (PowerShell).

Yêu cầu trước
-------------
- Hệ điều hành: Windows
- PowerShell (Windows PowerShell 5.1 hoặc PowerShell Core)
- MySQL server (hoặc MariaDB) đang chạy và có quyền tạo database

Phiên bản .NET được dùng trong repository
--------------------------------------
- Dự án hiện target `net9.0` (xem `HRMApi.csproj`).
- Các package EF/Core và Pomelo tương thích với `net9.0` trong cấu hình hiện tại.

1) Kiểm tra .NET SDK / Runtime hiện có
--------------------------------------
Mở PowerShell và chạy:

```powershell
dotnet --list-sdks
dotnet --list-runtimes
```

Nếu bạn thấy `Microsoft.NETCore.App` (runtime) hoặc SDK cho `9.0.x` thì tốt — tiếp tục bước tiếp theo.

2) Nếu thiếu .NET 9 runtime/SDK
-------------------------------
Nếu bạn nhận lỗi kiểu "You must install or update .NET to run this application" khi chạy `dotnet ef` hoặc `dotnet run`, hãy cài .NET 9 runtime/SDK.

- Trang tải chính: https://dotnet.microsoft.com/en/download
- Link nhanh cài runtime 9: https://aka.ms/dotnet-core-applaunch?framework=Microsoft.NETCore.App&framework_version=9.0.0

Sau khi cài xong, kiểm tra lại `dotnet --list-runtimes`.

3) Cài đặt `dotnet-ef` (Entity Framework CLI)
--------------------------------------------
Phiên bản `dotnet-ef` phải tương thích với TargetFramework của dự án.

Ví dụ cho `net9.0` (dotnet-ef v9):

```powershell
# Nếu đã cài dotnet-ef khác phiên bản, gỡ trước
dotnet tool uninstall --global dotnet-ef

# Cài dotnet-ef v9
dotnet tool install --global dotnet-ef --version 9.0.0

# Kiểm tra
dotnet-ef --version
```

Ghi chú: nếu bạn muốn làm việc với `net10.0` thay vì `net9.0`, cài `dotnet-ef` tương ứng (ví dụ `--version 10.0.0`).

4) Thiết lập connection string
-------------------------------
Mở `appsettings.json` hoặc `appsettings.Development.json` và chỉnh `ConnectionStrings:DefaultConnection` cho phù hợp với MySQL của bạn.

Ví dụ:

```json
"ConnectionStrings": {
  "DefaultConnection": "server=127.0.0.1;port=3306;database=hrm_db;user=root;password=your_password;"
}
```

5) Restore, build, tạo migration và cập nhật database
-----------------------------------------------------
Chạy các lệnh sau trong thư mục dự án (nơi chứa `HRMApi.csproj`):

```powershell
cd "F:\HCMUS_KH\Nam4\PTTK HTTTHD\HUMAN-RESOURCE-MANAGEMENT\src\BE\HRMApi"

# Lấy package
dotnet restore

# Kiểm tra build
dotnet build

# Tạo migration (chỉ khi muốn tạo migration mới)
dotnet ef migrations add InitialCreate

# Áp migration lên database
dotnet ef database update

# Chạy ứng dụng
dotnet run
```

6) Nếu gặp lỗi runtime mismatch khi chạy `dotnet ef`
---------------------------------------------------
Lỗi phổ biến: "The following frameworks were found: 8.x ..., 10.x ... Learn more ... Missing framework 9.0.0"

Nguyên nhân: `dotnet-ef` (hoặc project) yêu cầu runtime 9 nhưng trên máy chưa có.

Khắc phục:
- Cài .NET 9 runtime/SDK (xem phần 2), hoặc
- Nếu bạn không muốn cài runtime 9, retarget dự án sang runtime đã có (ví dụ `net10.0`) và cập nhật các package tương ứng trong `HRMApi.csproj` rồi chạy `dotnet restore`.

7) Gợi ý đồng bộ phiên bản package
-----------------------------------
- Nếu retarget sang `net10.0`, đảm bảo các package chính như `Microsoft.EntityFrameworkCore.Design`, `Microsoft.AspNetCore.OpenApi`, và `Swashbuckle.AspNetCore` có phiên bản tương thích (10.x). Một số provider (ví dụ `Pomelo.EntityFrameworkCore.MySql`) có thể chưa có phiên bản 10.x; trong trường hợp đó, bạn nên:
  - giữ target `net9.0` và cài .NET 9 trên máy, hoặc
  - tìm provider MySQL thay thế tương thích với `net10.0`.

8) Các lỗi thường gặp & cách xử lý nhanh
--------------------------------------
- "IServiceCollection does not contain a definition for 'AddSwaggerGen'": kiểm tra `Swashbuckle.AspNetCore` đã được thêm và phiên bản tương thích với target framework.
- "You must install or update .NET to run this application": cần cài runtime version yêu cầu (kiểm tra thông báo lỗi để biết version).
- Lỗi khi connect DB: kiểm tra connection string, quyền user và rằng MySQL đang chạy.

9) Áp migration và kiểm tra (chi tiết)
------------------------------------
Trước khi áp migration, đảm bảo:
- MySQL server đang chạy và bạn có quyền tạo database (user trong `appsettings.json` có quyền `CREATE`, `ALTER`, `INSERT`, `UPDATE`, `DELETE`).
- Cổng (`port`) đúng - mặc định MySQL dùng `3306`.

Lệnh áp миграtion đã liệt kê ở trên, tóm tắt:

```powershell
# Trong thư mục dự án
dotnet ef database update
```

Kiểm tra kết quả:
- Dùng MySQL Workbench / HeidiSQL / mysql CLI để kiểm tra database (ví dụ `HrmDb`) và xem bảng `Employees`, `LeaveRequests`, `OvertimeRequests`, `ResignationRequests` có tồn tại.

Ví dụ kiểm tra bằng mysql CLI:

```powershell
mysql -u root -p -P 3306 -h 127.0.0.1
USE HrmDb;
SHOW TABLES;
```

Nếu cần thay đổi mật khẩu hoặc database name, chỉnh `appsettings.json` ngay trước khi chạy `dotnet ef database update`.

Lỗi thường gặp khi cập nhật DB:
- "Access denied" hoặc "permission denied": đăng nhập bằng user có đủ quyền hoặc cấp quyền cho user hiện tại.
- Kết nối timeout / cannot connect: kiểm tra firewall, port, và rằng MySQL đang lắng nghe trên host/port đó.

Ghi chú bảo mật: tránh commit mật khẩu thật vào git; với môi trường production nên dùng secret manager hoặc biến môi trường để lưu connection string.