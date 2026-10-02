// /valuation — điền sẵn số vào HTML để AI/bot tải trang về là đọc được ngay
// (bình thường bảng + box "Recent TGE multiples" do JS vẽ sau khi tải → AI chỉ thấy "—").
//
// Chỉ ĐỌC KV (val-projects + val-prices), không ghi gì, không đổi giao diện:
// trình duyệt vẫn chạy JS như cũ và vẽ đè lên đúng các ô này bằng cùng con số.
//
// ⚠️ Công thức dưới đây CHÉP từ index.html (multiple · xMult · renderAnalysis · renderTable).
// Sửa công thức ở index.html thì phải sửa ở đây theo, không thì AI đọc ra số khác trang.
// Số in theo kiểu EN (dấu chấm thập phân) vì nhãn tĩnh trong HTML là tiếng Anh.

const readJson = async (kv, key, fallback) => {
  try { return JSON.parse(await kv.get(key) || JSON.stringify(fallback)); } catch { return fallback; }
};

const median = arr => {
  if (!arr.length) return null;
  const s = [...arr].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};

const vcFDVof   = e => e.fundraising / (e.vcAlloc / 100);
const vcPrice   = e => (!e.vcAlloc || !e.totalSupply) ? 0 : vcFDVof(e) / e.totalSupply;
const xMult     = (price, e) => { const vc = vcPrice(e); return vc > 0 && price > 0 ? price / vc : null; };
const multiple  = e => { const v = vcFDVof(e); return v > 0 ? (e.priceTGE * e.totalSupply) / v : 0; };
const fmtMult   = (n, dp = 2) => n > 0 ? n.toFixed(dp) : '—';
const fmtDate   = s => { if (!s) return '—'; const [y, m, d] = s.split('-'); return `${d}/${m}/${y.slice(2)}`; };
const esc       = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

function compute(projects, prices) {
  const entries = projects
    .filter(p => p.ticker && p.tgeDate && p.fundraising > 0)
    .map(p => {
      const px = prices[p.ticker] || {};
      return { ...p, ath: px.ath || 0, athDate: px.athDate || '', preAth: px.preAth || 0,
               athWick: !!px.athWick, atl: px.atl || 0, currentPrice: px.atm || 0 };
    });

  // Market condition — 6 deal TGE gần nhất (gộp mọi nhóm)
  const newest = [...entries].sort((a, b) => new Date(b.tgeDate) - new Date(a.tgeDate));
  const recent6 = newest.map(e => multiple(e)).filter(m => isFinite(m) && m > 0).slice(0, 6);
  const med = median(recent6);
  const condition = recent6.length ? (med >= 13 ? 'Strong' : med >= 4.3 ? 'Normal' : 'Weak') : '—';

  // Low / High FDV — tách ở 300M, 6 deal gần nhất (deal thứ 6 cách >60 ngày thì lấy 4)
  const SPLIT = 300e6;
  const pick = test => newest.filter(e => test(vcFDVof(e)))
    .map(e => ({ m: multiple(e), date: e.tgeDate })).filter(x => isFinite(x.m) && x.m > 0);
  const recentWindow = arr => {
    let n = Math.min(6, arr.length);
    if (arr.length >= 6 && (new Date(arr[0].date) - new Date(arr[5].date)) / 86400000 > 60) n = 4;
    return arr.slice(0, n).map(x => x.m);
  };
  const lowM  = recentWindow(pick(v => v < SPLIT));
  const highM = recentWindow(pick(v => v >= SPLIT));
  const low  = lowM.length  ? `×${median(lowM).toFixed(2)}`  : '—';
  const high = highM.length ? `×${median(highM).toFixed(2)}` : '—';

  // Bảng — cũ → mới, đúng cột như trang
  const rows = [...entries].sort((a, b) => new Date(a.tgeDate) - new Date(b.tgeDate)).map(e => {
    const athTooEarly = e.athWick || !e.athDate || !e.tgeDate ||
      (new Date(e.athDate) - new Date(e.tgeDate)) <= 7 * 86400000;
    const xATH = athTooEarly ? 0 : xMult(e.ath, e);
    const xPre = e.preAth ? xMult(e.preAth, e) : null;
    const athCell = xATH > 0 ? (xPre > 0 ? `${fmtMult(xPre)} → ${fmtMult(xATH)}` : fmtMult(xATH)) : '—';
    const hi = vcFDVof(e) >= SPLIT ? ' fdv-hi' : '';
    return `<tr data-ticker="${esc(e.ticker)}">
      <td class="td-ticker${hi}"><span class="ck">${esc(e.ticker)}</span></td>
      <td class="td-narrative"><span class="ck">${esc(e.narrative || '—')}</span></td>
      <td class="td-date"><span class="ck">${fmtDate(e.tgeDate)}</span></td>
      <td class="td-multi"><span class="ck">${fmtMult(multiple(e))}</span></td>
      <td class="td-multi td-ath"><span class="ck">${athCell}</span></td>
      <td class="td-multi"><span class="ck">${fmtMult(e.atl ? xMult(e.atl, e) : null)}</span></td>
      <td class="td-multi"><span class="ck">${fmtMult(xMult(e.currentPrice, e), 3)}</span></td>
    </tr>`;
  }).join('');

  return { low, high, condition, rows };
}

export async function onRequestGet({ request, env }) {
  const page = await env.ASSETS.fetch(new URL('/', request.url));
  if (!env.WORK) return page;

  let data;
  try {
    const [projects, prices] = await Promise.all([
      readJson(env.WORK, 'val-projects', []),
      readJson(env.WORK, 'val-prices', {}),
    ]);
    data = compute(projects, prices);
  } catch {
    return page;   // lỗi thì trả trang gốc, JS tự vẽ như trước
  }

  return new HTMLRewriter()
    .on('#baseline-low',         { element: el => el.setInnerContent(data.low) })
    .on('#baseline-high',        { element: el => el.setInnerContent(data.high) })
    .on('#market-condition-lvl', { element: el => el.setInnerContent(data.condition) })
    .on('#tge-tbody',            { element: el => el.setInnerContent(data.rows, { html: true }) })
    .transform(page);
}
