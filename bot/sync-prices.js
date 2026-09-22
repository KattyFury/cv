// Bot lấy giá hằng ngày cho tab Valuation.
//
//   CoinGecko  → atm (giá hiện tại) · ath · athDate     — cho TẤT CẢ dự án
//   Binance    → atl (đáy trong khoảng [lên sàn → ngày ATH])  — cho dự án có binanceSymbol
//
// ⚠️ KHÔNG đụng `priceTGE`. Giá lúc TGE là dữ kiện lịch sử, chỉ có MỘT giá trị,
//    do chủ site nhập tay và nằm ở key `val-projects`. Bot chỉ ghi `val-prices`.
//
// ⚠️ Gọi Binance bằng fetch REST THẲNG, KHÔNG qua `binance-cli` — đã verify CLI bỏ
//    qua tham số --start-time nên không lấy được lịch sử (xem HANDOFF, Failed Approaches).
//
// ⚠️ Binance trả HTTP 451 cho server ở một số quốc gia (Apps Script từng dính). Đó là
//    lý do bot chạy ở máy nhà bằng Docker chứ không phải Cloudflare Worker.
//
// Ghi kết quả theo 2 đường, tự chọn cái nào có cấu hình:
//   1. POST /api/val  (cần ADMIN_PASS)              — đường chuẩn, đi qua whitelist của server
//   2. Ghi thẳng KV   (cần CLOUDFLARE_API_TOKEN)    — đường dự phòng, không cần mật khẩu

const SITE = process.env.SITE_URL || 'https://0xhieu.xyz';
const KV_NS = process.env.KV_NAMESPACE_ID || 'b8fab2f8a83f45f0a023d2ba3ce78cde';
const ADMIN_PASS = process.env.ADMIN_PASS || '';
const CF_ACCOUNT = process.env.CLOUDFLARE_ACCOUNT_ID || '';
const CF_TOKEN = process.env.CLOUDFLARE_API_TOKEN || '';
const RUN_AT_HOUR = Number(process.env.RUN_AT_HOUR ?? 2);   // giờ chạy hằng ngày (giờ máy)
const ONCE = process.env.RUN_ONCE === 'true';

const log = (...a) => console.log(new Date().toISOString().slice(0, 19).replace('T', ' '), ...a);
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function getJson(url, tries = 3) {
  for (let i = 1; i <= tries; i++) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(30000) });
      if (res.status === 451) throw new Error('HTTP 451 — Binance chặn IP/quốc gia này');
      if (res.status === 429) { await sleep(20000 * i); continue; }   // bị rate limit → chờ rồi thử lại
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return await res.json();
    } catch (e) {
      if (i === tries) throw e;
      await sleep(2000 * i);
    }
  }
}

// ── 1. Lấy danh sách dự án từ chính site ────────────────────────────
async function loadProjects() {
  const d = await getJson(`${SITE}/api/val`);
  if (!d.ok) throw new Error('api/val trả lỗi: ' + d.error);
  return d.projects || [];
}

// ── 2. CoinGecko: giá hiện tại + ATH + ngày ATH ─────────────────────
// Gọi 1 lần cho tối đa 250 id (78 dự án thì đủ 1 lần), tránh đụng rate limit free tier.
async function fetchCoinGecko(projects) {
  const ids = [...new Set(projects.map(p => p.cgId).filter(Boolean))];
  const out = {};
  for (let i = 0; i < ids.length; i += 250) {
    const chunk = ids.slice(i, i + 250);
    const url = 'https://api.coingecko.com/api/v3/coins/markets'
      + '?vs_currency=usd&per_page=250&sparkline=false&ids=' + chunk.join(',');
    const rows = await getJson(url);
    for (const r of rows) {
      out[r.id] = {
        atm: r.current_price ?? null,
        ath: r.ath ?? null,
        athDate: r.ath_date ? r.ath_date.slice(0, 10) : null,
      };
    }
    if (i + 250 < ids.length) await sleep(15000);
  }
  return out;
}

