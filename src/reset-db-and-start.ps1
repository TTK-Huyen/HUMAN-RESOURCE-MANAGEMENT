# Reset Database & Start Backend

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "RESET DATABASE & START BACKEND" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Step 1: Clean database
Write-Host "`n[1/3] Dropping and recreating hrm database..." -ForegroundColor Yellow
mysql -u root -proot -e "DROP DATABASE IF EXISTS hrm; CREATE DATABASE hrm CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;" 2>&1 | Select-String -Pattern "ERROR" -ErrorAction SilentlyContinue | ForEach-Object { Write-Host "Error: $_" -ForegroundColor Red }
Write-Host "✅ Database reset" -ForegroundColor Green

# Step 2: Kill existing backend
Write-Host "`n[2/3] Stopping existing backend..." -ForegroundColor Yellow
Get-Process -Name "dotnet" -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 2
Write-Host "✅ Backend stopped" -ForegroundColor Green

# Step 3: Start backend (DataSeeder will run)
Write-Host "`n[3/3] Starting backend (DataSeeder will create new data)..." -ForegroundColor Yellow
Write-Host "Location: BE/HRMApi" -ForegroundColor Gray
Write-Host "`nWatch for: '--> Bắt đầu tạo dữ liệu...'" -ForegroundColor Cyan
Write-Host "This means DataSeeder is running.`n" -ForegroundColor Cyan

cd "F:\HCMUS_KH\Nam4\PTTK_HTTTHD\HUMAN-RESOURCE-MANAGEMENT\src\BE\HRMApi"
dotnet run
