// Đọc danh sách project công khai của Airdrop → Work to Earn.
// Dữ liệu nằm CHUNG kho KV với task cá nhân (xem functions/api/private.js) —
// mỗi task có field visibility: "public" | "personal", endpoint này chỉ trả về "public".
// Không cần mật khẩu vì đây vốn là data công khai (trước đây đọc từ Google Sheet).

const KEY = 'personal-tasks';

export async function onRequestGet({ env }) {
  const json = (obj, status = 200) => new Response(JSON.stringify(obj), {
    status,
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
  });

  if (!env.WORK) return json({ ok: false, error: 'Chưa gắn KV binding WORK trên Cloudflare' }, 500);

  let tasks = [];
  try { tasks = JSON.parse(await env.WORK.get(KEY) || '[]'); } catch { tasks = []; }

  return json({ ok: true, projects: tasks.filter(t => t.visibility === 'public') });
}
