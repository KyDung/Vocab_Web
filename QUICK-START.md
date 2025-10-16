# 🚀 HƯỚNG DẪN SETUP NHANH CHO BẠN

## ⚡ Bước 1: Tạo tài khoản Supabase (2 phút)

1. **Truy cập:** https://supabase.com
2. **Click:** "Start your project" 
3. **Đăng ký** bằng GitHub hoặc email
4. **Tạo Organization** (tên tùy ý)
5. **Create a new project:**
   - Project name: `vocab-web` (hoặc tên tùy ý)
   - Database password: tạo mật khẩu mạnh
   - Region: Southeast Asia (Singapore) - gần VN nhất
6. **Chờ 1-2 phút** để project khởi tạo

## ⚡ Bước 2: Lấy thông tin kết nối

1. **Vào project** vừa tạo
2. **Click Settings** (icon ⚙️) ở sidebar trái
3. **Click API** 
4. **Copy 2 thông tin này:**
   - **Project URL** (ví dụ: `https://abcxyz.supabase.co`)
   - **anon public** key (key dài bắt đầu bằng `eyJ...`)

## ⚡ Bước 3: Điền vào file .env.local

1. **Mở file** `.env.local` trong project
2. **Điền thông tin:**
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6...
```

## ⚡ Bước 4: Setup Database (tùy chọn)

1. **Vào Supabase Dashboard** → **SQL Editor**
2. **Copy nội dung** file `sql/supabase-setup.sql` 
3. **Paste và Execute** trong SQL Editor

## ⚡ Bước 5: Chạy project

```bash
# Cài đặt dependencies (nếu chưa)
pnpm install

# Chạy development server
pnpm dev
```

## ⚡ Bước 6: Test

- **Mở browser:** http://localhost:3000
- **Nếu thấy trang chủ** → ✅ Setup thành công!
- **Nếu lỗi** → Check lại URL và API key

## 🆘 Nếu gặp lỗi:

### Lỗi "supabaseUrl is required":
- ✅ Check file `.env.local` có đúng format
- ✅ URL phải bắt đầu bằng `https://`
- ✅ API key không có dấu cách thừa
- ✅ Restart server: Ctrl+C rồi `pnpm dev` lại

### Lỗi CORS:
- ✅ Vào Supabase → Authentication → URL Configuration
- ✅ Thêm `http://localhost:3000` vào Redirect URLs

### Lỗi khác:
- ✅ Check console browser (F12)
- ✅ Check terminal có lỗi gì
- ✅ Liên hệ: Kydung204@gmail.com

---

**🎯 Mục tiêu: Chỉ cần 5 phút để có web chạy local!**