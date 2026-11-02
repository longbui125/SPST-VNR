# SPST-VNR

Sử Đảng · Mạch nguồn lịch sử. Đã có cấu hình xuất bản tĩnh cho Vercel; xem hướng dẫn từng bước trong [DEPLOY.md](DEPLOY.md).

## Mở bản mới

Nếu đang chạy bản cũ, đóng cửa sổ chạy web cũ rồi nhấp đúp **Mo-web.cmd**. Mở http://127.0.0.1:4173/hanh-trinh/ bằng Chrome hoặc Edge. Giữ cửa sổ đang chạy; đóng nó để dừng máy chủ.

Bản mới cần HTTP để chạy module Three.js và các route độc lập, không mở trực tiếp index.html. Không cần cài thư viện hoặc build. Trình khởi động dùng Node trên máy hoặc Node đi kèm Codex.

## Các không gian riêng

- /hanh-trinh/: kể chuyện bằng cuộn, Three.js, camera, ảnh tư liệu trong phối cảnh, chuyển cảnh và32 mục kiến thức của3 chương. Cuộn để đọc, cuộn ngược để xem lại; có đọc tĩnh/giảm chuyển động.
- /on-tap/:215 trắc nghiệm biên soạn có giải thích, dẫn trang;14 câu tự luận gốc và đề cương. Có câu chưa làm, cần ôn lại, đánh dấu, chủ đề và tìm kiếm.
- /mindmap/:5 sơ đồ toàn chương, cây nhánh chi tiết, kéo nền, thu phóng, chọn nhánh, đề cương, đánh dấu ghi nhớ.

## Tiến độ

Không cần đăng nhập. Mỗi hồ sơ lưu riêng trên trình duyệt. Có xuất/nhập tiến độ; nhập tạo hồ sơ mới, không ghi đè hồ sơ cũ. Trong Tiến độ của bạn, chọn Xóa tiến độ rồi xác nhận để đặt lại riêng hồ sơ đang chọn. Tên hồ sơ và các hồ sơ khác được giữ nguyên.

Giữ nguyên khóa su-dang.progress.v1 và mã câu/ý ghi nhớ. Dùng cùng http://127.0.0.1:4173 để đọc tiếp tiến độ cũ. Đổi trình duyệt, tên miền, cổng hoặc xóa dữ liệu sẽ dùng vùng lưu khác. Không tự đồng bộ giữa máy.

## Nguồn

Bộ Giáo dục và Đào tạo, Giáo trình Lịch sử Đảng Cộng sản Việt Nam, NXB Chính trị quốc gia Sự thật,2021, ISBN9786045765906. Phạm vi theo bản2021. Trắc nghiệm và mindmap là nội dung biên soạn, không phải đề thi chính thức; lựa chọn sai là phương án nhiễu.

PDF và440 trang scan giữ nguyên. OCR chưa hiệu đính từng dòng; ảnh scan là căn cứ đối chiếu. Trang222 in ngày Hiệp định Pari khác trang227; câu hỏi dùng27/1/1973 theo trang227.

Ảnh lịch sử từ Wikimedia Commons/NARA và TTXVN, có nguồn/caption tại assets/archive/credits.json và phần Nguồn hình ảnh & tư liệu cuối Hành trình. Không dùng ảnh lịch sử tạo sinh. Texture giấy CC0; ngôi sao/vòng đồng3D là trang trí đương đại. Ảnh TTXVN giữ watermark và không được gán giấy phép mở; kiểm tra quyền sử dụng trước khi công bố công khai.

Phông Be Vietnam Pro và Noto Serif có OFL. Three.js0.187.0, GSAP3.15.0 lưu cùng web; khi học không phụ thuộc CDN.

## Kiểm tra

Chạy node tests/content.test.cjs, node tests/progress.test.cjs và node tests/map-layout.test.cjs. Kiểm tra215 câu có bằng chứng,440 ảnh, SHA-256 PDF, lưu/tách hồ sơ, nhập sai, dữ liệu hỏng và hình học mindmap.
