export async function onRequestGet(context) {
  const { searchParams } = new URL(context.request.url);
  const action = searchParams.get('action') || 'list';
  const q      = searchParams.get('q') || '';
  const key    = context.env.SURF_API;
  const kv     = context.env.WATCHLIST;

  // Load saved projects + participation from KV
  if (action === 'kv-load') {
    if (!kv) return Response.json({ data: [], user: {} });
    const raw  = await kv.get('projects');
    const rawU = await kv.get('participation');
    return Response.json({
      data: raw  ? JSON.parse(raw)  : [],
      user: rawU ? JSON.parse(rawU) : {},
    });
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
    const ov   = body && body.data && body.data.overview;

    // Surf tìm thấy → trả luôn (Sync chỉ dùng nhánh này)
    if (ov && ov.name) {
      return Response.json({ ...body, source: 'surf' }, { headers: { 'Cache-Control': 'no-store' } });
    }

    // Surf trống. Chỉ luồng Add (llm=1) mới fallback sang Claude (web search)
    if (searchParams.get('llm') === '1') {
      const info = await askClaude(context.env, q);
      if (info) {
        return Response.json(llmToSurf(info, 'claude'), { headers: { 'Cache-Control': 'no-store' } });
      }
    }

    return Response.json({ data: null, source: 'surf' }, { headers: { 'Cache-Control': 'no-store' } });
  }

  // Server-side sync: fetch Surf list → check new/removed → save to KV
  // Dùng cho Telegram bot (1 request thay vì loop client-side)
  if (action === 'sync') {
    if (!kv) return Response.json({ error: 'KV not configured' }, { status: 500 });

    // Load Tier-1 list
    const t1Res  = await fetch('https://0xhieu.xyz/vc-tier1.json').catch(() => null);
    const tier1  = t1Res ? await t1Res.json().catch(() => []) : [];
    const norm   = s => s.toLowerCase().replace(/[^a-z0-9]/g, ' ').trim();
    const t1norm = tier1.map(norm);
    const hasTier1 = backers => (backers || []).some(b => { const bn = norm(b); return t1norm.some(t => bn.includes(t) || t.includes(bn)); });

    // Load current projects from KV
    const raw      = await kv.get('projects');
    const existing = raw ? JSON.parse(raw) : [];
    const existingNames = new Set(existing.map(p => (p.name || '').toLowerCase()));

    // Fetch active list from Surf
    const listRes  = await fetch(`${BASE}/search/airdrop?sort_by=total_raise&order=desc&limit=100&phase=active`, { headers });
    const listBody = await listRes.json();
    const apiList  = listBody.data || [];
    const activeNames = new Set(apiList.map(p => (p.project_name || '').toLowerCase()));

    // Phase 1: clean TGE'd (cap 10 checks)
    let removed = 0;
    const projects = [...existing];
    const maybeGone = projects.filter(p => !activeNames.has((p.name || '').toLowerCase())).slice(0, 10);
    for (const p of maybeGone) {
      const r = await fetch(`${BASE}/project/detail?q=${encodeURIComponent(p.name)}`, { headers }).catch(() => null);
      if (!r) continue;
      const d = await r.json().catch(() => null);
      if (d?.data?.overview?.tge_status === 'post') {
        const idx = projects.findIndex(x => x.name === p.name);
        if (idx >= 0) { projects.splice(idx, 1); removed++; }
      }
    }

    // Phase 2: add new Tier-1 projects
    const newItems = apiList.filter(p => !existingNames.has((p.project_name || '').toLowerCase()));
    let added = 0;
    for (let i = 0; i < newItems.length; i++) {
      const item = newItems[i];
      const dRes = await fetch(`${BASE}/project/detail?q=${encodeURIComponent(item.project_name)}`, { headers }).catch(() => null);
      if (!dRes) continue;
      const dBody = await dRes.json().catch(() => null);
      const ov = dBody?.data?.overview || {};
      const fund = dBody?.data?.funding || {};
      if (ov.tge_status === 'post') continue;
      const backers = (fund.rounds || []).flatMap(r => (r.investors || []).map(inv => inv.name)).filter((v, i, a) => a.indexOf(v) === i);
      if (!hasTier1(backers)) continue;
      projects.push({ id: `sync_${Date.now()}_${i}`, name: ov.name || item.project_name, category: (ov.tags || []).join(', '), raise: item.total_raise ? '$' + (item.total_raise / 1e6).toFixed(1) + 'M' : '—', raise_num: item.total_raise || fund.total_raise || 0, round: '', date: '', backers, x_handle: ov.x_handle || '', logo_url: ov.logo_url || '' });
      added++;
    }

    await kv.put('projects', JSON.stringify(projects));
    return Response.json({ ok: true, added, removed, total: projects.length });
  }

  return Response.json({ error: 'invalid action' }, { status: 400 });
}

