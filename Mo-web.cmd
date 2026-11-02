@echo off
setlocal
set "SU_DANG_OPEN_BROWSER=1"
cd /d "%~dp0"
where node >nul 2>nul
if not errorlevel 1 goto run
if exist "%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe" goto bundled
echo Khong tim thay Node.js. Can Node.js de chay canh 3D va cac trang rieng.
echo Hay mo bang Codex hoac cai Node.js, sau do chay lai tep nay.
pause
exit /b 1
:bundled
"%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe" server.cjs
exit /b %errorlevel%
:run
node server.cjs
