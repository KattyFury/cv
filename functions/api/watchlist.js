export async function onRequestGet(context) {
  const { searchParams } = new URL(context.request.url);
  const action = searchParams.get('action') || 'list';
  const q      = searchParams.get('q') || '';
  const key    = context.env.SURF_API;
  const kv     = context.env.WATCHLIST;

  // Load saved projects from KV
  if (action === 'kv-load') {
    if (!kv) return Response.json({ data: [] });
    const raw = await kv.get('projects');
    return Response.json({ data: raw ? JSON.parse(raw) : [] });
  }

  if (!key) return Response.json({ error: 'SURF_API not configured' }, { status: 500 });

  const BASE    = 'https://api.asksurf.ai/gateway/v1';
  const headers = { Authorization: `Bearer ${key}` };

  if (action === 'list') {
    const res  = await fetch(`${BASE}/search/airdrop?sort_by=total_raise&order=desc&limit=100&phase=active`, { headers });
    const body = await res.json();
    return Response.json(body, { headers: { 'Cache-Control': 'no-store' } });
  }

  if (action === 'detail' && q) {
    const res  = await fetch(`${BASE}/project/detail?q=${encodeURIComponent(q)}`, { headers });
    const body = await res.json();
    return Response.json(body, { headers: { 'Cache-Control': 'no-store' } });
  }

  return Response.json({ error: 'invalid action' }, { status: 400 });
}

export async function onRequestPost(context) {
  const kv = context.env.WATCHLIST;
  if (!kv) return Response.json({ error: 'KV not configured' }, { status: 500 });

  const { action, data } = await context.request.json();

  // Save projects to KV
  if (action === 'kv-save') {
    await kv.put('projects', JSON.stringify(data));
    return Response.json({ ok: true });
  }

  return Response.json({ error: 'invalid action' }, { status: 400 });
}
