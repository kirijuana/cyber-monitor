# Build script for Cyber Monitor

Write-Host "Building Cyber Monitor..." -ForegroundColor Green

# Check Node.js
try {
    $nodeVersion = node --version
    Write-Host "Node.js found: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Node.js not found! Install from https://nodejs.org/" -ForegroundColor Red
    exit 1
}

# Install dependencies
Write-Host "`nInstalling dependencies..." -ForegroundColor Yellow
npm install

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Failed to install dependencies!" -ForegroundColor Red
    exit 1
}

# Build project
Write-Host "`nBuilding project..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Build failed!" -ForegroundColor Red
    exit 1
}

Write-Host "`nSUCCESS! Files built in frontend/" -ForegroundColor Green
Write-Host "`nNow run backend:" -ForegroundColor Cyan
Write-Host "   cd backend" -ForegroundColor White
Write-Host "   python main.py" -ForegroundColor White
Write-Host "`nOpen browser: http://localhost:8001" -ForegroundColor Cyan
