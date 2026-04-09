@echo off
cd /d "%~dp0"
powershell -ExecutionPolicy Bypass -File ".\start-site.ps1"
pause
