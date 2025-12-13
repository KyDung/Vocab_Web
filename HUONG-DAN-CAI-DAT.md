# 📖 HƯỚNG DẪN CÀI ĐẶT VÀ SỬ DỤNG VOCABAPP

> **Ứng dụng học từ vựng tiếng Anh thông minh với AI và Mini Games**

---

## 📋 MỤC LỤC

1. [Giới thiệu](#giới-thiệu)
2. [Yêu cầu hệ thống](#yêu-cầu-hệ-thống)
3. [Hướng dẫn cài đặt](#hướng-dẫn-cài-đặt)
4. [Cấu hình cơ sở dữ liệu](#cấu-hình-cơ-sở-dữ-liệu)
5. [Cấu hình API Keys](#cấu-hình-api-keys)
6. [Chạy ứng dụng](#chạy-ứng-dụng)
7. [Hướng dẫn sử dụng](#hướng-dẫn-sử-dụng)
8. [Troubleshooting](#troubleshooting)

---

## 🎯 GIỚI THIỆU

**VocabApp** là ứng dụng web học từ vựng tiếng Anh với các tính năng:

- 📚 **3147 từ vựng Oxford** - Bộ từ vựng chuẩn quốc tế
- 🎮 **6 Mini Games** - Flashcard, Quiz, Typing, Candy Catcher, Capyrun, Cat Coin
- 🤖 **AI Đánh giá** - Google Gemini AI feedback thông minh
- 📊 **Theo dõi tiến độ** - Thống kê học tập chi tiết
- 🔐 **Xác thực người dùng** - Đăng ký/đăng nhập an toàn
- 🌙 **Dark/Light Mode** - Giao diện tùy chỉnh

---

## 💻 YÊU CẦU HỆ THỐNG

### Phần mềm bắt buộc:

- **Node.js**: Phiên bản 18.18 hoặc mới hơn (tối đa 22.x)
  - Tải tại: https://nodejs.org/
  - Kiểm tra: `node --version`

- **pnpm**: Package manager (khuyến nghị)
  - Cài đặt: `npm install -g pnpm`
  - Kiểm tra: `pnpm --version`

- **Git**: Version control
  - Tải tại: https://git-scm.com/
  - Kiểm tra: `git --version`

### Tài khoản cần thiết (MIỄN PHÍ):

1. **Supabase** (Database + Authentication)
   - Đăng ký tại: https://supabase.com

2. **Google AI Studio** (Gemini API)
   - Đăng ký tại: https://aistudio.google.com/

3. **Unsplash** (Image API - Tùy chọn)
   - Đăng ký tại: https://unsplash.com/developers

---

## 🚀 HƯỚNG DẪN CÀI ĐẶT

### Bước 1: Giải nén source code

```bash
# Giải nén file Vocab_Web.zip
unzip Vocab_Web.zip
cd Vocab_Web
```

### Bước 2: Cài đặt dependencies

```bash
# Sử dụng pnpm (khuyến nghị)
pnpm install

# Hoặc npm
npm install
```

**Lưu ý:** Quá trình cài đặt có thể mất 3-5 phút tùy tốc độ internet.

### Bước 3: Tạo file cấu hình

```bash
# Sao chép file template
cp .env.local.example .env.local

# Mở file để chỉnh sửa
notepad .env.local     # Windows
nano .env.local        # Linux/Mac
```

---

## 🗄️ CẤU HÌNH CƠ SỞ DỮ LIỆU

### 1. Tạo Supabase Project

1. Truy cập: https://supabase.com/dashboard
2. Click **"New Project"**
3. Điền thông tin:
   - **Name**: VocabApp (hoặc tên tùy chọn)
   - **Database Password**: Tạo mật khẩu mạnh
   - **Region**: Southeast Asia (Singapore)
4. Click **"Create new project"** và đợi 2-3 phút

### 2. Lấy thông tin kết nối

1. Vào **Settings** → **API**
2. Copy các thông tin sau:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJhbGc...`
   - **service_role key**: `eyJhbGc...` (dùng cho admin)

### 3. Cập nhật file .env.local

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 4. Import Database Schema

**Cách 1: Sử dụng SQL Editor**

1. Vào Supabase Dashboard
2. Click **SQL Editor** (icon database bên trái)
3. Click **"New Query"**
4. Mở file `sql/supabase-setup.sql` từ project
5. Copy toàn bộ nội dung và paste vào SQL Editor
6. Click **"Run"** để thực thi

**Cách 2: Sử dụng file backup (nếu có)**

1. Vào **Database** → **Backups**
2. Click **"Restore from backup"**
3. Upload file `database-backup.sql`

### 5. Import dữ liệu từ vựng

Dữ liệu 3147 từ vựng Oxford đã được tích hợp sẵn trong database schema. Sau khi chạy `supabase-setup.sql`, bảng `oxford_words` sẽ có đầy đủ dữ liệu.

**Kiểm tra dữ liệu:**

```sql
-- Chạy trong SQL Editor
SELECT COUNT(*) FROM oxford_words;
-- Kết quả: 3147

SELECT * FROM oxford_words LIMIT 10;
```

---

## 🔑 CẤU HÌNH API KEYS

### 1. Google Gemini AI (Bắt buộc)

**Lấy API Key:**

1. Truy cập: https://aistudio.google.com/app/apikey
2. Đăng nhập bằng Google Account
3. Click **"Create API Key"**
4. Copy API Key

**Cập nhật .env.local:**

```bash
GEMINI_API_KEY=AIzaSyDxxxxxxxxxxxxxxxxxxxxxxxx
```

**Test API Key:**

```bash
node test-gemini-api.js
```

### 2. Unsplash API (Tùy chọn - cho auto-load ảnh)

**Lấy API Key:**

1. Truy cập: https://unsplash.com/oauth/applications
2. Click **"New Application"**
3. Đồng ý terms và tạo app
4. Copy **Access Key**

**Cập nhật .env.local:**

```bash
UNSPLASH_ACCESS_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Lưu ý:** Nếu không có Unsplash API, ứng dụng vẫn hoạt động bình thường nhưng không tự động tải ảnh cho từ mới.

---

## ▶️ CHẠY ỨNG DỤNG

### Development Mode

```bash
pnpm dev
```

Ứng dụng sẽ chạy tại: **http://localhost:3000**

### Production Build

```bash
# Build ứng dụng
pnpm build

# Chạy production server
pnpm start
```

### Kiểm tra lỗi

```bash
# Type checking
pnpm type-check

# Linting
pnpm lint
```

---

## 📱 HƯỚNG DẪN SỬ DỤNG

### 1. Đăng ký tài khoản

1. Mở trình duyệt và truy cập: http://localhost:3000
2. Click **"Đăng ký"** ở góc trên bên phải
3. Điền thông tin:
   - Email
   - Mật khẩu (tối thiểu 6 ký tự)
   - Xác nhận mật khẩu
4. Click **"Đăng ký"**
5. Kiểm tra email để xác thực tài khoản

### 2. Đăng nhập

1. Click **"Đăng nhập"**
2. Nhập email và mật khẩu
3. Click **"Đăng nhập"**

### 3. Học từ vựng Oxford

**Trang Oxford Vocabulary:**

1. Click menu **"Oxford"** trên thanh navigation
2. Xem danh sách 3147 từ vựng với:
   - Phiên âm IPA
   - Ý nghĩa tiếng Việt
   - Ví dụ câu
   - Hình ảnh minh họa
3. Tính năng:
   - 🔊 **Phát âm**: Click icon loa để nghe
   - 🖼️ **Xem ảnh**: Click vào từ để xem chi tiết
   - 📝 **Luyện tập**: Click "Practice" để luyện viết
   - ⭐ **Đánh dấu**: Chọn trạng thái học (Learning/Mastered)

**Tìm kiếm và lọc:**

- **Search**: Gõ từ khóa vào ô tìm kiếm
- **Filter by topic**: Chọn chủ đề (Business, Travel, Education...)
- **Filter by status**: Lọc theo trạng thái học tập

### 4. Học theo chủ đề

1. Click menu **"Topics"**
2. Chọn chủ đề quan tâm:
   - Business (Kinh doanh)
   - Travel (Du lịch)
   - Education (Giáo dục)
   - Technology (Công nghệ)
   - Health (Sức khỏe)
   - ...và nhiều chủ đề khác
3. Học từ vựng theo chủ đề với cùng tính năng như Oxford

### 5. Chơi Mini Games

**Truy cập:** Click menu **"Games"**

#### Game 1: Flashcard
- Lật thẻ để xem nghĩa
- Click ✓ nếu biết, ✗ nếu không biết
- Hệ thống ghi nhận kết quả

#### Game 2: Quiz Game
- Chọn đáp án đúng trong 4 lựa chọn
- Có giới hạn thời gian
- Điểm số tích lũy theo độ chính xác

#### Game 3: Typing Challenge
- Nghe từ và gõ chính xác
- Luyện kỹ năng chính tả
- Tính điểm theo tốc độ và độ chính xác

#### Game 4-6: Godot Games
- **Candy Catcher**: Bắt kẹo và trả lời câu hỏi từ vựng
- **Capyrun**: Chạy và vượt chướng ngại vật
- **Cat Coin**: Thu thập 10 đồng xu và trả lời 10 câu hỏi

### 6. Xem thống kê

1. Click menu **"Profile"** hoặc avatar
2. Xem các thông tin:
   - Tổng số từ đã học
   - Số từ đã thuộc (Mastered)
   - Tỷ lệ hoàn thành
   - Biểu đồ tiến độ theo thời gian
   - Lịch sử học tập

### 7. Cài đặt cá nhân

1. Click **"Settings"**
2. Tab **"Personal Info"**:
   - Cập nhật tên, bio
   - Thêm số điện thoại, ngày sinh
   - Địa chỉ, nghề nghiệp
3. Tab **"Security"**:
   - Đổi mật khẩu
   - Kiểm tra độ mạnh mật khẩu
4. Tab **"Preferences"**:
   - Bật/tắt thông báo email
   - Chuyển Dark/Light mode

### 8. Từ vựng tùy chỉnh

1. Click menu **"Custom"**
2. Click **"Add New Word"**
3. Điền thông tin:
   - Từ vựng
   - Phiên âm (IPA)
   - Nghĩa
   - Ví dụ
4. Upload ảnh minh họa (tùy chọn)
5. Click **"Save"**

---

## 🔧 TROUBLESHOOTING

### Lỗi thường gặp

#### 1. Không kết nối được Supabase

**Triệu chứng:** Lỗi "Failed to fetch" hoặc "Network error"

**Giải pháp:**
- Kiểm tra `.env.local` có đúng URL và API key
- Kiểm tra internet connection
- Thử xóa cache: `rm -rf .next && pnpm dev`

#### 2. Gemini API không hoạt động

**Triệu chứng:** Lỗi "Quota exceeded" hoặc "Invalid API key"

**Giải pháp:**
- Kiểm tra `GEMINI_API_KEY` trong `.env.local`
- Đảm bảo API key chưa hết quota (50 requests/day free tier)
- Thử tạo API key mới tại https://aistudio.google.com

#### 3. Database rỗng (không có từ vựng)

**Triệu chứng:** Trang Oxford hiển thị "No words found"

**Giải pháp:**
1. Vào Supabase SQL Editor
2. Chạy lại: `sql/supabase-setup.sql`
3. Kiểm tra: `SELECT COUNT(*) FROM oxford_words;`

#### 4. Ảnh không tải được

**Triệu chứng:** Placeholder icons thay vì ảnh

**Giải pháp:**
- Kiểm tra `UNSPLASH_ACCESS_KEY` trong `.env.local`
- Auto-loader sẽ tự động tải ảnh khi vào trang Oxford
- Hoặc chạy thủ công: `node scripts/load-missing-images.js`

#### 5. Port 3000 đã được sử dụng

**Triệu chứng:** "Port 3000 is already in use"

**Giải pháp:**
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3000 | xargs kill -9

# Hoặc dùng port khác
pnpm dev -- -p 3001
```

#### 6. Module not found

**Triệu chứng:** "Cannot find module..."

**Giải pháp:**
```bash
# Xóa node_modules và cài lại
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

---

## 📞 HỖ TRỢ

### Liên hệ

- **GitHub Issues**: https://github.com/KyDung/Vocab_Web/issues
- **Email**: support@vocabapp.com

### Tài liệu tham khảo

- **Next.js Docs**: https://nextjs.org/docs
- **Supabase Docs**: https://supabase.com/docs
- **Gemini API Docs**: https://ai.google.dev/docs

---

## 📄 LICENSE

MIT License - Xem file LICENSE để biết thêm chi tiết.

---

**Chúc bạn học tốt! 🎉**
