from flask import Flask, render_template, request, jsonify

app = Flask(__name__)

# Danh sách khách hàng kèm ID
SHIPPING_LINES = ["MSC","CMA CGM","COSCO","EVERGREEN","ONE","YANG MING","ZIM","HAPAG-LLOYD","MATSON"]
TRUCKING_COMPANIES = ["BẢO AN","THÁI DŨNG","HOÀNG PHÚC","TÂN ĐẠI LỘ","MINH QUỐC","ĐỨC THỊNH","HẢI VÂN","PHƯỚC LỘC"]

CUSTOMERS = [
    { "id": "VT", "name": "Việt Thiên" }, { "id": "PVN", "name": "PEGATRON VN" }, { "id": "FLAT", "name": "FLAT (VIETNAM)" },
    { "id": "AZW", "name": "AZUREWAVE" }, { "id": "VNT", "name": "Vĩ Nguyệt Tân" }, { "id": "HT", "name": "HOA THÁI" },
    { "id": "WA", "name": "WAACONG" }, { "id": "CR", "name": "CURRENT" }, { "id": "BBL", "name": "BBL HOME" },
    { "id": "KS", "name": "KINGSTAR" }, { "id": "IMD", "name": "IMD" }, { "id": "KF", "name": "KF" },
    { "id": "CF", "name": "CHUANGFU" }, { "id": "WY", "name": "WANYANG" }, { "id": "SAB", "name": "SAB" },
    { "id": "SIN", "name": "SINNOTECH" }, { "id": "INV", "name": "INNOVATION" }, { "id": "ABLE", "name": "ABLE" },
    { "id": "PCC", "name": "PRECISION CRAFT COMPONENT" }, { "id": "THK", "name": "THK" },
    { "id": "GRX", "name": "GREENWORKS" }, { "id": "CS", "name": "CANH SINH" }, { "id": "TEST", "name": "TEST" },
    { "id": "HL", "name": "Hằng Lực" }, { "id": "USI", "name": "USI" }, { "id": "PHP", "name": "PEGATRON HP" },
    { "id": "GRW", "name": "GREENWORK" }, { "id": "ISUN", "name": "ISUN" }, { "id": "DD", "name": "ĐẠI DƯƠNG" },
    { "id": "KVT", "name": "KHANG VẠN THÀNH" }, { "id": "SHARETECH", "name": "SHARETECH" },
    { "id": "NEFAB", "name": "NEFAB" }, { "id": "LS", "name": "LESSO" }, { "id": "ALU", "name": "ALUMINIUM" },
    { "id": "PC", "name": "HE THONG PC" }, { "id": "TA", "name": "TÍN AN" }, { "id": "IG", "name": "I-GREEN" },
    { "id": "BORUI", "name": "BORUI" }, { "id": "TR", "name": "Thép Rồng" }, { "id": "HY", "name": "HONGYUE" },
    { "id": "GMH", "name": "GMH" }, { "id": "MICIN", "name": "MICIN" }, { "id": "UT", "name": "ƯU THỊNH" },
    { "id": "DKHT", "name": "ĐIỆN KHÍ HOA THÁI" }, { "id": "TDP", "name": "TDP" }, { "id": "TG", "name": "TAOGLAS" },
    { "id": "HV", "name": "HƯNG VƯỢNG" }, { "id": "XT", "name": "XIONGTAI" }, { "id": "HD", "name": "HODA" },
    { "id": "TL", "name": "TAM LONG" }, { "id": "DL", "name": "DIGLOO" }, { "id": "HPH", "name": "HAI THANH" }
]

import random
from datetime import datetime, timedelta

# Tạo dữ liệu cho khoảng thời gian rộng (2025-01 đến 2026-06)
months = []
for y in [2025, 2026]:
    for m in range(1, 13):
        if y == 2026 and m > 6: break
        months.append(f"{y}-{m:02d}")

FIRST_THREE_NAMES = {c['name'] for c in CUSTOMERS[:3]}

