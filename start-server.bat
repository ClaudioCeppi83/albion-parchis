@echo off
echo Starting Albion Parchis Server...

cd /d "C:\Users\ercep\Documents\proyectos_python\parchis_25\server"

echo Compiling TypeScript...
npx tsc

if %ERRORLEVEL% NEQ 0 (
    echo TypeScript compilation failed!
    pause
    exit /b 1
)

echo Starting server...
node dist/server.js

pause