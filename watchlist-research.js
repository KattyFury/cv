// watchlist-research.js
// Gom dự án chưa TGE từ Surf API + Telegram @crypto_fundraising,
// lọc VC Tier-1 (vc-tier1.json) + ChatGPT chấm "degen farm được không",
// rồi GỬI ứng viên tới Apps Script (cổng ghi) -> tab "Danh sách chờ".
// Bạn tự thẩm rồi copy dòng ngon sang tab "Watchlist" (web đọc).
//
// Chạy:  node watchlist-research.js          (cron trên VPS, 1 lần/ngày)
//        node watchlist-research.js --dry     (chỉ in, KHÔNG gửi lên Sheet)
//
// Không cần npm install (Node >=18 có sẵn fetch).
// Cần .env:  SURF_API, OPENAI, WL_WEBHOOK_URL, WL_WEBHOOK_SECRET
// Xem WATCHLIST-RESEARCH-SETUP.md để cài Apps Script.

const fs   = require('fs');
const path = require('path');

// ── env ───────────────────────────────────────────────
function readEnv() {
  const e = {};
  try {
    fs.readFileSync(path.join(__dirname, '.env'), 'utf8').split('\n').forEach(l => {
      const m = l.match(/^([A-Z_]+)=(.*)$/);
      if (m) e[m[1]] = m[2].trim();
    });
  } catch {}
  return { ...e, ...process.env };
}
const ENV            = readEnv();
const SURF_KEY       = ENV.SURF_API;
const OPENAI_KEY     = ENV.OPENAI;
const SHEET_ID       = ENV.SHEET_ID || '1m8_nwbP_Apw43Y8iNxOoGFYy8YA-OpchGnVRfTMBUAo';
const WEBHOOK_URL    = ENV.WL_WEBHOOK_URL;
const WEBHOOK_SECRET = ENV.WL_WEBHOOK_SECRET;
const DRY            = process.argv.includes('--dry') || !WEBHOOK_URL;

const SURF_BASE   = 'https://api.asksurf.ai/gateway/v1';
const PENDING_TAB = 'Danh sách chờ';
const LIVE_TAB    = 'Watchlist';
const TG_PAGES    = parseInt(ENV.TG_PAGES || '5', 10);
const MAX_DETAIL  = parseInt(ENV.MAX_DETAIL || '60', 10);   // trần Surf detail call/lần (tiết kiệm credit)

// 13 narrative cố định (khớp dropdown cột C của Sheet)
const NARRATIVES = ['Stablechain','Layer-2','DeFi','AI','Payment','Layer-1','Infra','Game','Bitcoin','Identity','Prediction','Privacy','Trading'];

// ── Tier-1 VC filter ──────────────────────────────────
const TIER1  = JSON.parse(fs.readFileSync(path.join(__dirname, 'vc-tier1.json'), 'utf8'));
const norm   = s => (s || '').toLowerCase().replace(/[^a-z0-9]/g, ' ').trim();
const t1norm = TIER1.map(norm);
const tier1Of = backers => [...new Set((backers || []).filter(b => {
  const bn = norm(b);
  return bn && t1norm.some(t => bn.includes(t) || t.includes(bn));
}))];

const sleep = ms => new Promise(r => setTimeout(r, ms));
const log   = m => console.log('[' + new Date().toLocaleTimeString() + '] ' + m);

// ── CSV parser (dùng để đọc gviz khi dedup) ───────────
function parseCSV(text) {
  const rows = []; let row = [], field = '', inQ = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQ) {
      if (c === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (c === '"') inQ = false;
      else field += c;
    } else {
      if (c === '"') inQ = true;
      else if (c === ',') { row.push(field.trim()); field = ''; }
      else if (c === '\r') {}
      else if (c === '\n') { row.push(field.trim()); field = ''; rows.push(row); row = []; }
      else field += c;
    }
  }
  if (field || row.length) { row.push(field.trim()); rows.push(row); }
  return rows;
}

