# Demo Báo Cáo Sản Lượng (Logistics Production Report)

**Brand:** BVBB | AIGU — **Anh Đạt** (IT Logistics)

UI demo báo cáo sản lượng logistics, dùng dữ liệu mock, gửi dev team tích hợp vào `bvbb-master`.

## Stack

- **Backend:** Python Flask (`app.py`), mock data in-memory (`random.seed(42)`)
- **Frontend:** Vanilla JS, Chart.js (CDN), SheetJS (CDN)
- **CSS:** Style.css tự viết (chưa DaisyUI)
- **Database:** Chưa có (đang mock data)

## Nghiệp vụ chính

1. **Báo cáo tổng hợp** — 49 KH, lọc ngày/loại hình/C/O, biểu đồ đường/cột, xem theo Tháng/Quý/Năm
2. **Chi tiết lô hàng** — danh sách lô, check Khai báo/Điều độ, Xuất Excel, kèm Lines/FWD + Trucking Company
3. **Widget** — 5 KH mới nhất / 5 KH lâu nhất (hoặc Top 5 nhiều/ít nhất cho Trucking/Lines)

## Tính năng đã làm

- **3 view buttons:** Khách hàng | Trucking Company | Lines/FWD — highlight + shadow khi active
- Mỗi view có dropdown filter riêng (KH / Hãng tàu / Cty vận tải) — checkbox + Clear all + search
- **Entity view** (no filter): table tổng hợp tất cả entities, 6 cột (Tên, Số Lô, Tờ Khai, Cont, Thao Tác)
- **Monthly view** (có filter): aggregate theo tháng, 5 cột (Tháng, Số Lô, Tờ Khai, Cont)
- Chart ẩn khi chưa chọn entity (Trucking/Lines); hiện khi đã chọn
- Mock data: 9 hãng tàu (MSC, CMA CGM, COSCO...) + 8 cty vận tải (BẢO AN, THÁI DŨNG...)
- Sort cột theo width (%) cố định, table-layout: fixed
- Dropdown KH: Clear all, filter KH
- Datalabels trên biểu đồ, giới hạn 24 tháng
- Mở rộng data: 3 KH đầu có data 2025-01 → 2026-06
- Xem theo Tháng / Quý / Năm
- Widget Recent / Dormant (KH) hoặc Top 5 nhiều/ít nhất (Trucking/Lines)
- Detail page: thêm cột Lines/FWD + Trucking Company, Excel export kèm 2 cột này

## Cài đặt và chạy

```bash
cd C:\Users\TunDat\Desktop\demo_bao_cao_project
python app.py
# Mở http://127.0.0.1:5000
```

## Cấu trúc thư mục

```
demo_bao_cao_project/
├── app.py                          # Backend Flask — 6 API endpoints
├── _context.md                     # File snapshot cho AI sessions
├── ROADMAP.md
├── HUONG_DAN_CHAY.md
├── IMPLEMENTATION_PLAN_TEMPLATE.md
├── Demo_Bao_Cao_San_Luong.html     # Standalone demo cũ
├── Demo_Details.html               # Standalone demo cũ
├── static/
│   ├── css/style.css               # Stylesheet + button view group styles
│   └── js/main.js                  # Frontend: 3 views, 3 dropdowns, chart, table, export
├── templates/
│   ├── index.html                  # Báo cáo tổng hợp (3 tab view + dropdown động)
│   └── details.html                # Chi tiết lô hàng (kèm cột Lines/FWD + Trucking Company)
└── .opencode/
    └── agents/
        └── technical-writer.md
```

## API Endpoints

| Route | Params | Mô tả |
|---|---|---|
| `/api/customers` | — | Danh sách KH |
| `/api/lines` | — | Danh sách hãng tàu |
| `/api/trucking` | — | Danh sách cty vận tải |
| `/api/data` | `group, from_date, to_date, type, co_filter, customers, entities` | Dữ liệu báo cáo |
| `/api/shipments` | `customer, lines, trucking_comp, from_date, to_date, type, co_filter` | Chi tiết lô hàng |

## Kế hoạch

Xem [ROADMAP.md](ROADMAP.md) — mục tiêu: đổi style sang DaisyUI chuẩn `bvbb-master`.
