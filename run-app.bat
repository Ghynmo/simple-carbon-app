@echo off
echo Memulai Aplikasi Hejoijo...
echo.
echo Harap tunggu sebentar, aplikasi sedang dipersiapkan...
echo.

cd /d "%~dp0"

:: Periksa apakah Node.js terinstal
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo ERROR: Node.js tidak ditemukan. Silakan instal Node.js terlebih dahulu.
    echo Kunjungi https://nodejs.org/en/download/ untuk mengunduh Node.js
    pause
    exit /b 1
)

:: Periksa apakah npm terinstal
where npm >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo ERROR: npm tidak ditemukan. Silakan instal Node.js terlebih dahulu.
    echo Kunjungi https://nodejs.org/en/download/ untuk mengunduh Node.js
    pause
    exit /b 1
)

:: Periksa apakah node_modules ada, jika tidak ada, jalankan npm install
if not exist node_modules (
    echo Menginstal dependensi yang diperlukan...
    call npm install
    if %ERRORLEVEL% neq 0 (
        echo ERROR: Gagal menginstal dependensi.
        pause
        exit /b 1
    )
)

:: Jalankan server pengembangan
echo Memulai server pengembangan...
start "" http://localhost:5173

:: Tunggu sebentar agar server siap sebelum membuka browser
timeout /t 2 /nobreak >nul

:: Jalankan npm run dev
call npm run dev

pause