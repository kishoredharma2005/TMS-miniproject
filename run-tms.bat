@echo off
echo ========================================================
echo        TMS Ticket Management System - Mobile Launcher
echo ========================================================
echo.
echo [1/2] Starting Backend API Server (Port 5000)...
start "TMS Backend Server" cmd /k "cd /d %~dp0backend && npm run dev"

ping 127.0.0.1 -n 3 >nul

echo [2/2] Starting React Native Mobile Metro Bundler (Tunnel Mode)...
start "TMS Mobile App" cmd /k "cd /d %~dp0mobile && npm run tunnel"

echo.
echo ========================================================
echo Services Launched Successfully!
echo ========================================================
echo - Backend API: http://localhost:5000/api
echo - Mobile Metro Bundler: http://localhost:8081
echo.
echo HOW TO RUN ON MOBILE:
echo 1. On Android Emulator:
echo    - Open your emulator (e.g., Pixel 7)
echo    - In the "TMS Mobile App" window, press 'a'
echo.
echo 2. On Physical Android Phone:
echo    - Install "Expo Go" from Google Play Store
echo    - Ensure your phone is on the same Wi-Fi network
echo    - Scan the QR code displayed in the "TMS Mobile App" window
echo    - In app settings / login screen, verify server endpoint:
echo      http://10.245.184.250:5000/api
echo.
echo NOTE: Legacy web frontend in /frontend is intentionally
echo       bypassed to run the true React Native mobile app.
echo ========================================================
pause
