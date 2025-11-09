# 🚀 Hướng dẫn Setup VocabApp - Local Development

## 📋 Yêu cầu hệ thống

- **Node.js** >= 18.x
- **npm** hoặc **pnpm** (khuyến nghị)
- **Git**
- Tài khoản **Supabase** (miễn phí)

## ⚡ Quick Start

### 1. Clone repository

```bash
git clone https://github.com/KyDung/Vocab_Web.git
cd Vocab_Web
```

### 2. Cài đặt dependencies

```bash
# Sử dụng pnpm (khuyến nghị)
pnpm install

# Hoặc npm
npm install
```

### 3. Setup Environment Variables

```bash
# Copy file template
cp .env.example .env.local

# Edit file .env.local với editor yêu thích
code .env.local
# hoặc
notepad .env.local
```

### 4. Cấu hình Supabase

#### 4.1. Đăng ký Supabase (miễn phí):

- Truy cập: https://supabase.com
- Đăng ký/đăng nhập
- Tạo project mới

#### 4.2. Lấy thông tin kết nối:

- Vào **Settings** → **API**
- Copy **Project URL** và **anon public key**
- Dán vào file `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

#### 4.3. Setup Database:

```bash
# Chạy SQL scripts từ thư mục sql/
# Vào Supabase Dashboard → SQL Editor
# Copy nội dung file sql/supabase-setup.sql và execute
```

### 5. Khởi chạy development server

```bash
# Sử dụng pnpm
pnpm dev

# Hoặc npm
npm run dev
```

### 6. Mở browser

Truy cập: http://localhost:3000

## 🛠️ Scripts có sẵn

```bash
# Development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Type checking
pnpm type-check

# Linting
pnpm lint

# Format code
pnpm format
```

## 📁 Cấu trúc project

```
📦 Vocab_Web/
├── 📂 app/                 # Next.js App Router pages
│   ├── 📂 auth/           # Authentication pages
│   ├── 📂 games/          # Game pages
│   ├── 📂 oxford/         # Oxford vocabulary
│   ├── 📂 topics/         # Topic-based learning
│   └── 📂 api/            # API routes
├── 📂 components/         # React components
│   ├── 📂 ui/             # UI components
│   └── 📂 games/          # Game components
├── 📂 lib/                # Utilities and configurations
├── 📂 public/             # Static assets
├── 📂 sql/                # Database scripts
└── 📂 docs/               # Documentation
```

## 🔧 Cấu hình tùy chọn

### Google Gemini AI (cho tính năng đánh giá):

```bash
GOOGLE_AI_API_KEY=your_gemini_api_key
```

### Google Sheets Integration:

```bash
GOOGLE_SHEETS_API_KEY=your_api_key
GOOGLE_SHEETS_SPREADSHEET_ID=your_sheet_id
```

## 🐛 Troubleshooting

### Lỗi "supabaseUrl is required":

- Kiểm tra file `.env.local` có đúng format không
- Restart development server sau khi thay đổi env

### Lỗi CORS:

- Thêm `http://localhost:3000` vào Supabase → Authentication → URL Configuration

### Lỗi Database:

- Chạy lại SQL scripts trong `sql/` folder
- Kiểm tra RLS policies trong Supabase

## 📞 Hỗ trợ

- **Email**: Kydung204@gmail.com
- **GitHub Issues**: [Tạo issue mới](https://github.com/KyDung/Vocab_Web/issues)

## 🚀 Deploy lên Vercel

1. Push code lên GitHub
2. Connect Vercel với GitHub repo
3. Set environment variables trên Vercel Dashboard
4. Deploy!

## 👥 Credits

- **Full-Stack Development**: Xa Kỳ Trung Dũng (toàn bộ web application)
- **Documentation & Analysis**: Chu Thị Việt Chinh (setup guides, reports, presentations)

---

**Happy Coding! 🎉**
