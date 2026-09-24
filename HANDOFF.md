# HANDOFF — 0xhieu.xyz (repo `cv`)

**Chốt trạng thái:** 2026-09-24
**Repo:** https://github.com/KattyFury/cv · **Local:** `D:\Files\Claude\4_0xhieu`
**Live:** Cloudflare Pages, project **`0xhieu-xyz`** (khác tên repo) — auto-deploy từ `main`.

> File này chỉ ghi **sự thật hiện tại** + **luật/bẫy còn hiệu lực**. Lịch sử cũ (log quyết định từ 06/2026) nằm trong git history của file này, trước commit dọn repo 2026-09-24.
> Sửa code xong: cập nhật đúng mục liên quan + thêm 1 dòng vào **Nhật ký** cuối file. Không thêm mục "HANDOFF mới nhất" kể lể.

---

## 1. Repo có gì

```
index.html            — TOÀN BỘ website (HTML + 1 khối CSS + JS inline)
functions/api/        — Cloudflare Pages Functions, backend DUY NHẤT
  val.js              — GET công khai / POST cần ADMIN_PASS: dự án Valuation (+ giá từ bot)
  wte.js              — GET công khai: card Work to Earn đang public
  private.js          — POST cần ADMIN_PASS: CRUD card Work (cá nhân + public)
  ai.js               — GET công khai / POST cần ADMIN_PASS: bài viết tab AI
bot/                  — job lấy giá hằng ngày, chạy Docker trên PC nhà (xem bot/README.md)
_redirects            — SPA fallback: /* → /index.html
DESIGN_SYSTEM.md      — luật thiết kế (màu, chữ, lưới, thành phần). ĐỌC trước khi đụng giao diện
highlights.txt + highlights/   — ảnh + caption mục Highlights ở CV
icon.png              — favicon + nút mèo + logo navbar
pfp.webp · og.png     — avatar hero · ảnh preview khi share link (1200×630)
camera.svg · plus.svg — 2 icon tô bằng CSS mask (nút chụp ảnh, nút thêm dự án)
html2canvas.min.js    — DOM→PNG cho nút camera. Để trong repo, không CDN, lazy-load khi bấm
```

Secret: `ADMIN_PASS` đặt ở Cloudflare Dashboard; bot dùng `bot/.env` (gitignore). **Không có secret nào trong repo.**

## 2. Bốn tab

| Tab (nav) | Route | Nội dung | Ngôn ngữ |
|---|---|---|---|
| CV | `/` | Hero · Experience (timeline) · Highlights · Available for | **Tiếng Anh cố định** |
| Valuation | `/valuation` | Bảng altcoin 7 cột + 3 box phân tích | Toggle VI/EN, mặc định VI |
| AI | `/ai` | 4 hub bài viết: INSIGHTS · LEARN · TOOLS · BUILD | Toggle VI/EN |
| Work | `/airdrop` | Card Work to Earn theo rank + thanh lọc `$ S A B C` | Toggle VI/EN |

Nút mèo góc dưới phải (cả 4 tab) = **Agent**, mới có vỏ ("coming soon"). Agent là dự án riêng, sẽ ở chung repo với bot.

## 3. Data

```
Cloudflare KV `WORK` (namespace b8fab2f8a83f45f0a023d2ba3ce78cde)
  ├─ val-projects    ← admin (POST /api/val)      data nhập tay
  ├─ val-prices      ← bot   (chỉ trường giá)     atm · ath · athDate · atl · atlDate
  ├─ personal-tasks  ← admin tab Work
  └─ ai-posts        ← admin tab AI
```

- Cả 4 endpoint dùng **chung KV `WORK`** và **chung 1 mật khẩu `ADMIN_PASS`**, kiểm tra ở server. Mở khoá ở tab nào thì cả 3 tab cùng mở; mật khẩu giữ trong `sessionStorage`.
- **Không còn đọc Google Sheet ở đâu cả** (từ 2026-09-22).
- Nguồn ngoài còn lại, gọi thẳng từ client, không key: **Google Translate gtx** (dịch VI→EN tab Work + AI) · **unavatar.io** (logo card Work).

### `val-projects` — 1 dự án

`ticker` (khoá chính, viết hoa) · `tgeDate` · `narrative` (1 trong 15 slug) · `fundraising` (USD) · `vcAlloc` (%) · `totalSupply` · `priceTGE` · `cgId` · `binanceSymbol`. **7 trường đầu bắt buộc**, thiếu thì server chặn lưu.

### Luật của `val.js`

- **Không lưu bội số nào** (×TGE, ×ATL, ×ATH, ×ATM) — client tự tính lúc render, một nguồn duy nhất.
- **`priceTGE` không bao giờ bị bot ghi.** Action `prices` có whitelist: chỉ nhận `atm · ath · athDate · atl · atlDate · updatedAt`.
- Narrative lạ → để trống cho admin sửa, không nhét bừa vào nhóm (lệch median box Narrative).

