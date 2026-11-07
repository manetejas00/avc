# ==============================================================================
# AVC Dhanam Solutions - Local Pre-Migration Backup Script (PowerShell)
# ==============================================================================
[CmdletBinding()]
param (
    [string]$DestinationDir = ".\backups"
)

$ErrorActionPreference = "Stop"
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$targetBackup = Join-Path -Path $DestinationDir -ChildPath "backup_$timestamp"

Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "Creating Local Pre-Migration Backup: $timestamp" -ForegroundColor Cyan
Write-Host "Target: $targetBackup" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan

New-Item -ItemType Directory -Path "$targetBackup\configs" -Force | Out-Null
New-Item -ItemType Directory -Path "$targetBackup\dist" -Force | Out-Null

# 1. Back up config files
Write-Host "[1/4] Backing up configuration and environment files..." -ForegroundColor Green
$configs = @(".env", ".env.example", ".env.production", ".htaccess", "server.js", "package.json")
foreach ($cfg in $configs) {
    if (Test-Path $cfg) {
        Copy-Item $cfg -Destination "$targetBackup\configs\$cfg.backup" -Force
    }
}

# 2. Back up data folder (if present)
Write-Host "[2/4] Checking local database directory..." -ForegroundColor Green
if (Test-Path "data") {
    Copy-Item "data" -Destination "$targetBackup\data" -Recurse -Force
}

# 3. Back up compiled dist folder
Write-Host "[3/4] Backing up compiled dist assets..." -ForegroundColor Green
if (Test-Path "dist") {
    Copy-Item "dist\*" -Destination "$targetBackup\dist" -Recurse -Force
}

# 4. Generate SHA256 checksum manifest
Write-Host "[4/4] Generating checksum manifest..." -ForegroundColor Green
$files = Get-ChildItem -Path $targetBackup -Recurse -File | Where-Object { $_.Name -ne "checksums.csv" }
$hashes = foreach ($f in $files) {
    Get-FileHash -Path $f.FullName -Algorithm SHA256
}
$hashes | Export-Csv -Path "$targetBackup\checksums.csv" -NoTypeInformation

Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "Local backup completed successfully at: $targetBackup" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan
