# Test Excel Template Download

$backendUrl = "http://localhost:5291/api/v1/employees/excel-template"
$outputPath = "$PSScriptRoot\Employee_Import_Template.xlsx"

Write-Host "========================================" -ForegroundColor Green
Write-Host "TEST: DOWNLOAD EXCEL TEMPLATE"
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

try {
    Write-Host "Downloading template from: $backendUrl" -ForegroundColor Cyan
    
    $response = Invoke-WebRequest -Uri $backendUrl `
        -Method Get `
        -OutFile $outputPath `
        -ErrorAction Stop
    
    if (Test-Path $outputPath) {
        $fileSize = (Get-Item $outputPath).Length / 1KB
        Write-Host "✅ Template downloaded successfully!" -ForegroundColor Green
        Write-Host "   Location: $outputPath" -ForegroundColor Cyan
        Write-Host "   Size: $([math]::Round($fileSize, 2)) KB" -ForegroundColor Cyan
    }
} catch {
    Write-Host "❌ Error downloading template:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "TEMPLATE READY FOR TESTING"
Write-Host "========================================" -ForegroundColor Green
