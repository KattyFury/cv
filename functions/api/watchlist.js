export async function onRequestGet(context) {
  const { searchParams } = new URL(context.request.url);
  const action = searchParams.get('action') || 'list';
  const q      = searchParams.get('q') || '';
  const key    = context.env.SURF_API;

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
