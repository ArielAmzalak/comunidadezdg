@echo off
chcp 65001 >nul
title Gerador de Lista de Números
cd /d "%~dp0"

node gerar-lista.js
