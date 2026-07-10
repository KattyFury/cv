# HANDOFF — CV / Portfolio (0xhieu.xyz)

**Date:** 2026-06-18  
**Repo:** https://github.com/KattyFury/CV  
**Live:** Cloudflare Pages (auto-deploy từ main branch)  
**Local dev:** `npx wrangler pages dev . --port 8788` (cần Cloudflare Functions)

---

## ⭐ HANDOFF mới nhất (2026-07-10) — Watchlist + auto-research

**Đã xong (chạy được, đã test):**
1. **CV site — sub-tab Watchlist** (trong tab Airdrop): đọc Google Sheet tab `Watchlist` qua gviz,
   render card đồng bộ lưới hàng. Cột A tên·B X·C narrative·D gọi vốn·E "có việc" YES/NO. (commit 4982a71)
2. **`watchlist-research.js`** (repo cv, Node ≥18, không deps): quét **Surf API** (`search/airdrop` +
   `project/detail`) + scrape **Telegram `t.me/s/crypto_fundraising`**, lọc **VC Tier-1** (`vc-tier1.json`, 38)
   → **ChatGPT gpt-4o-mini** chấm `degen_farm YES/NO/MAYBE` + narrative (1/13) + lý do → **POST tới
   Apps Script webhook** → tab `Danh sách chờ`. `--dry` = in không gửi; env `MAX_DETAIL`/`TG_PAGES` test nhẹ.
3. **`apps-script-webhook.gs`**: dán vào Sheet (Extensions→Apps Script, **file MỚI**, đừng đè code lấy giá),
   deploy Web app, dedup 2 tab rồi ghi `Danh sách chờ`. Đã pivot từ service account (Google chặn tạo SA key).
4. **Bot `research_airdrop_bot` — lệnh `/work`** (repo riêng, commit 717a143): spawn `watchlist-research.js`
   → đổ cả loạt vào `Danh sách chờ`, không review từng cái. `/scan` cũ vẫn còn (review nút ✅/❌).

**Env (secret, tự sync tay, KHÔNG commit):**
- `cv/.env`: `SURF_API`, `OPENAI`, `WL_WEBHOOK_URL`, `WL_WEBHOOK_SECRET` — đã set đủ.
- `research_airdrop_bot/.env`: cần thêm `WATCHLIST_RESEARCH_DIR=<path repo cv>` — **user CHƯA thêm**.

**Việc dở (next):**
- User thêm `WATCHLIST_RESEARCH_DIR` vào .env bot → bật `npm start` → gõ `/work` trong Telegram test live.
- Đảm bảo Sheet có 2 tab `Watchlist` + `Danh sách chờ`; webhook đã deploy + `WL_SECRET` khớp `.env`.
- Cadence: chạy tay 2 tuần/lần, local, khỏi VPS.
- Luồng: `/work` (hoặc `node watchlist-research.js`) → `Danh sách chờ` → user liếc, kéo kèo ngon sang `Watchlist` → lên web.

**⚠ OPEN ISSUE — Surf trả ÍT dự án pre-TGE (user nói xưa ~60, nay ~22):**
- `watchlist-research.js` `surfList()` dùng `limit=100&phase=active&sort_by=total_raise&order=desc` → list trả 100 item,
  nhưng nhiều cái đã TGE (lọc `tge_status==='post'` bỏ) + lọc Tier-1 → còn ít.
- Bot cũ `src/surf.ts` `fetchSurfCandidates` dùng **`limit=25`** (mặc định) → chỉ ~22 sau lọc raise. **Đây khả năng cao là nguồn "22".**
- Cần điều tra: (a) tăng `limit` trong surf.ts của bot; (b) kiểm Surf API `phase=active` có thu hẹp data không
  (thử bỏ param, đổi sort); (c) kiểm credit/plan Surf còn hạn (nói ~2.850 credits, hết hạn 06/2027). Chưa làm.

Chi tiết cơ chế + quyết định xem Decisions Log bên dưới (các entry 2026-07-10).

---

## Spacing System (2026-06-18) — QUY ĐỊNH BẮT BUỘC

Toàn site dùng **grid 4px**. Mọi `margin / padding / gap` PHẢI là bội số của 4:
`4 · 8 · 12 · 16 · 20 · 24 · 32 · 40 · 48 · 56 · 64`

Ngoại lệ duy nhất được phép:
- `1px / 2px` — border, micro-gap
- `7px 10px` — table cell padding (KHÓA, không đụng)
- Cặp `padding: 2px 6px 2px 4px` + `margin: -2px -6px -2px -4px` — alignment bù trừ (kbd inline)

Font-size khóa riêng (không đụng): `19/15/14/13/12/11/10px`.

Scale documented trong `:root` comment đầu `<style>`. **Khi thêm element mới: chọn số trong scale, không tự chế số lẻ** (3/5/6/7/9/10/11/14/18/22 → đã loại sạch).

Wrapper mọi tab đồng bộ: `max-width:900px; margin:0 auto; padding:0 24px 24px` (val/ard/wl). Header mỗi panel dùng cùng pattern `position:relative > .val-intro (giữa) + control absolute phải`, content cách header `margin-top:4px`.

---

## Stack

- Static HTML (`index.html`) — toàn bộ site trong 1 file
- Cloudflare Pages Functions (`functions/api/`) — API proxy giữ secret keys
- Node.js `server.js` — dev server port 8080, SPA fallback (KHÔNG support Functions)
- Google Sheets CSV — data source cho Valuation + Airdrop tabs
- Google Apps Script — sync ATH + current price mỗi ngày lúc 2h
- Puppeteer `export-pdf.js` — xuất toàn trang thành PDF

---

## Data Flow

```
Google Sheet (DATA tab)
  → Apps Script syncAll() [daily 2am]
      → CoinGecko /coins/markets → ghi ATH (col L) + current price (col N)
  → Website fetch CSV → parse → render
```

### Sheet columns (DATA tab)

> Cập nhật 2026-06-10: sheet đã đổi thứ tự cột, `index.html` đã sửa theo mapping mới này.

| Col | Index | Field |
|-----|-------|-------|
| A | 0 | tgeDate (DD/MM/YYYY) |
| B | 1 | ticker |
| C | 2 | CoinGecko ID |
| D | 3 | type (Layer-1, Layer-2...) |
| E | 4 | fundraising ($M) |
| F | 5 | vcAlloc (%) |
| G | 6 | totalSupply |
| H | 7 | priceTGE |
| I | 8 | beforeATH (fill bằng `fetch-before-ath.js`, xem mục riêng) |
| J | 9 | ATH (sync bởi Apps Script, dùng cho ×ATH; bỏ trống nếu ATH cùng ngày TGE) |
| N | 13 | currentPrice (sync bởi Apps Script) |

