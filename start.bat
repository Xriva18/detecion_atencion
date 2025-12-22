@echo off
echo Iniciando Backend y Frontend...
echo.

REM Iniciar Backend en una nueva ventana
start "Backend - FastAPI" cmd /k "cd backend && uvicorn main:app --reload"

REM Esperar un segundo para que el backend inicie
timeout /t 2 /nobreak >nul

REM Iniciar Frontend en una nueva ventana
start "Frontend - Next.js" cmd /k "cd frontend && npm run dev"

echo.
echo Backend y Frontend iniciados en ventanas separadas.
echo Backend: http://localhost:8000
echo Frontend: http://localhost:3000
echo.
echo Presiona cualquier tecla para cerrar esta ventana...
pause >nul
