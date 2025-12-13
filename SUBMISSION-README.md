# 📦 VOCABAPP - SUBMISSION PACKAGE

> **Đồ án:** Ứng dụng học từ vựng tiếng Anh thông minh với AI và Mini Games

---

## 📋 THÔNG TIN ĐỒ ÁN

**Tên đồ án:** VocabApp - Ứng dụng học từ vựng tiếng Anh  
**Công nghệ:** Next.js 16, React 19, TypeScript, Supabase, Google Gemini AI  
**Repository:** https://github.com/KyDung/Vocab_Web

### 🔒 BẢO MẬT & CẬP NHẬT

**Dự án sử dụng phiên bản mới nhất (December 2024) để đảm bảo bảo mật:**

- ✅ **React 19.2.1** - Bản vá CVE-2025-66478 (Critical)
- ✅ **Next.js 16.0.7** - Latest security patches
- ✅ **0 vulnerabilities** trong npm audit
- ✅ Tất cả dependencies đã được kiểm tra bảo mật

**Lý do cập nhật:** Các phiên bản cũ (React 18.x, Next.js 15.x) có lỗ hổng bảo mật nghiêm trọng được công bố tháng 12/2024.

---

## 📁 CẤU TRÚC PACKAGE

```
Vocab_Web/
│
├── 📂 app/                      # Next.js App Router pages
│   ├── 📂 api/                  # API endpoints
│   ├── 📂 auth/                 # Authentication pages
│   ├── 📂 games/                # Mini games
│   ├── 📂 oxford/               # Oxford vocabulary
│   ├── 📂 topics/               # Topic learning
│   ├── 📂 profile/              # User profile
│   └── 📂 settings/             # User settings
│
├── 📂 components/               # React components
│   ├── 📂 ui/                   # UI components (shadcn/ui)
│   └── 📂 games/                # Game components
│
├── 📂 lib/                      # Libraries & utilities
│   ├── auth-context.tsx         # Authentication context
│   ├── supabase.ts              # Supabase client
│   └── utils.ts                 # Utility functions
│
├── 📂 sql/                      # Database scripts
│   ├── supabase-setup.sql       # Schema setup
│   └── README-DATABASE.md       # Database documentation
│
├── 📂 public/                   # Static assets
│   └── 📂 games/                # Godot game builds
│
├── 📂 docs/                     # Documentation
├── 📂 BaoCao/                   # Project reports (CRC, diagrams)
│
├── 📄 HUONG-DAN-CAI-DAT.md     # Installation & Usage Guide ⭐
├── 📄 README.md                 # Project overview
├── 📄 package.json              # Dependencies
├── 📄 .env.local.example        # Environment template
└── 📄 tsconfig.json             # TypeScript config
```

---

## ✨ TÍNH NĂNG CHÍNH

### 1. Học từ vựng Oxford 3000+

- 📚 3147 từ vựng chuẩn quốc tế
- 🔊 Phát âm chuẩn với Web Speech API
- 🖼️ Hình ảnh minh họa từ Unsplash
- 📝 Phiên âm IPA, nghĩa, ví dụ đầy đủ

### 2. Học theo chủ đề

- 20+ chủ đề: Business, Travel, Technology, Health...
- Từ vựng được phân loại khoa học
- Lọc và tìm kiếm nhanh

### 3. Mini Games (6 games)

- **Flashcard**: Lật thẻ học truyền thống
- **Quiz**: Trắc nghiệm 4 đáp án
- **Typing**: Luyện gõ chính tả
- **Candy Catcher**: Game Godot bắt kẹo + quiz
- **Capyrun**: Game chạy vượt chướng ngại vật
- **Cat Coin**: Thu thập đồng xu + trả lời câu hỏi

### 4. AI đánh giá thông minh

- Google Gemini 2.5 Flash
- Feedback chi tiết về grammar, vocabulary
- Đánh giá độ phù hợp ngữ cảnh

### 5. Theo dõi tiến độ

- Thống kê số từ đã học, đã thuộc
- Biểu đồ tiến độ theo thời gian
- Lịch sử học tập chi tiết

### 6. Quản lý tài khoản

- Đăng ký/đăng nhập an toàn với Supabase
- Profile cá nhân tùy chỉnh
- Đổi mật khẩu, quên mật khẩu

---

## 🚀 QUICK START

### Bước 1: Cài đặt dependencies

```bash
pnpm install
```

### Bước 2: Cấu hình environment

```bash
cp .env.local.example .env.local
# Chỉnh sửa file .env.local với thông tin Supabase và API keys
```

### Bước 3: Setup database

1. Tạo project trên https://supabase.com
2. Chạy `sql/supabase-setup.sql` trong SQL Editor
3. Database sẽ có sẵn 3147 từ vựng Oxford

### Bước 4: Chạy ứng dụng

```bash
pnpm dev
```

Truy cập: **http://localhost:3000**

📖 **Xem hướng dẫn chi tiết:** [HUONG-DAN-CAI-DAT.md](HUONG-DAN-CAI-DAT.md)

---

## 🗄️ CƠ SỞ DỮ LIỆU

### Database Schema (Supabase PostgreSQL)

**Bảng chính:**

1. **oxford_words** (3147 records)

   - Từ vựng Oxford với IPA, nghĩa, ví dụ, ảnh

2. **topics** (~20 records)

   - Danh sách chủ đề học tập

3. **topic_words** (~500+ records)

   - Liên kết many-to-many giữa words và topics

4. **user_word_status**

   - Trạng thái học tập của người dùng (learning/mastered)

5. **user_stats**
   - Thống kê chi tiết (correct_count, attempts, streak...)

**Authentication:**

- Sử dụng `auth.users` của Supabase
- User metadata lưu thông tin profile

