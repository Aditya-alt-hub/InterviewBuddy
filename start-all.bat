@echo off
echo Starting Interview Buddy Services...

REM ===============================
REM Start Backend
REM ===============================
start cmd /k "cd /d E:\Interview Buddy\backend && npm run dev"

REM ===============================
REM Start AI Service (FastAPI + Gemini)
REM ===============================
start cmd /k "cd /d E:\Interview Buddy\ai-service && .\venv\Scripts\python.exe main.py"

REM ===============================
REM Start Frontend
REM ===============================
start cmd /k "cd /d E:\Interview Buddy\frontend && npm run dev"

echo.
echo ===========================================
echo All services launched successfully!
echo ===========================================
pause