// ── 3. Binance: đáy trong khoảng [lên sàn → ngày ATH] ───────────────
// Bỏ NẾN ĐẦU TIÊN (ngày lên sàn) vì râu nến hôm đó không phải giá trade được.
async function fetchAtl(symbol, athDate) {
  if (!symbol || !athDate) return null;
  const athMs = Date.parse(athDate + 'T23:59:59Z');
  if (!Number.isFinite(athMs)) return null;

  for (const base of ['https://api.binance.com/api/v3', 'https://fapi.binance.com/fapi/v1']) {
    let candles = [], cursor = 0;
    try {
      for (let page = 0; page < 5; page++) {
        const url = `${base}/klines?symbol=${symbol}&interval=1d&startTime=${cursor}&limit=1000`;
        const k = await getJson(url, 2);
        if (!k.length) break;
        candles = candles.concat(k);
        if (k[k.length - 1][0] >= athMs) break;     // đã vượt ngày ATH, không cần kéo nữa
        cursor = k[k.length - 1][0] + 86400000;
        if (k.length < 1000) break;
        await sleep(150);
      }
    } catch { continue; }                            // symbol không có ở sàn này → thử sàn kia
    if (!candles.length) continue;

    const window = candles.slice(1).filter(c => c[0] < athMs);   // bỏ nến listing + chỉ lấy trước ATH
    if (!window.length) return null;                             // ATH rơi ngay ngày lên sàn
    let lo = Infinity, loAt = null;
    for (const c of window) {
      const low = parseFloat(c[3]);
      if (low > 0 && low < lo) { lo = low; loAt = c[0]; }
    }
    if (!Number.isFinite(lo)) return null;
    return { atl: lo, atlDate: new Date(loAt).toISOString().slice(0, 10) };
  }
  return null;
}

// ── 4. Ghi kết quả ──────────────────────────────────────────────────
async function writePrices(prices) {
  if (ADMIN_PASS) {
    const res = await fetch(`${SITE}/api/val`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ pass: ADMIN_PASS, action: 'prices', prices }),
      signal: AbortSignal.timeout(30000),
    });
    const d = await res.json().catch(() => ({}));
    if (!d.ok) throw new Error('POST /api/val hỏng: ' + (d.error || res.status));
    return `POST /api/val — ${d.count} dự án`;
  }
  if (CF_TOKEN && CF_ACCOUNT) {
    const url = `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT}`
      + `/storage/kv/namespaces/${KV_NS}/values/val-prices`;
    const res = await fetch(url, {
      method: 'PUT',
      headers: { Authorization: 'Bearer ' + CF_TOKEN, 'content-type': 'text/plain' },
      body: JSON.stringify(prices),
      signal: AbortSignal.timeout(30000),
    });
    const d = await res.json().catch(() => ({}));
    if (!d.success) throw new Error('Ghi KV hỏng: ' + JSON.stringify(d.errors || res.status));
    return `ghi thẳng KV — ${Object.keys(prices).length} dự án`;
  }
  throw new Error('Chưa có ADMIN_PASS lẫn CLOUDFLARE_API_TOKEN — không biết ghi vào đâu');
}

// ── Một lượt chạy ───────────────────────────────────────────────────
async function runOnce() {
  const t0 = Date.now();
  const projects = await loadProjects();
  log(`nạp ${projects.length} dự án từ ${SITE}/api/val`);

  const cg = await fetchCoinGecko(projects);
  log(`CoinGecko trả ${Object.keys(cg).length} / ${projects.length}`);

  const prices = {};
  let nAtl = 0, nSkip = 0;
  for (const p of projects) {
    const row = {};
    const c = p.cgId ? cg[p.cgId] : null;
    if (c) {
      if (c.atm != null) row.atm = c.atm;
      if (c.ath != null) row.ath = c.ath;
      if (c.athDate) row.athDate = c.athDate;
    }
    if (p.binanceSymbol && row.athDate) {
      const a = await fetchAtl(p.binanceSymbol, row.athDate);
      if (a) { row.atl = a.atl; row.atlDate = a.atlDate; nAtl++; } else nSkip++;
      await sleep(120);
    }
    if (Object.keys(row).length) {
      row.updatedAt = new Date().toISOString();
      prices[p.ticker] = row;
    }
  }

  log(`có giá: ${Object.keys(prices).length} · có đáy: ${nAtl} · không tính được đáy: ${nSkip}`);
  log('đã ghi:', await writePrices(prices));
  log(`xong sau ${Math.round((Date.now() - t0) / 1000)}s`);
}

// ── Lịch chạy: chạy ngay 1 lượt, rồi mỗi ngày đúng RUN_AT_HOUR ──────
function msUntilNextRun() {
  const now = new Date();
  const next = new Date(now);
  next.setHours(RUN_AT_HOUR, 0, 0, 0);
  if (next <= now) next.setDate(next.getDate() + 1);
  return next - now;
}

async function main() {
  log(`bot khởi động · site=${SITE} · ghi bằng ${ADMIN_PASS ? 'ADMIN_PASS' : 'Cloudflare API'}`);
  try { await runOnce(); } catch (e) { log('LỖI:', e.message); }
  if (ONCE) return;
  for (;;) {
    const wait = msUntilNextRun();
    log(`lượt sau sau ${Math.round(wait / 60000)} phút (${RUN_AT_HOUR}h)`);
    await sleep(wait);
    try { await runOnce(); } catch (e) { log('LỖI:', e.message); }
  }
}

main();