// ── Surf API ──────────────────────────────────────────
async function surfList() {
  const r = await fetch(SURF_BASE + '/search/airdrop?sort_by=total_raise&order=desc&limit=100&phase=active',
    { headers: { Authorization: 'Bearer ' + SURF_KEY } });
  const b = await r.json();
  if (b.error) throw new Error('Surf list: ' + JSON.stringify(b.error));
  return b.data || [];
}
async function surfDetail(name) {
  const r = await fetch(SURF_BASE + '/project/detail?q=' + encodeURIComponent(name),
    { headers: { Authorization: 'Bearer ' + SURF_KEY } });
  const b = await r.json().catch(() => null);
  return (b && b.data) || null;
}

// ── Telegram @crypto_fundraising (trang public t.me/s) ─
function stripHtml(html) {
  return html.replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>').replace(/&#8203;/g, '').replace(/\s+/g, ' ').trim();
}
function slugToName(slug) {
  return slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}
function parseInvestors(text) {
  const all = [];
  const ledM = text.match(/(?:led by|received (?:funding )?from)\s+([^]+?)(?=with participation|raised by|\.|$)/i);
  if (ledM) all.push(...ledM[1].split(/[,;]/).map(s => s.replace(/\([^)]+\)/g, '').trim()).filter(Boolean));
  const parM = text.match(/with participation from\s+([^]+?)(?=\.|$)/i);
  if (parM) all.push(...parM[1].split(/[,;]/).map(s => s.replace(/\([^)]+\)/g, '').trim()).filter(Boolean));
  if (!all.length) {
    const frM = text.match(/\bfrom\s+([^.]+)/i);
    if (frM) all.push(...frM[1].split(/[,;]/).map(s => s.replace(/\([^)]+\)/g, '').trim()).filter(Boolean));
  }
  return [...new Set(all.filter(s => s.length > 1 && s.length < 80))];
}
function parseRaise(text) {
  const m = text.match(/\$(\d+(?:\.\d+)?)\s*(K|M|B)\b/i);
  if (!m) return 0;
  const n = parseFloat(m[1]), u = m[2].toUpperCase();
  return u === 'B' ? n * 1e9 : u === 'M' ? n * 1e6 : n * 1e3;
}
async function telegramScrape(pages) {
  const TG  = 'https://t.me/s/crypto_fundraising';
  const HDR = { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' };
  const results = [];
  let url = TG;
  for (let p = 0; p < pages; p++) {
    let html;
    try { html = await (await fetch(url, { headers: HDR })).text(); }
    catch (e) { log('[TG] ' + e.message); break; }
    const allIds = [...html.matchAll(/data-post="crypto_fundraising\/(\d+)"/g)].map(m => parseInt(m[1]));
    const minId = allIds.length ? Math.min(...allIds) : null;
    for (const [fullMatch, slug] of [...html.matchAll(/href="https:\/\/crypto-fundraising\.info\/projects\/([^"\/]+)\/[^"]*"/g)]) {
      const li = html.indexOf(fullMatch);
      if (li < 0) continue;
      const zone = html.slice(Math.max(0, li - 3000), li);
      const di = zone.lastIndexOf('tgme_widget_message_text');
      if (di < 0) continue;
      const ds = zone.indexOf('>', di), de = zone.indexOf('</div>', ds);
      if (ds < 0 || de < 0) continue;
      const text = stripHtml(zone.slice(ds + 1, de));
      if (!text || /has been acquired/i.test(text)) continue;
      const investors = parseInvestors(text);
      if (!tier1Of(investors).length) continue;   // chỉ giữ có VC Tier-1
      results.push({ name: slugToName(slug), slug, raiseNum: parseRaise(text), investors, text });
    }
    if (!minId) break;
    url = TG + '?before=' + minId;
    await sleep(500);
  }
  const seen = new Set();
  return results.filter(r => (seen.has(r.slug) ? false : (seen.add(r.slug), true)));
}