# Gán tháng bắt đầu phát sinh
CUSTOMER_START_DATE = {}
for c in CUSTOMERS:
    if c['name'] in FIRST_THREE_NAMES:
        CUSTOMER_START_DATE[c['name']] = months[0]
    else:
        CUSTOMER_START_DATE[c['name']] = months[-6]

def mo(m):
    return int(m[:4])

def rnd(a, b):
    return random.randint(a, b)

# --- Mock data CHI TIẾT LÔ HÀNG (từng lô riêng lẻ) ---
SHIPMENT_LOTS = []
random.seed(42)

for c in CUSTOMERS:
    cust_id   = c["id"]
    cust_name = c["name"]
    is_first  = cust_name in FIRST_THREE_NAMES
    start_month   = CUSTOMER_START_DATE[cust_name]
    active_months = [m for m in months if m >= start_month]

    lot_seq = 1

    for month in active_months:
        y = mo(month)
        if is_first and y < 2026:
            num_lots = rnd(1, 2)
            d_range, c_range = (1, 3), (1, 5)
        elif is_first:
            num_lots = rnd(2, 4)
            d_range, c_range = (3, 10), (5, 15)
        else:
            num_lots = rnd(2, 6)
            d_range, c_range = (1, 15), (1, 30)

        for _ in range(num_lots):
            day      = random.randint(1, 28)
            rcv_date = f"{month}-{day:02d}"
            r_type   = random.choice(["IM", "EX", "EX"])
            has_co   = (r_type == "EX") and (random.random() > 0.4)

            year_suffix = month[2:4]
            month_part  = month[5:7]
            type_code   = "X" if r_type == "EX" else ""
            seq_str     = f"{lot_seq:02d}" if lot_seq < 100 else str(lot_seq)
            lot_code    = f"BV{cust_id}{type_code}{year_suffix}.{month_part}-{seq_str}"

            SHIPMENT_LOTS.append({
                "lot_code":          lot_code,
                "customer":          cust_name,
                "cust_id":           cust_id,
                "type":              r_type,
                "has_co":            has_co,
                "lines":             random.choice(SHIPPING_LINES),
                "trucking_comp":     random.choice(TRUCKING_COMPANIES),
                "rcv_date":          rcv_date,
                "month":             month,
                "declarations":      rnd(*d_range),
                "containers":        rnd(*c_range),
                "status_declared":   random.random() > 0.25,
                "status_dispatched": random.random() > 0.35,
            })
            lot_seq += 1

# --- Aggregate SHIPMENT_LOTS → RAW_DATA (khớp với chi tiết) ---
from collections import defaultdict
_raw_agg = defaultdict(lambda: {"orders": 0, "declarations": 0, "containers": 0, "rcv_date": None, "cust_id": None})

for lot in SHIPMENT_LOTS:
    key = (lot["customer"], lot["month"], lot["type"], lot["has_co"])
    _raw_agg[key]["orders"] += 1
    _raw_agg[key]["declarations"] += lot["declarations"]
    _raw_agg[key]["containers"] += lot["containers"]
    _raw_agg[key]["cust_id"] = lot["cust_id"]
    if _raw_agg[key]["rcv_date"] is None or lot["rcv_date"] < _raw_agg[key]["rcv_date"]:
        _raw_agg[key]["rcv_date"] = lot["rcv_date"]

RAW_DATA = []
for (customer, month, r_type, has_co), vals in _raw_agg.items():
    RAW_DATA.append({
        "id": vals["cust_id"],
        "customer": customer,
        "type": r_type,
        "has_co": has_co,
        "orders": vals["orders"],
        "declarations": vals["declarations"],
        "containers": vals["containers"],
        "RCV_date": vals["rcv_date"],
        "month": month
    })
del _raw_agg

# --- Tính last_rcv cho mỗi khách hàng ---
CUSTOMER_LAST_RCV = {}
for item in RAW_DATA:
    name = item['customer']
    rcv = item['RCV_date']
    if name not in CUSTOMER_LAST_RCV or rcv > CUSTOMER_LAST_RCV[name]:
        CUSTOMER_LAST_RCV[name] = rcv


