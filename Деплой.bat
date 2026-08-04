@echo off
chcp 65001 >nul
title Деплой ВайбМайнд на сервер
cd /d "%~dp0"

echo.
echo   ДЕПЛОЙ САЙТА ВАЙБМАЙНД
echo   ---------------------------------------------
echo   Обновляю сайт https://81-177-214-84.nip.io
echo   Пароль вводить НЕ нужно — вход по ключу.
echo   Займёт 3-6 минут. Не закрывайте это окно.
echo.

set "BASH="
if exist "C:\Program Files\Git\bin\bash.exe" set "BASH=C:\Program Files\Git\bin\bash.exe"
if not defined BASH if exist "C:\Program Files (x86)\Git\bin\bash.exe" set "BASH=C:\Program Files (x86)\Git\bin\bash.exe"
if not defined BASH if exist "%LOCALAPPDATA%\Programs\Git\bin\bash.exe" set "BASH=%LOCALAPPDATA%\Programs\Git\bin\bash.exe"

if not defined BASH (
  echo   ОШИБКА: не найден Git Bash.
  echo   Установите Git для Windows: https://git-scm.com/download/win
  echo.
  pause
  exit /b 1
)

"%BASH%" -lc "./scripts/deploy.sh"
set CODE=%errorlevel%

echo.
if "%CODE%"=="0" (
  echo   ============================================
  echo    ГОТОВО! Сайт обновлён.
  echo   ============================================
) else (
  echo   Деплой завершился с ошибкой (код %CODE%).
  echo   Что делать — смотрите DEPLOY.md, раздел «Если что-то пошло не так».
)
echo.
pause
