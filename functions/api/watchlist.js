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

    // Surf trống. Chỉ luồng Add (llm=1) mới fallback sang Claude → OpenAI
    if (searchParams.get('llm') === '1') {
      let info = await askClaude(context.env, q);
      let src  = 'claude';
      if (!info) { info = await askOpenAI(context.env, q); src = 'openai'; }
      if (info) {
        return Response.json(llmToSurf(info, src), { headers: { 'Cache-Control': 'no-store' } });
      }
    }

    return Response.json({ data: null, source: 'surf' }, { headers: { 'Cache-Control': 'no-store' } });
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

async function askOpenAI(env, name) {
  if (!env.OPENAI) return null;
  try {
    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${env.OPENAI}`, 'content-type': 'application/json' },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [{ role: 'user', content: LLM_PROMPT(name) }],
        response_format: { type: 'json_object' },
      }),
    });
    const b = await r.json();
    const text = b.choices && b.choices[0] && b.choices[0].message ? b.choices[0].message.content : '';
    return parseLLMJson(text);
  } catch { return null; }
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
