// Bot lấy giá hằng ngày cho tab Valuation.
//
//   CoinGecko  → atm · ath · athDate · atl · atlDate    — cho TẤT CẢ dự án
//   Binance / Gate / Bybit → preAth (đáy TRƯỚC khi lập ATH) — hỏi lần lượt tới khi ra
//
// PHÂN BIỆT RÕ 2 CON SỐ ĐÁY (đừng lẫn, đã lẫn một lần rồi):
//   atl     = đáy THẬT SỰ của token, đúng nghĩa all-time low. Lấy từ CoinGecko.
//   preAth  = đáy trong khoảng [lên sàn → ngày ATH]. KHÔNG phải đáy lịch sử —
//             nó là mức chiều sâu trước khi token bật lên đỉnh. Hiện ghép chung ô
//             với ×ATH dạng "1,62 → 19,80".
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
        atl: r.atl ?? null,                                   // đáy THẬT SỰ, đúng nghĩa all-time low
        atlDate: r.atl_date ? r.atl_date.slice(0, 10) : null,
      };
    }
    if (i + 250 < ids.length) await sleep(15000);
  }
  return out;
}

// ── 3. Đáy TRƯỚC khi lập ATH — hỏi lần lượt 3 sàn ───────────────────
//
// VÌ SAO CẦN NHIỀU SÀN: Binance nhiều khi list token MUỘN HƠN ngày nó lập ATH
// (PLUME, NEWT là ví dụ thật) — lúc đó Binance không có nến nào trước đỉnh, trả
// về rỗng. Sàn khác list sớm hơn thì vẫn có. Hỏi lần lượt, sàn nào ra kết quả
// trước thì lấy.
//
// Bỏ NẾN ĐẦU TIÊN của mỗi sàn vì râu nến ngày mở giao dịch không phải giá
// trade được. Đây KHÔNG phải all-time low — xem ghi chú đầu file.

const sec = ms => Math.floor(ms / 1000);

// Mỗi sàn trả về mảng nến với thứ tự cột khác nhau → chuẩn hoá về {t, low}.
const EXCHANGES = [
  {
    name: 'binance',
    // Binance phân trang theo startTime; kéo tới khi vượt ngày ATH.
    async candles(sym, fromMs, toMs) {
      for (const base of ['https://api.binance.com/api/v3', 'https://fapi.binance.com/fapi/v1']) {
        let out = [], cursor = 0;
        try {
          for (let page = 0; page < 5; page++) {
            const k = await getJson(`${base}/klines?symbol=${sym}&interval=1d&startTime=${cursor}&limit=1000`, 2);
            if (!k.length) break;
            out = out.concat(k.map(c => ({ t: c[0], low: parseFloat(c[3]) })));
            if (k[k.length - 1][0] >= toMs || k.length < 1000) break;
            cursor = k[k.length - 1][0] + 86400000;
            await sleep(150);
          }
        } catch { continue; }
        if (out.length) return out;
      }
      return [];
    },
  },
  {
    name: 'gate',
    // Gate nhận thẳng cửa sổ from/to (giây). Cột: [ts, vol, close, high, low, open]
    async candles(sym, fromMs, toMs) {
      const pair = sym.replace(/USDT$/, '') + '_USDT';
      const url = 'https://api.gateio.ws/api/v4/spot/candlesticks'
        + `?currency_pair=${pair}&interval=1d&from=${sec(fromMs)}&to=${sec(toMs)}&limit=1000`;
      const k = await getJson(url, 2).catch(() => null);
      if (!Array.isArray(k)) return [];
      return k.map(c => ({ t: Number(c[0]) * 1000, low: parseFloat(c[4]) }));
    },
  },
  {
    name: 'bybit',
    // Bybit trả DESCENDING. Cột: [start, open, high, low, close, ...]
    async candles(sym, fromMs, toMs) {
      const url = 'https://api.bybit.com/v5/market/kline'
        + `?category=spot&symbol=${sym}&interval=D&start=${fromMs}&end=${toMs}&limit=1000`;
      const d = await getJson(url, 2).catch(() => null);
      const k = d && d.result && d.result.list;
      if (!Array.isArray(k) || !k.length) return [];
      return k.map(c => ({ t: Number(c[0]), low: parseFloat(c[3]) })).sort((a, b) => a.t - b.t);
    },
  },
];

