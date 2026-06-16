Chart.register(ChartDataLabels);

const MAX_CHART_MONTHS = 24;
const formatNumber = (num) => new Intl.NumberFormat('vi-VN').format(num);
let currentGroup = 'customer';

function getGroupKey(month, viewMode) {
    if (viewMode === 'year') return month.slice(0, 4);
    if (viewMode === 'quarter') {
        const m = parseInt(month.slice(5, 7), 10);
        return `${month.slice(0, 4)}-Q${Math.ceil(m / 3)}`;
    }
    return month;
}

function aggregateChartData(chartData, months, viewMode) {
    if (!viewMode || viewMode === 'month') return { labels: months, data: chartData };
    const labels = [];
    const seen = new Set();
    const data = {};
    for (const ent of Object.keys(chartData)) data[ent] = {};
    for (const month of months) {
        const key = getGroupKey(month, viewMode);
        if (!seen.has(key)) { seen.add(key); labels.push(key); }
        for (const ent of Object.keys(chartData)) {
            data[ent][key] = (data[ent][key] || 0) + (chartData[ent][month] || 0);
        }
    }
    return { labels, data };
}

function getMonthsInRange(fromDate, toDate) {
    if (!fromDate || !toDate) return null;
    const [fy, fm] = fromDate.split('-').map(Number);
    const [ty, tm] = toDate.split('-').map(Number);
    const count = (ty - fy) * 12 + (tm - fm) + 1;
    if (count > MAX_CHART_MONTHS) return { error: true, count };
    const months = [];
    for (let y = fy, m = fm; y < ty || (y === ty && m <= tm); ) {
        months.push(`${y}-${String(m).padStart(2, '0')}`);
        if (++m > 12) { m = 1; y++; }
    }
    return { error: false, months };
}

function updateSummaryLabels(group) {
    const el1 = document.getElementById('totalEntityLabel');
    const el2 = document.getElementById('newEntityLabel');
    const nEl = document.getElementById('newCustCount');
    const ncCard = document.getElementById('newCustomerCard');
    if (group === 'customer') {
        if (el1) el1.textContent = 'Tổng khách hàng giao dịch';
        if (el2) el2.textContent = 'Khách hàng mới phát sinh (RCV_date)';
        if (nEl) nEl.style.display = '';
        if (ncCard) ncCard.style.display = '';
    } else {
        if (el1) el1.textContent = 'Tổng số lượng';
        if (ncCard) ncCard.style.display = 'none';
    }
}

function updateWidgetTitles(group) {
    const rt = document.getElementById('recentWidgetTitle');
    const dt = document.getElementById('dormantWidgetTitle');
    if (group === 'customer') {
        if (rt) rt.innerHTML = '🟢 Mới nhất';
        if (dt) dt.innerHTML = '🔴 Lâu nhất chưa phát sinh';
    } else {
        if (rt) rt.innerHTML = '🟢 Nhiều nhất';
        if (dt) dt.innerHTML = '🔴 Ít nhất';
    }
}

// --- Column configs ---
const CUST_COLS = [
    { width: 'w-[5%]',  label: 'STT', align: 'text-center' },
    { width: 'w-[10%]', label: 'Mã KH' },
    { width: 'w-[25%]', label: 'Khách Hàng / Đối Tác' },
    { width: 'w-[12%]', label: 'Ngày bắt đầu' },
    { width: 'w-[12%]', label: 'Gần nhất' },
    { width: 'w-[12%]', label: 'Số Lô', align: 'text-right' },
    { width: 'w-[10%]', label: 'Tờ Khai', align: 'text-right' },
    { width: 'w-[8%]',  label: 'Cont', align: 'text-right' },
    { width: 'w-[10%]', label: 'Thao Tác', align: 'text-center' }
];
const ENTITY_COLS = [
    { width: 'w-[5%]',  label: 'STT', align: 'text-center' },
    { width: 'w-[47%]', label: 'Tên' },
    { width: 'w-[16%]', label: 'Số Lô', align: 'text-right' },
    { width: 'w-[14%]', label: 'Tờ Khai', align: 'text-right' },
    { width: 'w-[10%]', label: 'Cont', align: 'text-right' },
    { width: 'w-[8%]',  label: 'Thao Tác', align: 'text-center' }
];
const MONTHLY_COLS = [
    { width: 'w-[5%]',  label: 'STT', align: 'text-center' },
    { width: 'w-[25%]', label: 'Tháng' },
    { width: 'w-[25%]', label: 'Số Lô', align: 'text-right' },
    { width: 'w-[23%]', label: 'Tờ Khai', align: 'text-right' },
    { width: 'w-[22%]', label: 'Cont', align: 'text-right' }
];

