# 📚 VocabApp - Ứng dụng học từ vựng tiếng Anh thông minh

> **Đồ án tốt nghiệp** - Ứng dụng học từ vựng hiện đại với AI đánh giá và game tương tác

[![Next.js](https://img.shields.io/badge/Next.js-15.2.4-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9.2-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Database-green?logo=supabase)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-06B6D4?logo=tailwindcss)](https://tailwindcss.com/)

## ✨ Tính năng chính

🎯 **Oxford Vocabulary 3000+** - Bộ từ vựng chuẩn quốc tế  
🎮 **5 Mini Games** - Flashcard, Quiz, Typing, Godot Games  
🤖 **AI Đánh giá** - Google Gemini AI cho feedback thông minh  
📱 **Responsive Design** - Hoạt động tốt trên mọi thiết bị  
🔐 **Authentication** - Đăng ký/đăng nhập với Supabase  
📊 **Theo dõi tiến độ** - Thống kê học tập cá nhân  
🎨 **Dark/Light Mode** - Giao diện tùy chỉnh

## 🚀 Quick Start

### Cách 1: Script tự động (Khuyến nghị)

```bash
# Windows
setup.bat

# macOS/Linux
chmod +x setup.sh && ./setup.sh
```

### Cách 2: Manual Setup

```bash
# 1. Clone repository
git clone https://github.com/KyDung/Vocab_Web.git
cd Vocab_Web

# 2. Cài đặt dependencies
pnpm install

# 3. Setup environment
cp .env.local.example .env.local
# Edit .env.local với thông tin Supabase

# 4. Chạy development server
pnpm dev
```

**Mở browser:** http://localhost:3000

## 📋 Yêu cầu hệ thống

- **Node.js** >= 18.x
- **pnpm** (khuyến nghị) hoặc npm
- **Tài khoản Supabase** (miễn phí)

## 🛠️ Tech Stack

| Công nghệ         | Mô tả                          | Phiên bản |
| ----------------- | ------------------------------ | --------- |
| **Next.js**       | React Framework với App Router | 15.2.4    |
| **TypeScript**    | Type-safe JavaScript           | 5.9.2     |
| **Supabase**      | Backend-as-a-Service           | Latest    |
| **Tailwind CSS**  | Utility-first CSS              | Latest    |
| **Radix UI**      | Headless UI components         | Latest    |
| **Lucide React**  | Icon library                   | Latest    |
| **Google Gemini** | AI cho đánh giá từ vựng        | Latest    |

## 📁 Cấu trúc Project

```
📦 VocabApp/
├── 📂 app/                    # Next.js App Router
│   ├── 📂 auth/              # Authentication pages
│   ├── 📂 games/             # Mini games
│   ├── 📂 oxford/            # Oxford vocabulary
│   ├── 📂 topics/            # Topic learning
│   ├── 📂 custom/            # Custom vocabulary
│   ├── 📂 profile/           # User profile
│   └── 📂 api/               # API endpoints
├── 📂 components/            # React components
│   ├── 📂 ui/                # UI components
│   ├── 📂 games/             # Game components
│   └── 📄 about-section.tsx  # About page
├── 📂 lib/                   # Utils & configs
├── 📂 hooks/                 # Custom hooks
├── 📂 public/                # Static files
├── 📂 sql/                   # Database scripts
└── 📂 docs/                  # Documentation
```

## 🎮 Game Features

### 1. **Flashcard Game**

- Lật thẻ học từ vựng truyền thống
- Hình ảnh minh họa từ Unsplash
- Phát âm chuẩn

### 2. **Quiz Game**

- Trắc nghiệm 4 đáp án
- Random questions
- Scoring system

### 3. **Typing Game**

- Gõ từ tiếng Anh theo nghĩa
- Tính thời gian
- Độ chính xác

### 4. **Godot Games**

- Candy Catcher Vocab
- Capyrun Adventure
- WebAssembly integration

### 5. **Custom Vocabulary**

- Tạo bộ từ vựng riêng
- Import từ Google Sheets
- Chia sẻ với cộng đồng

## 🤖 AI Features

- **Gemini AI Evaluation** - Đánh giá khả năng sử dụng từ vựng
- **Smart Suggestions** - Gợi ý từ học tiếp theo
- **Pronunciation Feedback** - Phản hồi phát âm (planned)

## 🌐 Deployment

### Vercel (Khuyến nghị)

```bash
# Deploy to Vercel
vercel --prod
```

### Docker

```bash
# Build Docker image
docker build -t vocabapp .

# Run container
docker run -p 3000:3000 vocabapp
```

## 👥 Đội ngũ phát triển

| Tác giả                | Vai trò            | Liên hệ             |
| ---------------------- | ------------------ | ------------------- |
| **Xa Kỳ Trung Dũng**   | Frontend Developer | Kydung204@gmail.com |
| **Chu Thị Việt Chinh** | Backend Developer  | [Updating...]       |

**Khoa:** Công nghệ Thông tin  
**Trường:** [Tên trường]

## 📄 License

MIT License - xem file [LICENSE](LICENSE) để biết thêm chi tiết.

## 🤝 Contributing

1. Fork the project
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📞 Hỗ trợ

- **Documentation:** [SETUP.md](SETUP.md)
- **Issues:** [GitHub Issues](https://github.com/KyDung/Vocab_Web/issues)
- **Email:** Kydung204@gmail.com

---

⭐ **Star this repo** nếu bạn thấy hữu ích!
