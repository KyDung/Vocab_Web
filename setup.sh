#!/bin/bash

# 🚀 VocabApp - Quick Setup Script
# Script này sẽ giúp bạn setup môi trường development nhanh chóng

echo "🚀 VocabApp - Quick Setup Script"
echo "================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js chưa được cài đặt. Vui lòng cài đặt Node.js >= 18.x"
    echo "   Download tại: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js version: $(node --version)"

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
    echo "📦 pnpm chưa được cài đặt. Đang cài đặt..."
    npm install -g pnpm
else
    echo "✅ pnpm version: $(pnpm --version)"
fi

# Install dependencies
echo "📦 Đang cài đặt dependencies..."
pnpm install

# Setup environment file
if [ ! -f ".env.local" ]; then
    echo "⚙️  Tạo file .env.local..."
    cp .env.local.example .env.local
    echo "✅ File .env.local đã được tạo từ template"
    echo "🔧 Vui lòng edit file .env.local với thông tin Supabase của bạn"
else
    echo "✅ File .env.local đã tồn tại"
fi

echo ""
echo "🎉 Setup hoàn thành!"
echo ""
echo "📋 Các bước tiếp theo:"
echo "1. Edit file .env.local với thông tin Supabase"
echo "2. Chạy: pnpm dev"
echo "3. Mở: http://localhost:3000"
echo ""
echo "📚 Đọc thêm hướng dẫn trong file SETUP.md"
echo ""

# Ask if user wants to start dev server
read -p "Bạn có muốn chạy development server ngay bây giờ? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🚀 Đang khởi động development server..."
    pnpm dev
fi