function getCols(group, hasFilter, selectedCount) {
    if (group === 'customer') return CUST_COLS;
    if (hasFilter && selectedCount === 1) return MONTHLY_COLS;
    return ENTITY_COLS;
}

function updateTableHeaders(group, hasFilter, selectedCount) {
    const thead = document.querySelector('#reportTable thead');
    if (!thead) return;
    const cols = getCols(group, hasFilter, selectedCount);
    const isMonthly = hasFilter && selectedCount === 1;
    const nameLabel = group === 'lines' ? 'Hãng Tàu' : group === 'trucking_comp' ? 'Trucking Company' : '';
    let html = '<tr>';
    cols.forEach((c, i) => {
        let label = c.label;
        if (i === 1 && group !== 'customer' && !isMonthly) label = nameLabel;
        html += `<th class="${c.align || ''} ${c.width}">${label}</th>`;
    });
    html += '</tr>';
    thead.innerHTML = html;
}

function entityLabel(group) {
    if (group === 'lines') return 'Hãng tàu';
    if (group === 'trucking_comp') return 'Cty vận tải';
    return 'Khách hàng';
}

// --- Dropdown helpers ---
function getDropdownId(type) {
    return type === 'customer' ? 'customer' : type === 'lines' ? 'lines' : 'trucking';
}

function getSelectedEntities(type) {
    const id = getDropdownId(type);
    return Array.from(document.querySelectorAll(`#${id}Options input[type="checkbox"]:checked`)).map(cb => cb.value);
}

function updateSelectedText(type) {
    const id = getDropdownId(type);
    const checked = document.querySelectorAll(`#${id}Options input[type="checkbox"]:checked`);
    const textSpan = document.querySelector(`#${id}Dropdown .selected-text`);
    if (!textSpan) return;
    const allLabel = type === 'customer' ? '-- Tất cả Khách hàng --' : type === 'lines' ? '-- Tất cả Hãng tàu --' : '-- Tất cả Cty vận tải --';
    if (checked.length === 0) {
        textSpan.textContent = allLabel;
    } else if (checked.length === 1) {
        textSpan.textContent = checked[0].parentElement.textContent.trim();
    } else {
        textSpan.textContent = `Đã chọn (${checked.length})`;
    }
}

function clearSelection(type) {
    const id = getDropdownId(type);
    document.querySelectorAll(`#${id}Options input[type="checkbox"]`).forEach(cb => cb.checked = false);
    updateSelectedText(type);
    applyFilters();
}

function toggleDropdown(type) {
    const id = getDropdownId(type);
    const list = document.getElementById(`${id}List`);
    if (list) list.classList.toggle('show');
}

function filterCustomers(keyword, type) {
    const id = getDropdownId(type);
    const items = document.querySelectorAll(`#${id}Options .dropdown-item`);
    keyword = keyword.toLowerCase();
    items.forEach(item => {
        item.classList.toggle('hidden', !item.textContent.toLowerCase().includes(keyword));
    });
}

function initDropdown(type, apiUrl) {
    const id = getDropdownId(type);
    const container = document.getElementById(`${id}Options`);
    if (!container) return;
    fetch(apiUrl).then(r => r.json()).then(items => {
        container.innerHTML = '';
        const clearItem = document.createElement('div');
        clearItem.className = 'dropdown-item clear-all-item';
        clearItem.innerHTML = '<span class="text-red-500 font-semibold text-xs w-full text-center">✕ Clear all / Bỏ chọn tất cả</span>';
        clearItem.onclick = () => clearSelection(type);
        container.appendChild(clearItem);
        const divider = document.createElement('div');
        divider.style.cssText = 'height:1px;background:#eee;margin:4px 0;';
        container.appendChild(divider);
        items.forEach(item => {
            const label = document.createElement('label');
            label.className = 'dropdown-item';
            const name = item.name || item.id;
            label.innerHTML = `<input type="checkbox" value="${name}" onchange="updateSelectedText('${type}')"><span>${name}</span>`;
            container.appendChild(label);
        });
    }).catch(e => console.error(`Error loading ${type}:`, e));
}

