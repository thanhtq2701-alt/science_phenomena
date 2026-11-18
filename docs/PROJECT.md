# Science Phenomena 12 – Tổng quan dự án

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

## Danh sách bài (81) – đối chiếu chương trình GDPT 2018

Bảng sinh tự động từ data/catalog.json (chạy `npm run catalog`).

### Hóa học 12 (26 bài)

| Chương | Bài mô phỏng |
|---|---|
| Ester – Lipid | Phản ứng ester hóa (điều chế ethyl acetate); Thủy phân ester: môi trường acid vs. xà phòng hóa; Xà phòng và chất giặt rửa: cơ chế tẩy vết dầu mỡ |
| Carbohydrate | Nhận biết glucose: Cu(OH)2 và phản ứng tráng bạc; Hồ tinh bột + iodine: màu xanh tím và nhiệt độ; Thủy phân saccharose và tinh bột; Lên men glucose thành ethanol; Cellulose: tính chất và ứng dụng |
| Hợp chất chứa nitrogen | Amine: tính base và phản ứng của aniline với nước bromine; Amino acid lưỡng tính, điện di và phản ứng màu biuret của peptide; Protein: sự đông tụ (biến tính) và phản ứng màu |
| Polymer | Trùng hợp và trùng ngưng; Vật liệu polymer: chất dẻo, cao su lưu hóa, tơ |
| Pin điện và điện phân | Pin Galvani (pin điện hóa) Zn–Cu; Điện phân dung dịch và mạ điện; Acquy chì và pin nhiên liệu hydrogen |
| Đại cương về kim loại | Dãy điện hóa: kim loại đẩy kim loại khỏi muối; Liên kết kim loại, tính chất vật lí và hợp kim; Ăn mòn điện hóa và bảo vệ kim loại; Điều chế kim loại: nhiệt luyện, thủy luyện, điện phân |
| Nguyên tố nhóm IA, IIA | Kim loại kiềm tác dụng với nước; Nước cứng và cách làm mềm; Nhiệt phân muối carbonate, hydrogencarbonate; Màu ngọn lửa của kim loại nhóm IA, IIA |
| Kim loại chuyển tiếp & phức chất | Phức chất và màu sắc của ion kim loại chuyển tiếp; Chuẩn độ xác định hàm lượng Fe2+ bằng dung dịch KMnO4 |

### Vật lí 12 (24 bài)

| Chương | Bài mô phỏng |
|---|---|
| Vật lí nhiệt | Mô hình động học phân tử: rắn – lỏng – khí; Nhiệt độ, thang Celsius – Kelvin và nhiệt kế; Chuyển động Brown; Đun nước đá: nhiệt nóng chảy, nhiệt hóa hơi; Cân bằng nhiệt và nhiệt dung riêng; Thí nghiệm đo nhiệt dung riêng bằng biến thế nguồn và joulemeter; Thực hành đo nhiệt hóa hơi riêng và nhiệt nóng chảy riêng; Nội năng và định luật I nhiệt động lực học |
| Khí lí tưởng | Định luật Boyle: quá trình đẳng nhiệt; Định luật Charles (đẳng áp) và đẳng tích – độ không tuyệt đối; Áp suất chất khí từ va chạm phân tử – phương trình trạng thái |
| Từ trường | Từ trường của dòng điện: dây thẳng, vòng dây, ống dây; Lực từ tác dụng lên dây dẫn mang dòng điện; Thực hành đo cảm ứng từ bằng "cân dòng điện"; Cảm ứng điện từ: nam châm chuyển động qua ống dây; Máy phát điện xoay chiều; Máy biến áp và truyền tải điện năng đi xa; Điện từ trường và sóng điện từ |
| Vật lí hạt nhân | Phóng xạ và chu kì bán rã; Các loại tia phóng xạ: khả năng đâm xuyên và lệch trong từ trường; Phân hạch dây chuyền và nhiệt hạch; Cấu tạo hạt nhân và năng lượng liên kết |
| Mở rộng (kế thừa bản gốc) | Dao động tắt dần: hệ lò xo – vật – giảm chấn; Thấu kính hội tụ: dựng ảnh của ngọn nến |

