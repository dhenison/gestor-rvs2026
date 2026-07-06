@echo off
setlocal
set "SCRIPT_DIR=%~dp0"

where py >nul 2>nul
if %errorlevel%==0 (
  py -3 "%SCRIPT_DIR%compilar_boletins.py" %*
  goto :end
)

where python >nul 2>nul
if %errorlevel%==0 (
  python "%SCRIPT_DIR%compilar_boletins.py" %*
  goto :end
)

echo Python nao foi encontrado neste computador.
echo Instale o Python 3 e execute novamente este arquivo.

:end
pause
