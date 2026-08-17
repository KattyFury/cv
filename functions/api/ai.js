// Hub bài viết của tab "AI" — danh sách bài lưu trong Cloudflare KV.
//
//   GET  /api/ai   → công khai, KHÔNG cần mật khẩu (đây vốn là data để hiển thị cho khách)
//   POST /api/ai   → thêm / sửa / xoá, BẮT BUỘC mật khẩu, kiểm tra Ở SERVER
//
//   KV binding : WORK         (dùng CHUNG kho với Work to Earn, chỉ khác key — xem private.js)
//   Secret     : ADMIN_PASS   (dùng CHUNG 1 mật khẩu với /api/private)
//
// Sai mật khẩu → 401 và KHÔNG ghi gì.

const KEY = 'ai-posts';

const json = (obj, status = 200) => new Response(JSON.stringify(obj), {
  status,
  headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
});

// So sánh không rò rỉ thời gian (giống private.js — chống dò mật khẩu bằng cách đo độ trễ)
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

// LƯU Ý: khớp AI_HUBS trong index.html (mục "AI — hub bài viết") — thêm/bớt hub
// thì sửa CẢ 2 chỗ, không chỉ client, nếu không bài lưu vào sẽ rơi hết về hub đầu.
const CATS = ['INSIGHTS', 'LEARN', 'TOOLS', 'BUILD'];
const cleanCat = v => CATS.includes(v) ? v : CATS[0];

// Ngày đăng: admin sửa được, để trống thì tự lấy ngày hôm nay (giờ UTC của Cloudflare)
const today = () => new Date().toISOString().slice(0, 10);
const cleanDate = v => /^\d{4}-\d{2}-\d{2}$/.test(String(v ?? '')) ? String(v) : today();

const sanitize = p => ({
  title: clean(p.title, 200) || 'Không tên',
  link:  cleanLink(p.link),
  cat:   cleanCat(p.cat),
  date:  cleanDate(p.date),
});

const readPosts  = async kv => { try { return JSON.parse(await kv.get(KEY) || '[]'); } catch { return []; } };
const writePosts = (kv, posts) => kv.put(KEY, JSON.stringify(posts));

export async function onRequestGet({ env }) {
  if (!env.WORK) return json({ ok: false, error: 'Chưa gắn KV binding WORK trên Cloudflare' }, 500);
  return json({ ok: true, posts: await readPosts(env.WORK) });
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

  if (body.action === 'add') {
    const posts = await readPosts(kv);
    posts.push({ id: crypto.randomUUID(), ...sanitize(body.post || {}) });
    await writePosts(kv, posts);
    return json({ ok: true, posts });
  }

  if (body.action === 'update') {
    const id = String(body.id ?? '');
    const posts = await readPosts(kv);
    const i = posts.findIndex(p => p.id === id);
    if (i < 0) return json({ ok: false, error: 'not-found' }, 404);
    posts[i] = { ...posts[i], ...sanitize(body.post || {}) };   // chỉ giữ nguyên id
    await writePosts(kv, posts);
    return json({ ok: true, posts });
  }

  if (body.action === 'delete') {
    const id = String(body.id ?? '');
    const posts = (await readPosts(kv)).filter(p => p.id !== id);
    await writePosts(kv, posts);
    return json({ ok: true, posts });
  }

  return json({ ok: false, error: 'unknown-action' }, 400);
}
