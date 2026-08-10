@echo off
REM Windows launcher for the DevOps + AWS learning app.
cd /d "%~dp0"
where node >nul 2>nul && node build-content.js
set PORT=8778
echo Serving the learning app at http://localhost:%PORT%/
echo Leave this window open. Press Ctrl+C to stop.
start "" "http://localhost:%PORT%/"
where python >nul 2>nul && (python -m http.server %PORT%) || (py -m http.server %PORT%)
