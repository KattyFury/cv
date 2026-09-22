// Kho dữ liệu tab Valuation — thay hẳn Google Sheet (chốt trong REBUILD_SPEC_V3_VALUATION.md).
//
//   GET  /api/val   → công khai, KHÔNG cần mật khẩu (data để hiển thị cho khách)
//   POST /api/val   → thêm / sửa / xoá dự án, BẮT BUỘC mật khẩu, kiểm tra Ở SERVER
//                     action 'prices' dành cho job lấy giá hằng ngày (cũng cần mật khẩu)
//
//   KV binding : WORK         (dùng CHUNG kho với Work to Earn + AI, chỉ khác key)
//   Secret     : ADMIN_PASS   (dùng CHUNG 1 mật khẩu với /api/private và /api/ai)
//
// HAI KEY TÁCH RIÊNG LÀ CÓ CHỦ ĐÍCH:
//   val-projects → data nguồn, CHỈ admin ghi
//   val-prices   → giá, CHỈ job ghi
// Tách ra thì admin sửa dự án và job ghi giá không bao giờ đụng cùng một key,
// nên không có chuyện bên này ghi đè mất thay đổi của bên kia.
//
// KHÔNG lưu bất kỳ bội số nào (×TGE, ×ATL, ×ATH, ×ATM) — tất cả tính ở client lúc
// render, một nguồn duy nhất. Bản cũ từng lưu sẵn ×TGE trong Sheet rồi dùng lẫn lộn
// với số client tự tính, hai chỗ lệch nhau mà không ai biết.

const KEY_PROJECTS = 'val-projects';
const KEY_PRICES   = 'val-prices';

const json = (obj, status = 200) => new Response(JSON.stringify(obj), {
  status,
  headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
});

