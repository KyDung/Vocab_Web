# 🔧 Hướng dẫn cấu hình Supabase Production

## Vấn đề: Email confirmation redirect về localhost

Khi deploy production, email xác nhận vẫn redirect về localhost thay vì domain thực tế.

## ✅ Cách khắc phục:

### 1. **Cấu hình URL trong Supabase Dashboard**

Vào **Supabase Dashboard** → **Settings** → **Authentication** → **URL Configuration**:

```bash
Site URL: https://your-domain.vercel.app

Redirect URLs (thêm cả hai):
- https://your-domain.vercel.app/auth/callback
- http://localhost:3000/auth/callback
```

### 2. **Cấu hình Environment Variables**

#### Trong `.env.local` (local development):

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

#### Trong Vercel Dashboard (production):

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_SITE_URL=https://your-domain.vercel.app
```

### 3. **Email Templates (optional)**

Trong Supabase Dashboard → **Authentication** → **Email Templates**:

- **Confirm signup**: Redirect to `{{ .SiteURL }}/auth/callback`
- **Reset password**: Redirect to `{{ .SiteURL }}/auth/reset-password`

### 4. **Test checklist**

- [ ] Local development: Email redirect to localhost:3000
- [ ] Production: Email redirect to production domain
- [ ] Google OAuth works on both environments
- [ ] Reset password works on both environments

## 🚨 Common Issues:

1. **"localhost refused to connect"**: Site URL chưa đúng
2. **Google OAuth fails**: Redirect URLs chưa được thêm vào Google Console
3. **Email không đến**: Kiểm tra SMTP settings trong Supabase

## 📧 Google OAuth Setup:

Trong Google Cloud Console → **APIs & Services** → **Credentials**:

Authorized redirect URIs:

```
https://your-project-id.supabase.co/auth/v1/callback
https://your-domain.vercel.app/auth/callback
http://localhost:3000/auth/callback
```