---

## Valuation Section — Logic

### ×TGE / ×ATH / ×ATM

```
vcPricePerToken = (fundraising * 1e6) / (vcAlloc / 100) / totalSupply
×TGE = priceTGE / vcPricePerToken
×ATH = ath / vcPricePerToken       ← ATH intraday listing day bị filter → hiển thị —
×ATM = currentPrice / vcPricePerToken
```

**ATH intraday filter:** Nếu `ath_date` cùng ngày `tgeDate` (< 24h) → `×ATH = —`  
Lý do: CoinGecko lấy absolute high kể cả râu nến listing day, không phản ánh thực tế.

### Size suffix (vcFDV)

```
vcFDV = fundraising / (vcAlloc / 100)
< $100M  → $
< $200M  → $$
< $500M  → $$$
≥ $500M  → $$$$
```

### Recent TGE Multiples

- Split theo $300M FDV threshold: Low FDV / High FDV
- Window: **6 token gần nhất** mỗi bucket; nếu token thứ 6 cách token mới nhất >60 ngày → giảm còn **4** (giống logic mid-term của Market Condition)
- Hiển thị median

### Danger Zone (box 4, thêm 2026-06-11)

- Lọc token đang có **×ATM ≥ 15** — VC lãi 15×+, sell pressure cực đại
- Backtest: 17 token từng ở vùng ≥15× (ACE ×69, SAGA ×97, ENA ×142, XPL ×131, HOOK, MIRA, ERA, VANA...) → 100% về đáy, không con nào giữ giá
- Sort: token TGE mới nhất lên đầu (bắt ứng cử viên vừa chớm)
- TGE < 30 ngày mà đã vào vùng → badge **⚠ FAKE PUMP** đỏ + nền đậm (pump láo sắp về 0)
- Nằm ở hàng card thứ 2 (`.val-analysis` row 2), render bởi `renderDanger()`

### Pattern analysis (phân tích 2026-06-11, làm nền cho các box sau)

Metric chính: `retention = ×ATM / ×TGE` — tách các nhóm nhãn tay sạch:
- **Mạnh**: retention 0.53–2.42 (median 0.85)
- **RUG**: retention 0.03–0.25 (growth thấp ~1.3 — xả thẳng từ vùng list, không có sóng)
- **FOMO rồi về 0**: retention ≤0.14 + ×TGE rất cao (median 22.7) — list giá ảo
- **ATH rồi về 0**: retention ≤0.27 + growth cao (~6×) — pump sau TGE rồi sập
- **rug?**: nhóm trộn — nửa giống RUG (retention <0.4), nửa số đẹp nhưng còn trẻ (<6 tháng)

Box ý tưởng chưa build (user chỉ duyệt Danger Zone): Token Health (retention-based, khớp 85% label tay), Dip Zone (median dip trước ATH — cần cột beforeATH).

### Market Condition

- `shortMed` = median của 4 ×TGE gần nhất
- 3 levels: Weak (<4.3×) / Normal (4.3-13×) / Strong (≥13×)
- Ngưỡng calibrate theo các giai đoạn thị trường thực tế (không phải phân phối thống kê thuần, vì 2025-2026 chiếm phần lớn data nhưng đó là do thiếu data cũ 2018-2024, không phản ánh đúng "bình thường"):
  - Strong  ≈ Q4/2022-Q1/2023 (HOOK+ARB, median ~21.7), Q4/2023-Q1/2024 (median ~16) → ≥13
  - Normal  ≈ Q2-Q3/2022 (OP, ~4.8) → 4.3-13
  - Weak    ≈ 2025 (median ~3.9), 2026 (median ~2.95) → <4.3

---

## Apps Script (Google Sheet)

**Function:** `syncAll()`  
**Trigger:** Daily 2am (setup bằng `setupDailyTrigger()` — chạy 1 lần để tạo trigger; kiểm tra ở panel Triggers/đồng hồ, lịch sử chạy ở panel Executions)

Logic hiện tại (2026-06-11):
- Cột N: current price — luôn cập nhật
- Cột J: ATH — cập nhật, NHƯNG nếu `ath_date` cùng ngày TGE (râu nến listing) → giữ nguyên giá trị cũ
- KHÔNG sync beforeATH (cột I) — Apps Script chạy trên server Mỹ, bị Binance chặn HTTP 451. Dùng `fetch-before-ath.js` local thay thế.

---

## fetch-before-ath.js — script local fill cột I (beforeATH)

Chạy trên máy local (VN IP nên không bị sàn chặn):

```bash
cd C:\Users\p\Desktop\Claude\CV
node fetch-before-ath.js
```

Cách hoạt động:
1. Đọc sheet DATA (CSV public) → ticker + TGE date
2. Lấy `ath_date` mới nhất từ CoinGecko `/coins/markets` (key đọc từ `.env`)
3. Mỗi token hỏi lần lượt: **Binance → Bybit → Gate.io → MEXC** (public API, không cần key)
4. Tính `min(low)` daily candles trong [TGE → ATH], theo các rule:
   - ATH trước TGE hoặc cùng ngày TGE (intraday) → bỏ trống
   - ATH trong 1–3 ngày TGE → beforeATH = close ngày TGE
   - **Bỏ candle đầu tiên của sàn** — wick listing là giá ảo (ARB mở 0.5, SUI 0.1); rule này cũng cover case sàn list muộn hơn TGE (SUI TGE 01/05 nhưng Binance list 03/05)
5. Output cuối: cột số (dấu phẩy thập phân) → copy paste thẳng vào ô **I2** của sheet

Khi nào chạy lại: khi thêm token mới vào sheet, hoặc khi token phá ATH mới (beforeATH phụ thuộc cửa sổ TGE→ATH nên ATH đổi thì phải tính lại). Không cần daily.

Đã verify khớp với số nhập tay: OP 0.396, SUI 0.362, ARB 0.739, TIA 2.13, ENA 0.703, EIGEN 2.142...

Chỉ sync 2 cột:
- Col L: ATH (`c.ath`)
- Col N: current price (`c.current_price`)

Cột J (beforeATH) **bỏ trống** — đã thử CoinGecko (401), Binance (451 geo-block), OKX (ít data), CryptoCompare (cần key, SSL issue), Gate.io (user từ chối), CoinDesk API (ít data). Chưa có giải pháp free hoạt động tốt.

---

## WTE Cards (Airdrop tab)

