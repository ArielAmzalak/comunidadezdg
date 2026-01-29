@echo off
chcp 65001 >nul
title Verificador de WhatsApp
cd /d "%~dp0"

if "%~1"=="" (
    echo.
    echo ╔══════════════════════════════════════════════════╗
    echo ║     📋 VERIFICADOR DE WHATSAPP - LISTA EXCEL     ║
    echo ╚══════════════════════════════════════════════════╝
    echo.
    echo  Arraste um arquivo .xlsx para cima deste arquivo!
    echo.
    echo  Ou execute: verificar.bat caminho\para\arquivo.xlsx
    echo.
    pause
    exit /b
)

echo.
echo Iniciando verificacao de: %~1
echo.

node verificar-lista.js "%~1"

echo.
echo ════════════════════════════════════════════════════════
echo.
pause
