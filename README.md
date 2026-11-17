# 🔬 Science Phenomenons 12 – Phòng thí nghiệm ảo Hóa · Lí · Sinh

[![CI](https://github.com/thanhtq2701-alt/science_phenomenons/actions/workflows/ci.yml/badge.svg)](https://github.com/thanhtq2701-alt/science_phenomenons/actions/workflows/ci.yml)
![Mô phỏng](https://img.shields.io/badge/m%C3%B4%20ph%E1%BB%8Fng-81-4ade80)
![Node](https://img.shields.io/badge/node-%E2%89%A518-339933?logo=node.js&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-Canvas-f7df1e?logo=javascript&logoColor=black)

**Bước vào phòng thí nghiệm không giới hạn.** Phản ứng hóa học bùng lên, từ trường hiện hình, DNA tự nhân đôi, ngay trên trình duyệt. Kéo thanh trượt, bấm nút và nhìn khoa học vận hành trước mắt bạn.

81 mô phỏng tương tác cho chương trình Hóa – Lí – Sinh lớp 12. JavaScript thuần + Canvas, không cần cài đặt.

## 🌐 Dùng thử

| Link | Ghi chú |
|---|---|
| _(sẽ cập nhật sau khi deploy Render)_ | Render Static Site: mở nhanh, không bị ngủ. |

## ✨ Có gì bên trong

| Môn | Số bài | Ví dụ |
|---|---|---|
| ⚗️ Hóa học 12 | 26 | ester hóa, tráng bạc, xà phòng hóa, pin Galvani, điện phân, ăn mòn, nước cứng, phức chất, **chuẩn độ KMnO4** |
| 🧲 Vật lí 12 | 24 | mô hình động học phân tử, định luật chất khí, định luật I, cảm ứng điện từ, máy biến áp, phóng xạ, **3 bài thực hành đo đại lượng** |
| 🧬 Sinh học 12 | 31 | nhân đôi DNA, phiên mã, dịch mã, operon Lac, Mendel, phả hệ, Hardy–Weinberg, chọn lọc tự nhiên, Miller–Urey, sinh thái |

Mỗi bài có: hình động, bảng điều khiển, số liệu tức thời, phương trình/công thức, giải thích, gợi ý "Hãy thử & quan sát" và "Liên hệ bài thi". Bảng đối chiếu từng chương SGK với từng bài: [docs/PROJECT.md](docs/PROJECT.md).

## 🏃 Chạy trên máy

Cần [Node.js](https://nodejs.org/) 18 trở lên.

```bash
npm install
npm start          # mở http://localhost:3000
npm test           # 34 kiểm tra tự động
npm run build      # (tùy chọn) đóng gói bản tĩnh vào dist/
```

## ✅ Kiểm tra chất lượng

`npm test` chạy tự động trên GitHub Actions mỗi lần push:
- chạy mọi bài ở giá trị mặc định, min, max của từng thanh trượt và mọi lựa chọn, bắt lỗi chạy và tọa độ vẽ NaN;
- đối chiếu 21 đáp số với SGK: hiệu suất ester hóa 2/3, E° Zn–Cu 1,10 V, Hardy–Weinberg, thí nghiệm Gause, bán rã, máy biến áp, thấu kính, chuẩn độ…

## 🧩 Cấu trúc

```text
science_phenomenons/
├── web/            # Giao diện: index.html, css/, js/app.js (router), js/core/, js/sims/<môn>/
├── data/           # curriculum.json (môn → chương), catalog.json (sinh tự động)
├── server/         # Express: phục vụ web, /api/health, /api/feedback, /api/stats
├── tests/          # node --test
├── tools/          # build-catalog.js, build-static.js
├── docs/           # PROJECT.md (kiến trúc, danh sách bài), LEGACY_REVIEW.md
└── old/            # Bản Streamlit (Python) đầu tiên, giữ để tham chiếu
```

**Thêm một bài**: tạo `web/js/sims/<chem|physics|bio>/<ten-bai>.js` theo mẫu trong [docs/PROJECT.md](docs/PROJECT.md), thêm đường dẫn vào `web/js/core/registry.js`, chạy `npm test`.

## 🚀 Deploy trên Render

**Static Site** (đang dùng, cấu hình trong `render.yaml`): New → Blueprint → chọn repo. Build `npm run build`, Publish directory `dist`. Không ngủ, mở nhanh; form góp ý tự ẩn vì không có server.

**Web Service** (nếu muốn có form góp ý và thống kê lượt mở bài): Build `npm ci --omit=dev && npm run catalog`, Start `npm start`, Health Check `/healthz`. Dữ liệu lưu file tạm trong `var/`, mất khi Render khởi động lại.

Upstash Redis là tùy chọn: đặt `UPSTASH_REDIS_REST_URL` và `UPSTASH_REDIS_REST_TOKEN` cho Web Service nếu muốn góp ý không bị mất.

## 👤 Tác giả

Trần Quốc Thành · [GitHub](https://github.com/thanhtq2701-alt)