- Logo: lấy từ `unavatar.io/twitter/{handle}` — extract handle từ cột Twitter
- Rank badge (SS/S/A/B) nằm góc phải card, đứng sau Type
- Colors: SS=#8B5CF6 (purple, ★★★★), S=#FF5A36 (★★★), A=#FFA111 (★★), B=#FFD447 (★)
- CSS classes dùng rank trực tiếp: `.wte-card--SS`, `.rank-SS` — valid vì SS là alphanumeric

---

## Watchlist Tab (mục thứ 3 — giữa Valuation và Airdrop)

**Nav:** About me | Valuation | **Watchlist** | Airdrop  
**Route:** `/watchlist`

### Data sources

| Source | Mục đích |
|---|---|
| **Cloudflare KV** (binding `WATCHLIST`, key `projects`) | **Source of truth — cross-device.** Load đầu tiên khi mở tab |
| `watchlist-data.json` | 42 project tĩnh import từ CSV (Desktop) — chỉ fallback khi KV rỗng |
| `vc-tier1.json` | 33 Tier-1 VC/angel — filter tiêu chuẩn |
| `functions/api/watchlist.js` | Proxy Surf AI API + KV load/save (giữ `SURF_API` key an toàn) |
| `localStorage wl_projects_v2` | Cache project data trên browser |
| `localStorage wl_user_v2` | Participation chips per project |

### KV persistence (cross-device) — 2026-06-18

- **Binding name: `WATCHLIST`** (set trong Cloudflare Pages Dashboard → Settings → Functions → KV bindings). Code đọc `context.env.WATCHLIST`. **Tên này PHẢI khớp Dashboard** — đừng tự đổi.
- `wlInit()` load thứ tự: KV (`?action=kv-load`) → localStorage → static JSON. KV có data thì dùng luôn, KHÔNG để wlLoadStorage() ghi đè.
- `wlInitialFetch()` (static JSON fallback) chỉ ghi localStorage, **KHÔNG push lên KV** — tránh đè data đã sync bằng 37 project tĩnh.
- Mọi save (sync/add/delete) → `wlSaveStorage()` → ghi localStorage + POST `kv-save`. Nút `↑` Save thủ công cũng gọi cùng endpoint.

### Surf AI API

- **Base:** `https://api.asksurf.ai/gateway/v1`
- **Key:** `SURF_API` trong `.env` (local) + `.dev.vars` (wrangler) + Cloudflare Pages Dashboard (production)
- **Credits:** ~2,879 remaining, expire 06/2027
- **Endpoints dùng:**
  - `GET /search/airdrop?sort_by=total_raise&limit=100&phase=active` — 2 credits, list pre-TGE projects
  - `GET /project/detail?q=<name>` — 1 credit, full data (investors, tge_status, x_handle, logo)

### Filter logic

Chỉ hiện project có ít nhất 1 backer trong `vc-tier1.json`. Matching dùng substring (case-insensitive) — "a16z CSX" match "a16z".

### Admin mode

Password: `vi2702` (client-side only, không phải bảo mật thật).

Unlock → 3 nút xuất hiện (cùng size/style, icon đồng bộ):
- **↻ Sync** — gộp 2 phase trong 1 lần chạy:
  - Phase 1 (clean): project không còn trong active list → check `detail`, xóa nếu `tge_status === 'post'`. **Cap tối đa 10 detail call/sync** để tiết kiệm credit.
  - Phase 2 (thêm mới): fetch 100 từ Surf API, check Tier-1 + pre-TGE, thêm project mới. **KHÔNG filter theo raise** (Tier-1 invest seed nhỏ $3-4M bình thường).
- **↑ Save** — push toàn bộ `wlProjects` lên KV thủ công, báo `✓ Saved N projects` hoặc lỗi cụ thể.
- **+ Add** — mở **modal popup** (overlay giữa màn hình), thêm thủ công theo tên. Đóng bằng Cancel / click backdrop / Escape.

> Nút 🧹 Clean cũ đã bỏ — logic clean gộp vào Sync (2026-06-18).

### Layout notes (2026-06-18)
- Sub-tab bar (`.ard-subtabs`) `position:sticky; top:56px` — không mất khi scroll.
- Raise column width cố định `72px` — tránh spacing thừa giữa Project và Raise.
- Mobile ≤640px: ẩn cột VCs, chip nhỏ hơn.
- **Modal HTML phải nằm TRƯỚC `<script>` tag** — script chạy inline (không có DOMContentLoaded), đặt sau → `getElementById` null → crash toàn bộ JS → mất hết data hiển thị.

### Scripts

```bash
node import-watchlist.js    # parse surf-table*.csv từ Desktop → watchlist-data.json
node enrich-watchlist.js    # thêm x_handle + logo_url cho project chưa có (cần wrangler chạy)
```

### Participation chips

4 options per project: **Contribute** (cam) / Point / Retroactive / Yap. Multi-select. Lưu localStorage. Luôn hiển thị đủ 4, option chưa chọn mờ hơn.

### Arrow button

Mũi tên SVG — **cam + bấm được** nếu project có guide trong Airdrop tab (match tên WTE card), **xám + disabled** nếu chưa có. Click → navigate sang Airdrop + scroll đến card + highlight 1.5s.

---

## Personal Tab (mục thứ 4 cạnh About me/Valuation/Airdrop)

- Nav button "Personal" → password gate client-side (`PERSONAL_PASSWORD = 'hieu1403'`, hardcoded trong `index.html`, không phải bảo mật thật — chỉ chặn người xem thường)
- Unlock → lưu `sessionStorage.personal_unlocked = '1'`, không cần nhập lại trong session
- 3 sub-tab:
  - **X analysis** — xem mục riêng "X Analysis Tab" bên dưới
  - **Watchlist** — chưa định nghĩa nội dung
  - **Writing** — chưa định nghĩa nội dung
- Route `/personal` đã thêm vào `routeFromPath()`, server SPA fallback đã cover

---

## X Analysis Tab (Personal → X analysis)

**Status (2026-06-15):** MVP table view xong, đã test bằng `wrangler pages dev`, **chưa commit/push**.

