# PowerShell script para iniciar el servidor Albion Parchis
Write-Host "Iniciando Albion Parchis Server..." -ForegroundColor Green

# Cambiar al directorio del servidor
Set-Location "C:\Users\ercep\Documents\proyectos_python\parchis_25\server"

Write-Host "Compilando TypeScript..." -ForegroundColor Yellow

# Intentar compilar con tsc directamente
try {
    & "C:\Users\ercep\Documents\proyectos_python\parchis_25\server\node_modules\.bin\tsc.cmd"
    if ($LASTEXITCODE -ne 0) {
        throw "Compilation failed"
    }
    Write-Host "Compilación exitosa!" -ForegroundColor Green
} catch {
    Write-Host "Error en la compilación: $_" -ForegroundColor Red
    Write-Host "Intentando instalar dependencias..." -ForegroundColor Yellow
    
    # Cambiar al directorio raíz e instalar dependencias
    Set-Location "C:\Users\ercep\Documents\proyectos_python\parchis_25"
    & "C:\Users\ercep\Documents\proyectos_python\parchis_25\node_modules\.bin\npm.cmd" install
    
    # Volver al servidor e intentar compilar de nuevo
    Set-Location "C:\Users\ercep\Documents\proyectos_python\parchis_25\server"
    & "C:\Users\ercep\Documents\proyectos_python\parchis_25\server\node_modules\.bin\tsc.cmd"
}

Write-Host "Iniciando servidor..." -ForegroundColor Yellow
& node "dist\server.js"

Write-Host "Presiona cualquier tecla para continuar..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")