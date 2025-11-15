#!/usr/bin/env pwsh
# ArcCredit Quick Setup Script for PowerShell
# Run: ./setup.ps1

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "    ArcCredit Quick Setup (PowerShell)" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Check if running in correct directory
if (-not (Test-Path "package.json")) {
    Write-Host "ERROR: Please run this script from the ArcCredit root directory" -ForegroundColor Red
    Write-Host "Current directory: $(Get-Location)" -ForegroundColor Red
    exit 1
}

# Step 1: Install backend dependencies
Write-Host "[1/4] Checking backend dependencies..." -ForegroundColor Yellow
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing npm packages (backend)..." -ForegroundColor Green
    npm install
} else {
    Write-Host "✓ Backend dependencies already installed" -ForegroundColor Green
}

# Step 2: Compile contracts
Write-Host ""
Write-Host "[2/4] Compiling smart contracts..." -ForegroundColor Yellow
npx hardhat compile
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Contract compilation failed" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Contracts compiled successfully" -ForegroundColor Green

# Step 3: Deploy contracts
Write-Host ""
Write-Host "[3/4] Deploying contracts to Hardhat network..." -ForegroundColor Yellow
npx hardhat run scripts/deploy.js
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Deployment failed" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Deployment successful" -ForegroundColor Green

# Step 4: Install frontend dependencies
Write-Host ""
Write-Host "[4/4] Setting up frontend..." -ForegroundColor Yellow
Push-Location arccredit-frontend
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing npm packages (frontend)..." -ForegroundColor Green
    npm install
} else {
    Write-Host "✓ Frontend dependencies already installed" -ForegroundColor Green
}
Pop-Location

# Success message
Write-Host ""
Write-Host "================================================" -ForegroundColor Green
Write-Host "    Setup Complete! ✓" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green
Write-Host ""

Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Configure MetaMask (if not already done):" -ForegroundColor White
Write-Host "   - Network: ArcCredit Dev" -ForegroundColor Gray
Write-Host "   - RPC URL: http://127.0.0.1:8545" -ForegroundColor Gray
Write-Host "   - Chain ID: 31337" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Start the frontend:" -ForegroundColor White
Write-Host "   cd arccredit-frontend" -ForegroundColor Gray
Write-Host "   npm start" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Open http://localhost:3000 in your browser" -ForegroundColor White
Write-Host ""
Write-Host "4. Click 'Connect Wallet' to connect MetaMask" -ForegroundColor White
Write-Host ""
Write-Host "For more details, see:" -ForegroundColor Cyan
Write-Host "- docs/DEPLOYMENT_GUIDE.md" -ForegroundColor Gray
Write-Host "- DEPLOYMENT_SUMMARY.md" -ForegroundColor Gray
Write-Host ""

Read-Host "Press Enter to close this window"