### Đã làm
- `functions/api/x-analysis.js` — Cloudflare Pages Function, gọi X API v2 `GET /2/users/{id}/tweets?tweet.fields=public_metrics,created_at&exclude=retweets,replies`, trả 20 tweet gần nhất
- Secrets: `X_BEARER_TOKEN`, `X_USER_ID` (user `nguyen0xhieu`, id `1518820673581305857`) lưu trong `.env` (tham khảo) và `.dev.vars` (dùng cho `wrangler pages dev`, gitignored) — **CHƯA set trên Cloudflare Pages Dashboard** (cần làm trước khi deploy production)
- `.gitignore` thêm `.dev.vars`
- Frontend tab X analysis: 3 summary card (Posts / Avg engagement rate / Total impressions) + bảng tweet gần nhất (ngày, nội dung-link, impressions, eng. rate, like, RT, reply)
- Local test: chạy `npx wrangler pages dev . --port 8788` (server.js cũ port 8080 KHÔNG hỗ trợ Functions)

### X API setup — lưu ý quan trọng
- Account "Free" project bị **deprecated**, app trong đó báo lỗi `client-not-enrolled` dù đã add payment method
- Fix: tạo app mới trong project **"Pay Per Use"** (môi trường development/staging/production, mỗi cái cho phép tối đa 3 app) → Bearer Token từ app này hoạt động được
- X API hiện dùng **prepaid credits** (pay-per-use), không phải subscription tier cố định

### Đánh giá & hướng tiếp theo (chưa quyết định)
- Bàn về dashboard kiểu "KOL Growth OS" (Grok gợi ý, copy template của người khác) — nhận định: nếu chỉ làm metric card + chart tĩnh thì **không hữu ích hơn X Analytics có sẵn (free)**.
- Phần thực sự có giá trị, dựa theo phân tích x-algorithm (xai-org/x-algorithm):
  1. Tính tỉ lệ **(reply+quote)/like** — đo "amplification", X Analytics không show trực tiếp
  2. **Tracking theo thời gian** (followers/engagement theo tuần) — cần lưu snapshot định kỳ (vd: ghi vào Google Sheet hàng ngày, giống pattern ATH/currentPrice hiện tại), vì API chỉ trả 20 tweet gần nhất, không có lịch sử
- Sidebar kiểu Content Pillars/Calendar/Roadmap/Task Tracker (từ template Grok) — quá lớn, để dành cho sub-tab **Writing** sau, không làm trong X analysis.
- **User dừng ở đây vì mệt — quyết định hướng tiếp theo (amplification ratio / tracking) vào buổi sau.**

---

## Best Roles to Grind — Spec (chưa implement)

Tab Airdrop → sub-tab "Best Roles to Grind". User cung cấp danh sách project có role grinding, hệ thống tự tính rating.

### Rating system

| Tiêu chí | Stars | Logic |
|----------|-------|-------|
| Fundraising | 1–3★ | mốc cụ thể cần xác định từ data (xem bên dưới) |
| Layer-1 / Layer-2 | +1★ | chain type ưu tiên |
| Stable chain (Tempo, Arc...) | +2★ | established chain, ít rủi ro hơn |
| VC quality | +1★ | **TODO** — cần bộ VC list trước khi làm |

**Final rating:** tổng stars → S (cao) / A / B

### Fundraising thresholds (chưa xác định)
Cần phân tích phân phối fundraising của ~71 token trong DATA sheet để tìm breakpoint tự nhiên cho 1★ / 2★ / 3★.

### Data source
Dự kiến: thêm tab mới trong Google Sheet (tương tự Work to Earn). User nhập: project name, twitter handle, chain type, fundraising (lấy từ DATA nếu có). Website fetch CSV → tính rating → render cards.

### VC bonus (TODO)
Cần có bộ data: danh sách VC tier-1/tier-2 → nếu project có VC trong list → +1★. Làm sau khi có data.

---

## Pending / Known Issues

1. ~~**beforeATH** — chưa có giải pháp~~ → **ĐÃ GIẢI QUYẾT 2026-06-11** bằng `fetch-before-ath.js` chạy local (xem mục riêng ở trên).

2. **×ATH filter** — hiện filter ATH cùng ngày TGE (cả ở website lẫn Apps Script). Nhưng một số token ATH trong 1-3 ngày đầu cũng có thể là pump ảo. Cân nhắc mở rộng window filter.

3. **CoinGecko API key** — đang dùng Demo key trong `.env` (đổi từ `.env.txt`, 2026-06-11; gitignored). Key từng bị commit lên GitHub trước đây — nên regenerate nếu cần bảo mật. `.env` cũng chứa `COINDESK_API_KEY` (chưa dùng — CoinDesk API thử rồi nhưng ít data).

---

## Files quan trọng

```
index.html            — toàn bộ website (HTML + CSS + JS)
server.js             — dev server (có SPA fallback cho /valuation)
export-pdf.js         — xuất PDF toàn trang bằng Puppeteer (cần server đang chạy)
fetch-before-ath.js   — fill cột I beforeATH, chạy local (xem mục riêng)
analyze-pattern.js    — script nháp phân tích pattern retention (local, không push)
.env                  — API keys: CG_API_KEY, COINDESK_API_KEY (gitignored)
.gitignore            — bao gồm .env, node_modules, .claude/
```

---

## Lệnh thường dùng

```bash
node server.js              # chạy local → http://localhost:8080
node export-pdf.js          # xuất cv.pdf (cần server đang chạy)
node fetch-before-ath.js    # tính beforeATH → copy output paste vào cột I sheet
git add index.html && git commit -m "..." && git push
```

---

## Decisions Log

