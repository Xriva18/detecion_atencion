@echo off
setlocal

echo ===================================================
echo   Desplegar Backend a Hugging Face Spaces
echo ===================================================
echo.

set /p SPACE_URL="Pega la URL del repositorio de tu Space (ej: https://huggingface.co/spaces/USUARIO/NOMBRE): "

if "%SPACE_URL%"=="" goto error

echo.
echo [1/3] Configurando remoto 'space'...
git remote remove space 2>nul
git remote add space %SPACE_URL%

echo.
echo [2/3] Verificando cambios...
git add .
git commit -m "Preparando deploy a HF" 2>nul

echo.
echo [3/3] Subiendo backend...
echo Esto puede tardar unos minutos. Si te pide credenciales, usa tu token de HF.
echo.

git subtree push --prefix backend space main

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ---------------------------------------------------
    echo ERROR: No se pudo subir el codigo.
    echo Intenta ejecutar este comando manualmente:
    echo git push space `git subtree split --prefix backend main`:main --force
    echo ---------------------------------------------------
    pause
    exit /b 1
)

echo.
echo ===================================================
echo   !DESPLIEGUE EXITOSO!
echo ===================================================
echo.
echo Ahora ve a tu Space en Hugging Face y espera a que diga "Running".
echo Luego copia la "Direct URL" y damela para configurar el frontend.
echo.
pause