function switchGroup(group) {
    currentGroup = group;
    document.querySelectorAll('#viewGroup .btn').forEach(b => {
        b.classList.toggle('btn-active', b.dataset.group === group);
    });
    document.getElementById('customerDropdown').style.display = group === 'customer' ? '' : 'none';
    document.getElementById('linesDropdown').style.display = group === 'lines' ? '' : 'none';
    document.getElementById('truckingDropdown').style.display = group === 'trucking_comp' ? '' : 'none';
    const fl = document.getElementById('filterLabel');
    if (fl) fl.textContent = entityLabel(group) + '/Đối tác:';
    updateTableHeaders(group, false, 0);
    updateSummaryLabels(group);
    updateWidgetTitles(group);
    const ws = document.getElementById('widgetSection');
    if (ws) ws.style.display = group === 'customer' ? '' : 'none';
    applyFilters();
}

function renderTable(data, group, hasFilter, selectedCount) {
    const tbody = document.getElementById('reportTableBody');
    const tfoot = document.getElementById('reportTableFoot');
    tbody.innerHTML = '';
    tfoot.innerHTML = '';

    const cols = getCols(group, hasFilter, selectedCount);
    const colCount = cols.length;
    const isMonthly = hasFilter && selectedCount === 1;

    if (data.length === 0) {
        tbody.innerHTML = `<tr><td colspan="${colCount}" class="text-center text-gray-400" style="padding: 40px;">Không có dữ liệu phù hợp</td></tr>`;
        if (document.getElementById('totalCustCount')) {
            document.getElementById('totalCustCount').innerText = '0';
            document.getElementById('totalOrdersCount').innerText = '0';
        }
        return;
    }

    let totalOrders = 0, totalDecls = 0, totalConts = 0;

    data.forEach((row, index) => {
        totalOrders += row.orders;
        totalDecls += row.declarations;
        totalConts += row.containers;

        const tr = document.createElement('tr');

        if (group === 'customer') {
            const newBadge = row.is_new ? '<span class="badge-new">MỚI</span>' : '';
            tr.innerHTML = `
                <td class="text-center ${cols[0].width}">${index + 1}</td>
                <td class="text-gray-500 font-semibold ${cols[1].width}">${row.id || '---'}</td>
                <td class="font-semibold text-gray-700 ${cols[2].width}">${row.customer} ${newBadge}</td>
                <td class="text-gray-500 text-xs ${cols[3].width}">${row.first_rcv || '---'}</td>
                <td class="text-gray-500 text-xs ${cols[4].width}">${row.last_rcv || '---'}</td>
                <td class="text-right ${cols[5].width}">${formatNumber(row.orders)}</td>
                <td class="text-right ${cols[6].width}">${formatNumber(row.declarations)}</td>
                <td class="text-right ${cols[7].width}">${formatNumber(row.containers)}</td>
                <td class="text-center ${cols[8].width}">
                    <button class="btn btn-ghost btn-xs text-primary" onclick="viewDetails('${row.customer.replace(/'/g, "\\'")}', 'customer')">Chi tiết</button>
                </td>
            `;
        } else if (isMonthly) {
            tr.innerHTML = `
                <td class="text-center ${cols[0].width}">${index + 1}</td>
                <td class="font-semibold text-gray-700 ${cols[1].width}">${row.month || '---'}</td>
                <td class="text-right ${cols[2].width}">${formatNumber(row.orders)}</td>
                <td class="text-right ${cols[3].width}">${formatNumber(row.declarations)}</td>
                <td class="text-right ${cols[4].width}">${formatNumber(row.containers)}</td>
            `;
        } else {
            tr.innerHTML = `
                <td class="text-center ${cols[0].width}">${index + 1}</td>
                <td class="font-semibold text-gray-700 ${cols[1].width}">${row.name || '---'}</td>
                <td class="text-right ${cols[2].width}">${formatNumber(row.orders)}</td>
                <td class="text-right ${cols[3].width}">${formatNumber(row.declarations)}</td>
                <td class="text-right ${cols[4].width}">${formatNumber(row.containers)}</td>
                <td class="text-center ${cols[5].width}">
                    <button class="btn btn-ghost btn-xs text-primary" onclick="viewDetails('${row.name.replace(/'/g, "\\'")}', '${group}')">Chi tiết</button>
                </td>
            `;
        }
        tbody.appendChild(tr);
    });

    if (document.getElementById('totalCustCount')) {
        document.getElementById('totalCustCount').innerText = data.length;
    }
    if (document.getElementById('totalOrdersCount')) {
        document.getElementById('totalOrdersCount').innerText = formatNumber(totalOrders);
    }

    const totalTr = document.createElement('tr');
    totalTr.className = 'summary-row';
    if (group === 'customer') {
        totalTr.innerHTML = `
            <td colspan="5" class="text-right text-gray-600">TỔNG CỘNG:</td>
            <td class="text-right ${cols[5].width}">${formatNumber(totalOrders)}</td>
            <td class="text-right ${cols[6].width}">${formatNumber(totalDecls)}</td>
            <td class="text-right ${cols[7].width}">${formatNumber(totalConts)}</td>
            <td class="text-center ${cols[8].width}"></td>
        `;
    } else if (!isMonthly) {
        totalTr.innerHTML = `
            <td colspan="2" class="text-right text-gray-600">TỔNG CỘNG:</td>
            <td class="text-right ${cols[2].width}">${formatNumber(totalOrders)}</td>
            <td class="text-right ${cols[3].width}">${formatNumber(totalDecls)}</td>
            <td class="text-right ${cols[4].width}">${formatNumber(totalConts)}</td>
            <td class="text-center ${cols[5].width}"></td>
        `;
    } else {
        totalTr.innerHTML = `
            <td colspan="2" class="text-right text-gray-600">TỔNG CỘNG:</td>
            <td class="text-right ${cols[2].width}">${formatNumber(totalOrders)}</td>
            <td class="text-right ${cols[3].width}">${formatNumber(totalDecls)}</td>
            <td class="text-right ${cols[4].width}">${formatNumber(totalConts)}</td>
        `;
    }
    tfoot.appendChild(totalTr);
}