- 2026-06-10: Cập nhật mapping cột CSV trong `index.html` (`fetchPublicData`) để khớp với cột mới của Google Sheet tab DATA — reason: Sheet đã đổi thứ tự cột (TGE DATE chuyển từ G ra A, các cột khác dồn theo), khiến `fundraising` luôn = 0 → toàn bộ data bị filter, bảng Valuation trống trên 0xhieu.xyz.
- 2026-06-10: Đổi ngưỡng Market Condition `lvlIdx` từ `[2,4,8,15]` sang `[1,2,5,10]` (Dead/Weak/Normal/Good/Uptrend) — reason: phân tích median4 của 68 deal lịch sử cho thấy ngưỡng cũ làm Normal quá hẹp, không phải nhóm đông nhất; ngưỡng mới giữ Normal là nhóm đông nhất và Uptrend (≥10) khớp với các giai đoạn uptrend thực tế (Q1/2023, Q1/2024 có median4 ~13.5-16.5).
- 2026-06-10: Đổi tiếp Market Condition từ 5 levels (Dead/Weak/Normal/Good/Uptrend) sang 3 levels (Weak/Normal/Strong), ngưỡng `[4.3, 13]` — reason: "Normal nhiều nhất" mâu thuẫn với cảm nhận thực tế của user, vì 2025-2026 chiếm 72% data (do thiếu data 2018-2024) khiến median tổng thể trùng với giai đoạn user coi là tệ. Calibrate lại theo giai đoạn: Strong≈chu kỳ 2023-2024 (≥13), Normal≈Q2-Q3/2022 (4.3-13), Weak≈2025-2026 (<4.3).
- 2026-06-10: Đánh giá chia "Recent TGE Multiples" thành 3 phân khúc FDV (thay vì 2) — kiểm tra trên toàn bộ 68 deal lịch sử cho thấy nhóm <$100M và $100-300M có median gần như giống hệt (4.78 vs 4.83), chỉ nhóm ≥$300M khác biệt rõ (2.70). → giữ nguyên 2 phân khúc <$300M / ≥$300M, không chia 3.
- 2026-06-10: Thêm span-aware window cho "Recent TGE Multiples" — mỗi nhóm lấy 6 deal gần nhất, nhưng nếu deal thứ 6 cách deal mới nhất >60 ngày thì giảm còn 4 (đồng nhất với logic mid-term của Market Condition), tránh nhóm High FDV (ít deal hơn) bị kéo dài tới 4 tháng dữ liệu trong khi nhóm Low FDV chỉ 1 tháng.
- 2026-06-10: Thu nhỏ kích thước result box của "Predict TGE FDV" (`#calc-result`: padding 8px 10px, range 17px, sub 10.5px, price pill 11px; bỏ label "Predicted TGE FDV" dư thừa) — reason: bản restyle trước đó (commit 2bb0b04) làm box kết quả cao hơn box form, khiến cả hàng `.val-analysis` 3-card bị giãn cao theo (do `height:100%` + `align-items:stretch`). User yêu cầu 3 box cố định kích thước, không được "mở rộng box".
- 2026-06-10: Bỏ `height:100%` + `display:flex` trên `#calc-result` (giữ lại padding/box-sizing) — reason: sau khi card "Predict TGE FDV" bị stretch lên 175px (bằng card "Market condition"), `#calc-result` với `height:100%` lại tính theo chiều cao card đó nhưng cộng thêm vào phần đã bị label đẩy xuống → tràn ra ngoài card 24px ("box cam rơi ra ngoài"). Bỏ height ép buộc, để box cam có chiều cao tự nhiên (~122px), nằm gọn trong card.
- 2026-06-10: Gộp nội dung kết quả "Predict TGE FDV" còn 2 dòng — bỏ hẳn dòng "Weak regime · 68 data pts" và badge giá riêng (`#calc-res-price`), gộp "Expected $X" + "≈ $Y/token" vào chung 1 dòng `#calc-res-sub` — reason: user yêu cầu giảm số chi tiết hiển thị để box kết quả không còn cao hơn box form, tránh nới rộng `.val-analysis` row.
- 2026-06-10: Bỏ luôn dòng range "$lo – $hi" (`#calc-res-range`), chỉ còn 1 dòng duy nhất "$Expected ≈ $price/token" — reason: user thấy box kết quả vẫn quá nhiều spacing so với nội dung, yêu cầu bỏ dòng range để gọn lại còn 1 dòng + nút "New calculation".
- 2026-06-10: Đổi nút "← New calculation" thành icon "✕" đặt góc trên-phải `#calc-result` (absolute position) — reason: user yêu cầu thay text link bằng dấu X ở góc, gọn hơn cho box 1 dòng.
- 2026-06-10: Tăng kích thước `#calc-result` (padding 10px, gap 4px, `.res-price` 11px/lh1.5) để khớp chiều cao với box `.split-box` (×3.46) ở 2 card kia (~58.5px vs 60px) — reason: user muốn box kết quả "to bằng" box ×3.46 cho đồng bộ visual giữa 3 card.
- 2026-06-10: Chuyển nút "✕" reset từ góc trên-phải (18px) sang giữa-trái, to hơn (24px, font 18px), sau đó user nói nhầm hướng → đổi lại thành giữa-phải (giữ size 24px) — reason: user muốn nút X to, dễ nhìn, ở bên phải box.
- 2026-06-10: `predictFDV()` — sample pool (regime detection + base_mult) giờ lọc theo FDV bucket của project đang predict (Low <$300M / High ≥$300M, giống "Recent TGE Multiples"), fallback dùng toàn bộ data nếu bucket <2 entries — reason: trước đó sample lấy từ toàn bộ data (đa số là Low FDV, median ×4.8) nên project High FDV ($300M) bị predict ra ×1.33 ($400M), trong khi thực tế High FDV median chỉ ×0.60-2.70. Sau khi split, $300M FDV ra ×0.33 ($99M) — cùng bậc với median thực tế.
- 2026-06-10: Bỏ luôn STEP 7-9 (market compression `mktMap`, FDV penalty `kMap`, liquidity cliff) trong `predictFDV()` — `finalMult = base_mult` (weighted median, recency-weighted, đã clamp theo min/max của bucket) — reason: sau khi sample đã split theo FDV bucket (commit 3859f71), 2 lớp compression/penalty cũ làm "double-compress" → High FDV $300M ra ×0.33, thấp hơn cả median thực tế ×0.60. Bỏ 2 lớp này, $300M FDV ra đúng ×0.60 (= median thực tế), $150M FDV ra ×2.53. User chọn đơn giản hóa (option C) thay vì giữ 1 lớp phạt nhẹ (option B).