### Bot (`bot/`)

Chạy 1 lượt lúc khởi động, rồi mỗi ngày lúc `RUN_AT_HOUR` (mặc định 2h VN). CoinGecko → `atm/ath/athDate`; Binance klines → `atl` = đáy thấp nhất trong **[ngày lên sàn → ngày ATH]**, đã bỏ nến ngày lên sàn. Chạy ở máy nhà vì **Binance trả HTTP 451** cho server một số nước (Apps Script/Worker đều dính).

## 4. Valuation — công thức

```
vcPrice = fundraising / (vcAlloc/100) / totalSupply
×TGE = priceTGE / vcPrice      ×ATM = atm / vcPrice
×ATH = ath / vcPrice           → "—" nếu ATH trong vòng 7 ngày sau TGE, hoặc bot đặt cờ athWick
×ATL = atl / vcPrice           (đáy trước ATH, hiện trong ô ×ATH dạng "đáy → đỉnh")
vcFDV = fundraising / (vcAlloc/100)
```

- **Bảng 7 cột:** Ticker · Narrative · TGE · ×TGE · ×ATH · ×ATL · ×ATM. Ticker **đậm = vcFDV ≥ $300M**. Ô số bỏ dấu `×`, dấu thập phân theo ngôn ngữ; ×ATM 3 số lẻ, còn lại 2.
- **Cột 176 + khe 16 nhét trong padding ô** (184 · 192×5 · 184 = 1328), khai bằng % để co theo màn. Đừng chia đều 1328/7, đừng kéo giãn cột.
- Bấm tiêu đề màn → popup bảng dài (clone thead/tbody của bảng). JS đo `--ck1..7` để mỗi cột trong popup thẳng mép trái.
- **Box "Hệ số TGE gần đây":** chia 2 rổ ở vcFDV **$300M**, mỗi rổ lấy 6 TGE gần nhất (token thứ 6 cách >60 ngày → còn 4), hiện median. Market condition = median ×TGE của 6 deal gần nhất: Weak <4.3 · Normal 4.3–13 · Strong ≥13. **Đừng tách thêm bậc dưới $300M** — data không khác nhau.
- **Dự đoán FDV TGE:** `predictFDV()` lấy weighted median theo rổ FDV của dự án đang đoán (rổ <2 mẫu thì dùng toàn bộ).
- **Vùng nguy hiểm:** ×ATM ≥ 15, TGE mới nhất lên đầu; TGE < 30 ngày → badge "⚠ FAKE PUMP".
- **Narrative đang hot:** mọi narrative có data từ 02/2025, xếp theo **median ×TGE** (không dùng ×ATH — 1 coin pump muộn kéo cả nhóm), kèm `SL:nn` số deal.
- Mỗi box luôn vẽ đủ 3 chip (`pad3()`). Tiêu đề box kiêm nút mở popup giải thích.
- **Admin:** icon `+` mở danh sách dự án (chỉ data nguồn); bấm dòng danh sách hoặc dòng bảng → form sửa. `ticker` khoá khi sửa. Ô vốn/supply nhận viết tắt `6.8M` / `10B` (`parseSupply()`). Xoá hỏi lại 1 nhịp ("Chắc chưa?" 4 giây).

## 5. Work — luật rank

- Thang: **`$` (INCOME) · S · A · B · C**. `$` không phải rank — suy từ thẻ `Work-to-Earn` qua `groupOf()`. `groupOf()` còn map rank cũ `SS` → `S`.
- Khai **1 chỗ**: `WTE_GROUPS` · `WTE_RANKS` · `RANK_LABEL` (mục "AIRDROP — Work to Earn" trong `index.html`). Dropdown admin đổ bằng JS từ đó.
- `WTE_TYPES` là nguồn duy nhất cho thẻ phân loại: vừa là dropdown admin, vừa là thứ tự card trong mỗi nhóm (`typeOrder()`).
- Card cùng rank dàn 2 cột, khác rank cách 48. KV lưu `potential` 1–3, client quy đổi `≥2 = high-potential`.

## 6. Luật bắt buộc

