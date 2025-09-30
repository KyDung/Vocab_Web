# Environment Variables cho Deploy Vercel
# Copy các giá trị này vào Vercel Dashboard > Settings > Environment Variables

# === SUPABASE ===
# Lấy từ Supabase Dashboard > Settings > API
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# === AI API ===
# Lấy từ Google AI Studio
GEMINI_API_KEY=your-gemini-api-key-here

# === APP CONFIG ===
# URL của Vercel deployment (cập nhật sau khi deploy)
NEXT_PUBLIC_BASE_URL=https://your-app-name.vercel.app
NODE_ENV=production

# === DATABASE (Nếu sử dụng direct database connection) ===
# Thông thường không cần vì đã dùng Supabase
# Nhưng nếu có sử dụng trong code thì lấy từ Supabase > Settings > Database
PGHOST=db.your-project-id.supabase.co
PGPORT=5432
PGDATABASE=postgres
PGUSER=postgres
PGPASSWORD=your-database-password
PGSSL=true

# === HƯỚNG DẪN ===
# 1. Vào Vercel Dashboard > Your Project > Settings > Environment Variables
# 2. Với mỗi biến, click "Add New" và điền:
#    - Name: tên biến (ví dụ: NEXT_PUBLIC_SUPABASE_URL)
#    - Value: giá trị tương ứng
#    - Environments: chọn Production, Preview, Development (tất cả)
# 3. Sau khi thêm xong, redeploy project để áp dụng