@echo off
echo 🚀 VocabApp - Quick Setup Script (Windows)
echo ==========================================

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js chưa được cài đặt. Vui lòng cài đặt Node.js ^>= 18.x
    echo    Download tại: https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js version:
node --version

REM Check if pnpm is installed
pnpm --version >nul 2>&1
if errorlevel 1 (
    echo 📦 pnpm chưa được cài đặt. Đang cài đặt...
    npm install -g pnpm
) else (
    echo ✅ pnpm version:
    pnpm --version
)

REM Install dependencies
echo 📦 Đang cài đặt dependencies...
pnpm install

REM Setup environment file
if not exist ".env.local" (
    echo ⚙️  Tạo file .env.local...
    copy .env.local.example .env.local
    echo ✅ File .env.local đã được tạo từ template
    echo 🔧 Vui lòng edit file .env.local với thông tin Supabase của bạn
) else (
    echo ✅ File .env.local đã tồn tại
)

echo.
echo 🎉 Setup hoàn thành!
echo.
echo 📋 Các bước tiếp theo:
echo 1. Edit file .env.local với thông tin Supabase
echo 2. Chạy: pnpm dev
echo 3. Mở: http://localhost:3000
echo.
echo 📚 Đọc thêm hướng dẫn trong file SETUP.md
echo.

REM Ask if user wants to start dev server
set /p answer=Bạn có muốn chạy development server ngay bây giờ? (y/n): 
if /i "%answer%"=="y" (
    echo 🚀 Đang khởi động development server...
    pnpm dev
) else (
    echo 👋 Tạm biệt! Chạy 'pnpm dev' khi bạn sẵn sàng.
    pause
)