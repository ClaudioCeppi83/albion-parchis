@echo off
echo Starting Albion Parchis Development Environment...
echo.

echo Checking if dependencies are installed...
if not exist "node_modules" (
    echo Root dependencies not found. Installing...
    npm install
)

if not exist "server\node_modules" (
    echo Server dependencies not found. Installing...
    cd server
    npm install
    cd ..
)

if not exist "client\node_modules" (
    echo Client dependencies not found. Installing...
    cd client
    npm install
    cd ..
)

echo.
echo Starting development servers...
echo Server will run on http://localhost:3001
echo Client will run on http://localhost:5173
echo.

npm run dev