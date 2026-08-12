// Cổng riêng tư cho Airdrop → Work: task cá nhân lưu trong Cloudflare KV.
// Mật khẩu được kiểm tra Ở SERVER — không nằm trong index.html, không dò được bằng F12.
//
//   KV binding : WORK          (Cloudflare Pages → Settings → Bindings)
//   Secret     : ADMIN_PASS    (Cloudflare Pages → Settings → Environment variables, chọn "Encrypt")
//
// Sai mật khẩu → trả 401 và KHÔNG trả về bất kỳ dữ liệu nào.

const KEY = 'personal-tasks';

const json = (obj, status = 200) => new Response(JSON.stringify(obj), {
  status,
  headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
});

// So sánh không rò rỉ thời gian (chống dò mật khẩu bằng cách đo độ trễ)
function safeEqual(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

// Cắt độ dài + bỏ < > để nội dung không phá HTML khi render bằng innerHTML
const clean = (v, max) => String(v ?? '').replace(/[<>]/g, '').trim().slice(0, max);
// Chỉ nhận link http/https — chặn javascript: nhét vào thuộc tính href
const cleanLink = v => { const s = clean(v, 500); return /^https?:\/\//i.test(s) ? s : ''; };
// Mỗi mục Get Started / Daily / Weekly là danh sách {text, link} — form cho thêm dòng bằng nút +.
// Dòng không có chữ thì bỏ; cắt tối đa 20 dòng để 1 request không nhồi được data khổng lồ vào KV.
const itemList = v => (Array.isArray(v) ? v : [])
  .slice(0, 20)
  .map(it => ({ text: clean(it?.text, 500), link: cleanLink(it?.link) }))
  .filter(it => it.text);

// rank/visibility chỉ nhận đúng giá trị hợp lệ, sai hoặc thiếu thì rơi về mặc định an toàn
// LƯU Ý: khớp WTE_RANKS trong index.html (mục "AIRDROP — Work to Earn") — đổi thang rank
// thì sửa cả 2 chỗ, không chỉ client.
const RANKS = ['S', 'A', 'B', 'C'];
const cleanRank = v => RANKS.includes(v) ? v : 'C';
const cleanVisibility = v => v === 'public' ? 'public' : 'personal';

// Làm sạch các ô người dùng nhập — dùng chung cho add và update (chỉ id là không lấy từ client)
const sanitize = t => ({
  name:       clean(t.name, 120) || 'Không tên',
  twitter:    cleanLink(t.twitter),
  potential:  Math.max(0, Math.min(3, parseInt(t.potential, 10) || 0)),
  type:       clean(t.type, 60),
  rank:       cleanRank(t.rank),
  visibility: cleanVisibility(t.visibility),
  getStarted: itemList(t.getStarted),
  daily:      itemList(t.daily),
  weekly:     itemList(t.weekly),
});

const readTasks  = async kv => { try { return JSON.parse(await kv.get(KEY) || '[]'); } catch { return []; } };
const writeTasks = (kv, tasks) => kv.put(KEY, JSON.stringify(tasks));

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

  if (body.action === 'list') {
    return json({ ok: true, tasks: await readTasks(kv) });
  }

  if (body.action === 'add') {
    const tasks = await readTasks(kv);
    tasks.push({
      id: crypto.randomUUID(),
      ...sanitize(body.task || {}),
    });
    await writeTasks(kv, tasks);
    return json({ ok: true, tasks });
  }

  if (body.action === 'update') {
    const id = String(body.id ?? '');
    const tasks = await readTasks(kv);
    const i = tasks.findIndex(t => t.id === id);
    if (i < 0) return json({ ok: false, error: 'not-found' }, 404);
    tasks[i] = { ...tasks[i], ...sanitize(body.task || {}) };   // chỉ giữ nguyên id
    await writeTasks(kv, tasks);
    return json({ ok: true, tasks });
  }

  if (body.action === 'delete') {
    const id = String(body.id ?? '');
    const tasks = (await readTasks(kv)).filter(t => t.id !== id);
    await writeTasks(kv, tasks);
    return json({ ok: true, tasks });
  }

  return json({ ok: false, error: 'unknown-action' }, 400);
}