function handleTypeChange() {
    const reportType = document.getElementById('typeFilter').value;
    const coFilter = document.getElementById('coFilter');
    const coFilterGroup = document.getElementById('coFilterGroup');
    if (reportType === 'EX') {
        coFilter.disabled = false;
        coFilterGroup.style.opacity = '1';
    } else {
        coFilter.disabled = true;
        coFilter.checked = false;
        coFilterGroup.style.opacity = '0.6';
    }
    applyFilters();
}

let analyticsChartInstance = null;

function toggleChart() {
    const chartArea = document.getElementById('chartArea');
    const btn = document.getElementById('toggleChartBtn');
    chartArea.classList.toggle('hidden');
    btn.innerHTML = chartArea.classList.contains('hidden') ? '📊 Hiện biểu đồ' : '📊 Ẩn biểu đồ';
}

function updateChart(chartData, months, fromDate, toDate, group, hasFilter, filterName, selectedCount) {
    const canvas = document.getElementById('analyticsChart');
    const chartCard = document.getElementById('chartArea');
    const chartTitle = document.getElementById('chartMainTitle');
    const placeholder = document.getElementById('chartPlaceholder');
    if (!canvas || !chartCard) return;
    const ctx = canvas.getContext('2d');

    chartCard.style.display = '';

    if (!selectedCount || selectedCount === 0) {
        canvas.style.display = 'none';
        if (placeholder) placeholder.style.display = 'flex';
        if (chartTitle) chartTitle.innerText = 'Phân tích xu hướng & So sánh sản lượng (Số Lô)';
        if (analyticsChartInstance) { analyticsChartInstance.destroy(); analyticsChartInstance = null; }
        return;
    }
    canvas.style.display = 'block';
    if (placeholder) placeholder.style.display = 'none';

    let errorEl = document.getElementById('chartRangeError');
    const range = getMonthsInRange(fromDate, toDate);
    if (range && range.error) {
        canvas.style.display = 'none';
        if (!errorEl) {
            errorEl = document.createElement('div');
            errorEl.id = 'chartRangeError';
            errorEl.className = 'text-center py-12 px-5 text-red-500 font-semibold text-base';
            chartCard.appendChild(errorEl);
        }
        chartTitle.innerText = 'Khoảng thời gian vượt quá giới hạn';
        errorEl.innerHTML = `Khoảng thời gian đã chọn (<strong>${range.count} tháng</strong>) vượt quá giới hạn tối đa <strong>${MAX_CHART_MONTHS} tháng</strong>. Vui lòng thu hẹp phạm vi lọc.`;
        if (analyticsChartInstance) { analyticsChartInstance.destroy(); analyticsChartInstance = null; }
        return;
    }
    canvas.style.display = 'block';
    if (errorEl) { errorEl.remove(); }

    let visibleMonths = months;
    if (range && range.months) {
        visibleMonths = months.filter(m => range.months.includes(m));
    }

    const viewMode = (document.getElementById('viewMode') || {}).value || 'month';
    const agg = aggregateChartData(chartData, visibleMonths, viewMode);
    const aggLabels = agg.labels;
    const aggData = agg.data;
    const viewLabel = viewMode === 'quarter' ? 'Theo Quý' : viewMode === 'year' ? 'Theo Năm' : 'Theo Tháng';

    if (analyticsChartInstance) {
        analyticsChartInstance.destroy();
    }

    const entities = Object.keys(aggData);
    let chartType = 'line';
    let datasets = [];

    const groupLabel = group === 'lines' ? 'Hãng Tàu' : group === 'trucking_comp' ? 'Trucking Company' : 'Khách Hàng';

    if (entities.length === 1) {
        const name = entities[0];
        chartTitle.innerText = `Xu hướng sản lượng (${viewLabel}): ${name}`;
        const data = aggLabels.map(m => aggData[name][m] || 0);
        datasets.push({
            label: name, data: data,
            borderColor: '#f26b21', backgroundColor: 'rgba(242, 107, 33, 0.1)',
            fill: false, tension: 0.1, pointRadius: 3
        });
    } else if (entities.length > 1 && entities.length <= 10) {
        chartType = 'bar';
        chartTitle.innerText = `So sánh sản lượng giữa các ${groupLabel} (Số Lô)`;
        const colors = ['#007bff', '#f26b21', '#28a745', '#dc3545', '#ffc107', '#17a2b8', '#6610f2', '#e83e8c', '#fd7e14', '#20c997'];
        entities.forEach((name, index) => {
            datasets.push({ label: name, data: [Object.values(aggData[name]).reduce((a, b) => a + b, 0)], backgroundColor: colors[index % colors.length] });
        });
        analyticsChartInstance = new Chart(ctx, {
            type: chartType, data: { labels: ['Tổng sản lượng'], datasets },
            options: {
                responsive: true, maintainAspectRatio: false, animation: { duration: 400 },
                scales: { y: { beginAtZero: true } },
                plugins: { datalabels: { anchor: 'end', align: 'end', color: '#333', font: { weight: 'bold', size: 12 }, formatter: (value) => formatNumber(value) || '' } }
            }
        });
        return;
    } else {
        chartTitle.innerText = `Phân tích xu hướng sản lượng chung (${viewLabel})`;
        const aggregateData = aggLabels.map(m => entities.reduce((sum, name) => sum + (aggData[name][m] || 0), 0));
        datasets.push({
            label: 'Tổng sản lượng', data: aggregateData,
            borderColor: '#007bff', backgroundColor: 'rgba(0, 123, 255, 0.1)',
            fill: false, tension: 0.1, pointRadius: 2
        });
    }

    analyticsChartInstance = new Chart(ctx, {
        type: chartType, data: { labels: aggLabels, datasets },
        options: {
            responsive: true, maintainAspectRatio: false, animation: { duration: 400 },
            scales: { y: { beginAtZero: true } },
            plugins: { datalabels: { anchor: 'end', align: 'top', color: '#444', font: { weight: 'bold', size: 10 }, formatter: (value) => value || '' } }
        }
    });
}

