// fetch-before-ath.js — Lấy giá đáy trước ATH (before-ATH) cho các token trong sheet DATA
// Chạy: node fetch-before-ath.js
// Nguồn giá: Binance → Bybit → Gate.io → MEXC (public API, không cần key)
// Output: bảng ticker → beforeATH để paste vào cột J

const SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/1m8_nwbP_Apw43Y8iNxOoGFYy8YA-OpchGnVRfTMBUAo/gviz/tq?tqx=out:csv&sheet=DATA';

// Đọc CG_API_KEY từ .env (không hardcode key trong source)
const fs = require('fs');
const path = require('path');
const envText = fs.readFileSync(path.join(__dirname, '.env'), 'utf8');
const CG_KEY = (envText.match(/CG_API_KEY=(.+)/) || [])[1]?.trim();
if (!CG_KEY) { console.error('Không tìm thấy CG_API_KEY trong .env'); process.exit(1); }

const ONE_DAY = 24 * 3600 * 1000;

// ── CSV parse ────────────────────────────────────────────────────────────────
function parseCSVLine(line) {
  const out = [];
  let cur = '', inQ = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQ) {
      if (ch === '"' && line[i+1] === '"') { cur += '"'; i++; }
      else if (ch === '"') inQ = false;
      else cur += ch;
    } else {
      if (ch === '"') inQ = true;
      else if (ch === ',') { out.push(cur); cur = ''; }
      else cur += ch;
    }
  }
  out.push(cur);
  return out;
}

// DD/MM/YYYY → timestamp ms
function parseTgeDate(s) {
  const p = String(s || '').trim().split('/');
  if (p.length !== 3) return null;
  return new Date(+p[2], +p[1] - 1, +p[0]).getTime();
}

// ── Exchange fetchers — trả về mảng [{ts, low, close}] daily candles ─────────

async function tryFetch(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    return await res.json();
  } catch { return null; }
}

async function fetchBinance(ticker, fromTs, toTs) {
  const j = await tryFetch(`https://api.binance.com/api/v3/klines?symbol=${ticker}USDT&interval=1d&startTime=${fromTs}&endTime=${toTs}&limit=1000`);
  if (!Array.isArray(j) || !j.length) return null;
  return j.map(c => ({ ts: +c[0], low: +c[3], close: +c[4] }));
}

async function fetchBybit(ticker, fromTs, toTs) {
  const j = await tryFetch(`https://api.bybit.com/v5/market/kline?category=spot&symbol=${ticker}USDT&interval=D&start=${fromTs}&end=${toTs}&limit=1000`);
  const list = j?.result?.list;
  if (!Array.isArray(list) || !list.length) return null;
  // Bybit: [ts, open, high, low, close, ...] — mới nhất trước
  return list.map(c => ({ ts: +c[0], low: +c[3], close: +c[4] })).reverse();
}

async function fetchGateio(ticker, fromTs, toTs) {
  const from = Math.floor(fromTs / 1000), to = Math.floor(toTs / 1000);
  const j = await tryFetch(`https://api.gateio.ws/api/v4/spot/candlesticks?currency_pair=${ticker}_USDT&interval=1d&from=${from}&to=${to}`);
  if (!Array.isArray(j) || !j.length) return null;
  // Gate: [ts_sec, vol_quote, close, high, low, open, ...]
  return j.map(c => ({ ts: +c[0] * 1000, low: +c[4], close: +c[2] }));
}

async function fetchMexc(ticker, fromTs, toTs) {
  const j = await tryFetch(`https://api.mexc.com/api/v3/klines?symbol=${ticker}USDT&interval=1d&startTime=${fromTs}&endTime=${toTs}&limit=1000`);
  if (!Array.isArray(j) || !j.length) return null;
  return j.map(c => ({ ts: +c[0], low: +c[3], close: +c[4] }));
}

const SOURCES = [
  ['Binance', fetchBinance],
  ['Bybit',   fetchBybit],
  ['Gate',    fetchGateio],
  ['MEXC',    fetchMexc],
];

async function fetchCandles(ticker, fromTs, toTs) {
  for (const [name, fn] of SOURCES) {
    const candles = await fn(ticker, fromTs, toTs);
    if (candles && candles.length) return { source: name, candles };
  }
  return null;
}

// ── Main ─────────────────────────────────────────────────────────────────────