- 2026-06-11: Thêm box **Danger Zone** (×ATM ≥ 15, token TGE mới nhất lên đầu, TGE < 30 ngày → badge "⚠ FAKE PUMP") — reason: backtest 17 token từng ≥15× cho thấy 100% về đáy; ngưỡng 15× do user chọn từ kinh nghiệm 2025-2026 (thị trường rút thanh khoản, VC lãi 15×+ chắc chắn xả). Token vừa TGE đã vào vùng = pump láo → cảnh báo đặc biệt.
- 2026-06-11: Website lưu thêm `ath_date` từ CoinGecko, filter ×ATH = "—" nếu ATH cùng ngày TGE — reason: CoinGecko lấy absolute high kể cả râu nến intraday ngày listing, không phản ánh giá có thể trade được. Apps Script cũng áp rule tương tự (giữ nguyên giá trị cũ thay vì ghi đè ATH intraday).
- 2026-06-11: Build `fetch-before-ath.js` chạy local thay vì Apps Script — reason: Apps Script chạy trên server Google ở Mỹ → Binance chặn HTTP 451, CoinGecko Demo không có quyền market_chart (401), CryptoCompare cần key (user gặp lỗi SSL khi đăng ký), CoinDesk/OKX ít data. Máy local VN IP gọi Binance/Bybit/Gate/MEXC thoải mái, cascade 4 sàn cover 49/68 token (19 còn lại là ATH intraday — bỏ đúng logic).
- 2026-06-11: `fetch-before-ath.js` bỏ candle ĐẦU TIÊN của sàn khi tìm min — reason: wick listing là giá khớp ảo (ARB mở 0.5, SUI 0.1, HOOK 0.1 trong khi đáy thật là 0.739/0.362/1.08); bỏ theo "candle đầu của sàn" thay vì "ngày TGE+1" vì có case sàn list muộn hơn TGE (SUI TGE 01/05, Binance list 03/05).
- 2026-06-11: Chuyển key từ `.env.txt` sang `.env`, script đọc key bằng regex từ file — reason: không hardcode key trong source trước khi push fetch-before-ath.js lên GitHub.
- 2026-06-11: WTE cards thêm logo từ `unavatar.io/twitter/{handle}` (22px, tròn), Rank badge chuyển sang góc phải đứng sau Type — reason: user muốn nhận diện dự án bằng logo, không cần thêm cột sheet hay folder ảnh.
- 2026-06-11: Đổi "Investment Researcher" → "Investment Analyst" + mô tả "Analyzed Bitcoin and altcoins at VHG"; hero tagline "Former crypto researcher" → "Former crypto analyst" — reason: user thấy mô tả đúng bản thân hơn.
- 2026-06-11: Xuất PDF bằng Puppeteer (`export-pdf.js`) với `height = document.body.scrollHeight` — reason: khổ giấy cố định làm PDF bị cắt 3 trang; set height động ra 1 trang liền y chang website.

---

- 2026-06-17: **UI consistency rule** — mọi tab phải dùng cùng wrapper (`.val-wrap`: `max-width:900px; padding:0 24px 24px`), cùng headline class (`.val-intro`), cùng box style (`.val-table-section`: border + border-radius 14px + white thead sticky). Bất kỳ tab mới nào cũng phải match các giá trị này, không tự ý đặt padding/style riêng.

- 2026-06-17: Build **Watchlist tab** thay thế Personal tab — pre-TGE project tracker dùng Surf AI API. Nav mới: About me | Valuation | Watchlist | Airdrop. Data: static JSON từ CSV + Surf API enrichment + localStorage cho user preferences. Filter: Tier-1 VC list (33 names). Admin mode: password `vi2702`, 3 admin buttons (Clean/Sync/Add).

- 2026-06-17: Dùng `logo_url` từ Surf API thay vì `unavatar.io` — reason: unavatar bị rate-limit 429 khi load 41 ảnh cùng lúc.

- 2026-06-17: Sync button check `shownNames` (Tier-1 filtered) thay vì toàn bộ `wlProjects` — reason: localStorage có thể chứa project không pass Tier-1 từ sync cũ, gây "already up to date" sai.

- 2026-06-18: **KV cross-device hoạt động** sau khi sửa binding name về `WATCHLIST` (khớp Dashboard). Root cause của "máy khác trống trơn": (1) binding name trong code có lúc bị đổi nhầm sang `KV_BINDING` → KV undefined → trả `[]`; (2) `wlInitialFetch()` static JSON push 37 project tĩnh đè data KV; (3) `wlInit()` KV-path gọi `wlLoadStorage()` ghi đè wlProjects bằng localStorage rỗng. Đã fix cả 3.
- 2026-06-18: Sync gộp luôn clean TGE (bỏ nút 🧹) — Phase 1 clean (cap 10 call), Phase 2 add. Bỏ filter raise≥5M (sai — Tier-1 invest seed nhỏ). Add chuyển sang modal popup. 3 nút admin đồng bộ icon `↻ ↑ +`. Sub-tab sticky, raise width 72px, mobile ẩn cột VCs.
- 2026-06-18: **Tách Watchlist thành tab top-level "Pre-TGE"** (nằm giữa Valuation và Airdrop) — Watchlist vốn là sub-tab trong Airdrop, giờ thành tab độc lập (`/pre-tge`, backward-compat `/watchlist`). Airdrop tab giờ chỉ còn Work to Earn (bỏ sub-tab bar). Route `showPreTGE()` gọi `wlInit()`; `showAirdrop()` gọi `renderWTE()` trực tiếp. Arrow button trong Pre-TGE → `showAirdrop()` thay vì `showArdSubTab('wte')`.
- 2026-06-18: **Pre-TGE table layout** — bỏ cột `#`, 5 cột desktop theo tỉ lệ 4-2-4-2-1 (Project/Raise/VCs/Available/arrow), mobile 4-2-2-1 (ẩn VCs). Bảng scroll nội bộ (`max-height: calc(100vh - 180px); scrollbar-gutter: stable`). VCs hiển thị tối đa 5 tên, mỗi tên 1 dòng (đổi `join(', ')` → `join('<br>')`). Chip "Yap" đổi thành "Else". Header + nội dung căn trái. PROJECT header lùi `padding-left: 46px` (logo 22px + gap 8px + cell padding 16px) để align với tên dự án. AVAILABLE header lùi `padding-left: 24px` (cell padding 16px + chip padding 8px) để align với chip text.
- 2026-06-17: Watchlist layout fixes — `wl-wrap` padding đồng bộ với `val-wrap` (`0 24px 24px`), admin button dùng `position:absolute` góc phải của headline row, thead dùng `background:white; position:sticky` giống Valuation, thêm `margin-top:5px` cho `.wl-table-section`.

