@echo off
echo =======================================================================
echo Asistente para Desplegar Gold Whisper Dashboard en VPS Hostinger
echo =======================================================================
echo.
echo Este asistente abrira Git Bash y ejecutara el script de despliegue.
echo.
echo Requisitos:
echo 1. Git Bash instalado (https://git-scm.com/download/win)
echo 2. Configuracion DNS completada para:
echo    - dashboard.galle18k.com
echo    - api.galle18k.com
echo    - chatwoot.galle18k.com
echo.
echo Presiona cualquier tecla para abrir Git Bash e iniciar el despliegue...
pause > nul

REM Ubicación del repositorio
set REPO_PATH=%~dp0

REM Comando para abrir Git Bash y ejecutar el script
start "" "%PROGRAMFILES%\Git\bin\bash.exe" --login -i -c "cd '%REPO_PATH%' && chmod +x gold-whisper-dash-main/hostinger-deploy.sh && ./gold-whisper-dash-main/hostinger-deploy.sh"

echo.
echo Ventana de Git Bash abierta. Sigue las instrucciones en esa ventana.
echo.
echo Si Git Bash no se abre, instalalo desde: https://git-scm.com/download/win
echo.
pause