// So sánh không rò rỉ thời gian (giống private.js/ai.js — chống dò mật khẩu bằng độ trễ)
function safeEqual(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

const clean = (v, max) => String(v ?? '').replace(/[<>]/g, '').trim().slice(0, max);

// 15 narrative đã chốt (spec v3 §3). Giá trị lạ → rơi về chuỗi rỗng để admin thấy mà sửa,
// KHÔNG tự nhét vào một nhóm bừa (nhét bừa là làm lệch median của box Narrative).
const NARRATIVES = [
  'stablechain', 'layer-1', 'infra', 'ai', 'layer-2',
  'prediction', 'trading', 'bitcoin', 'payment', 'defi',
  'identity', 'privacy', 'game', 'social', 'desci',
];
const cleanNarrative = v => {
  const t = clean(v, 40).toLowerCase();
  return NARRATIVES.includes(t) ? t : '';
};

const num = v => {
  const n = typeof v === 'number' ? v : parseFloat(String(v ?? '').replace(/[^0-9.\-]/g, ''));
  return Number.isFinite(n) ? n : null;
};

const cleanDate = v => /^\d{4}-\d{2}-\d{2}$/.test(String(v ?? '')) ? String(v) : '';

// 7 trường BẮT BUỘC (spec v3 §5): thiếu một trong số này thì cả 4 cột bội số của dòng
// đó ra gạch — dự án nằm trong bảng mà không nói gì, nên chặn ngay từ lúc lưu.
// cgId và binanceSymbol CHO PHÉP trống: để nhập trước được dự án chưa lên sàn.
function sanitize(p) {
  return {
    ticker:        clean(p.ticker, 20).replace(/^\$/, '').toUpperCase(),
    tgeDate:       cleanDate(p.tgeDate),
    narrative:     cleanNarrative(p.narrative),
    fundraising:   num(p.fundraising),
    vcAlloc:       num(p.vcAlloc),
    totalSupply:   num(p.totalSupply),
    priceTGE:      num(p.priceTGE),
    cgId:          clean(p.cgId, 60).toLowerCase(),
    binanceSymbol: clean(p.binanceSymbol, 20).toUpperCase(),
  };
}

function missingFields(p) {
  const need = ['ticker', 'tgeDate', 'narrative', 'fundraising', 'vcAlloc', 'totalSupply', 'priceTGE'];
  return need.filter(k => p[k] === null || p[k] === '' || p[k] === undefined);
}

const readJson = async (kv, key, fallback) => {
  try { return JSON.parse(await kv.get(key) || JSON.stringify(fallback)); } catch { return fallback; }
};

export async function onRequestGet({ env }) {
  if (!env.WORK) return json({ ok: false, error: 'Chưa gắn KV binding WORK trên Cloudflare' }, 500);
  const [projects, prices] = await Promise.all([
    readJson(env.WORK, KEY_PROJECTS, []),
    readJson(env.WORK, KEY_PRICES, {}),
  ]);
  return json({ ok: true, projects, prices });
}

export async function onRequestPost({ request, env }) {
  if (!env.ADMIN_PASS) return json({ ok: false, error: 'Chưa cấu hình biến ADMIN_PASS trên Cloudflare' }, 500);
  if (!env.WORK)       return json({ ok: false, error: 'Chưa gắn KV binding WORK trên Cloudflare' }, 500);

  let body;
  try { body = await request.json(); } catch { return json({ ok: false, error: 'bad-json' }, 400); }

  if (!safeEqual(String(body.pass ?? ''), String(env.ADMIN_PASS))) {
    await new Promise(r => setTimeout(r, 400));   // làm chậm việc dò mật khẩu hàng loạt
    return json({ ok: false, error: 'wrong-pass' }, 401);
  }

  const kv = env.WORK;

  // Job lấy giá hằng ngày ghi vào key RIÊNG, không đụng data nhập tay.
  //
  // ⚠️ `priceTGE` KHÔNG nằm trong danh sách này và không bao giờ được nằm:
  // giá lúc TGE là dữ kiện lịch sử, chỉ có MỘT giá trị duy nhất, do chủ site
  // nhập tay và cất ở val-projects. Job chỉ lấy thứ thay đổi theo ngày.
  // Lọc theo whitelist để một job viết ẩu cũng không ghi đè được data nhập tay.
  const PRICE_FIELDS = ['atm', 'ath', 'athDate', 'atl', 'atlDate', 'updatedAt'];
  if (body.action === 'prices') {
    if (!body.prices || typeof body.prices !== 'object') {
      return json({ ok: false, error: 'bad-prices' }, 400);
    }
    const clean_ = {};
    for (const [ticker, v] of Object.entries(body.prices)) {
      if (!v || typeof v !== 'object') continue;
      const row = {};
      for (const f of PRICE_FIELDS) if (v[f] !== undefined) row[f] = v[f];
      if (Object.keys(row).length) clean_[clean(ticker, 20).toUpperCase()] = row;
    }
    await kv.put(KEY_PRICES, JSON.stringify(clean_));
    return json({ ok: true, count: Object.keys(clean_).length });
  }

  const projects = await readJson(kv, KEY_PROJECTS, []);
  const write = list => kv.put(KEY_PROJECTS, JSON.stringify(list));

  if (body.action === 'add' || body.action === 'update') {
    const p = sanitize(body.project || {});
    const missing = missingFields(p);
    if (missing.length) return json({ ok: false, error: 'missing', fields: missing }, 400);

    const i = projects.findIndex(x => x.ticker === (body.ticker || p.ticker));
    if (body.action === 'add') {
      if (i >= 0) return json({ ok: false, error: 'duplicate-ticker' }, 409);
      projects.push(p);
    } else {
      if (i < 0) return json({ ok: false, error: 'not-found' }, 404);
      projects[i] = p;
    }
    await write(projects);
    return json({ ok: true, projects });
  }

  if (body.action === 'delete') {
    const t = clean(body.ticker, 20).toUpperCase();
    await write(projects.filter(x => x.ticker !== t));
    return json({ ok: true, projects: projects.filter(x => x.ticker !== t) });
  }

  // Nhập hàng loạt — chỉ dùng cho lần chuyển data từ Google Sheet sang KV
  if (body.action === 'import') {
    if (!Array.isArray(body.projects)) return json({ ok: false, error: 'bad-projects' }, 400);
    const list = body.projects.map(sanitize);
    await write(list);
    return json({ ok: true, count: list.length });
  }

  return json({ ok: false, error: 'unknown-action' }, 400);
}