function renderRecentDormant(recent, dormant) {
    const rw = document.getElementById('recentWidget');
    const dw = document.getElementById('dormantWidget');
    if (rw) rw.innerHTML = recent.map(c => `<div class="wi"><span class="wi-name">${c.customer}</span><span class="wi-date">${c.last_rcv}</span></div>`).join('');
    if (dw) dw.innerHTML = dormant.map(c => `<div class="wi"><span class="wi-name">${c.customer}</span><span class="wi-date">${c.last_rcv}</span></div>`).join('');
}

function renderTopWidget(most, least) {
    const rw = document.getElementById('recentWidget');
    const dw = document.getElementById('dormantWidget');
    if (rw) rw.innerHTML = most.map(c => `<div class="wi"><span class="wi-name">${c.name}</span><span class="wi-date">${c.orders} lô</span></div>`).join('');
    if (dw) dw.innerHTML = least.map(c => `<div class="wi"><span class="wi-name">${c.name}</span><span class="wi-date">${c.orders} lô</span></div>`).join('');
}

async function applyFilters() {
    const fromDate = document.getElementById('fromDate').value;
    const toDate = document.getElementById('toDate').value;
    const reportType = document.getElementById('typeFilter').value;
    const isCoOnly = document.getElementById('coFilter').checked;
    const coFilter = isCoOnly ? 'YES' : 'ALL';

    const selectedCustomers = getSelectedEntities('customer');
    let selectedEntities = [];
    if (currentGroup === 'lines') selectedEntities = getSelectedEntities('lines');
    else if (currentGroup === 'trucking_comp') selectedEntities = getSelectedEntities('trucking');

    const isCust = currentGroup === 'customer';
    const loadingCols = isCust ? 9 : (selectedEntities.length === 1 ? 5 : 6);
    const tbody = document.getElementById('reportTableBody');
    tbody.innerHTML = `<tr><td colspan="${loadingCols}" class="text-center text-gray-400" style="padding: 40px;">Đang tải dữ liệu...</td></tr>`;

    try {
        let url = `/api/data?group=${currentGroup}&from_date=${fromDate}&to_date=${toDate}&type=${reportType}&co_filter=${coFilter}`;
        if (selectedCustomers.length > 0 && isCust) {
            url += `&customers=${encodeURIComponent(JSON.stringify(selectedCustomers))}`;
        }
        if (selectedEntities.length > 0 && !isCust) {
            url += `&entities=${encodeURIComponent(JSON.stringify(selectedEntities))}`;
        }

        const response = await fetch(url);
        if (!response.ok) throw new Error('Lỗi khi tải dữ liệu');
        const result = await response.json();

        setTimeout(() => {
            const hf = result.has_filter || false;
            const sc = result.selected_count !== undefined ? result.selected_count : (result.group === 'customer' ? selectedCustomers.length : selectedEntities.length);
            updateTableHeaders(result.group, hf, sc);
            renderTable(result.table, result.group, hf, sc);
            updateChart(result.chart, result.months, fromDate, toDate, result.group, hf, result.filter_name, sc);

            if (result.group === 'customer') {
                renderRecentDormant(result.recent_customers, result.dormant_customers);
            }
        }, 300);
    } catch (error) {
        console.error(error);
        const errCols = isCust ? 9 : 6;
        tbody.innerHTML = `<tr><td colspan="${errCols}" class="text-center text-error" style="padding: 40px;">Đã xảy ra lỗi khi tải dữ liệu!</td></tr>`;
    }
}

