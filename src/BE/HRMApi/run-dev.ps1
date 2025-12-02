# run-dev.ps1
# Install .NET 9 SDK if needed, restore, build, apply migrations, and run the app

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

Write-Host "== run-dev.ps1: starting ==" -ForegroundColor Cyan

# Change to script directory
if ($PSScriptRoot) { Set-Location $PSScriptRoot }

# Check for .NET 9 SDK
Write-Host "Checking for .NET 9 SDK..." -NoNewline
$sdks = @(& dotnet --list-sdks 2>$null)
$has9 = $sdks | Where-Object { $_ -match '^9\.' }

if ($has9) {
    Write-Host " found." -ForegroundColor Green
} else {
    Write-Host " not found. Installing .NET 9 SDK..." -ForegroundColor Yellow
    $installScript = "$env:TEMP\dotnet-install.ps1"
    Invoke-WebRequest -Uri "https://dot.net/v1/dotnet-install.ps1" -OutFile $installScript -UseBasicParsing
    & $installScript -Channel 9.0 -InstallDir "$env:USERPROFILE\.dotnet"
    $env:PATH = "$env:USERPROFILE\.dotnet;$env:USERPROFILE\.dotnet\tools;$env:PATH"
    Write-Host ".NET 9 SDK install completed." -ForegroundColor Green
}

# Show SDK/runtime info
Write-Host "`n.NET SDKs available:" -ForegroundColor Cyan
& dotnet --list-sdks

Write-Host "`n.NET Runtimes available:" -ForegroundColor Cyan
& dotnet --list-runtimes

# Restore packages
Write-Host "`nRestoring NuGet packages..." -ForegroundColor Cyan
& dotnet restore

# Build project
Write-Host "`nBuilding project..." -ForegroundColor Cyan
& dotnet build

# Install dotnet-ef if needed
Write-Host "`nEnsuring dotnet-ef v9 is installed..." -ForegroundColor Cyan
& dotnet tool uninstall --global dotnet-ef -ErrorAction SilentlyContinue | Out-Null
& dotnet tool install --global dotnet-ef --version 9.0.0

# Apply migrations
Write-Host "`nApplying EF migrations..." -ForegroundColor Cyan
try {
    & dotnet-ef database update
} catch {
    Write-Host "Warning: EF migrations failed. Check database connection." -ForegroundColor Yellow
}

# Run application
Write-Host "`nStarting application..." -ForegroundColor Cyan
& dotnet run

Write-Host "`n== run-dev.ps1: finished ==" -ForegroundColor Cyan
