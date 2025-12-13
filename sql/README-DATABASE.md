# 📦 HƯỚNG DẪN EXPORT DATABASE CHO SUBMISSION

## 🎯 Mục đích

Tạo file backup database để nộp kèm source code, giúp người khác có thể restore lại toàn bộ dữ liệu.

---

## 📝 Các file database cần export

### 1. Database Schema (Cấu trúc bảng)
- File: `sql/supabase-setup.sql` ✅ (Đã có sẵn)
- Chứa: CREATE TABLE statements cho tất cả bảng

### 2. Sample Data (Dữ liệu mẫu)
- File: `sql/sample-data.sql` (Cần tạo)
- Chứa: INSERT statements cho dữ liệu demo

---

## 🔄 Cách export database từ Supabase

### Option 1: Sử dụng Supabase Dashboard (Khuyến nghị)

#### Bước 1: Export Schema

1. Vào Supabase Dashboard → **SQL Editor**
2. Tạo query mới và chạy:

```sql
-- Export schema của các bảng chính
\d+ oxford_words
\d+ topics
\d+ topic_words
\d+ user_word_status
\d+ user_stats
```

3. Copy output và lưu vào file

#### Bước 2: Export Data

**Export oxford_words (3147 từ):**

```sql
-- Chạy trong SQL Editor
SELECT 
  'INSERT INTO oxford_words (id, term, ipa, pos, meaning, example, image_url, rank) VALUES ' ||
  string_agg(
    format('(%s, %L, %L, %L, %L, %L, %L, %s)', 
      id, term, ipa, pos, meaning, example, image_url, rank
    ),
    ',' || E'\n'
  ) || ';'
FROM oxford_words;
```

Copy output và lưu vào `sql/oxford-words-data.sql`

**Export topics:**

```sql
SELECT 
  'INSERT INTO topics (id, slug, title, description) VALUES ' ||
  string_agg(
    format('(%s, %L, %L, %L)', id, slug, title, description),
    ',' || E'\n'
  ) || ';'
FROM topics;
```

**Export topic_words (liên kết):**

```sql
SELECT 
  'INSERT INTO topic_words (topic_id, word_id) VALUES ' ||
  string_agg(
    format('(%s, %s)', topic_id, word_id),
    ',' || E'\n'
  ) || ';'
FROM topic_words;
```

### Option 2: Sử dụng pg_dump (Advanced)

Nếu có quyền truy cập database trực tiếp:

```bash
# Export full database
pg_dump -h db.xxxxx.supabase.co \
  -U postgres \
  -d postgres \
  --schema=public \
  --no-owner \
  --no-privileges \
  -f database-full-backup.sql

# Export chỉ schema
pg_dump -h db.xxxxx.supabase.co \
  -U postgres \
  -d postgres \
  --schema=public \
  --schema-only \
  --no-owner \
  -f database-schema-only.sql

# Export chỉ data
pg_dump -h db.xxxxx.supabase.co \
  -U postgres \
  -d postgres \
  --schema=public \
  --data-only \
  --no-owner \
  -f database-data-only.sql
```

---

## 📁 Cấu trúc files database cho submission

```
sql/
├── supabase-setup.sql           # Schema + Functions ✅
├── oxford-words-data.sql        # 3147 từ Oxford
├── topics-data.sql              # Danh sách chủ đề
├── topic-words-data.sql         # Liên kết từ-chủ đề
└── README-DATABASE.md           # Hướng dẫn import
```

---

## 🚀 Cách import lại database

### Bước 1: Tạo schema

```sql
-- Chạy trong Supabase SQL Editor
\i sql/supabase-setup.sql
```

### Bước 2: Import data

```sql
-- Import từ vựng
\i sql/oxford-words-data.sql

-- Import topics
\i sql/topics-data.sql

-- Import liên kết
\i sql/topic-words-data.sql
```

### Bước 3: Verify

```sql
SELECT COUNT(*) FROM oxford_words;  -- Kết quả: 3147
SELECT COUNT(*) FROM topics;        -- Kết quả: ~20
SELECT COUNT(*) FROM topic_words;   -- Kết quả: ~500+
```

---

## ⚠️ Lưu ý quan trọng

### 1. Dữ liệu nhạy cảm

**KHÔNG export:**
- ❌ `auth.users` - Thông tin người dùng thật
- ❌ `user_word_status` - Tiến độ học tập cá nhân
- ❌ `user_stats` - Thống kê người dùng
- ❌ Bất kỳ bảng nào chứa email, password, personal info

**Chỉ export:**
- ✅ `oxford_words` - Từ vựng công khai
- ✅ `topics` - Chủ đề công khai
- ✅ `topic_words` - Liên kết công khai

### 2. Kích thước file

- File `oxford-words-data.sql` có thể lớn (~2-5 MB)
- Nén file trước khi nộp: `gzip sql/*.sql`
- Hoặc tách thành nhiều file nhỏ nếu cần

### 3. API Keys

- ❌ KHÔNG commit file `.env.local` vào Git
- ✅ Chỉ commit file `.env.local.example` (template)
- ✅ Hướng dẫn người dùng tạo API keys riêng

---

## 📋 Checklist trước khi nộp

- [ ] File `sql/supabase-setup.sql` đầy đủ
- [ ] File `sql/oxford-words-data.sql` (hoặc link download nếu quá lớn)
- [ ] File `sql/topics-data.sql`
- [ ] File `sql/topic-words-data.sql`
- [ ] File `HUONG-DAN-CAI-DAT.md` chi tiết
- [ ] File `.env.local.example` có đầy đủ variables
- [ ] Đã remove sensitive data (emails, passwords)
- [ ] Test import database trên project mới

---

## 🎯 Alternative: Sử dụng Supabase Project Template

Nếu không muốn export file SQL lớn, có thể:

1. Tạo Supabase project template public
2. Share project template link
3. Người dùng fork template để có data sẵn

**Hướng dẫn:**
- Supabase Dashboard → Settings → Project Templates
- Click "Share as Template"
- Copy template URL

---

**Hoàn thành! Database đã sẵn sàng để nộp.** 🎉
