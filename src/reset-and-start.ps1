# Reset Database & Restart All Services

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "RESET DATABASE & RESTART SERVICES" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Step 1: Reset Database
Write-Host "`n[1/5] Resetting database..." -ForegroundColor Yellow
Write-Host "Command: DROP DATABASE IF EXISTS hrm; CREATE DATABASE hrm;" -ForegroundColor Gray

# Run MySQL command (need password)
$mysqlCommand = "DROP DATABASE IF EXISTS hrm; CREATE DATABASE hrm CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
Write-Host "`nPlease enter MySQL root password when prompted:" -ForegroundColor Yellow
mysql -u root -p -e $mysqlCommand

if ($LASTEXITCODE -ne 0) {
    Write-Host "`n❌ MySQL command failed. Please:" -ForegroundColor Red
    Write-Host "  1. Make sure MySQL is running" -ForegroundColor Red
    Write-Host "  2. Check your MySQL password" -ForegroundColor Red
    Write-Host "  3. Run this manually:" -ForegroundColor Red
    Write-Host "     mysql -u root -p" -ForegroundColor Gray
    Write-Host "     DROP DATABASE IF EXISTS hrm;" -ForegroundColor Gray
    Write-Host "     CREATE DATABASE hrm;" -ForegroundColor Gray
    exit 1
}

Write-Host "✅ Database reset successful!" -ForegroundColor Green

# Step 2: Kill existing processes
Write-Host "`n[2/5] Stopping existing services..." -ForegroundColor Yellow
Get-Process -Name "dotnet" -ErrorAction SilentlyContinue | Stop-Process -Force
Get-Process -Name "java" -ErrorAction SilentlyContinue | Stop-Process -Force
Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object { $_.Path -like "*npm*" } | Stop-Process -Force
Start-Sleep -Seconds 2
Write-Host "✅ Services stopped" -ForegroundColor Green

# Step 3: Start Backend (.NET) - This will run DataSeeder
Write-Host "`n[3/5] Starting Backend API (.NET)..." -ForegroundColor Yellow
Write-Host "This will run DataSeeder and create:" -ForegroundColor Gray
Write-Host "  - 1 Manager (employeeId=1)" -ForegroundColor Gray
Write-Host "  - 1 HR (employeeId=2)" -ForegroundColor Gray
Write-Host "  - 31 Employees (all with DirectManagerId=1)" -ForegroundColor Gray

$backendPath = "F:\HCMUS_KH\Nam4\PTTK_HTTTHD\HUMAN-RESOURCE-MANAGEMENT\src\BE\HRMApi"
Start-Process powershell -ArgumentList "-NoExit -Command `"cd '$backendPath' ; Write-Host 'Backend starting...' -ForegroundColor Cyan ; dotnet run`"" -WindowStyle Normal
Start-Sleep -Seconds 5

Write-Host "✅ Backend started" -ForegroundColor Green

# Step 4: Start Notification Service (Java)
Write-Host "`n[4/5] Starting Notification Service (Java)..." -ForegroundColor Yellow
$env:PATH = "C:\Program Files\Java\jdk-17\bin;$env:PATH"
$notificationPath = "F:\HCMUS_KH\Nam4\PTTK_HTTTHD\HUMAN-RESOURCE-MANAGEMENT\src\notification-service\notification-service"
Start-Process powershell -ArgumentList "-NoExit -Command `"cd '$notificationPath' ; Write-Host 'Notification Service starting...' -ForegroundColor Cyan ; java -jar target/notification-service-0.0.1-SNAPSHOT.jar`"" -WindowStyle Normal
Start-Sleep -Seconds 5

Write-Host "✅ Notification Service started" -ForegroundColor Green

# Step 5: Start Frontend (React)
Write-Host "`n[5/5] Starting Frontend (React)..." -ForegroundColor Yellow
$frontendPath = "F:\HCMUS_KH\Nam4\PTTK_HTTTHD\HUMAN-RESOURCE-MANAGEMENT\src\frontend"
Start-Process powershell -ArgumentList "-NoExit -Command `"cd '$frontendPath' ; Write-Host 'Frontend starting...' -ForegroundColor Cyan ; npm start`"" -WindowStyle Normal

Write-Host "`n========================================" -ForegroundColor Green
Write-Host "✅ ALL SERVICES STARTED!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green

Write-Host "`nService URLs:" -ForegroundColor Cyan
Write-Host "  Backend API:          http://localhost:5291" -ForegroundColor Yellow
Write-Host "  Notification Service: http://localhost:8085" -ForegroundColor Yellow
Write-Host "  Frontend:             http://localhost:3000" -ForegroundColor Yellow

Write-Host "`nTest Accounts:" -ForegroundColor Cyan
Write-Host "  Manager:  manager / 123456" -ForegroundColor Yellow
Write-Host "  HR:       hr / 123456" -ForegroundColor Yellow
Write-Host "  Employee: EMP001 / 123456" -ForegroundColor Yellow

Write-Host "`nWait 10-15 seconds for all services to fully start..." -ForegroundColor Gray
Write-Host "`nTest Notification Flow:" -ForegroundColor Cyan
Write-Host "  1. Login as EMP001 (or any employee)" -ForegroundColor White
Write-Host "  2. Create a request (Leave/Overtime/Resignation)" -ForegroundColor White
Write-Host "  3. Login as manager" -ForegroundColor White
Write-Host "  4. Check notification bell 🔔" -ForegroundColor White
