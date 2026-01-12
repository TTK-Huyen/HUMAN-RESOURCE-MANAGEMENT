# Vào folder src : "cd F:\HCMUS_KH\Nam4\PTTK_HTTTHD\HUMAN-RESOURCE-MANAGEMENT\src>" trước khi chạy script này
# Chạy lệnh sau trên vscode: .\notification-service\start-all-services.ps1



# --- CẤU HÌNH ĐƯỜNG DẪN (Sửa lại cho đúng folder của bạn) ---
# Dấu "." nghĩa là thư mục hiện tại chứa file script này
$dotnetPath  = "./BE/HRMApi"        # Folder backend
$frontendPath = "./frontend"         # Folder frontend
$javaPath     = "./notification-service/notification-service"   # Folder java

# --- BẮT ĐẦU SCRIPT ---

Write-Host "Dang khoi dong he thong..." -ForegroundColor Cyan

# --- TASK 1: JAVA SERVICE ---
# Kiểm tra xem folder có tồn tại không trước khi chạy
if (Test-Path $javaPath) {
    Write-Host "-> Khoi chay Java..." -ForegroundColor Yellow
    # Lệnh: cd vào folder -> chạy lệnh java
    $cmdJava = "cd '$javaPath'; Write-Host 'Dang chay Java Service...' -ForegroundColor Yellow; java -jar target/notification-service-0.0.1-SNAPSHOT.jar"
    Start-Process powershell -ArgumentList "-NoExit", "-Command", $cmdJava
} else {
    Write-Host "ERR: Khong tim thay folder Java tai: $javaPath" -ForegroundColor Red
}

# --- TASK 2: FRONTEND ---
if (Test-Path $frontendPath) {
    Write-Host "-> Khoi chay Frontend..." -ForegroundColor Green
    # Lệnh: cd vào folder -> npm start
    $cmdFe = "cd '$frontendPath'; Write-Host 'Dang chay Frontend...' -ForegroundColor Green; npm start"
    Start-Process powershell -ArgumentList "-NoExit", "-Command", $cmdFe
} else {
    Write-Host "ERR: Khong tim thay folder Frontend tai: $frontendPath" -ForegroundColor Red
}

# --- TASK 3: BACKEND .NET (RESET DB & RUN) ---
Write-Host "-> Khoi chay Backend .NET (Reset DB)..." -ForegroundColor Magenta

# Chuỗi lệnh gộp tất cả các bước bạn yêu cầu
$cmdBe = "cd '$dotnetPath'; " +
         "Write-Host '1. Xoa Database...' -ForegroundColor Cyan; " +
         "dotnet ef database drop -f; " +
         "Write-Host '2. Xoa thu muc Migrations...' -ForegroundColor Cyan; " +
         "if (Test-Path 'Migrations') { Remove-Item -Path 'Migrations' -Recurse -Force }; " +
         "Write-Host '3. Tao Migration InitialCreate...' -ForegroundColor Cyan; " +
         "dotnet ef migrations add InitialCreate; " +
         "Write-Host '4. Update Database...' -ForegroundColor Cyan; " +
         "dotnet ef database update; " +
         "Write-Host '5. Start Backend...' -ForegroundColor Green; " +
         "dotnet watch run"

Start-Process powershell -ArgumentList "-NoExit", "-Command", $cmdBe

Write-Host "Da gui lenh mo 3 cua so!" -ForegroundColor Cyan