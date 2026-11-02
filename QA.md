# Kiểm tra bản thiết kế lại

- Nội dung215 câu,14 tự luận, nguồn sách, mã câu và định dạng tiến độ giữ nguyên. Các kiểm tra nguồn và toàn vẹn PDF đạt.
- Ba route HTML độc lập: /hanh-trinh/, /on-tap/, /mindmap/.
- Trình duyệt xác nhận WebGL canvas Three.js thật. Không ghi nhận lỗi JavaScript trong các route đã kiểm tra.
- Cuộn tiến làm đổi mục, tiêu đề và trang nguồn; cuộn ngược về mục trước. Chế độ đọc tĩnh đã kiểm tra32/32 mục có thể đọc.
- Trả lời câu hỏi, chuyển mindmap, quay lại ôn tập: đáp án còn nguyên. Nguồn câu hỏi hiển thị dẫn trang ngắn gọn.
- Toàn bộ5 sơ đồ và từng nhánh qua kiểm tra hình học: không node chồng hoặc ra ngoài canvas. Đã thử chọn nhánh, xem chi tiết và về toàn chương.
- Đã xem desktop và điện thoại390×844. Canvas dùng client width để tránh tràn ngang; layer chuyển động nằm trong khung cảnh. Có chế độ đọc tĩnh khi không muốn chuyển động.
- Ảnh giữ caption/ngày và ghi công, phân biệt với biểu trưng trang trí3D. Dùng contain để giữ trọn ranh giới ảnh và watermark.

Chưa thử mọi GPU/trình duyệt/thiết bị. Máy không có WebGL dùng ảnh tư liệu thay cảnh3D. OCR chưa hiệu đính toàn bộ. Chưa triển khai internet; tiến độ cục bộ theo trình duyệt.

## Cập nhật giao diện và đặt lại tiến độ

Trang Giáo trình đã được gỡ; giữ ba không gian Hành trình, Ôn tập và Mindmap. Nguồn ảnh chuyển xuống cuối Hành trình; câu hỏi giữ dẫn trang, bỏ phần OCR. Kiểm tra tiến độ bổ sung đặt lại một hồ sơ, giữ danh tính, giữ hồ sơ khác và lưu lại sau khi mở lại. Cả ba bộ kiểm tra đều đạt. Trình duyệt xác nhận nút xóa, tên hồ sơ trong bước xác nhận, nút Hủy, đáp án có dẫn trang và Mindmap; không ghi nhận lỗi JavaScript trong các trang vừa kiểm tra. Không thực hiện xóa tiến độ thật qua trình duyệt.
