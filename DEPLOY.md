# Đưa SPST-VNR lên Vercel

1. Truy cập https://vercel.com/new và đăng nhập bằng GitHub.
2. Import repository `longbui125/SPST-VNR`. Nếu chưa thấy repo, cấp quyền cho Vercel truy cập repo này trong GitHub.
3. Giữ **Root Directory** ở thư mục gốc, chọn **Framework Preset: Other**.
4. Cấu hình đã có trong `vercel.json`: **Build Command:** `node build.cjs`; **Output Directory:** `dist`; bỏ qua bước cài thư viện.
5. Không cần Environment Variables. Chọn **Deploy**, đợi **Ready** rồi mở đường dẫn Vercel cấp.
6. Thử Hành trình, Ôn tập, Mindmap và tải lại trực tiếp từng đường dẫn. Các lần push tiếp lên `main` sẽ tự cập nhật bản production nếu giữ tích hợp Git mặc định.

Website được xuất thành tệp tĩnh, không chạy `server.cjs` trên Vercel. Bản xuất bản không chứa PDF toàn bộ sách, dữ liệu OCR, kiểm tra hay tài liệu nội bộ. Ảnh và thư viện dùng cho giao diện được giữ đầy đủ.

## Chạy và kiểm tra trên máy

Cần Node.js 22 trở lên. Không có thư viện cần cài thêm.

```sh
npm start
npm test
npm run build
```

`npm start` mở máy chủ cục bộ tại http://127.0.0.1:4173/hanh-trinh/. `npm run build` tạo thư mục `dist/`.

Nếu dùng Node đi kèm Codex chưa có npm, có thể chạy trực tiếp `node server.cjs`, `node --test tests/*.test.cjs` và `node build.cjs`.

## Tiến độ khi chuyển lên Vercel

Tiến độ lưu riêng trên trình duyệt của từng người, không có đồng bộ nhiều máy hay bảng xếp hạng chung. Đổi từ localhost sang Vercel sẽ dùng vùng lưu mới: **Xuất tiến độ** ở bản cũ, sau đó **Nhập tiến độ** trên tên miền mới. Tính năng nhập tạo hồ sơ mới. Xóa dữ liệu trình duyệt hoặc đóng cửa sổ ẩn danh có thể làm mất tiến độ.
