# Science Phenomenons 12 – Tổng quan dự án

## Mục tiêu
Phòng thí nghiệm ảo cho học sinh lớp 12 (Chương trình GDPT 2018), ba môn Hóa – Lí – Sinh, chạy hoàn toàn trên trình duyệt, không cần cài đặt. Mỗi bài: hình động trên Canvas + thanh trượt điều kiện + số liệu tức thời + phần lí thuyết, gợi ý quan sát, liên hệ bài thi.

## Kiến trúc
```
trình duyệt ── web/index.html ── js/app.js (hash router)
                                  ├─ core/engine.js   vòng lặp rAF, Runner, tham số
                                  ├─ core/draw.js     thư viện vẽ (cốc, ống nghiệm, đồ thị, phân tử…)
                                  ├─ core/ui.js       dựng panel điều khiển từ spec params
                                  ├─ core/registry.js danh sách SIM_PATHS
                                  └─ sims/<môn>/*.js  48 module mô phỏng
server/index.js (Express) ── static web/, /data, /api/catalog, /api/health, /api/feedback (ghi var/feedback.jsonl)
data/curriculum.json  môn → chương          data/catalog.json  sinh bởi tools/build-catalog.js
tests/                node --test            render.yaml        deploy Render
```

## Hợp đồng module mô phỏng
```js
export default {
  id: 'chem-xxx', subject: 'chem'|'physics'|'bio', chapter: '<id chương>',
  title, summary, equation: string|string[], theory: string[], observe: string[], exam: string[], keywords: string[],
  params: [{ key, label, type?: 'range'|'select'|'toggle', min, max, step, value, unit, options, help }],
  actions: [{ key, label }],
  create({ w, h, params, runner }) => ({ update(dt, p, t), draw(g, w, h, p, t), metrics?(p, t), action?(key, p), onParam?(key, p) })
}
```
- `update` chỉ thay đổi trạng thái, `draw` chỉ vẽ; cả hai phải chạy được khi `g` là context giả (test).
- Không dùng DOM trong module (để Node import được khi build catalog/test).
- Văn bản trong canvas dùng `text()/label()` của draw.js; công thức hóa học trong `equation/theory` dùng dạng thô (`H2SO4`, `Cu2+`), UI tự chuyển chỉ số.

## Danh sách bài (48)
**Hóa 12 (16)**: ester hóa; thủy phân ester/xà phòng hóa; glucose với Cu(OH)2 & tráng bạc; hồ tinh bột + I2; thủy phân carbohydrate; amine/aniline; amino acid & biuret; trùng hợp/trùng ngưng; pin Galvani; điện phân & mạ điện; dãy điện hóa; ăn mòn điện hóa; kim loại kiềm + nước; nước cứng; màu ngọn lửa; phức chất.

**Lí 12 (16)**: mô hình động học phân tử; chuyển động Brown; đường đun nước đá; cân bằng nhiệt; Boyle; Charles/đẳng tích; áp suất khí & pV = nRT; từ trường dòng điện; lực từ BIL; cảm ứng điện từ; máy phát xoay chiều; phóng xạ & bán rã; phân hạch/nhiệt hạch; cấu tạo hạt nhân; dao động tắt dần (kế thừa); thấu kính (kế thừa, đã sửa công thức).

**Sinh 12 (16)**: nhân đôi DNA; phiên mã; dịch mã; operon Lac; đột biến gene; nguyên phân/giảm phân; đột biến NST; Punnett; liên kết & hoán vị gene; liên kết giới tính; Hardy–Weinberg; chọn lọc tự nhiên; phiêu bạt di truyền; tăng trưởng quần thể; vật ăn thịt – con mồi; lưới thức ăn & tháp năng lượng.

## Việc có thể làm tiếp
- Kiểm tra trực quan từng bài trên nhiều kích thước màn hình (đặc biệt điện thoại); vài bài bố cục dày khi w < 700 px.
- Thêm bài: cân bằng hóa học động, khúc xạ/giao thoa (nếu mở rộng ra lớp 11), hệ sinh thái tự điều chỉnh.
- Lưu phản hồi (`/api/feedback`) vào cơ sở dữ liệu thay vì file khi deploy nhiều instance.
- Thêm chế độ "bài tập": ẩn số liệu, yêu cầu học sinh dự đoán trước khi chạy.
