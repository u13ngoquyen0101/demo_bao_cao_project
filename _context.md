# Project Snapshot

## Tổng quan
- **Dự án:** `demo_bao_cao_project` — Báo cáo sản lượng Logistics (UI demo cho dev)
- **Brand:** BVBB | AIGU
- **Anh Đạt** — IT Logistics, cần UI demo gửi dev tích hợp vào bvbb-master
- **bvbb-master tham chiếu:** `D:\bvbb-master` (DaisyUI, fragment pattern, PostgreSQL)

## Stack
- Backend: Python Flask (`app.py`), mock data in-memory (seed=42)
- Frontend: Vanilla JS, Chart.js (CDN), SheetJS (CDN)
- Database: Chưa có (đang dùng mock data)
- CSS: Style.css tự viết (chưa DaisyUI)

## Cấu trúc thư mục
```
demo_bao_cao_project/
├── app.py                  # Backend Flask — 6 API endpoints
├── _context.md             # File snapshot này
├── ROADMAP.md
├── HUONG_DAN_CHAY.md
├── IMPLEMENTATION_PLAN_TEMPLATE.md
├── static/
│   ├── css/style.css       # Stylesheet + button view group styles
│   └── js/main.js          # Frontend: 3 views, 3 dropdowns, chart, table, export
├── templates/
│   ├── index.html          # Báo cáo tổng hợp (3 tab view + dropdown động)
│   └── details.html        # Chi tiết lô hàng (kèm cột Lines/FWD + Trucking Company)
└── Demo_*.html             # Standalone demo cũ
```

## Nghiệp vụ chính
1. **Báo cáo tổng hợp** — 49 KH, lọc ngày/loại hình/C/O, biểu đồ đường/cột, xem theo Tháng/Quý/Năm
2. **Chi tiết lô hàng** — danh sách lô, check Khai báo/Điều độ, Xuất Excel, kèm Lines/FWD + Trucking Company
3. **Widget** — 5 KH mới nhất / 5 KH lâu nhất (hoặc Top 5 nhiều/ít nhất cho Trucking/Lines)

## Tính năng đã làm
- 3 view buttons: **Khách hàng** | **Trucking Company** | **Lines/FWD** — highlight + shadow khi active
- Mỗi view có dropdown filter riêng (KH / Hãng tàu / Cty vận tải) — checkbox + Clear all + search
- **Entity view** (no filter): table tổng hợp tất cả entities, 6 cột (Tên, Số Lô, Tờ Khai, Cont, Thao Tác)
- **Monthly view** (có filter): aggregate theo tháng, 5 cột (Tháng, Số Lô, Tờ Khai, Cont)
- Chart ẩn khi chưa chọn entity (Trucking/Lines); hiện khi đã chọn
- Mock data: 9 hãng tàu (MSC, CMA CGM, COSCO...) + 8 cty vận tải (BẢO AN, THÁI DŨNG...)
- Sort cột theo width (%) cố định, table-layout: fixed, thẳng hàng tuyệt đối
- Dropdown KH: Clear all, filter KH
- Datalabels trên biểu đồ, giới hạn 24 tháng
- Mở rộng data: 3 KH đầu có data 2025-01 → 2026-06
- Xem theo Tháng / Quý / Năm
- Widget Recent / Dormant (KH) hoặc Top 5 nhiều/ít nhất (Trucking/Lines)
- Detail page: thêm cột Lines/FWD + Trucking Company, Excel export kèm 2 cột này

## API Endpoints
| Route | Params | Mô tả |
|---|---|---|
| `/api/customers` | — | Danh sách KH |
| `/api/lines` | — | Danh sách hãng tàu |
| `/api/trucking` | — | Danh sách cty vận tải |
| `/api/data` | group, from_date, to_date, type, co_filter, customers, entities | Dữ liệu báo cáo |
| `/api/shipments` | customer, lines, trucking_comp, from_date, to_date, type, co_filter | Chi tiết lô hàng |

---

## HDSD: Cách dùng file này

Khi mở **session chat mới**, hãy paste toàn bộ nội dung file `_context.md` này vào khung chat. AI (tôi) sẽ nhận diện được ngay:

- Dự án nào, stack gì, cấu trúc ra sao
- Anh là ai, vai trò gì
- Nghiệp vụ chính là gì
- Việc đã làm / đang làm / cần làm tiếp

→ **Không cần scan lại code**, tiết kiệm token và context.
