# CLAUDE.md

> How to work with me. Read this before every session.

---

## Who I Am

I'm a **Vietnamese vibecoder** — I have ideas, not a programming background. I build products by handing off to AI, not by writing every line myself.

**How I learn and work:**
- I learn by **actually building**, not from books or tutorials.
- I want to **understand while building**, not sit through a lecture first.
- I'm **decisive and push back fast** when output is off — don't guess and make me review later.
- I **plan carefully in Claude Desktop**, then hand off to Claude Code to build step by step.

**Background:** crypto research (VHG, 2023-2024). Now I do content + community at [0xhieu.xyz](https://0xhieu.xyz).

> Tôi có nhiều dự án khác (ví dụ ví **ezwallet**, các bot airdrop) nằm ở **repo riêng** dưới `D:\Files\Claude\`, **stack khác** (Solidity / Cloudflare Workers / bot Node). **Những thứ đó KHÔNG liên quan tới `cv`** — đừng lôi asset, code, hay secret của chúng vào đây.

---

## This Project — `cv` (0xhieu.xyz)

**Bản chất:** một **website tĩnh 1 file** để hiển thị data. **KHÔNG có backend, KHÔNG smart contract, KHÔNG secret/API key.**

- **Toàn bộ site nằm trong `index.html`** (HTML + CSS + JS inline). Host trên **Cloudflare Pages** (auto-deploy từ nhánh `main`).
- **Data đọc từ nguồn PUBLIC (không key):**
  - **Google Sheet** (gviz CSV) — 3 mục: **Valuation** (tab DATA), **Airdrop → Work** (tab Work), **Airdrop → Watchlist** (tab Watchlist).
  - **CoinGecko** (free API) — giá / ATH cho Valuation.
  - **Google Translate** (gtx) — dịch VI→EN cho tab Airdrop.
- **Logic tính toán** (multiples, Market Condition, Predict FDV, sao tiềm năng...) nằm trong JS của `index.html`. **Data số liệu** nằm trong Google Sheet. Muốn đổi công thức → sửa `index.html`; muốn đổi số liệu dự án → sửa Sheet.
- **Assets:** `icon.png` (favicon + iPhone icon), `pfp.png` (avatar), `arrow.svg`, `highlights/`.
- **Local:** `D:\Files\Claude\cv` · **GitHub:** `KattyFury/cv`

> ⚠️ Nếu thấy mình cần một API key / backend / Cloudflare Function cho `cv` → **gần như chắc chắn là hiểu sai**. cv chỉ đọc data public.

> ⚠️ **Luôn kiểm tra cột thật trong Google Sheet trước khi viết code parse** (kéo CSV về xem). Đừng đoán thứ tự/định dạng cột — nhiều lỗi đến từ đoán sai (vd sao tiềm năng dùng dấu `*`, không phải số).

---

## How to Talk to Me

- Respond in **Vietnamese**. Use English for code, technical terms, and proper nouns.
- **No filler**: skip "Great question!", "Sure!", "Certainly!".
- **Answer directly**. Short task = short answer.
- **Don't dump theory** — build first, explain when needed.
- **Don't assume I know jargon** — explain inline when using technical terms.
- **Multiple approaches → show options, don't pick silently.**
- **Not sure → say so, don't guess.**

---

## How to Write Code

- **Think before coding**: state assumptions before writing the first line.
- **Stay in scope**: I asked to fix one function, fix one function. Don't touch other files.
- **Ask before**: big refactors, architecture changes, anything touching >3 files.
- **Simplicity first**: if 200 lines could be 50, rewrite it. No "flexibility" or "future-proofing" I didn't ask for.
- **Summarize after every edit**: what changed, why.
- **Loop until verified**: don't stop at "it should work" — verify it actually works (kéo data thật, mở trang xem).

---

## When Editing Existing Code

- **Touch only what you must**: don't "improve" adjacent code, comments, formatting.
- **Don't refactor what isn't broken**: match existing style even if you'd do it differently.
- **See unrelated dead code**: mention it, don't delete it.
- **Clean up your own orphans**: imports / variables / functions made unused by YOUR changes → remove them.
- **The test**: every changed line must trace back to my actual request.

---

## My Workflow

I work in this order. Don't skip steps:

1. **Plan in Claude Desktop** — brainstorm, design, write spec
2. **Generate spec file** — detailed `.md` for handoff
3. **Hand off to Claude Code** — implement step by step, don't jump ahead

When I'm in **planning phase**, don't rush to code. When I have a spec, don't re-design.

**Sync:** mọi project có remote GitHub. Xong việc thì `git push` lên `main`. (cv không còn secret nào để lo commit nhầm.)

---

## Absolute DON'Ts

- ❌ Pick an approach silently when multiple options exist — present them and ask
- ❌ Touch files unrelated to the request
- ❌ Refactor code that's working fine
- ❌ Delete dead code unless asked
- ❌ Push to prod, drop databases, run irreversible commands without explicit confirmation
- ❌ Lôi asset / code / secret của dự án khác (ezwallet, bot...) vào cv
- ❌ Giả định cv có backend / smart contract / API key
- ❌ Viết code parse Google Sheet mà chưa xem data cột thật
- ❌ Dump theory when I need to build
- ❌ Assume I know technical terms
- ❌ Stop at "it should work" — verify

---

## Hard Decisions → Think Deeply

For architecture choices, tradeoffs, or major decisions → use Extended Thinking. Don't propose hastily.

---

## Required Process — HANDOFF.md

Giữ `HANDOFF.md` ở root luôn phản ánh **đúng trạng thái hiện tại**: stack, data flow, decisions log, failed approaches. **Cập nhật sau mỗi session, xoá phần đã lỗi thời** — đừng để tồn đọng trạng thái cũ.

- **Decisions Log** — `- [date]: [decision] — reason: [why]`
- **Failed Approaches** — `- [date]: Tried [approach] → failed because [reason] → switched to [alternative]`

---

## How to Know You're Doing It Right

- Diffs contain only what I requested
- No surprise refactors
- Clarifying questions come **before** implementation, not after mistakes
- No re-suggesting decisions already made
- Code is simple the first time, no rewrite needed
