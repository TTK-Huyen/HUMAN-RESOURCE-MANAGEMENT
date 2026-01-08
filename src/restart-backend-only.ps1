# Restart Backend Only (with logs)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "RESTART BACKEND API ONLY" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

Write-Host "`nStopping dotnet processes..." -ForegroundColor Yellow
Get-Process -Name "dotnet" -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 2
Write-Host "âœ… Stopped" -ForegroundColor Green

Write-Host "`nStarting backend..." -ForegroundColor Yellow
Write-Host "Location: BE\HRMApi" -ForegroundColor Gray
Write-Host "Command: dotnet run" -ForegroundColor Gray

cd "F:\HCMUS_KH\Nam4\PTTK_HTTTHD\HUMAN-RESOURCE-MANAGEMENT\src\BE\HRMApi"

Write-Host "`n========================================" -ForegroundColor Green
Write-Host "Watch for this message:" -ForegroundColor Green
Write-Host "  '--> Bắt đầu tạo dữ liệu...'" -ForegroundColor Yellow
Write-Host "========================================`n" -ForegroundColor Green

dotnet run