function viewDetails(name, group) {
    const fromDate  = document.getElementById('fromDate').value;
    const toDate    = document.getElementById('toDate').value;
    const typeFilter = document.getElementById('typeFilter').value;
    const isCoOnly  = document.getElementById('coFilter').checked;
    const coFilter  = isCoOnly ? 'YES' : 'ALL';

    const params = new URLSearchParams({ from_date: fromDate, to_date: toDate, type: typeFilter, co_filter: coFilter });
    if (group === 'customer') params.set('customer', name);
    else if (group === 'trucking_comp') params.set('trucking_comp', name);
    else if (group === 'lines') params.set('lines', name);

    window.open(`/details?${params.toString()}`, '_blank');
}

function exportExcel() {
    alert('Đang khởi tạo tiến trình xuất báo cáo ra Excel...');
}

// --- Close dropdowns on outside click ---
window.addEventListener('click', function(event) {
    ['customer', 'lines', 'trucking'].forEach(type => {
        const id = getDropdownId(type);
        if (!event.target.closest(`#${id}Dropdown`)) {
            const list = document.getElementById(`${id}List`);
            if (list && list.classList.contains('show')) list.classList.remove('show');
        }
    });
});

document.addEventListener('DOMContentLoaded', async () => {
    initDropdown('customer', '/api/customers');
    initDropdown('lines', '/api/lines');
    initDropdown('trucking', '/api/trucking');

    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
    const fromInput = document.getElementById('fromDate');
    const toInput = document.getElementById('toDate');
    if (fromInput && toInput) {
        fromInput.value = firstDay;
        toInput.value = lastDay;
    }

    document.getElementById('linesDropdown').style.display = 'none';
    document.getElementById('truckingDropdown').style.display = 'none';
    updateTableHeaders('customer', false, 0);
    updateSummaryLabels('customer');
    updateWidgetTitles('customer');
    applyFilters();
});
