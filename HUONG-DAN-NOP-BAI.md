# 📥 HƯỚNG DẪN TẢI VỀ VÀ NỘP BÀI

## 🎯 Các bước thực hiện

### Bước 1: Clone repository từ GitHub

```bash
git clone https://github.com/KyDung/Vocab_Web.git
cd Vocab_Web
```

### Bước 2: Tạo file .zip để nộp

#### Option 1: Sử dụng Git Archive (Khuyến nghị)

```bash
# Tạo zip từ commit mới nhất, loại trừ các file không cần thiết
git archive --format=zip --output=VocabApp_Submission.zip HEAD \
  --exclude='.git*' \
  --exclude='node_modules' \
  --exclude='.next' \
  --exclude='.env.local' \
  --exclude='test-*.js' \
  --exclude='test-*.mjs'
```

#### Option 2: Sử dụng zip command

**Windows (PowerShell):**

```powershell
# Loại trừ các thư mục lớn
Compress-Archive -Path * -DestinationPath VocabApp_Submission.zip -Exclude node_modules,.next,.git,.env.local,test-*.js
```

**Linux/Mac:**

```bash
# Tạo zip loại trừ các thư mục không cần
zip -r VocabApp_Submission.zip . \
  -x "node_modules/*" \
  -x ".next/*" \
  -x ".git/*" \
  -x ".env.local" \
  -x "test-*.js" \
  -x "test-*.mjs" \
  -x "*.log"
```

### Bước 3: Kiểm tra nội dung file zip

```bash
# Kiểm tra kích thước file
ls -lh VocabApp_Submission.zip

# Xem danh sách files trong zip
unzip -l VocabApp_Submission.zip | head -50
```

**Kích thước file:** ~10-15 MB (không có node_modules)

---

## 📦 NỘI DUNG PACKAGE

File `VocabApp_Submission.zip` bao gồm:

### ✅ Mã nguồn

```
app/          # Next.js pages
components/   # React components  
lib/          # Utilities
public/       # Static assets
styles/       # CSS files
```

### ✅ Cơ sở dữ liệu

```
sql/
├── supabase-setup.sql      # Database schema
└── README-DATABASE.md      # Database documentation
```

### ✅ Tài liệu

```
HUONG-DAN-CAI-DAT.md        # Hướng dẫn cài đặt chi tiết ⭐
SUBMISSION-README.md        # Tổng quan project
README.md                   # Project overview
SETUP.md                    # Development setup
QUICK-START.md              # Quick start guide
```

### ✅ Config files

```
package.json                # Dependencies
tsconfig.json              # TypeScript config
next.config.mjs            # Next.js config
.env.local.example         # Environment template
```

### ✅ Documentation

```
BaoCao/                    # Project reports
docs/                      # Technical docs
```

---

## 📋 CHECKLIST TRƯỚC KHI NỘP

- [ ] File zip đã được tạo thành công
- [ ] Kích thước file < 50MB (không có node_modules, .next)
- [ ] Đã kiểm tra nội dung file zip
- [ ] File `HUONG-DAN-CAI-DAT.md` có trong zip
- [ ] File `sql/supabase-setup.sql` có trong zip
- [ ] File `.env.local.example` có trong zip (KHÔNG phải .env.local)
- [ ] Không có sensitive data (API keys, passwords)

---

## 🚀 TEST PACKAGE TRƯỚC KHI NỘP

### Bước 1: Giải nén và test

```bash
# Tạo thư mục test
mkdir test-submission
cd test-submission

# Giải nén
unzip ../VocabApp_Submission.zip

# Cài đặt dependencies
pnpm install

# Kiểm tra build
pnpm build
```

### Bước 2: Verify các files quan trọng

```bash
# Kiểm tra file hướng dẫn
cat HUONG-DAN-CAI-DAT.md

# Kiểm tra database schema
cat sql/supabase-setup.sql

# Kiểm tra env template
cat .env.local.example
```

---

## 📝 NỘI DUNG NỘP

### Files chính cần có:

1. **VocabApp_Submission.zip** (~10-15 MB)
   - Toàn bộ source code
   - Database scripts
   - Documentation

2. **HUONG-DAN-CAI-DAT.md** (riêng biệt hoặc trong zip)
   - Hướng dẫn cài đặt từng bước
   - Hướng dẫn sử dụng
   - Troubleshooting

3. **README/GIOI-THIEU.txt** (nếu yêu cầu)
   - Tóm tắt project
   - Tính năng chính
   - Tech stack

---

## 🔐 BẢO MẬT

### ❌ KHÔNG BAO GỒM trong file nộp:

- `.env.local` - File chứa API keys thật
- `node_modules/` - Thư mục dependencies (quá lớn)
- `.next/` - Build cache
- `.git/` - Git history
- `test-*.js` - Test scripts với API keys
- `*.log` - Log files
- Personal data/credentials

### ✅ CÓ BAO GỒM:

- `.env.local.example` - Template không có giá trị thật
- `package.json` - Danh sách dependencies
- Source code đầy đủ
- Documentation
- Database schema

---

## 📤 CÁCH NỘP

### Option 1: Upload trực tiếp

- Upload file `VocabApp_Submission.zip` lên hệ thống nộp bài

### Option 2: Google Drive/OneDrive

```bash
# Nếu file quá lớn (>50MB), upload lên cloud
# Tạo link share và nộp link
```

### Option 3: GitHub Repository

- Nộp link GitHub: https://github.com/KyDung/Vocab_Web
- Commit hash: `5f715f7`
- Branch: `main`

---

## ✅ FILE ZIP ĐÃ SẴN SÀNG!

Bạn có thể:

1. **Tải về từ local:**
   - File: `VocabApp_Submission.zip`
   - Location: `e:\HTML_GAME\CDsupa\Ver1\Vocab_Web-main\`

2. **Clone từ GitHub:**
   ```bash
   git clone https://github.com/KyDung/Vocab_Web.git
   ```

3. **Download ZIP từ GitHub:**
   - Vào: https://github.com/KyDung/Vocab_Web
   - Click: **Code** → **Download ZIP**

---

## 📞 HỖ TRỢ

Nếu có vấn đề khi tạo file zip hoặc nộp bài:

- **GitHub Issues:** https://github.com/KyDung/Vocab_Web/issues
- **Email:** support@vocabapp.com

---

**🎉 CHÚC BẠN NỘP BÀI THÀNH CÔNG!**
