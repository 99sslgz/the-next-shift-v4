@echo off
setlocal
powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -File "%~dp0Start-Next-Shift.ps1" %*
if errorlevel 1 echo The website could not start. See the message above.
pause
