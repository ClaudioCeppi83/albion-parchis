@echo off
echo Installing Albion Parchis dependencies...
echo.

echo Installing root dependencies...
npm install
if %errorlevel% neq 0 (
    echo Failed to install root dependencies
    pause
    exit /b 1
)

echo.
echo Installing server dependencies...
cd server
npm install
if %errorlevel% neq 0 (
    echo Failed to install server dependencies
    pause
    exit /b 1
)

echo.
echo Installing client dependencies...
cd ..\client
npm install
if %errorlevel% neq 0 (
    echo Failed to install client dependencies
    pause
    exit /b 1
)

cd ..
echo.
echo All dependencies installed successfully!
echo.
echo You can now run:
echo   npm run dev        - Start both server and client
echo   npm run dev:server - Start only server
echo   npm run dev:client - Start only client
echo.
pause