- **Ngôn ngữ:** tiếng Việt CHỈ ở tab có toggle (Valuation · AI · Work) + tài liệu nội bộ. Tab CV + mọi thẻ meta/og/JSON-LD luôn tiếng Anh. Dịch nhãn UI tĩnh (`VAL_HEAD_LABELS` · `VAL_PLACEHOLDERS` · `VAL_TITLES`), **không dịch data** (ticker, narrative, số). Ngoại lệ: tiêu đề bài AI **có** dịch; task cá nhân Work **không** dịch.
- **Châm ngôn, nguyên văn mọi nơi:** `Sharing POVs on Crypto and AI`. Câu niềm tin có **2 bản cố ý**: bản dài 3 vế ở hero CV, bản ngắn *"AI is the future. Crypto is the money of the future."* ở meta/og/JSON-LD/`og.png`. `jobTitle` JSON-LD giữ "Builder + Contributor".
- **Đổi `og.png` phải bump `?v=`** (đang `?v=6`) — X/Telegram cache theo URL. Nguồn vẽ ngoài repo: `C:\tmp\cvshot\og-gen-a.html`.
- **Client ↔ server phải khớp:** `AI_HUBS` ↔ `CATS` (`ai.js`) · `WTE_RANKS` ↔ `RANKS` (`private.js`). Lệch là server âm thầm ép về mặc định.
- **Hàng đầu mỗi tab:** tiêu đề TRÁI, nút PHẢI (flex). Không quay lại kiểu tiêu đề canh giữa + nút absolute. Tiêu đề dài thì cho xuống 2 dòng (line-clamp), đừng rút ngắn câu.
- **Thanh cuộn:** mọi vùng cuộn dùng `.thin-scroll`. **Không set `scrollbar-width`/`scrollbar-color` cho Chromium** — từ bản 121 chúng tắt hết `::-webkit-scrollbar`.
- **Icon tô bằng CSS mask → mask đặt ở `::before`**, không trên nút (Chromium hit-test theo vùng mask). Icon mới thì dùng SVG inline (`wteIcon()`), không dùng mask.
- **html2canvas không vẽ được CSS mask.** Nút camera chụp `.val-wrap` và bỏ qua `.val-head-ctrl` (chỗ duy nhất có mask). Thêm mask vào vùng chụp là ra ô đặc.
- **Không dùng `wrangler.toml`** — nó khoá dashboard thành chỉ-đọc, rủi ro mất `ADMIN_PASS`.

## 7. Kiểm tra trước khi push

- JS: tách script inline ra rồi `node --check`. JSON-LD: `json.loads`.
- CV: regex dấu tiếng Việt trên vùng `#cv-view` phải ra 0.
- Giao diện: chụp thật. **`chrome --headless --window-size=390,...` KHÔNG ra mobile thật** (Windows không cho cửa sổ < ~500px, ảnh bị cắt trông như tràn ngang) → dùng puppeteer `setViewport` hoặc nhét trang vào iframe rộng 390.
- `python -m http.server` không có SPA fallback (`/valuation` → 404). Dùng server có fallback, hoặc chụp production sau deploy.
- Test có KV + mật khẩu thật: `npx wrangler pages dev . --kv WORK --binding ADMIN_PASS=...`

## 8. Cloudflare

Account `f9df99b7751b7dc3c80a22b6911c6f2b`, project Pages `0xhieu-xyz`. API token (Pages · KV · DNS · Cache) ở `C:\Users\MR VAN\.claude\secrets.env`. Env var + binding chỉ ăn từ **lần deploy kế tiếp**.

## 9. Việc còn treo

1. **Agent (nút mèo)** — mới có vỏ.
2. **`potential` trong KV vẫn là số 1–3** — nên migrate sang `high`/`low` cho đúng kho.
3. **Rank `SS` còn sót trong KV** — đang hiện ở nhóm S nhờ `groupOf()`; sửa tay qua popup admin rồi bỏ shim.
4. **Làm tab Valuation dễ hiểu cho số đông** (hướng đã chốt: diễn giải ngay trong box — con số nói gì, ngưỡng nào tốt/xấu). Chưa làm.
5. Ảnh mới cho Highlights: nén WebP ~750×500, dưới ~150KB, tên khớp `highlights.txt`.

---

## Nhật ký

- 2026-09-24: **Dọn repo, chốt trạng thái.** CSS 4 lớp đè nhau (bản gốc → Valuation mới → bản sang → bản sáng) viết lại thành 1 stylesheet theo thành phần (2363 → ~760 dòng; index.html 252KB → 166KB); verify bằng so computed style của mọi phần tử ở 72 trạng thái (4 tab × desktop/mobile × admin, hover, 12 popup). Gỡ JS chết: bộ đọc CSV Google Sheet, `capLabel()`/`CAP_*` (nhãn S/M đã bỏ), `onclone` mũi tên Watchlist. Xoá `arrow.svg` · `info.svg` · `right2.svg` (không còn dùng), `REBUILD_SPEC.md` + `REBUILD_SPEC_V3_VALUATION.md` (đã build xong, luật còn hiệu lực chuyển vào đây). HANDOFF viết lại chỉ còn hiện trạng.
- 2026-09-24: **Bản sáng.** Desktop Roboto, Condensed chỉ cho bảng altcoin + toàn site trên mobile. Chữ mobile ≥14 (trừ bảng altcoin). Navbar/header/nút bỏ nền đen → trắng/ngà, nút chính amber. Navbar → nội dung 24 (bỏ hàng trống 48).
- 2026-09-24: **Bản sang** cho tab Work rồi áp cả site: icon SVG, tiêu đề card canh trái + icon, chip `#F5F5F4`, bóng mềm 2 lớp, viền 1px.
