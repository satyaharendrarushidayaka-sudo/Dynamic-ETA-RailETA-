@echo off
echo ========================================================
echo RailETA - Generating Public Links for Hackathon Demo...
echo ========================================================
echo.
echo Starting Backend API Tunnel on port 8000...
start cmd /k "echo BACKEND TUNNEL (Wait for URL, then copy it to api.js) && npx -y localtunnel --port 8000"

echo.
echo Please copy the Backend URL from the new window, 
echo and paste it into frontend/src/services/api.js (API_BASE_URL).
echo.
echo Once you have saved api.js, press any key to start the Frontend Tunnel...
pause

echo.
echo Starting Frontend UI Tunnel on port 5173...
start cmd /k "echo FRONTEND TUNNEL (Share this URL with Judges!) && npx -y localtunnel --port 5173"

echo.
echo Done! Keep the two black windows open during your presentation.
pause
