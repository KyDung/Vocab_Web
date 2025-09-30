# Checklist Test sau khi Deploy

## 1. Test Authentication (/auth)
- [ ] Đăng ký bằng email/password
- [ ] Đăng nhập bằng email/password  
- [ ] Đăng nhập bằng Google OAuth
- [ ] Đăng xuất
- [ ] Profile được tạo tự động trong database

## 2. Test Browse Oxford Words
- [ ] Trang Topics (/topics) load được danh sách
- [ ] Click vào topic hiển thị được list từ
- [ ] Trang Oxford (/oxford) hoạt động
- [ ] Click vào từ hiển thị chi tiết

## 3. Test Games
- [ ] Trang Games (/games) hoạt động
- [ ] Flashcard game load được từ ngẫu nhiên
- [ ] Có thể mark Known/Unknown
- [ ] Summary hiển thị sau khi hoàn thành
- [ ] Progress được lưu vào database (check bằng /debug)

## 4. Test Custom Lists (/custom)
- [ ] Có thể paste Google Sheets GViz link
- [ ] Parser hoạt động với link hợp lệ  
- [ ] Dữ liệu được lưu vào localStorage
- [ ] Có thể tạo game từ custom data
- [ ] Test với link không hợp lệ (hiển thị lỗi)

## 5. Test AI Evaluation (nếu có UI)
- [ ] Submit text hoặc audio
- [ ] Nhận được response từ Gemini API
- [ ] Kết quả được lưu vào ai_evaluations table
- [ ] Graceful degradation khi API lỗi

## 6. Test Profile & Settings
- [ ] Xem profile (/profile)
- [ ] Cập nhật display name
- [ ] Upload avatar (nếu có)
- [ ] Settings page hoạt động

## 7. Test Responsive Design
- [ ] Mobile view hoạt động tốt
- [ ] Desktop view hoạt động tốt
- [ ] Navigation responsive

## 8. Test Error Handling
- [ ] 404 pages
- [ ] Network errors hiển thị toast
- [ ] Authentication errors xử lý đúng
- [ ] API timeouts được handle

## 9. Performance Check
- [ ] Trang load nhanh (< 3s)
- [ ] Images được optimize
- [ ] No console errors
- [ ] Lighthouse score > 80

## 10. Database Verification
Kiểm tra trong Supabase Dashboard:
- [ ] Bảng có dữ liệu sau khi test
- [ ] RLS policies hoạt động (user chỉ thấy data của mình)
- [ ] Triggers tạo profile tự động

## Các lỗi thường gặp và cách sửa:

### 1. "Invalid API key" hoặc AI không hoạt động
- Kiểm tra GEMINI_API_KEY trong Vercel env
- Đảm bảo key chưa hết quota

### 2. Google OAuth không hoạt động  
- Kiểm tra redirect URIs trong Google Cloud Console
- Đảm bảo domain Vercel đã được thêm
- Check Supabase Google provider config

### 3. Database connection errors
- Kiểm tra Supabase URL và keys
- Đảm bảo RLS policies không block queries

### 4. CORS errors với GViz
- Thử với link GViz khác
- Check console để xem error details

### 5. Build errors
- Check Vercel build logs
- Đảm bảo all dependencies trong package.json
- TypeScript errors phải fix trước khi deploy