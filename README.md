# 🔬 Science Phenomenons 12 – Phòng thí nghiệm ảo Hóa · Lí · Sinh

Web mô phỏng tương tác cho học sinh lớp 12 (Chương trình GDPT 2018): phản ứng Hóa học, thí nghiệm Vật lí và hình động Sinh học. JavaScript thuần + Canvas, phục vụ bằng Express, không cần bước build.

## Chạy trên máy

```bash
npm install
npm start          # http://localhost:3000
npm run dev        # tự khởi động lại khi sửa server
npm test           # kiểm tra mọi module mô phỏng + server
npm run catalog    # sinh data/catalog.json từ các module
```

## Bố cục repo

```
data/       curriculum.json (môn → chương), catalog.json (sinh tự động)
docs/       LEGACY_REVIEW.md – rà soát bản Streamlit cũ, PROJECT.md – kiến trúc & danh sách bài
old/        bản Streamlit (Python) gốc, giữ để tham chiếu
server/     Express: static + /api/catalog, /api/health, /api/feedback
tests/      node --test: kiểm tra metadata, chạy thử update/draw mọi bài
tools/      build-catalog.js
web/        index.html, css/, js/app.js (router), js/core/ (engine, draw, ui), js/sims/<môn>/
```

## Thêm một bài mô phỏng

1. Tạo `web/js/sims/<chem|physics|bio>/<ten-bai>.js` với `export default { id, subject, chapter, title, summary, equation, theory, observe, exam, params, actions, create(ctx) }`.
2. `create()` trả về `{ update(dt, p, t), draw(g, w, h, p, t), metrics?(p), action?(key, p), onParam?(key, p) }`.
3. Thêm đường dẫn vào `SIM_PATHS` trong `web/js/core/registry.js`, chạy `npm test`.

## Tiến độ

| Môn | Bài đã có | Trạng thái |
|---|---|---|
| Hóa học 12 | 16 | ✅ đủ 8 chương |
| Vật lí 12 | 16 | ✅ đủ 4 chương + 2 bài kế thừa bản gốc |
| Sinh học 12 | 16 | ✅ đủ 6 chương |

## Deploy Render + Upstash (giống repo Hackathon)

1. **Upstash**: tạo database Redis (free) → tab *REST API* → copy `UPSTASH_REDIS_REST_URL` và `UPSTASH_REDIS_REST_TOKEN`.
2. **Render** → New → *Blueprint* (đọc `render.yaml`) hoặc *Web Service*: Language `Node`, Build `npm ci --omit=dev && npm run catalog`, Start `npm start`, Health Check `/healthz`.
3. Environment: điền 2 biến Upstash ở trên và `ADMIN_KEY` (chuỗi bí mật tùy ý).
4. Deploy xong có link dạng `https://<tên-service>.onrender.com`. Free tier ngủ sau 15 phút không có người xem, lần mở đầu mất 30–60 s.

Dữ liệu lưu trên Upstash: phản hồi (`/api/feedback`, tối đa 500 mục, xem bằng `/api/feedback?key=ADMIN_KEY`) và lượt mở từng bài (`/api/stats`). Không có biến Upstash thì server ghi file JSON vào `var/` (mất khi Render restart).

## Tác giả

Trần Quốc Thành · [GitHub](https://github.com/thanhtq2701-alt)
