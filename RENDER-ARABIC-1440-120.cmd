@echo off
setlocal EnableExtensions
if /i "%~1"=="--stay-open" goto RUN
start "Arabic Video Render" "%ComSpec%" /d /k call "%~f0" --stay-open
exit /b
:RUN
title Arabic Video Render - 2560x1440 / 120 FPS
cd /d "%~dp0"
echo ============================================================
echo  Arabic video - 2560x1440 / 120 FPS
echo  This window stays open. Rendering shows frames, speed and ETA.
echo ============================================================
echo.
if not exist "app\scripts\render.ts" (
  echo ERROR: Extract the whole ZIP first.
  echo Keep this CMD next to the app, data and audio folders.
  goto FAILED
)
where bun >nul 2>nul
if errorlevel 1 (
  echo ERROR: Bun is missing from PATH. Install it from https://bun.sh
  echo Then close and reopen this window.
  goto FAILED
)
where ffprobe >nul 2>nul
if errorlevel 1 (
  echo ERROR: FFprobe is missing. Add the FFmpeg bin folder to PATH.
  goto FAILED
)
where ffmpeg >nul 2>nul
if errorlevel 1 (
  echo ERROR: FFmpeg is missing from PATH. See https://ffmpeg.org/download.html
  echo Add FFmpeg's bin folder to PATH, then reopen this window.
  goto FAILED
)
if not exist "out" mkdir "out"
cd /d "%~dp0app"
echo [1/2] Installing project dependencies...
call bun install
if errorlevel 1 goto INSTALL_FAILED
echo.
echo [2/2] Rendering 2560x1440 / 120 FPS. Keep this window open.
echo Output: %~dp0out\pdoom-arabic-1440p-120fps.mp4
echo Progress will appear after Chrome and the scenes load.
echo.
call bun scripts/render-resume.ts --scale 1.3333333333 --fps 120 --out ../out/pdoom-arabic-1440p-120fps.mp4
if errorlevel 1 goto RENDER_FAILED
echo.
echo DONE: %~dp0out\pdoom-arabic-1440p-120fps.mp4
start "" "%~dp0out"
goto END
:INSTALL_FAILED
echo.
echo ERROR: Dependency installation failed. See the error above.
goto FAILED
:RENDER_FAILED
echo.
echo ERROR: Rendering failed. See the error above.
echo Completed parts are kept. Run this CMD again to resume.
goto FAILED
:FAILED
echo.
echo Copy the error above if you need help. The window will stay open.
:END
echo.
pause
exit /b