// ── ChatGPT: chấm degen-farm + phân narrative ─────────
async function gptJudge({ name, description, tags, chains, backers }) {
  const sys =
    'Bạn là nhà nghiên cứu airdrop crypto cho degen/retail. Dựa DUY NHẤT trên thông tin cho sẵn ' +
    '(KHÔNG tự bịa thêm), trả về JSON đúng dạng:\n' +
    '{"degen_farm":"YES"|"NO"|"MAYBE","narrative":"<1 nhãn hoặc rỗng>","ly_do":"1 câu tiếng Việt ngắn"}\n' +
    'NGUYÊN TẮC: mặc định GIỮ LẠI, con người sẽ thẩm cuối. Chỉ trả NO khi bạn CHẮC CHẮN dự án ' +
    'thuần enterprise/B2B/tổ chức, KHÔNG có sản phẩm on-chain nào cho retail dùng và gần như ' +
    'không thể có token/airdrop (vd "enterprise blockchain data platform" bán API cho doanh nghiệp).\n' +
    '- degen_farm=YES: có bất kỳ đường nào cho retail/degen tương tác & có khả năng token/airdrop ' +
    '(blockchain/L1/L2/chain — kể cả mô tả kiểu doanh nghiệp, DeFi, ví, game, DePIN, prediction market, ' +
    'perp/trading, points, testnet, stablecoin chain...). Là 1 CHAIN/mạng thì gần như luôn YES (degen farm testnet được).\n' +
    '- degen_farm=MAYBE: mơ hồ, thiếu thông tin, hoặc lưỡng lự — CỨ để MAYBE, đừng vội NO.\n' +
    '- narrative: chọn ĐÚNG 1 trong [' + NARRATIVES.join(', ') + ']; không khớp rõ thì để "".';
  const user =
    'Tên: ' + name +
    '\nMô tả: ' + (description || '—') +
    '\nTags: ' + ((tags || []).join(', ') || '—') +
    '\nChain: ' + ((chains || []).join(', ') || '—') +
    '\nNhà đầu tư: ' + ((backers || []).join(', ') || '—');
  const r = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + OPENAI_KEY },
    body: JSON.stringify({
      model: 'gpt-4o-mini', temperature: 0,
      response_format: { type: 'json_object' },
      messages: [{ role: 'system', content: sys }, { role: 'user', content: user }],
    }),
  });
  const b = await r.json();
  if (b.error) return { degen_farm: '?', narrative: '', ly_do: 'GPT lỗi: ' + b.error.message };
  try {
    const o = JSON.parse(b.choices[0].message.content);
    let nar = (o.narrative || '').trim();
    if (!NARRATIVES.includes(nar)) nar = '';
    return { degen_farm: (o.degen_farm || '?').toUpperCase(), narrative: nar, ly_do: o.ly_do || '' };
  } catch { return { degen_farm: '?', narrative: '', ly_do: 'parse lỗi' }; }
}

// ── Dedup: đọc cột A của 1 tab qua gviz CSV (free, không cần auth) ──
async function gvizNames(tab) {
  const url = 'https://docs.google.com/spreadsheets/d/' + SHEET_ID +
    '/gviz/tq?tqx=out:csv&sheet=' + encodeURIComponent(tab);
  try {
    const txt  = await (await fetch(url)).text();
    const rows = parseCSV(txt);
    const head = (rows[0] || []).join('|').toUpperCase();
    // tab chưa tồn tại -> gviz trả tab DATA (sheet đầu) -> bỏ qua
    if (/TGE DATE|FUNDRAISED|TICKER|TOTAL SUPPLY/.test(head)) return [];
    return rows.slice(1).map(r => r[0]).filter(Boolean);
  } catch { return []; }
}

function raiseM(n) {
  if (!n) return '';
  const m = n / 1e6;
  return m >= 100 ? Math.round(m) : Math.round(m * 10) / 10;   // 30 = $30M
}

// ── Gửi rows tới Apps Script (cổng ghi) ───────────────
async function postRows(rows) {
  const r = await fetch(WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ secret: WEBHOOK_SECRET, rows }),
    redirect: 'follow',
  });
  const t = await r.text();
  try { return JSON.parse(t); } catch { return { ok: false, error: 'resp: ' + t.slice(0, 200) }; }
}