// ── LLM fallback: hỏi project info khi Surf không có ──────────────
const LLM_PROMPT = (name) =>
  `Research the crypto project the user means by "${name}". Use web search to verify real, current data — do NOT answer from memory or guess.\n` +
  `If several projects share the name, pick the most prominent / most-funded one (the one real VCs backed). ` +
  `Set "found" to false if web search shows no real, VC-backed crypto project by that name — never invent a low-quality match.\n` +
  `After researching, output ONLY this JSON object as your final message (no prose, no markdown, nothing after it):\n` +
  `{"found": true|false, "name": "official project name", "investors": ["real VC/angel names from sources"], ` +
  `"tge_status": "pre"|"post", "x_handle": "official twitter handle without @", "category": "short category", ` +
  `"total_raise": total_raised_in_USD_or_null}\n` +
  `"tge_status" is "post" ONLY if a tradable token already launched; otherwise "pre". Investors must come from your search results, not assumptions.`;

// Lấy block JSON cuối cùng trong text (web search có thể chèn prose/citation phía trước)
function parseLLMJson(text) {
  if (!text) return null;
  const z = text.lastIndexOf('}');
  if (z < 0) return null;
  // quét ngược tìm '{' khớp ngoặc của object cuối
  let depth = 0;
  for (let i = z; i >= 0; i--) {
    if (text[i] === '}') depth++;
    else if (text[i] === '{') { depth--; if (depth === 0) {
      try { const o = JSON.parse(text.slice(i, z + 1)); return o && o.found ? o : null; } catch { return null; }
    }}
  }
  return null;
}

function llmToSurf(o, source) {
  const investors = Array.isArray(o.investors) ? o.investors.filter(Boolean) : [];
  return {
    source,
    data: {
      overview: {
        name:       o.name || '',
        tags:       o.category ? [o.category] : [],
        x_handle:   o.x_handle || '',
        logo_url:   o.x_handle ? `https://unavatar.io/twitter/${o.x_handle}` : '',
        tge_status: o.tge_status === 'post' ? 'post' : 'pre',
      },
      funding: {
        rounds:      investors.length ? [{ investors: investors.map((n) => ({ name: n })) }] : [],
        total_raise: typeof o.total_raise === 'number' ? o.total_raise : 0,
      },
    },
  };
}

async function askClaude(env, name) {
  if (!env.CLAUDE) return null;
  const hdr = {
    'x-api-key': env.CLAUDE,
    'anthropic-version': '2023-06-01',
    'content-type': 'application/json',
  };
  const tools = [{ type: 'web_search_20260209', name: 'web_search', max_uses: 4 }];
  const messages = [{ role: 'user', content: LLM_PROMPT(name) }];
  try {
    // web search chạy server-side; có thể trả pause_turn → tiếp tục tối đa vài vòng
    for (let i = 0; i < 4; i++) {
      const r = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST', headers: hdr,
        body: JSON.stringify({ model: 'claude-opus-4-8', max_tokens: 1500, tools, messages }),
      });
      const b = await r.json();
      if (!b.content) return null;
      const text = b.content.filter((c) => c.type === 'text').map((c) => c.text).join('\n');
      const parsed = parseLLMJson(text);
      if (parsed) return parsed;
      if (b.stop_reason === 'pause_turn') { messages.push({ role: 'assistant', content: b.content }); continue; }
      return parsed; // null
    }
  } catch { return null; }
  return null;
}

export async function onRequestPost(context) {
  const kv = context.env.WATCHLIST;
  if (!kv) return Response.json({ error: 'KV not configured' }, { status: 500 });

  const { action, data, user } = await context.request.json();

  // Save projects và/hoặc participation lên KV
  if (action === 'kv-save') {
    if (data !== undefined) await kv.put('projects', JSON.stringify(data));
    if (user !== undefined) await kv.put('participation', JSON.stringify(user));
    return Response.json({ ok: true });
  }

  return Response.json({ error: 'invalid action' }, { status: 400 });
}
