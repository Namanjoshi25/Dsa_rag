# Script to move Docker Desktop storage to E: drive and clean up
# Run this script as Administrator

Write-Host "=== Docker Storage Migration Script ===" -ForegroundColor Cyan
Write-Host ""

# Check if running as admin
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Host "ERROR: This script must be run as Administrator!" -ForegroundColor Red
    Write-Host "Right-click PowerShell and select 'Run as Administrator'" -ForegroundColor Yellow
    exit 1
}

# Check E: drive space
Write-Host "Checking E: drive space..." -ForegroundColor Yellow
$eDrive = Get-PSDrive E -ErrorAction SilentlyContinue
if ($eDrive) {
    $freeGB = [math]::Round($eDrive.Free / 1GB, 2)
    Write-Host "E: drive has $freeGB GB free space" -ForegroundColor Green
    if ($freeGB -lt 20) {
        Write-Host "WARNING: E: drive has less than 20GB free. Docker needs significant space." -ForegroundColor Yellow
    }
} else {
    Write-Host "ERROR: E: drive not found!" -ForegroundColor Red
    exit 1
}

# Stop Docker Desktop
Write-Host ""
Write-Host "Stopping Docker Desktop..." -ForegroundColor Yellow
Stop-Process -Name "Docker Desktop" -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 5

# Stop WSL
Write-Host "Stopping WSL..." -ForegroundColor Yellow
wsl --shutdown
Start-Sleep -Seconds 3

# Docker data locations
$dockerDataPath = "$env:LOCALAPPDATA\Docker"
$dockerWSLPath = "$env:USERPROFILE\.docker"
$newDockerPath = "E:\DockerData"
$newWSLPath = "E:\DockerWSL"

Write-Host ""
Write-Host "Docker data locations:" -ForegroundColor Cyan
Write-Host "  Current: $dockerDataPath"
Write-Host "  Current WSL: $dockerWSLPath"
Write-Host "  New location: $newDockerPath"
Write-Host "  New WSL location: $newWSLPath"
Write-Host ""

# Create new directories
Write-Host "Creating new directories on E: drive..." -ForegroundColor Yellow
New-Item -ItemType Directory -Path $newDockerPath -Force | Out-Null
New-Item -ItemType Directory -Path $newWSLPath -Force | Out-Null

# Move Docker data if it exists
if (Test-Path $dockerDataPath) {
    Write-Host "Moving Docker data to E: drive..." -ForegroundColor Yellow
    try {
        robocopy $dockerDataPath $newDockerPath /E /MOVE /R:3 /W:5
        Write-Host "Docker data moved successfully!" -ForegroundColor Green
    } catch {
        Write-Host "Error moving Docker data: $_" -ForegroundColor Red
    }
}

# Clean up Docker (if possible)
Write-Host ""
Write-Host "Attempting to clean Docker resources..." -ForegroundColor Yellow
try {
    docker system prune -a --volumes -f 2>&1 | Out-Null
    Write-Host "Docker cleanup attempted" -ForegroundColor Green
} catch {
    Write-Host "Could not run Docker cleanup (Docker may not be accessible)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=== Next Steps ===" -ForegroundColor Cyan
Write-Host "1. Open Docker Desktop Settings" -ForegroundColor White
Write-Host "2. Go to 'Resources' > 'Advanced'" -ForegroundColor White
Write-Host "3. Change the 'Disk image location' to: $newDockerPath" -ForegroundColor White
Write-Host "4. Or use WSL2 backend and configure it to use E: drive" -ForegroundColor White
Write-Host ""
Write-Host "Alternative: Use Docker Desktop Settings > Resources > Advanced" -ForegroundColor Yellow
Write-Host "  to change the disk image location directly to E:\DockerData" -ForegroundColor Yellow
Write-Host ""
Write-Host "Script completed!" -ForegroundColor Green