📄 **Xem chi tiết:** [sql/README-DATABASE.md](sql/README-DATABASE.md)

---

## 🔑 YÊU CẦU API KEYS

### 1. Supabase (Bắt buộc)

- URL: `NEXT_PUBLIC_SUPABASE_URL`
- Key: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Đăng ký miễn phí: https://supabase.com

### 2. Google Gemini AI (Bắt buộc)

- Key: `GEMINI_API_KEY`
- Đăng ký miễn phí: https://aistudio.google.com
- Free tier: 50 requests/day

### 3. Unsplash (Tùy chọn)

- Key: `UNSPLASH_ACCESS_KEY`
- Đăng ký miễn phí: https://unsplash.com/developers
- Dùng cho auto-load ảnh từ vựng

---

## 💻 TECH STACK

| Công nghệ         | Phiên bản | Mục đích                         |
| ----------------- | --------- | -------------------------------- |
| **Next.js**       | 16.0.7    | React Framework với Turbopack    |
| **React**         | 19.2.1    | UI Library                       |
| **TypeScript**    | 5.9.2     | Type-safe JavaScript             |
| **Supabase**      | 2.58.0    | Backend-as-a-Service (DB + Auth) |
| **Tailwind CSS**  | 3.4       | Utility-first CSS                |
| **Radix UI**      | Latest    | Headless UI components           |
| **Google Gemini** | 2.5 Flash | AI đánh giá từ vựng              |
| **Unsplash API**  | v1        | Lấy ảnh minh họa                 |
| **Godot Engine**  | 4.x       | Game engine cho mini games       |

---

## 📊 THỐNG KÊ PROJECT

- **Lines of Code:** ~15,000+ LOC
- **Components:** 50+ React components
- **API Routes:** 15+ endpoints
- **Database Tables:** 7 tables
- **Vocabulary:** 3,147 Oxford words
- **Topics:** 20+ learning topics
- **Games:** 6 interactive mini games

---

## 🎯 TÍNH NĂNG NỔI BẬT

### 1. Responsive Design 📱

- Hoạt động mượt mà trên desktop, tablet, mobile
- Touch-friendly UI cho mobile devices

### 2. Real-time Progress Tracking 📊

- Cập nhật tiến độ học tập theo thời gian thực
- Biểu đồ trực quan với Recharts

### 3. Offline-capable 🔌

- Pronunciation hoạt động offline (Web Speech API)
- Progressive Web App ready

### 4. Security 🔐

- Row Level Security (RLS) trên Supabase
- JWT authentication
- Password strength validation

### 5. Performance ⚡

- Next.js Server Components
- Image optimization
- Code splitting tự động

---

## 📚 TÀI LIỆU THAM KHẢO

### Hướng dẫn:

- [HUONG-DAN-CAI-DAT.md](HUONG-DAN-CAI-DAT.md) - Hướng dẫn cài đặt đầy đủ ⭐
- [README.md](README.md) - Project overview
- [SETUP.md](SETUP.md) - Development setup
- [QUICK-START.md](QUICK-START.md) - Quick start guide

### Báo cáo kỹ thuật:

- [BaoCao/](BaoCao/) - CRC cards, use cases, diagrams
- [docs/](docs/) - Technical documentation

### Database:

- [sql/README-DATABASE.md](sql/README-DATABASE.md) - Database guide
- [sql/supabase-setup.sql](sql/supabase-setup.sql) - Schema script

---

## 🧪 TESTING

### Test files có sẵn:

```bash
# Test Gemini API
node test-gemini-api.js

# Test database connection
node test-simple-db.js

# Test Unsplash API
node test-unsplash-direct.js

# Test auto-load images
node test-auto-load.js
```

---

## 📦 BUILD & DEPLOYMENT

### Production Build

```bash
# Build application
pnpm build

# Start production server
pnpm start
```

### Deploy lên Vercel

1. Push code lên GitHub
2. Import project trên https://vercel.com
3. Thêm Environment Variables
4. Deploy tự động

**Production URL:** https://vocab-web-six.vercel.app

---

## 🔧 TROUBLESHOOTING

### Lỗi thường gặp và cách khắc phục:

Xem chi tiết trong: [HUONG-DAN-CAI-DAT.md](HUONG-DAN-CAI-DAT.md) phần Troubleshooting

---

## 📞 LIÊN HỆ & HỖ TRỢ

- **GitHub:** https://github.com/KyDung/Vocab_Web
- **Issues:** https://github.com/KyDung/Vocab_Web/issues
- **Email:** support@vocabapp.com

---

## 📄 LICENSE

MIT License - Xem file LICENSE để biết chi tiết

---

## 🙏 CREDITS

- **Oxford 3000 Vocabulary** - Oxford University Press
- **Unsplash** - Free high-quality images
- **Google Gemini** - AI evaluation engine
- **Supabase** - Backend infrastructure
- **shadcn/ui** - Beautiful UI components

---

## ✅ CHECKLIST NỘP BÀI

- [x] Mã nguồn đầy đủ
- [x] Database schema & setup scripts
- [x] Hướng dẫn cài đặt chi tiết (HUONG-DAN-CAI-DAT.md)
- [x] File .env.local.example
- [x] Documentation đầy đủ
- [x] README với thông tin project
- [x] Test scripts
- [x] Đã push lên GitHub

---

**🎉 PROJECT READY FOR SUBMISSION!**

Để tải về và nộp, chạy lệnh sau:

```bash
git clone https://github.com/KyDung/Vocab_Web.git
cd Vocab_Web
zip -r VocabApp_Submission.zip . -x "node_modules/*" ".next/*" ".git/*"
```

**File nộp:** `VocabApp_Submission.zip` (~10-15 MB)
