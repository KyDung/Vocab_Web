# 🔑 Hướng dẫn lấy API Keys

## 📋 Tổng quan các API cần thiết

| API           | Bắt buộc       | Mục đích         | Hướng dẫn                  |
| ------------- | -------------- | ---------------- | -------------------------- |
| **Supabase**  | ✅ Bắt buộc    | Database, Auth   | [Xem bên dưới](#supabase)  |
| **Gemini AI** | 🟡 Khuyến nghị | Đánh giá từ vựng | [Xem bên dưới](#gemini-ai) |
| **Unsplash**  | 🟡 Khuyến nghị | Ảnh minh họa     | [Xem bên dưới](#unsplash)  |

---

## 🗃️ Supabase (Bắt buộc)

### Bước 1: Tạo tài khoản

1. Truy cập: https://supabase.com
2. Click **"Start your project"**
3. Đăng ký bằng GitHub hoặc email

### Bước 2: Tạo project

1. Click **"New project"**
2. Điền thông tin:
   - **Organization**: Tên tổ chức (tùy ý)
   - **Project name**: `vocab-web`
   - **Database password**: Mật khẩu mạnh
   - **Region**: Southeast Asia (Singapore)
3. Click **"Create new project"**
4. Chờ 1-2 phút

### Bước 3: Lấy API keys

1. Vào project vừa tạo
2. Click **Settings** (⚙️) → **API**
3. Copy 3 thông tin:
   - **Project URL**: `https://xxx.supabase.co`
   - **anon public**: Key bắt đầu bằng `eyJ...`
   - **service_role**: Key bắt đầu bằng `eyJ...`

---

## 🤖 Gemini AI (Khuyến nghị)

### Mục đích:

- Đánh giá khả năng sử dụng từ vựng
- Feedback thông minh cho người học

### Cách lấy API key:

1. Truy cập: https://aistudio.google.com/app/apikey
2. Đăng nhập Google account
3. Click **"Create API Key"**
4. Chọn project hoặc tạo mới
5. Copy API key

### Giá cả:

- **Miễn phí**: 15 requests/minute, 1500 requests/day
- **Paid**: $0.50/$1M characters

---

## 📸 Unsplash (Khuyến nghị)

### Mục đích:

- Lấy ảnh minh họa chất lượng cao cho từ vựng
- Cải thiện trải nghiệm học tập

### Cách lấy API key:

1. Truy cập: https://unsplash.com/developers
2. Đăng ký/đăng nhập
3. Click **"New Application"**
4. Điền thông tin app:
   - **Application name**: `VocabWeb`
   - **Description**: `Educational vocabulary app`
5. Đồng ý terms và submit
6. Copy **Access Key**

### Giới hạn:

- **Development**: 50 requests/hour
- **Production**: 5000 requests/hour (sau khi submit for review)

---

## 📋 Google Sheets (Tùy chọn)

### Mục đích:

- Import từ vựng từ Google Sheets
- Chia sẻ bộ từ vựng với cộng đồng

### Cách setup:

1. Truy cập: https://console.developers.google.com
2. Tạo project mới hoặc chọn existing
3. Enable **Google Sheets API**
4. Tạo credentials → API Key
5. Copy API key

---

## ⚙️ Cách điền vào .env.local

```bash
# Supabase (Bắt buộc)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# AI Features (Khuyến nghị)
GEMINI_API_KEY=AIzaSyBNrlkO-nqH7BfBVxfHHYKKDG6KOaw1234

# Images (Khuyến nghị)
UNSPLASH_ACCESS_KEY=abc123def456ghi789jkl012mno345pqr678stu901vwx234yzab567cde890fgh123

# Local development
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

---

## 🧪 Test các API

### Test Supabase:

```bash
pnpm dev
# Mở http://localhost:3000
# Nếu trang chủ load được → ✅ Supabase OK
```

### Test Gemini AI:

- Vào trang **Custom Vocabulary**
- Thử tạo câu với từ vựng
- Nếu có feedback AI → ✅ Gemini OK

### Test Unsplash:

- Vào trang **Oxford** hoặc **Topics**
- Xem có ảnh minh họa → ✅ Unsplash OK

---

## 🆘 Troubleshooting

### Lỗi "API key invalid":

- ✅ Check key không có space thừa
- ✅ Key chưa hết hạn
- ✅ Restart dev server

### Lỗi CORS:

- ✅ Thêm domain vào whitelist của API provider
- ✅ Check API có enable cho domain

### Performance:

- 🟡 Gemini AI: Có rate limit, dùng tiết kiệm
- 🟡 Unsplash: Cache ảnh để tránh vượt limit

---

**💡 Tip: Bắt đầu với Supabase, các API khác có thể thêm sau!**
