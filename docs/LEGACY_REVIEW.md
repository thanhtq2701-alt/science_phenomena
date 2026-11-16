# Rà soát code gốc (bản Streamlit, nay nằm trong `old/streamlit/`)

Ngày rà soát: 2026-11-16. Bản gốc được giữ nguyên để tham chiếu; mọi phát triển mới nằm ở `web/`, `server/`, `data/`.

## Lỗi chạy (bug)

| File | Vấn đề | Hệ quả |
|---|---|---|
| `modules/calendar_tools.py` | Hàm `run_calendar()` được định nghĩa nhưng **không được gọi** (st.Page chạy file như script) | Trang "Project & Calendar" hiển thị trống |
| `modules/calendar_tools.py:36` | `st.dataframe(df, use_container_with_width=True)` – sai tên tham số (`use_container_width`) | TypeError khi hàm được gọi |
| `requirements.txt` | Thiếu `pandas` (calendar_tools import) | Lỗi ImportError khi deploy sạch |
| `modules/about.py:9` | Ảnh lấy từ CDN Facebook có chữ kí hết hạn (`oe=...`) | Ảnh sẽ vỡ sau vài tuần; lộ token trong repo |

## Sai về vật lí / nội dung

| File | Vấn đề |
|---|---|
| `modules/optics.py:19` | `focal_length = 5 / (power * (n - 0.5))` không phải công thức thấu kính. Đúng là `1/f = (n − 1)(1/R1 − 1/R2)` hoặc `1/f = 1/d + 1/d'`. |
| `modules/optics.py:28-32` | Mọi tia từ ngọn nến (cách thấu kính 5 đơn vị) đều hội tụ tại tiêu điểm – chỉ đúng khi nguồn ở vô cực. Với nguồn hữu hạn phải dùng `1/d + 1/d' = 1/f`. |
| `README.md` | Hứa hiển thị tần số riêng ωn, tỉ số tắt dần ζ, "System State" nhưng `modules/vibration.py` không tính/hiển thị. |

## Code chết / dọn dẹp

- `utils/helpers.py`: `apply_custom_style`, `format_metric` không được module nào import.
- `abc.py`: file nháp (in x, y, z).
- `README.md` mục "Deployment Instructions" chỉ có bước cài đặt, thiếu `streamlit run streamlit_app.py`.
- Không có test, không pin phiên bản thư viện.

## Quyết định cho phiên bản mới

1. Chuyển sang **JavaScript thuần + Canvas**, phục vụ bằng Express (`server/index.js`) để deploy Render dễ dàng (không cần Python runtime).
2. Port hai mô phỏng gốc sang JS với công thức đúng:
   - Dao động tắt dần (lò xo – giảm chấn): thêm ωn, ζ, phân loại tắt dần dưới/tới hạn/trên.
   - Thấu kính hội tụ: dựng ảnh đúng bằng `1/d + 1/d' = 1/f`, vẽ 3 tia đặc biệt.
3. Nội dung bám **Chương trình GDPT 2018 lớp 12** cho ba môn Hóa – Lí – Sinh (xem `data/curriculum.json`).
4. Bố cục repo tham khảo repo Hackathon: `app/ data/ docs/ old/ server/ tests/ tools/ web/`.