(async () => {
  // 1. Đọc sheet
  console.log('Đọc sheet DATA...');
  const csv   = await (await fetch(SHEET_CSV_URL)).text();
  const lines = csv.trim().split('\n');
  const tokens = lines.slice(1)
    .map(parseCSVLine)
    .filter(r => r[1] && r[2])
    .map(r => ({
      tgeDate: r[0],                                   // col A
      ticker:  (r[1] || '').replace(/^\$/, '').trim().toUpperCase(), // col B
      cgId:    (r[2] || '').trim().toLowerCase(),      // col C
    }))
    .filter(t => t.ticker && t.cgId);
  console.log(`${tokens.length} tokens\n`);

  // 2. CoinGecko: ath_date cho tất cả
  console.log('Lấy ath_date từ CoinGecko...');
  const ids = tokens.map(t => t.cgId).join(',');
  const cgRes = await fetch(
    `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${ids}&per_page=250&sparkline=false`,
    { headers: { 'x-cg-demo-api-key': CG_KEY } }
  );
  if (!cgRes.ok) { console.error(`CoinGecko HTTP ${cgRes.status} — dừng`); process.exit(1); }
  const coinMap = {};
  (await cgRes.json()).forEach(c => { coinMap[c.id] = c; });
  console.log(`coinMap: ${Object.keys(coinMap).length} tokens\n`);

  // 3. Từng token: tính before-ATH
  const results = [];   // { ticker, value, note, source }

  for (const t of tokens) {
    const c = coinMap[t.cgId];
    const row = { ticker: t.ticker, value: '', note: '', source: '' };
    results.push(row);

    if (!c)          { row.note = 'không có trên CoinGecko'; continue; }
    if (!c.ath_date) { row.note = 'không có ath_date'; continue; }

    const tgeTs = parseTgeDate(t.tgeDate);
    if (!tgeTs) { row.note = `TGE date sai format: "${t.tgeDate}"`; continue; }

    const athTs = new Date(c.ath_date).getTime();
    const diff  = athTs - tgeTs;

    if (diff < 0)       { row.note = 'ATH trước TGE — bỏ'; continue; }
    if (diff < ONE_DAY) { row.note = 'ATH cùng ngày TGE (intraday) — bỏ'; continue; }

    // Lấy candles từ TGE-1d đến ATH+1d
    const r = await fetchCandles(t.ticker, tgeTs - ONE_DAY, athTs + ONE_DAY);
    if (!r) { row.note = 'không sàn nào có data'; continue; }
    row.source = r.source;

    // ATH trong 1-3 ngày TGE → beforeATH = giá TGE (close ngày đầu)
    if (diff <= 3 * ONE_DAY) {
      const tgeCandle = r.candles.find(x => Math.abs(x.ts - tgeTs) <= ONE_DAY);
      if (!tgeCandle) { row.note = 'ATH gần TGE, không tìm được candle TGE'; continue; }
      row.value = tgeCandle.close;
      row.note  = 'ATH trong 3 ngày → dùng TGE price';
      continue;
    }

    // Bình thường: min(low) trong [tgeTs, athTs], BỎ candle đầu tiên của sàn
    // — wick listing là giá ảo (ARB mở 0.5, SUI 0.1...), kể cả khi sàn list muộn hơn TGE
    const inRange = r.candles.filter(x => x.ts >= tgeTs && x.ts <= athTs && x.low > 0);
    if (!inRange.length) { row.note = 'window rỗng (sàn thiếu data đầu)'; continue; }
    const win = inRange.slice(1); // bỏ candle listing
    if (win.length) {
      row.value = Math.min(...win.map(x => x.low));
      row.note  = `${win.length} ngày`;
    } else {
      row.value = inRange[0].close; // chỉ có 1 candle → dùng close, tránh wick
      row.note  = 'chỉ có candle listing → dùng close';
    }
  }

  // 4. Output
  console.log('═'.repeat(70));
  console.log('KẾT QUẢ — paste cột "beforeATH" vào cột I (BEFORE ATH) theo đúng thứ tự sheet');
  console.log('═'.repeat(70));
  console.log('TICKER'.padEnd(10) + 'beforeATH'.padEnd(16) + 'SOURCE'.padEnd(9) + 'NOTE');
  console.log('─'.repeat(70));
  for (const r of results) {
    console.log(
      r.ticker.padEnd(10) +
      String(r.value).padEnd(16) +
      r.source.padEnd(9) +
      r.note
    );
  }

  // Cột thuần để copy-paste vào sheet (theo thứ tự dòng)
  const column = results.map(r => r.value !== '' ? String(r.value).replace('.', ',') : '-').join('\r\n');
  fs.writeFileSync(path.join(__dirname, 'before-ath-output.txt'), column, 'utf8');
  console.log('\n' + '═'.repeat(70));
  console.log('ĐÃ XUẤT FILE: before-ath-output.txt');
  console.log('Mở file → Ctrl+A → Ctrl+C → click ô I2 trong sheet → Ctrl+V');
  console.log('═'.repeat(70));
})();