async function fetchPreAth(symbol, tgeDate, athDate) {
  if (!symbol || !athDate) return null;
  const athMs = Date.parse(athDate + 'T23:59:59Z');
  const tgeMs = Date.parse((tgeDate || '1970-01-01') + 'T00:00:00Z');
  if (!Number.isFinite(athMs)) return null;

  let listedSomewhere = false;   // có sàn nào thật sự list token này không

  for (const ex of EXCHANGES) {
    let rows;
    try { rows = await ex.candles(symbol, tgeMs, athMs); } catch { continue; }
    if (!rows || !rows.length) continue;
    listedSomewhere = true;

    const win = rows.slice(1).filter(c => c.t < athMs && c.low > 0);   // bỏ nến mở giao dịch
    if (!win.length) continue;                                          // sàn này list sau ATH → thử sàn kế

    let lo = Infinity, loAt = null;
    for (const c of win) if (c.low < lo) { lo = c.low; loAt = c.t; }
    if (!Number.isFinite(lo)) continue;
    return { preAth: lo, preAthDate: new Date(loAt).toISOString().slice(0, 10), src: ex.name };
  }

  // Có sàn list nhưng KHÔNG sàn nào có nến trước ATH → token chỉ bắt đầu giao dịch
  // đúng ngày lập đỉnh. Đó là râu nến listing, không phải đỉnh thật — kể cả khi
  // ngày TGE ghi trong kho cách đó cả tháng (NEWT: TGE 08/05, lên sàn 24/06 = ngày ATH).
  if (listedSomewhere) return { athWick: true };
  return null;   // không sàn nào list → không kết luận được gì, cứ để nguyên ATH
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
  let nPre = 0, nSkip = 0, nWick = 0;
  const bySrc = {};
  for (const p of projects) {
    const row = {};
    const c = p.cgId ? cg[p.cgId] : null;
    if (c) {
      if (c.atm != null) row.atm = c.atm;
      if (c.ath != null) row.ath = c.ath;
      if (c.athDate) row.athDate = c.athDate;
      if (c.atl != null) row.atl = c.atl;                    // đáy thật sự
      if (c.atlDate) row.atlDate = c.atlDate;
    }
    // Đáy trước ATH chỉ có nghĩa khi ATH cách ngày TGE hơn 1 tuần — trong 1 tuần
    // thì "đỉnh" đó là râu nến listing, không phải đỉnh thật (xem luật ở index.html).
    // Đáy trước ATH chỉ có nghĩa khi ATH cách ngày TGE hơn 1 tuần — trong 1 tuần
    // thì "đỉnh" đó là râu nến những ngày đầu lên sàn, không phải đỉnh thật.
    // Không có binanceSymbol vẫn thử: đoán cặp từ chính ticker để hỏi Gate/Bybit.
    if (row.athDate && p.tgeDate
        && Date.parse(row.athDate) - Date.parse(p.tgeDate) > 7 * 86400000) {
      const sym = p.binanceSymbol || (p.ticker + 'USDT');
      const a = await fetchPreAth(sym, p.tgeDate, row.athDate);
      if (a && a.athWick) {
        row.athWick = true;                      // ATH rơi đúng ngày mở giao dịch → client ẩn ×ATH
        nWick++;
      } else if (a) {
        row.preAth = a.preAth; row.preAthDate = a.preAthDate;
        nPre++; bySrc[a.src] = (bySrc[a.src] || 0) + 1;
      } else nSkip++;
      await sleep(120);
    }
    if (Object.keys(row).length) {
      row.updatedAt = new Date().toISOString();
      prices[p.ticker] = row;
    }
  }

  const nAtl = Object.values(prices).filter(v => v.atl != null).length;
  const srcs = Object.entries(bySrc).map(([k, v]) => `${k} ${v}`).join(' · ') || 'không có';
  log(`có giá: ${Object.keys(prices).length} · có ATL: ${nAtl} · có đáy-trước-ATH: ${nPre} (${srcs})`
    + ` · ATH là râu nến listing: ${nWick} · không sàn nào list: ${nSkip}`);
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