// ── Main ──────────────────────────────────────────────
async function main() {
  log('=== watchlist research start' + (DRY ? ' [DRY-RUN, không gửi Sheet]' : '') + ' ===');
  if (!SURF_KEY)   throw new Error('Thiếu SURF_API trong .env');
  if (!OPENAI_KEY) throw new Error('Thiếu OPENAI trong .env');

  // dedup nhẹ (best-effort; Apps Script vẫn dedup lần cuối)
  const seen = new Set();
  for (const tab of [PENDING_TAB, LIVE_TAB]) (await gvizNames(tab)).forEach(n => seen.add(norm(n)));
  log('Đã có ~' + seen.size + ' tên trong Sheet (dedup nhẹ)');

  const out = [];   // [name, xLink, narrative, raiseM, note]

  // ── Surf ──
  log('[Surf] fetch list...');
  const list = await surfList();
  const toCheck = list.filter(it => !seen.has(norm(it.project_name))).slice(0, MAX_DETAIL);
  log('[Surf] ' + list.length + ' dự án, ' + toCheck.length + ' cần check (cap ' + MAX_DETAIL + ')');
  for (const it of toCheck) {
    const d = await surfDetail(it.project_name); await sleep(150);
    const ov = (d && d.overview) || {}, fund = (d && d.funding) || {};
    if (ov.tge_status === 'post') continue;
    const backers = (fund.rounds || []).flatMap(r => (r.investors || []).map(i => i.name))
      .filter((v, i, a) => v && a.indexOf(v) === i);
    const t1 = tier1Of(backers);
    if (!t1.length) continue;                          // tầng 1: không có VC Tier-1 → bỏ
    const name = ov.name || it.project_name;
    if (seen.has(norm(name))) continue;
    const g = await gptJudge({ name, description: ov.description, tags: ov.tags, chains: ov.chains, backers }); await sleep(150);
    if (g.degen_farm === 'NO') { log('  x ' + name + ' (GPT NO: ' + g.ly_do + ')'); continue; }  // tầng 2
    seen.add(norm(name));
    const note = 'SURF · ' + t1.slice(0, 3).join(',') + ' · ' + g.ly_do + (g.degen_farm === 'MAYBE' ? ' (?)' : '');
    out.push([name, ov.x_handle ? 'https://x.com/' + ov.x_handle : '', g.narrative, raiseM(fund.total_raise || it.total_raise), note]);
    log('  + ' + name + ' [' + (g.narrative || '?') + '] ' + g.degen_farm);
  }

  // ── Telegram ──
  log('[TG] scrape @crypto_fundraising...');
  const tg = await telegramScrape(TG_PAGES);
  log('[TG] ' + tg.length + ' dự án có VC Tier-1');
  for (const it of tg) {
    if (seen.has(norm(it.name))) continue;
    const t1 = tier1Of(it.investors);
    const g = await gptJudge({ name: it.name, description: it.text, tags: [], chains: [], backers: it.investors }); await sleep(150);
    if (g.degen_farm === 'NO') { log('  x ' + it.name + ' (GPT NO: ' + g.ly_do + ')'); continue; }
    seen.add(norm(it.name));
    const note = 'Telegram · ' + t1.slice(0, 3).join(',') + ' · ' + g.ly_do + (g.degen_farm === 'MAYBE' ? ' (?)' : '');
    out.push([it.name, '', g.narrative, raiseM(it.raiseNum), note]);
    log('  + ' + it.name + ' [' + (g.narrative || '?') + '] ' + g.degen_farm);
  }

  // ── Gửi ──
  if (!out.length) { log('Không có kèo mới.'); return; }
  if (DRY) {
    log('=== DRY-RUN: ' + out.length + ' kèo (không gửi Sheet) ===');
    out.forEach(r => console.log('   ' + JSON.stringify(r)));
    return;
  }
  const res = await postRows(out);
  if (res.ok) log('=== Đã gửi: thêm ' + res.added + ' · trùng bỏ ' + res.skipped + ' vào "' + PENDING_TAB + '" ===');
  else log('LỖI gửi Sheet: ' + res.error);
}

main().catch(e => { console.error('Fatal:', e.message); process.exit(1); });