# ================================================================
# ROUTES
# ================================================================

@app.route('/')
def index():
    return render_template('index.html')


@app.route('/details')
def details():
    return render_template('details.html')


@app.route('/api/customers')
def get_customers():
    return jsonify(CUSTOMERS)


@app.route('/api/lines')
def get_lines():
    lines_set = sorted(set(l['lines'] for l in SHIPMENT_LOTS))
    return jsonify([{"id": l, "name": l} for l in lines_set])


@app.route('/api/trucking')
def get_trucking():
    comps_set = sorted(set(l['trucking_comp'] for l in SHIPMENT_LOTS))
    return jsonify([{"id": c, "name": c} for c in comps_set])


@app.route('/api/data')
def get_data():
    from_date       = request.args.get('from_date', '')
    to_date         = request.args.get('to_date', '')
    customers_param = request.args.get('customers', '')
    entities_param  = request.args.get('entities', '')
    report_type     = request.args.get('type', 'ALL')
    co_filter       = request.args.get('co_filter', 'ALL')
    group           = request.args.get('group', 'customer')

    selected_customers = []
    if customers_param:
        try:
            import json
            selected_customers = json.loads(customers_param)
        except Exception:
            selected_customers = []

    selected_entities = []
    if entities_param:
        try:
            import json
            selected_entities = json.loads(entities_param)
        except Exception:
            selected_entities = []

    # --- Filter lots ---
    lots = SHIPMENT_LOTS
    if from_date:
        lots = [l for l in lots if l['rcv_date'] >= from_date]
    if to_date:
        lots = [l for l in lots if l['rcv_date'] <= to_date]
    if selected_customers:
        lots = [l for l in lots if l['customer'] in selected_customers]
    if report_type != 'ALL':
        lots = [l for l in lots if l['type'] == report_type]
    if co_filter == 'YES':
        lots = [l for l in lots if l['has_co'] is True]
    elif co_filter == 'NO':
        lots = [l for l in lots if l['has_co'] is False]

    if group == 'customer':
        return _group_customer(lots, from_date, to_date, selected_customers)
    elif group == 'lines':
        return _group_lines(lots, selected_entities)
    else:
        return _group_trucking(lots, selected_entities)


def _group_customer(lots, from_date, to_date, selected_customers=[]):
    table_agg = {}
    chart     = {}

    for l in lots:
        cust_name = l['customer']
        cust_id   = l['cust_id']
        if cust_id not in table_agg:
            all_dates = [x['rcv_date'] for x in SHIPMENT_LOTS if x['customer'] == cust_name]
            first_rcv = min(all_dates) if all_dates else ""
            last_rcv  = CUSTOMER_LAST_RCV.get(cust_name, "")
            is_new    = False
            if from_date and to_date:
                is_new = (from_date <= first_rcv <= to_date)
            table_agg[cust_id] = {
                "id": cust_id, "customer": cust_name,
                "orders": 0, "declarations": 0, "containers": 0,
                "first_rcv": first_rcv, "last_rcv": last_rcv, "is_new": is_new
            }
        table_agg[cust_id]['orders']       += 1
        table_agg[cust_id]['declarations'] += l['declarations']
        table_agg[cust_id]['containers']   += l['containers']

        m = l['month']
        if cust_name not in chart:
            chart[cust_name] = {month: 0 for month in months}
        chart[cust_name][m] += 1

    cust_list = list(table_agg.values())
    by_rcv = sorted(cust_list, key=lambda x: x['last_rcv'], reverse=True)
    recent = [{"customer": c['customer'], "last_rcv": c['last_rcv']} for c in by_rcv[:5]]
    dormant = [{"customer": c['customer'], "last_rcv": c['last_rcv']} for c in by_rcv[-5:]]
    dormant.reverse()

    sc = len(selected_customers)
    return jsonify({
        "group": "customer",
        "table": cust_list,
        "chart": chart,
        "months": months,
        "new_customers_count": len([v for v in cust_list if v['is_new']]),
        "recent_customers": recent,
        "dormant_customers": dormant,
        "selected_count": sc
    })


