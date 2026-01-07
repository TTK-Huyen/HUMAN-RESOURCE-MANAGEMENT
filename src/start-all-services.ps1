# start-all-services.ps1
# Script để start tất cả services

Write-Host "Starting all services..." -ForegroundColor Green

# Config
$BackendPath = "F:\HCMUS_KH\Nam4\PTTK_HTTTHD\HUMAN-RESOURCE-MANAGEMENT\src\BE\HRMApi"
$NotificationPath = "F:\HCMUS_KH\Nam4\PTTK_HTTTHD\HUMAN-RESOURCE-MANAGEMENT\src\notification-service\notification-service"
$FrontendPath = "F:\HCMUS_KH\Nam4\PTTK_HTTTHD\HUMAN-RESOURCE-MANAGEMENT\src\frontend"

# 1. Notification Service (Java)
Write-Host "`n[1/3] Starting Notification Service (Java on port 8085)..." -ForegroundColor Cyan
$env:PATH = "C:\Program Files\Java\jdk-17\bin;$env:PATH"
Start-Process powershell -ArgumentList "-NoExit -Command `"cd '$NotificationPath' ; java -jar target/notification-service-0.0.1-SNAPSHOT.jar`"" -WindowStyle Normal

Start-Sleep -Seconds 3

# 2. Backend API (.NET)
Write-Host "[2/3] Starting Backend API (.NET on port 5291)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit -Command `"cd '$BackendPath' ; dotnet run`"" -WindowStyle Normal

Start-Sleep -Seconds 3

# 3. Frontend (React)
Write-Host "[3/3] Starting Frontend (React on port 3000)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit -Command `"cd '$FrontendPath' ; npm start`"" -WindowStyle Normal

Write-Host "`n✅ All services started!" -ForegroundColor Green
Write-Host "Notification Service: http://localhost:8085" -ForegroundColor Yellow
Write-Host "Backend API:          http://localhost:5291" -ForegroundColor Yellow
Write-Host "Frontend:             http://localhost:3000" -ForegroundColor Yellow
Write-Host "`nLogin: manager / 123456" -ForegroundColor Yellow
