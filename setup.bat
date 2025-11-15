@echo off
REM ArcCredit Quick Setup Script for Windows
REM This script automates the deployment and frontend startup process

echo.
echo ================================================
echo    ArcCredit Quick Setup (Windows)
echo ================================================
echo.

REM Check if running in correct directory
if not exist "package.json" (
    echo ERROR: Please run this script from the ArcCredit root directory
    echo Current directory: %cd%
    exit /b 1
)

echo [1/4] Checking dependencies...
if not exist "node_modules" (
    echo Installing npm packages (backend)...
    call npm install
) else (
    echo ✓ Backend dependencies already installed
)

echo.
echo [2/4] Compiling smart contracts...
call npx hardhat compile
if errorlevel 1 (
    echo ERROR: Contract compilation failed
    exit /b 1
)
echo ✓ Contracts compiled successfully

echo.
echo [3/4] Deploying contracts to Hardhat network...
call npx hardhat run scripts/deploy.js
if errorlevel 1 (
    echo ERROR: Deployment failed
    exit /b 1
)
echo ✓ Deployment successful

echo.
echo [4/4] Setting up frontend...
cd arccredit-frontend
if not exist "node_modules" (
    echo Installing npm packages (frontend)...
    call npm install
) else (
    echo ✓ Frontend dependencies already installed
)
cd ..

echo.
echo ================================================
echo    Setup Complete! ✓
echo ================================================
echo.
echo Next steps:
echo.
echo 1. Configure MetaMask (if not already done):
echo    - Network: ArcCredit Dev
echo    - RPC URL: http://127.0.0.1:8545
echo    - Chain ID: 31337
echo.
echo 2. Start the frontend:
echo    cd arccredit-frontend
echo    npm start
echo.
echo 3. Open http://localhost:3000 in your browser
echo.
echo 4. Click "Connect Wallet" to connect MetaMask
echo.
echo For more details, see:
echo - docs/DEPLOYMENT_GUIDE.md
echo - DEPLOYMENT_SUMMARY.md
echo.
pause