### Sinh học 12 (31 bài)

| Chương | Bài mô phỏng |
|---|---|
| Di truyền phân tử | Nhân đôi DNA (tái bản); Phiên mã: tổng hợp mRNA từ gene; Dịch mã: ribosome tổng hợp chuỗi polypeptide; Điều hòa hoạt động gene: operon Lac ở E. coli; Công nghệ gene: tạo DNA tái tổ hợp sản xuất insulin; Đột biến gene và hậu quả lên protein |
| Di truyền nhiễm sắc thể | Nguyên phân và giảm phân; Cấu trúc siêu hiển vi của nhiễm sắc thể; Đột biến nhiễm sắc thể: cấu trúc và số lượng |
| Quy luật di truyền | Phép lai Mendel: bảng Punnett và tỉ lệ kiểu hình; Liên kết gene và hoán vị gene; Di truyền liên kết giới tính (gene lặn trên X); Tương tác gene: bổ sung, át chế, cộng gộp; Di truyền ngoài nhân (di truyền theo dòng mẹ); Kiểu gene – môi trường – kiểu hình: thường biến và mức phản ứng; Phân tích phả hệ và di truyền học người |
| Di truyền quần thể | Cân bằng Hardy – Weinberg; Các nhân tố làm thay đổi vốn gene: di – nhập gene, đột biến, giao phối không ngẫu nhiên |
| Tiến hóa | Chọn lọc tự nhiên: bướm đêm và màu nền; Bằng chứng tiến hóa: giải phẫu so sánh và sinh học phân tử; Hình thành loài khác khu vực địa lí (cách li địa lí); Phiêu bạt di truyền (trôi dạt gene) và hiệu ứng cổ chai; Phát sinh sự sống: thí nghiệm Miller – Urey (tiến hóa hóa học) |
| Sinh thái học | Tăng trưởng quần thể: hình chữ J và chữ S; Đặc trưng cơ bản của quần thể: mật độ, phân bố, cấu trúc tuổi, tỉ lệ giới tính; Quan hệ vật ăn thịt – con mồi (thỏ và cáo); Quan hệ giữa các loài trong quần xã; Chuỗi, lưới thức ăn và tháp năng lượng; Diễn thế sinh thái nguyên sinh và thứ sinh; Chu trình carbon và hiệu ứng nhà kính; Giới hạn sinh thái và ổ sinh thái |

## Kiểm tra chất lượng

- `tests/sims.test.js`: metadata, chương tồn tại, tham số hợp lệ, chạy create/update/draw/metrics cho mọi lựa chọn.
- `tests/sims-deep.test.js`: chạy ~20 s mô phỏng ở min/max từng thanh trượt, bắt tọa độ vẽ NaN/Infinity và số liệu "NaN".
- `tests/science.test.js`: 21 phép đối chiếu đáp số với SGK.
- `tests/server.test.js`, `tests/storage.test.js`: server, API, kho Upstash/file.

## Triển khai

- Đang chạy: **https://science-phenomenons.onrender.com** (Render Static Site, cấu hình trong `render.yaml`, build `npm run build` → `dist/`). Mỗi lần push lên `main`, Render tự build lại.
- Bản tĩnh không có server nên form góp ý tự ẩn. Muốn có góp ý: chuyển sang Web Service (xem README), thêm Upstash nếu cần lưu lâu dài.
- Link có thể đặt sẵn tham số: `#/sim/<id>?<key>=<giá trị>`, ví dụ `#/sim/physics-kinetic-model?temp=610`.
- Đã kiểm tra trên máy tính (Chrome) và điện thoại.

## Việc có thể làm tiếp

- Mở rộng sang lớp 10–11: cân bằng hóa học, khúc xạ – giao thoa ánh sáng, quang hợp – hô hấp.
- Chế độ "bài tập": ẩn số liệu, yêu cầu học sinh dự đoán trước khi bấm chạy.
- Thêm ảnh/GIF minh họa vào README cho mỗi môn.