- 2026-06-16: Thêm rank tier **SS** (★★★★, purple #8B5CF6) vào WTE cards — nằm trên S, sort đầu tiên. Set cột Rank = `SS` trong sheet để dùng.

- 2026-06-15: Thêm tab **Personal** (4th nav item) với password gate client-side + 3 sub-tab placeholder (X analysis / Watchlist / Writing) — reason: user cần khu vực riêng cho công việc cá nhân (X growth, watchlist, writing), chưa cần bảo mật thật nên chọn gate đơn giản để làm nhanh, build nội dung từng sub-tab sau.

---

- 2026-06-23: **CV content updates** — X handle `0xhieu_eth` → `0xhieuxyz` (x.com + t.me); Telegram link `t.me/0xhieu_eth` → `t.me/nguyen0xhieu`; email bottom fix `mailto:` → Gmail compose; X audience 7k→10k; Crypto Markets: bỏ "futures", thêm "Binance Vietnam"; Graphic Designer: gọn lại, bỏ portfolio link.

- 2026-06-23: **Valuation box redesign** — `--box-h` 192px → 160px. Grid đổi thành 3 rows explicit: `40px 80px 40px` (title/content/bottom). Padding card: `0 12px` (bỏ vertical). Title (vc-q1): `display:flex; align-items:center; justify-content:center; align-self:stretch; margin:0`. Content (vc-q23): `grid-row: 2/3; overflow:hidden`. Bottom (vc-q4): `display:flex; align-items:center; justify-content:space-around`. Market levels buttons: `height:26px; display:flex; align-items:center` → cách đều 7px trên dưới trong row 40px. Predict TGE FDV button: `height:26px; align-self:center` — phải có `align-self:center` để không stretch full grid row.

- 2026-06-23: **Danger Zone label** — bỏ emoji 🔴 và "×ATM ≥ 15", chỉ giữ "Danger Zone".

- 2026-06-24: **CV content updates (session 2)** — "Join Crypto Market" đổi từ "Crypto Markets"; highlight caption "futures OG" → "OG trader"; X audience 6k→10k (sửa lại đúng); Crypto Markets bullet: bỏ "futures", thêm "Binance Vietnam"; Graphic Designer bullet gọn hơn.

- 2026-06-24: **Profitable Patterns box** — thêm box mới hàng 2 trong val-boxes (1/3 màn hình desktop, full mobile). Đọc cột P (index 15) từ CSV làm field `label`. Filter 3 pattern: `healthy`, `x10-ed`, `x5-ed`. Render list với green muted background (`rgba(34,197,94,0.08)`), giống style Danger Zone. Gọi `renderPatterns()` trong `renderAll()`.

- 2026-06-24: **Font scale audit** — scale: `10/11/12/13/14/15/19px`. Fix 4 vi phạm: `16px→15px` (`.wl-add-btn`, `.wl-modal-title`), `9px→10px` (`.danger-badge-new`, `.tge-modal-body .td-size`).

- 2026-06-24: **Apps Script ATH filter** — user đổi `ATH_SKIP_DAYS` từ 3 → 1, và bỏ `=` trong điều kiện (`<` thay vì `<=`). Kết quả: chỉ skip ATH intraday (< 1 ngày), công nhận ATH từ ngày 1 trở đi. Script này chỉnh trong Google Apps Script, không trong repo.

- 2026-06-24: **fetch-before-ath.js chạy** — 68 tokens, output lưu `before-ath-output.txt`. RE (hàng 69) chưa có vì được thêm vào sheet sau khi script đã chạy. Chạy lại để lấy beforeATH cho RE sau khi thêm CoinGecko ID vào cột C.

- 2026-07-06: **Thay "Profitable Patterns" bằng box "Trending Narratives"** — box cũ đọc cột P (index 15) làm `label`, nhưng sheet thật chỉ có 15 cột (A→O), cột P không tồn tại → box luôn hiện 0 project, chết từ đầu. Box mới gom project theo cột D (narrative) có TGE ≥ 01/02/2025, đọc trực tiếp ×TGE (cột K) / ×ATH (cột M) đã tính sẵn trong sheet, xếp hạng theo **median ×ATH** (không dùng trung bình) — median không bị 1 outlier đơn lẻ (vd MYX ×380) kéo lệch cả narrative.
- 2026-07-06: **Fix Trending Narratives — thêm gate median ×TGE ≥ 1** — bug: narrative "Identity" (H ×TGE 0.76, BILL ×TGE 0.9 — cả 2 dưới giá vốn VC lúc TGE) vẫn lọt top vì H pump ×16.9 sau đó kéo median ×ATH lên, y hệt lỗi outlier của MYX nhưng núp trong nhóm chỉ 2 dự án nên median không đủ sức "trung hòa". Thêm điều kiện `medTGE >= 1`: narrative chỉ tính là "trending" nếu thị trường tin ngay lúc TGE (giá ≥ giá vốn VC), không phải nhờ 1 coin ăn may pump sau. Loại Identity + Privacy khỏi box sau fix này.
- 2026-07-06: **Box Trending Narratives về đúng kích thước 1/3 màn hình, cao cố định `--box-h`** (revert bản full-width/tự giãn cao trước đó) — hiển thị gọn còn "Tên narrative + ×median", bỏ dòng phụ liệt kê ticker/count. `#narrative-list` chỉ thêm `overflow-y:auto` (không đổi chiều cao khung) để cuộn khi list dài hơn khung.
- 2026-07-06: **Đổi theme màu: xoay quanh đen + `#FFA111`, bỏ xanh/đỏ/tím/vàng rải rác** — Danger Zone (nền đỏ, badge "FAKE PUMP", số ×multiple), Market condition (background 3 màu xanh/vàng/đỏ theo level), Trending Narratives (số ×ATH xanh lá) → tất cả đổi thành sắc cam `--accent`/đen, phân biệt mức độ bằng opacity thay vì đổi hue. Badge "FAKE PUMP" đổi nền đen + chữ cam (thay vì nền đỏ + chữ trắng) cho nổi bật kiểu "stamp cảnh báo". Riêng rank badge WTE (SS/S/A/B) vẫn giữ 4 màu riêng vì cần phân biệt tier — nhưng đổi bộ màu mới: SS=`#FFA111`, S=`#8B5CF6` (tím), A=`#3B82F6` (xanh dương), B=`#22C55E` (xanh lá) — trước đó SS=tím, S=đỏ, A=cam, B=vàng.
- 2026-07-06: **Market condition Strong/Normal/Weak — bỏ style pill/button** — 3 nút trước có background bo góc màu theo level, nhìn giống button bấm được (nhưng chỉ là div hiển thị trạng thái, không click). Đổi thành text + underline (`border-bottom: 2px solid var(--accent)`) khi active, không còn nền bo góc.
- 2026-07-06: **Market condition: bỏ luôn underline, chỉ để chữ cam đậm; card về nền xám tĩnh** — user thấy underline dư, chỉ cần chữ `var(--accent)` là đủ báo hiệu active. `mktCardBg` (JS, tint theo level) bị xoá — card giờ `background: var(--off)` cố định, không đổi theo Strong/Normal/Weak nữa.
- 2026-07-06: **Trending Narratives / Danger Zone / bảng TGE ("Tracking altcoins...") — scroll được nhưng ẩn thanh scrollbar** — dùng `scrollbar-width:none` (Firefox) + `-ms-overflow-style:none` (Edge legacy) + `::-webkit-scrollbar{display:none}` (Chrome/Safari), giữ `overflow-y:auto` nên vẫn lướt chuột/chạm được, chỉ ẩn thanh scrollbar (đỡ chiếm chỗ/xấu theo yêu cầu). `#narrative-list` giới hạn `max-height:88px` (~3 dòng, chừa spacing) thay vì show hết.
- 2026-07-06: **Xoá toàn bộ tính năng Pre-TGE / Watchlist khỏi Airdrop** — theo yêu cầu dọn tính năng không còn dùng. Archive đầy đủ code + data (functions/api/watchlist.js, vc-tier1.json, watchlist-data.json, import-watchlist.js, enrich-watchlist.js, pre-tge-research.js, pretge-run-20260626.log, và toàn bộ HTML/CSS/JS liên quan trong index.html) lưu tại `~/Desktop/pre-tge-watchlist-archive-2026-07-06.md` trước khi xoá — có thể tham khảo/khôi phục lại nếu cần. Airdrop giờ chỉ còn Work to Earn, bỏ luôn sub-tab bar (chỉ 1 tab thì không cần UI chuyển tab). Env vars `SURF_API`/`CLAUDE`/KV binding `WATCHLIST` không còn được dùng bởi code nào trong repo nhưng chưa xoá khỏi Cloudflare Dashboard (ngoài phạm vi truy cập).
- 2026-07-06: **Dead-code sweep sau khi xoá Pre-TGE** — quét toàn bộ class CSS không còn được HTML/JS nào dùng, xoá: `.ard-subtab-btn`/`.ard-tab-panel` (chết do bỏ sub-tab bar), và một số orphan có từ trước (không liên quan Pre-TGE): `.pf-*` (bảng "Projects & Fundraising" chưa từng được implement/dùng), `.val-panel-head*`, `.baseline-num`/`.baseline-sub`, `.calc-fields` (số nhiều — bản dùng thật là `.calc-field` số ít), `.danger-sub`, `.wte-count`, `.td-source`.
- 2026-07-10: **Watchlist auto-research pipeline (`watchlist-research.js`)** — Node script (chạy cron/pm2 trên VPS) gom dự án chưa TGE từ **Surf API** (`search/airdrop` + `project/detail`) + scrape **Telegram `t.me/s/crypto_fundraising`** (trang public, không cần bot), lọc **VC Tier-1** (`vc-tier1.json`, 38 quỹ) rồi **ChatGPT (gpt-4o-mini)** chấm `degen_farm YES/NO/MAYBE` + phân narrative (1 trong 13 nhãn dropdown) + lý do. Ghi ứng viên vào tab **"Danh sách chờ"** (A tên · B link X · C narrative · D gọi vốn dạng số triệu · E Note=`Nguồn·VC·lý do`) bằng cách **POST tới 1 Apps Script Web App (`apps-script-webhook.gs`, dán vào Sheet) làm cổng ghi** — KHÔNG dùng service account vì Google chặn tạo key SA (org policy `iam.disableServiceAccountKeyCreation`). Apps Script nhận POST (có `WL_WEBHOOK_SECRET`), dedup lần cuối rồi ghi. Node dedup nhẹ trước bằng đọc gviz CSV (free). Không cần `npm install` (Node ≥18 có fetch). user tự thẩm rồi copy sang tab `Watchlist`. Dedup theo tên với cả 2 tab, chỉ append. Prompt GPT để **nhẹ tay** (chỉ NO khi chắc chắn enterprise/B2B; chain→gần như luôn YES) sau khi test thấy bản gắt loại nhầm cả Tempo/OpenSea. Chế độ `--dry` in ra không ghi Sheet; env `MAX_DETAIL`/`TG_PAGES` để test nhẹ. Secret: `SURF_API`+`OPENAI` trong `.env`, `service-account.json` (đều gitignored, user tự sync). Xem `WATCHLIST-RESEARCH-SETUP.md`. **CHỜ USER:** tạo 2 tab Sheet + service account + share Sheet cho robot + deploy VPS.
- 2026-07-10: **Watchlist (Pre-TGE tracker) v2 — Sheet-driven, thay placeholder "coming soon"** trong sub-tab Airdrop. Đọc tab Google Sheet tên `Watchlist` qua gviz CSV (cùng sheet ID với Work to Earn), cột: A tên · B X handle · C narrative · D gọi vốn · E "có việc" (YES/NO). Render card lưới 2 cột (mobile 1 cột), gap 0.5 hàng, tái dùng style/typography của WTE card (`.wl-*`). Badge: YES = "Có việc" (cam); nếu tên khớp slug card WTE thì thành nút bấm được "Có việc →" → `wlGoWork()` chuyển tab Work + scroll + flash 1.5s; NO = "Chưa có" (xám). Logo lấy từ `unavatar.io/twitter/<handle>`. **Guard quan trọng:** khi tab `Watchlist` chưa tồn tại, gviz KHÔNG báo lỗi mà trả về tab DATA (sheet đầu) với HTTP 200 → `parseWL` nhận diện chữ ký cột DATA (`TGE DATE|FUNDRAISED|TICKER|TOTAL SUPPLY`) và trả `[]` để không render data valuation thành card rác. Lazy-fetch lần đầu mở tab. Verify bằng Playwright (mock + fetch thật). **User tự thêm/xóa project bằng cách sửa Sheet, không cần deploy.**

## Failed Approaches

- 2026-06-11: Apps Script + CoinGecko `market_chart/range` và `market_chart?days=max` → 401 (Demo key không có quyền) → bỏ.
- 2026-06-11: Apps Script + Binance klines → 451 geo-block (server Google ở Mỹ) → chuyển sang chạy local.
- 2026-06-11: Apps Script + CryptoCompare → yêu cầu API key, user đăng ký bị "Invalid SSL certificate" → bỏ.
- 2026-06-11: Apps Script + Gate.io → user từ chối dùng. OKX + CoinDesk Data API → chạy được nhưng coverage quá ít → bỏ.
- 2026-06-11: `fetch-before-ath.js` bản đầu lấy min kể cả candle listing → ra giá wick ảo (ARB 0.5, SUI 0.1) → fix bỏ candle đầu tiên của sàn.
- 2026-06-18: Tự đổi KV binding name `WATCHLIST` → `KV_BINDING` vì tưởng config sai → Dashboard thực tế là `WATCHLIST` → waste 2 commit. **Bài học: không đoán mò config/binding name, hỏi user hoặc xem Dashboard.**
- 2026-06-18: Filter Sync bỏ qua project raise < $5M → sai, Tier-1 (Coinbase Ventures, a16z CSX) invest seed $3-4M đầy → bỏ filter.
- 2026-06-18: Đặt modal HTML sau `</script>` → `getElementById` null → `null.addEventListener` crash toàn bộ JS → mất hết data hiển thị → fix dời modal lên trước script.