def _group_entity(lots, field, entities):
    """Generic grouping: field='lines'/'trucking_comp'.
       1 entity → monthly breakdown table + line chart.
       0 or 2+ entities → entity-aggregated table."""
    if entities:
        lots = [l for l in lots if l[field] in entities]

    sc = len(entities) if entities else 0

    if entities and sc == 1:
        # 1 entity → monthly breakdown
        monthly = {}
        for l in lots:
            m = l['month']
            if m not in monthly:
                monthly[m] = {"month": m, "orders": 0, "declarations": 0, "containers": 0}
            monthly[m]['orders']       += 1
            monthly[m]['declarations'] += l['declarations']
            monthly[m]['containers']   += l['containers']
        table = sorted(monthly.values(), key=lambda x: x['month'])
        chart = {entities[0]: {month: 0 for month in months}}
        for row in table:
            chart[entities[0]][row['month']] = row['orders']
        return jsonify({
            "group": field,
            "table": table,
            "chart": chart,
            "months": months,
            "has_filter": True,
            "filter_name": entities[0],
            "selected_count": sc
        })

    # 0 or 2+ entities → entity list
    agg = {}
    chart = {}
    for l in lots:
        name = l[field]
        if name not in agg:
            agg[name] = {"id": name, "name": name, "orders": 0, "declarations": 0, "containers": 0}
        agg[name]['orders']       += 1
        agg[name]['declarations'] += l['declarations']
        agg[name]['containers']   += l['containers']
        m = l['month']
        if name not in chart:
            chart[name] = {month: 0 for month in months}
        chart[name][m] += 1

    entries = list(agg.values())

    if entities:
        return jsonify({
            "group": field,
            "table": entries,
            "chart": chart,
            "months": months,
            "has_filter": True,
            "filter_name": entities[0],
            "selected_count": sc
        })

    by_orders = sorted(entries, key=lambda x: x['orders'], reverse=True)
    top_most  = [{"name": e['name'], "orders": e['orders']} for e in by_orders[:5]]
    top_least = [{"name": e['name'], "orders": e['orders']} for e in by_orders[-5:]]
    top_least.reverse()

    return jsonify({
        "group": field,
        "table": entries,
        "chart": chart,
        "months": months,
        "top_most":  top_most,
        "top_least": top_least,
        "has_filter": False,
        "selected_count": 0
    })


def _group_lines(lots, entities=None):
    return _group_entity(lots, 'lines', entities or [])

def _group_trucking(lots, entities=None):
    return _group_entity(lots, 'trucking_comp', entities or [])


@app.route('/api/shipments')
def get_shipments():
    """Danh sách lô hàng chi tiết theo bộ lọc."""
    customer       = request.args.get('customer',       '')
    lines_filter   = request.args.get('lines',          '')
    trucking_filter = request.args.get('trucking_comp', '')
    from_date      = request.args.get('from_date', '')
    to_date        = request.args.get('to_date',   '')
    report_type    = request.args.get('type',      'ALL')
    co_filter      = request.args.get('co_filter', 'ALL')

    filtered = SHIPMENT_LOTS

    if customer:
        filtered = [l for l in filtered if l['customer'] == customer]
    if lines_filter:
        filtered = [l for l in filtered if l['lines'] == lines_filter]
    if trucking_filter:
        filtered = [l for l in filtered if l['trucking_comp'] == trucking_filter]
    if from_date:
        filtered = [l for l in filtered if l['rcv_date'] >= from_date]
    if to_date:
        filtered = [l for l in filtered if l['rcv_date'] <= to_date]
    if report_type != 'ALL':
        filtered = [l for l in filtered if l['type'] == report_type]
    if co_filter == 'YES':
        filtered = [l for l in filtered if l['has_co'] is True]
    elif co_filter == 'NO':
        filtered = [l for l in filtered if l['has_co'] is False]

    filtered = sorted(filtered, key=lambda x: x['rcv_date'])

    return jsonify({
        "lots":  filtered,
        "total": len(filtered)
    })


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
