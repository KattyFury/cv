# HANDOFF — CV / Portfolio (0xhieu.xyz)

**Date:** 2026-08-20
**Repo:** https://github.com/KattyFury/cv
**Local path:** `D:\Files\Claude\0xhieu` (path cũ `build_for_me\cv` / `Claude\cv` không còn tồn tại)
**Live:** Cloudflare Pages, project **`0xhieu-xyz`** (KHÁC tên repo GitHub là `cv`) — git-integration auto-deploy từ `main`, chạy bình thường
**Local dev:** site tĩnh 1 file. Xem nhanh: mở thẳng `index.html`. Test route thật (`/valuation`, `/ai`, `/airdrop`) thì cần server có **SPA fallback** về `index.html` — `python -m http.server` KHÔNG có nên sẽ 404.

> **Cách đọc file này:** mục **TRẠNG THÁI HIỆN TẠI** = sự thật của code lúc này. Mục **QUY ĐỊNH BẮT BUỘC** = luật đã trả giá mới rút ra được, đừng phá. **Decisions Log** + **Failed Approaches** ở cuối = lịch sử *vì sao*, chỉ thêm vào, không sửa lại.
> Sửa code xong thì cập nhật mục Trạng thái + thêm 1 dòng Decisions Log; **đừng thêm mục "HANDOFF mới nhất" mới** — kiểu đó đã làm file phình lên 544 dòng với 5 mục kể lể chồng chéo, trong đó 2 mục ghi sai sự thật hiện tại (2026-08-20 dọn lại).

---

# TRẠNG THÁI HIỆN TẠI

## Tổng quan

Website cá nhân, **toàn bộ nằm trong `index.html`** (HTML + CSS + JS inline). Nav 4 tab:

| Tab | Route | Nội dung | Ngôn ngữ |
|---|---|---|---|
| **CV** | `/` | Hero + Experience + Highlights + Available for | **Tiếng Anh cố định**, không toggle |
| **Valuation** | `/valuation` | Bảng TGE + 4 box phân tích | Toggle EN\|VI, mặc định VI |
| **AI** | `/ai` | Hub bài viết, 4 box | Toggle EN\|VI, mặc định VI |
| **Airdrop** | `/airdrop` | Card Work to Earn + thanh lọc rank | Toggle EN\|VI, mặc định VI |

`_redirects` là catch-all (`/* /index.html 200`) nên thêm route mới không phải sửa gì.

## Tab CV

- **Châm ngôn định vị, dùng nguyên văn ở mọi nơi: `Sharing POVs on Crypto and AI`.**
- Dưới tagline là `.hero-belief` — câu niềm tin bản dài 3 vế: *"I believe AI is the future of knowledge work, robots the future of manual labor, and crypto the future of money."*
- ⚠️ **Câu niềm tin CÓ 2 BẢN, cố ý — đừng "đồng bộ" lại làm một.** Bản dài 3 vế dùng ở **hero CV** (có chỗ để thở); bản rút gọn *"AI is the future. Crypto is the money of the future."* dùng ở **meta description / og:description / JSON-LD / og.png** vì mấy chỗ đó giới hạn ký tự và ảnh preview không chứa nổi câu 3 vế.
- Lưới hero 10 hàng: `repeat(5, var(--row)) auto var(--row) auto var(--row) auto` — h6 tagline · h7 trống · h8 niềm tin · h9 trống · h10 socials. **Ba hàng chữ để `auto`**, không ghim `var(--row)`: mobile câu dài xuống 2-3 dòng sẽ tràn ô đè hàng dưới. Phân cấp tagline/niềm tin bằng **weight** (500 vs 400), cùng 15px, cùng màu đen. `.hero-belief` có `max-width: 62ch`.
- Highlights đọc `highlights.txt` (mỗi dòng `tên-ảnh | caption`, thứ tự dòng = thứ tự hiển thị). Ảnh thiếu → card tự ẩn.

## Thẻ share (`<head>`) + `og.png`

- `og:title` = châm ngôn · `og:description` + `meta description` = châm ngôn + câu niềm tin bản ngắn · JSON-LD giữ `jobTitle` = "Builder + Contributor" (schema.org cần **chức danh thật**, không nhét khẩu hiệu) và để châm ngôn ở field `description`.
- ⚠️ **Đổi ảnh thì PHẢI bump `?v=` trên `og:image` + JSON-LD `image`** — X/Telegram/Facebook cache ảnh preview theo URL, giữ nguyên URL thì chúng vẫn hiện ảnh cũ dù file đã thay. Đang ở `?v=6`.
- **Nguồn vẽ `og.png` nằm NGOÀI repo**: `C:\tmp\cvshot\og-gen.html` (biến thể `og-gen-a.html` = bản đang dùng, `og-gen-b.html` = bản giữ dòng phụ `Valuation · AI · Airdrop`). Render: `node C:\tmp\cvshot\shot.js "file:///C:/tmp/cvshot/og-gen-a.html" og-a.png 1200 630 4000`. Máy khác không có `C:\tmp` thì phải chép lại từ đây.
- Handle X hiện tại: **`nguyen0xhieu`** (đổi 2026-08-20 từ `0xhieuxyz`) — có ở 5 chỗ: nút Twitter hero, link footer, `twitter:site`, `twitter:creator`, `sameAs` trong JSON-LD.

## Tab Valuation

- Bảng "Tracking altcoins" 6 cột: **Ticker · Narrative · TGE · ×TGE · ×ATH · ×ATM** (cột 3 dùng chung chữ `TGE` cho cả EN lẫn VI). Tiêu đề màn: VI `Theo dõi altcoin để nhận định thị trường` / EN `Tracking altcoins to read the market`.
- **Hậu tố vốn hoá ở cột Ticker: `S` (<$300M) · `M` (>$300M)** — class `.td-cap` (tím `--accent`, 10px, bold; KHÔNG dùng chung `.td-size` vì `.td-size` là xám-phụ). Thang đầy đủ đã chốt là **S · M · L** với `L = >$500M` nhưng **CHƯA BẬT**; tất cả gom về `capLabel()` + 3 hằng số `CAP_M` / `CAP_L` / `CAP_L_ACTIVE` ngay trên `renderTable()`.
- **Chú giải S/M nằm ở box "Hệ số TGE gần đây"** (`tge-lowfdv-label` / `tge-highfdv-label` có `<span class="td-cap">`) — đây là chỗ DUY NHẤT giải thích ký hiệu. Đổi chữ 1 chỗ thì phải đổi chỗ kia.
- 4 box: Hệ số TGE gần đây (đã gộp Market Condition) · Vùng nguy hiểm · Narrative đang hot · Watchlist theo narrative. Popup bảng dài (`#tge-modal`) **clone thẳng thead/tbody của bảng inline** nên tự ăn theo mọi thay đổi, không có code riêng.
- Nút camera xuất dashboard ra PNG (xem quy định "Chụp ảnh dashboard").

## Tab AI (hub bài viết)

- 4 box khai trong **`AI_HUBS`**: INSIGHTS · LEARN · TOOLS · BUILD. Mỗi box cao **12 hàng** (tên hub 1 hàng · danh sách bài 11 hàng tự cuộn), desktop 2 cột / mobile 1 cột. Mỗi bài 1 hàng: tiêu đề (mở link, `target=_blank`) + ngày (`fmtDate`, mới nhất lên đầu).
- Box **chỉ có tên hub, KHÔNG dòng mô tả**; hub rỗng để trống luôn, không có chữ "Chưa có bài nào" (user chốt "chỉ cần header").
- **KHÔNG viết CSS riêng cho tab AI**: box dùng lại nguyên class box Valuation (`.val-card` + `.val-card-label.calc-card-label.vc-q1`, nút `+` nằm cạnh tên hub đúng chỗ icon ⓘ); `.ai-row`/`.ai-title`/`.ai-date`/`.ai-list` **gộp thẳng vào định nghĩa dùng chung** với `.danger-row`/`.narrative-row`/`.wlb-row`. Sửa màu/nhịp 1 chỗ là cả site đổi theo.
- **Dịch (khác Valuation): tab AI dịch CẢ tiêu đề bài viết** VI→EN qua `gtranslate()` (dùng chung với Airdrop). Bản dịch chỉ nằm trong RAM (`aiTitlesEN`, map id→tiêu đề EN), **KV luôn giữ tiêu đề gốc**; thêm/sửa/xoá xong `applyAiPosts()` đặt `aiTitlesEN = null` để dịch lại.
- Admin: nút "Admin" thành "+" khi mở khoá; mỗi hub có "+" riêng (thêm thẳng vào hub đó), mỗi bài có "⋮" để sửa/xoá. Ngày đăng tự điền hôm nay, sửa tay được.

## Tab Airdrop

Card Work to Earn đọc từ KV, thanh lọc rank `$ · S · A · B · C` — chi tiết luật ở mục "WTE Cards" bên dưới. Tiêu đề màn: "Work to Earn".

## Backend + nguồn data

- **Cloudflare Pages Functions** (`functions/api/`) — đây là backend DUY NHẤT của site, không có secret nào khác, không smart contract:
  - `wte.js` — `GET /api/wte`, công khai, trả project Work to Earn có `visibility === 'public'`.
  - `private.js` — `POST /api/private`, cần `ADMIN_PASS`, CRUD task Work to Earn (cá nhân + public). Key KV: `personal-tasks`.
  - `ai.js` — `GET /api/ai` công khai + `POST /api/ai` cần `ADMIN_PASS`, CRUD bài viết tab AI. Key KV: `ai-posts`.
- Cả 3 dùng **CHUNG KV binding `WORK`** và **CHUNG 1 mật khẩu `ADMIN_PASS`** (đặt ở Cloudflare Dashboard, không nằm trong repo) → thêm endpoint mới không phải cấu hình gì thêm. Mở khoá admin ở tab nào thì cả 2 tab cùng mở (`setAdminUnlocked()` gọi `syncAiAdminBtn()`). Mật khẩu giữ trong `sessionStorage`, đóng trình duyệt là phải nhập lại; kiểm tra **ở server**, sai → 401 và không trả bất kỳ dữ liệu nào.
- Nguồn data còn lại public, keyless, đọc thẳng client-side:
  - **Google Sheets CSV** (gviz) — chỉ Valuation dùng (tab `DATA` + tab `Watchlist`). Airdrop **không còn đọc Sheet** từ 2026-08-09.
  - **CoinGecko** free API — giá / ATH.
  - **Google Translate** (gtx) — dịch VI→EN cho Airdrop + tab AI.
- **Google Apps Script** (trong Sheet, chạy daily 2h) — sync ATH + current price vào tab DATA.

---

# QUY ĐỊNH BẮT BUỘC

## Ngôn ngữ

⚠️ **Tiếng Việt CHỈ được xuất hiện ở tab có toggle VI/EN (Valuation · AI · Airdrop) và tài liệu nội bộ.** Tab CV + toàn bộ thẻ meta/og/JSON-LD là **mặt tiếng Anh của site** (khách quốc tế, X, Telegram preview đều đọc chỗ đó) → luôn tiếng Anh. Luật này cũng ghi trong `CLAUDE.md`.

Trước khi push thay đổi nội dung CV: **quét lại regex dấu tiếng Việt trên vùng `<div id="cv-view">`** (hiện đang 0 kết quả).

Quy tắc dịch trong tab có toggle: dịch **toàn bộ nhãn UI tĩnh**, **KHÔNG dịch data từ Sheet** (ticker, tên narrative, ngày, số). Ngoại lệ có chủ đích: **tiêu đề bài viết tab AI CÓ dịch** (để người đọc tiếng Anh dùng được hub); **task cá nhân Airdrop KHÔNG dịch** (ghi chú riêng, giữ nguyên chữ user gõ).

Cơ chế: `VAL_HEAD_LABELS` (id → {EN,VI}) áp bằng `innerHTML` trong `applyValHeadLabels()`. **Thêm nhãn tĩnh mới thì PHẢI khai ở đây**, không thì nó kẹt tiếng Anh khi ở mode VI. Nhãn nằm trong hàm render thì đọc `valLang` trực tiếp và `switchValLang()` gọi lại cả 3 hàm render. `#market-condition-lvl` lưu key tiếng Anh gốc ở `dataset.level` (không đọc `textContent` vì chữ hiển thị đã bị dịch).

## Header của panel (Valuation · AI · Airdrop)

Class chung **`.panel-head`**: **tiêu đề (`.val-intro`) bên TRÁI, cụm control (`.val-head-ctrl`) bên PHẢI**, đẩy nhau bằng flex `space-between`.

⚠️ **ĐỪNG quay lại kiểu tiêu đề căn giữa + control `position:absolute`** (đã hỏng 2 lần trong 1 ngày): tiêu đề khi đó canh giữa theo TOÀN BỘ chiều rộng nên **không né control** → chữ chui xuống dưới nút Admin/EN|VI và mất chữ. Fix nửa vời bằng `@media (max-width:640px)` vẫn hỏng ở 641px trở lên. Trái–phải thì mọi bề rộng đều an toàn.

⚠️ **Tiêu đề dài thì sửa CHỖ CẮT CHỮ, đừng rút ngắn câu.** `.panel-head .val-intro > span` cho xuống **tối đa 2 dòng** (`-webkit-line-clamp: 2`, `white-space: normal`, `line-height: 1.25`); hộp `.val-intro` vốn cao sẵn 2 hàng (~56px) nên 2 dòng 15px nằm gọn, không đẩy lưới hàng, quá 2 dòng vẫn có ellipsis chặn. Từng có lần rút ngắn câu để "chữa" — đó là chữa triệu chứng, vì mọi tiêu đề dài đều sẽ mất chữ.

## Client và server phải khớp nhau

⚠️ Nhiều danh sách tồn tại **2 bản: 1 ở `index.html`, 1 ở Function** — sửa 1 bên mà quên bên kia thì server **âm thầm ép về giá trị mặc định, không báo lỗi gì**:

| Client (`index.html`) | Server | Hậu quả nếu lệch |
|---|---|---|
| `AI_HUBS` | `CATS` trong `ai.js` | bài lưu vào hub mới rơi hết về hub đầu |
| `WTE_RANKS` | `RANKS` trong `private.js` | rank mới bị ép về mặc định (đúng bug rank C ngày 12/08) |

## Lưới hàng + spacing

- Toàn site dùng **grid 4px**: mọi `margin / padding / gap` phải là bội số của 4 (`4 · 8 · 12 · 16 · 20 · 24 · 32 · 40 · 48 · 56 · 64`). Ngoại lệ: `1px/2px` cho border, `7px 10px` cho table cell (KHOÁ). Font-size khoá riêng: `19/15/14/13/12/11/10px`. **Thêm element mới thì chọn số trong scale, không tự chế số lẻ.**
- **Lưới hàng:** `--row = 100vh/30`. "1 hàng" = `var(--row)`. Yếu tố **cùng cụm cách 1 hàng**, cụm khác cụm cách 2 hàng. Navbar chiếm hàng 1-2, margin trái/phải 0.75 hàng.
- Wrapper mọi tab đồng bộ: `max-width: 900px; margin: 0 auto; padding: 0 calc(var(--row)*0.75) 24px`.

## Scrollbar

**MỌI vùng cuộn dùng chung đúng 1 class `.thin-scroll`** (định nghĩa 1 chỗ duy nhất, ngay sau `html` ở đầu `<style>`). Không viết CSS scrollbar riêng cho từng vùng. Hình thức: lane chừa sẵn (`scrollbar-gutter: stable`) · thanh 6px màu `--muted` bo tròn · track trong suốt · không nút mũi tên.

⚠️ **LUẬT SỐNG CÒN — không set `scrollbar-width` / `scrollbar-color` cho Chromium.** Từ Chromium 121, chỉ cần 1 trong 2 thuộc tính đó khác `auto` là trình duyệt **vô hiệu hoá toàn bộ `::-webkit-scrollbar`** → vùng đó rơi về scrollbar hệ thống. Firefox được phục vụ riêng trong `@supports not selector(::-webkit-scrollbar)`.

**Vùng cuộn có header:** header đặt **ngoài** vùng cuộn (div riêng `overflow:hidden` + `.thin-scroll` để chừa cùng lane) → thanh cuộn chỉ bao phần data. Áp cho cả bảng inline (`#tge-head-wrap` + `.val-table-scroll`) lẫn popup (`.tge-modal-head` + `.tge-modal-scroll`). Ngoại lệ có chủ đích: `#ptask-form` ẩn hẳn scrollbar.

## Hover / màu tương tác

- Hover hàng bảng: `rgba(97,85,245,0.1)` (tím nhạt, gốc brand `#6155F5`) — **không** dùng xám `--off`.
- Khoảng cách giữa các hàng bảng tạo bằng **`padding` trong `<td>`**, KHÔNG dùng `border-spacing`: gap của `border-spacing` nằm ngoài ô nên background hover không tô tới → hàng bị tô hụt 4/5 chiều cao.

## Vùng bấm của icon

⚠️ **Icon tô bằng CSS `mask` thì mask phải nằm ở `::before`, KHÔNG đặt trên chính nút** — Chromium hit-test theo vùng mask, để mask trên nút thì chỉ mấy pixel của hình mới ăn click. Nút bỏ mask, cho `align-self: stretch` + `width` rộng + `margin` âm bù lại; mask xuống `::before` với `inset` đúng ô 14px. **Đừng dùng padding để nới** — mask `center / contain` sẽ kéo icon phình to. Nút CHỮ (✕, ⋮) không dính mask, chỉ cần phủ `::after` trong suốt `inset: -8px -12px`.

## Chụp ảnh dashboard (nút camera ở Valuation)

Xuất `.val-wrap` ra PNG bằng `html2canvas.min.js` **nằm trong repo** (không CDN — cv giữ nguyên tắc không gọi ra server bên thứ 3), lazy-load khi bấm lần đầu.

⚠️ **html2canvas KHÔNG vẽ được CSS mask** — mà mọi icon của cv đều tô bằng mask → để nguyên thì icon ra **ô đặc màu currentColor** rất xấu. Thêm icon/element mới vào vùng chụp thì chọn 1 trong 2 đường có sẵn: **không mang thông tin** (nút bấm, icon ⓘ) → cho vào `ignoreElements`; **mang thông tin** (mũi tên Watchlist sáng/mờ) → trong `onclone` gắn class `.shot-arrow` (tắt `::before`) rồi thay bằng ký tự text tương đương.

## Verify bằng mắt — BẮT BUỘC trước khi chốt việc động vào layout/màu

⚠️ **`chrome --headless --window-size=390,844` KHÔNG ra mobile thật.** Windows không cho cửa sổ hẹp hơn **500px**, nên Chrome layout ở ~500-534px rồi **cắt** còn 390 → nhìn y hệt trang bị tràn ngang, rất dễ tưởng có bug layout (đã tưởng nhầm 1 lần). Phải ép viewport qua CDP `Emulation.setDeviceMetricsOverride`.

Script sẵn có (ngoài repo, `C:\tmp\cvshot\`):

```bash
node shot.js <url> <out.png> <width> <height> [waitMs] [clickSelector...]   # chụp đúng viewport
node pdf.js  <out.pdf>                                                     # xuất tab CV ra PDF A4
node serve.js                                                              # server test: SPA fallback + mock /api/ai, /api/private, /api/wte
node test-admin.js                                                         # chạy thử luồng admin tab AI qua DOM thật
```

---

# THAM CHIẾU

## Data Flow

```
Google Sheet (DATA tab)
  → Apps Script syncAll() [daily 2am]
      → CoinGecko /coins/markets → ghi ATH (col J) + current price (col N)
  → Website fetch CSV → parse → render
```

### Sheet columns (tab DATA)

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
| I | 8 | beforeATH (fill bằng `fetch-before-ath.js` chạy local) |
| J | 9 | ATH (sync bởi Apps Script; bỏ trống nếu ATH cùng ngày TGE) |
| N | 13 | currentPrice (sync bởi Apps Script) |

### Apps Script

`syncAll()`, trigger daily 2am (tạo bằng `setupDailyTrigger()`, chạy 1 lần). Cột N luôn cập nhật; cột J cập nhật **trừ khi** `ath_date` cùng ngày TGE (râu nến listing) thì giữ giá trị cũ. **KHÔNG sync beforeATH** — Apps Script chạy trên server Mỹ, bị Binance chặn HTTP 451.

## Valuation — công thức

```
vcPricePerToken = (fundraising * 1e6) / (vcAlloc / 100) / totalSupply
×TGE = priceTGE / vcPricePerToken
×ATH = ath / vcPricePerToken       ← ATH intraday ngày listing bị filter → hiển thị —
×ATM = currentPrice / vcPricePerToken
vcFDV = fundraising / (vcAlloc / 100)      → nhãn S (<$300M) / M (>$300M) qua capLabel()
```

**ATH intraday filter:** `ath_date` cùng ngày `tgeDate` (< 24h) → `×ATH = —`. CoinGecko lấy absolute high kể cả râu nến listing day, không phản ánh giá trade được.

### Box "Hệ số TGE gần đây" (đã gộp Market Condition)

- Split theo ngưỡng **$300M** vcFDV: FDV thấp / FDV cao. Window: **6 token gần nhất** mỗi rổ; nếu token thứ 6 cách token mới nhất >60 ngày → giảm còn 4. Hiển thị median.
- **Market condition** = median ×TGE của **6 deal gần nhất**: Weak (<4.3×) · Normal (4.3–13×) · Strong (≥13×). Ngưỡng calibrate theo giai đoạn thị trường thật (Strong ≈ chu kỳ 2023-2024, Normal ≈ Q2-Q3/2022, Weak ≈ 2025-2026), không phải phân phối thống kê thuần.
- UI dùng chung khung `vc-q1` (tiêu đề) + `vc-q234` (nội dung) với Danger Zone / Trending Narratives để mọi box tự thẳng hàng — **đừng tự chế grid riêng cho từng box**.

⚠️ **ĐỪNG tách thêm bậc ở nửa DƯỚI $300M.** Data nói `<$100M` và `$100–300M` hành xử y hệt (median ×TGE 4.25 vs 4.61 toàn lịch sử; 3.38 vs 3.73 riêng 12 tháng qua) — tách ra chỉ được 2 rổ nói cùng 1 điều, mỗi rổ ít mẫu đi một nửa. Chỗ data thật sự gãy là **$300M**.

**Điều kiện bật bậc `L` (>$500M):** rổ đó có **≥12 dự án TGE trong 12 tháng gần nhất** (hiện chỉ 5). Đặt `CAP_L_ACTIVE = true` **chưa đủ** — comment trên `capLabel()` liệt kê 3 việc phải làm nốt (tách rổ trong `renderTGEStats()` + `predictFDV()`, thêm hàng thứ 3 vào box, thêm entry dịch cho hàng mới). Lý do chưa bật: `predictFDV()` cần ≥2 mẫu cùng rổ, thiếu thì **âm thầm fallback về toàn bộ pool** (không báo gì) → số hiện ra không biết đến từ đâu.

### Danger Zone

Lọc token đang có **×ATM ≥ 15** (VC lãi 15×+, sell pressure cực đại). Backtest 17 token từng ở vùng này → 100% về đáy. Sort token TGE mới nhất lên đầu. TGE < 30 ngày mà đã vào vùng → badge **⚠ FAKE PUMP** (pump láo sắp về 0).

### Trending Narratives

Xếp hạng **TẤT CẢ** narrative có data từ 02/2025 (không lọc bỏ ai), theo **median ×TGE** — không dùng ×ATH vì 1 coin pump đơn lẻ về sau kéo cả nhóm trông "hot" dù ban đầu thị trường không tin. Kèm số deal `(n)` mờ cạnh tên để người xem tự đánh giá độ tin cậy mẫu.

### Pattern analysis (nền cho các box, 2026-06-11)

`retention = ×ATM / ×TGE` tách sạch các nhóm: **Mạnh** 0.53–2.42 (median 0.85) · **RUG** 0.03–0.25 · **FOMO rồi về 0** ≤0.14 + ×TGE rất cao · **ATH rồi về 0** ≤0.27 + growth ~6×. Box ý tưởng chưa build: Token Health, Dip Zone.

## WTE Cards (Airdrop)

- Data từ KV qua `GET /api/wte`. Logo lấy từ `unavatar.io/twitter/{handle}`. Rank badge góc phải card, sau Type.
- **THANG RANK** — 5 nhóm xếp từ trên xuống:

  | Nhóm | Badge | Màu | Ý nghĩa |
  |---|---|---|---|
  | `INCOME` | `$` | gradient `#6155F5→#34C759` | việc RA TIỀN ngắn hạn |
  | `S` | `S` | `#6155F5` tím | kèo 10K |
  | `A` | `A` | `#0088FF` xanh dương | kèo 1K |
  | `B` | `B` | `#34C759` xanh lá | kèo xxx |
  | `C` | `C` | trắng, viền xám | kèo rác |

- **LUẬT — thang rank khai 1 chỗ duy nhất** (mục "AIRDROP — Work to Earn" trong `index.html`): `WTE_GROUPS` (thứ tự nhóm) · `WTE_RANKS` (rank chọn tay được = `WTE_GROUPS` bỏ `INCOME`) · `RANK_LABEL` (chữ trên badge). Dropdown Rank của form admin **đổ bằng JS từ `WTE_RANKS`**, không hardcode `<option>`. Thêm/đổi nhóm = sửa 3 hằng số + thêm `.rank-*`/`.wte-card--*` trong CSS + thêm nút cùng `data-rank` vào `#rank-filter` + **sửa `RANKS` trong `private.js`**.
- `INCOME` **không phải rank** — suy ra từ thẻ phân loại `WTE_INCOME_TYPE` (`'Work-to-Earn'`) qua `groupOf()`, nên dropdown Rank không có option `$`. `groupOf()` còn map rank cũ `'SS'` → `'S'` cho bản ghi KV chưa sửa tay; shim này bỏ được khi KV hết bản ghi `SS`.
- Mọi nhóm đều có nhãn (`.wte-group-label`): "Income", "Rank S", "Rank A"… suy ra bằng `groupLabel(r)` từ `RANK_LABEL`, không khai danh sách thứ 2.
- **CẤU TRÚC CHUẨN 1 NHÓM** (kể cả nhóm "Cá nhân" của admin): `.wte-group[id]` > `.wte-group-label?` + `.wte-rank-group`. `id` đặt ở **wrapper** chứ không phải lưới, để `scrollIntoView` từ thanh lọc không cắt mất nhãn nhóm.
- **LUẬT — `WTE_TYPES` là nguồn DUY NHẤT cho thẻ phân loại.** Thứ tự phần tử = thứ tự ưu tiên, dùng chung 2 chỗ: dropdown "Phân loại" của form admin, và thứ tự card trong mỗi nhóm rank qua `typeOrder()`. Thẻ trống/lạ xếp cuối nhóm; cùng thẻ giữ nguyên thứ tự KV (sort stable). Nhóm "Cá nhân" cố ý KHÔNG sort — thứ tự gõ vào chính là thứ tự ưu tiên.
- Badge `C` dùng `box-shadow: inset 0 0 0 1px` chứ **không** dùng `border` — border làm badge trắng cao/rộng hơn 4 badge kia.
- Nền + viền card giống nhau ở mọi rank; màu phân biệt chỉ ở badge, section label, `border-left` của Daily, hover tên và dấu `•`.

## Box "Watchlist theo narrative" (Valuation, box thứ 4)

- Đọc Google Sheet tab **`Watchlist`** qua gviz CSV. Cột: **A** tên · **B** X handle · **C** narrative · **D** gọi vốn (số triệu USD kiểu Việt, `"2.879,0"` = 2879 → `parseRaise`). Cột **E** "Thing to do yet?" **KHÔNG còn dùng**.
- Fetch cùng đợt init với DATA + Work (`Promise.all`) vì tam giác cần `wteData` để biết dự án nào đã có bài hướng dẫn.
- Mỗi hàng `.wlb-row`: tên (link X, cắt `…` nếu dài) · narrative (11px xám) · **tam giác** (`right2.svg`, tô bằng CSS mask): **sáng** = đã có card bên Airdrop/Work (khớp slug tên) → bấm được, nhảy sang + cuộn tới card + flash 1.5s (`valGoWork`); **mờ** = chưa có.
- **Thứ tự:** (1) narrative theo ĐÚNG thứ tự box "Narrative đang hot" — dùng chung `narrativeRanking()` để 2 box không lệch; (2) narrative không có trong bảng xếp hạng xếp sau, nhóm nào có dự án gọi vốn to nhất lên trước; (3) dự án chưa điền narrative xuống cuối; (4) trong cùng narrative: gọi vốn nhiều → ít.
- Narrative **KHÔNG dịch** (là data từ Sheet).

## Files quan trọng

```
index.html                — toàn bộ website (HTML + CSS + JS)
functions/api/wte.js      — GET public: project Work to Earn từ KV
functions/api/private.js  — POST cần ADMIN_PASS: CRUD task Work to Earn (key personal-tasks)
functions/api/ai.js       — GET public + POST cần ADMIN_PASS: CRUD bài viết tab AI (key ai-posts)
_redirects                — Cloudflare Pages SPA fallback (/* → /index.html)
og.png                    — ảnh preview khi share link (1200×630, nguồn vẽ ở C:\tmp\cvshot\og-gen.html)
icon.png                  — favicon + icon iPhone home screen (mèo-kính, mắt cam)
pfp.webp                  — avatar hero CV
info.svg                  — icon ⓘ giải thích 3 box Valuation (tô qua CSS mask)
right2.svg                — tam giác box "Watchlist theo narrative" (tô qua CSS mask)
camera.svg                — icon nút chụp ảnh dashboard (tô qua CSS mask)
html2canvas.min.js        — thư viện DOM→PNG (v1.4.1). ĐỂ TRONG REPO có chủ đích (không CDN),
                            chỉ nạp khi user bấm camera lần đầu
arrow.svg                 — KHÔNG còn code nào dùng từ 2026-08-06; giữ lại phòng khi cần
highlights.txt + highlights/  — ảnh Highlights ở CV (mỗi dòng "tên-ảnh | caption")
.gitignore                — .env, node_modules, .claude/, .dev.vars, .wrangler/
```

> Đã xoá khỏi repo: `server.js`, `export-pdf.js`, `package.json`, `.dev.vars`, toàn bộ file research/bot (archive tại `Desktop/cv-research-archive.md`).

## Cloudflare

- Account id `f9df99b7751b7dc3c80a22b6911c6f2b`, project Pages **`0xhieu-xyz`**. Có API token (Pages Edit · KV Edit · DNS Edit · Cache Purge…) nên kiểm tra/cấu hình được bằng lệnh, không cần bấm dashboard.
- Env var + binding chỉ có hiệu lực từ **bản deploy kế tiếp**; soi `kv_namespaces`/`env_vars` từng deployment qua `GET /pages/projects/0xhieu-xyz/deployments`.
- ⚠️ **KHÔNG dùng `wrangler.toml`** cho project này: docs nói file đó thành "source of truth" và khoá dashboard thành chỉ-đọc, nhưng không nói rõ số phận của secret → rủi ro làm chết `ADMIN_PASS`.
- Test local có KV + mật khẩu thật: `npx wrangler pages dev . --kv WORK --binding ADMIN_PASS=...`

## Pending / Known Issues

1. **Làm cho số đông HIỂU tab Valuation là gì** (user chốt hướng 2026-08-01, CHƯA làm) — các box hiện chỉ bày số cho người đã biết đọc. **Hướng: làm chính các BOX dễ hiểu hơn** (diễn giải con số đang nói gì, ngưỡng nào tốt/xấu, vì sao nhìn chỉ số đó) — user đã bác 3 phương án đổi tên tab / thêm khối ở CV / đụng tagline. Cùng tinh thần cho tab Airdrop.
2. **Rank `SS` còn sót trong KV** — project từng bị ép về `SS` (bug rank C ngày 12/08) hiện nằm lộn ở nhóm S do `groupOf()` map `SS`→`S`. Phải vào popup admin sửa tay từng cái, code không tự biết cái nào bị ảnh hưởng.
3. **×ATH filter** — đang bỏ ATH cùng ngày TGE. Một số token pump ảo 1-3 ngày đầu; cân nhắc mở rộng window.
4. **Ảnh** — dùng WebP (`pfp.webp`, `highlights/*.webp`), tên trong `highlights.txt` phải khớp đuôi thật. Ảnh mới nên nén WebP (~750×500, dưới ~150KB).
5. **Google Sheet tab "Work"** không còn code nào đọc (từ 09/08) — vẫn giữ trên Drive phòng cần đối chiếu, chưa xoá.

---

## Decisions Log

- 2026-08-18: **Chốt châm ngôn `Sharing POVs on Crypto and AI`** — bản `Crypto and AI` (entry dưới) chỉ giữ được ít phút: rút xuống 13 ký tự làm **hero của tab CV trông trống huếch** — hero vốn chỉ còn đúng 1 dòng tagline từ 19/07 (dòng "Outside crypto…" và câu "I don't sell dreams…" đã bỏ từ đó), nên câu tagline chính là toàn bộ phần chữ giới thiệu. **Bài học:** với hero 1 dòng, tagline không chỉ là khẩu hiệu mà là **cả đoạn mô tả bản thân** — rút quá ngắn là mất luôn phần "about me". Ảnh `og.png` lên `?v=6`, cỡ chữ tiêu đề về lại 64px (80px chỉ hợp với câu 13 ký tự).
- 2026-08-18: **Rút châm ngôn xuống còn `Crypto and AI`** (thay bản đầu cùng ngày `Sharing POVs on Crypto + AI`, entry dưới) — user chốt ngắn gọn, và chốt luôn **đổi đồng bộ cả 6 chỗ** thay vì chỉ dòng hero: `.hero-tagline`, `meta description`, `og:title`, `og:image:alt`, JSON-LD `description`, và vẽ lại `og.png` (`?v=4` → **`?v=5`**). `og:description` không đụng vì nó chứa câu niềm tin chứ không chứa châm ngôn. Trong `og-gen.html` phải **tăng cỡ chữ tiêu đề 64px → 80px**: câu mới chỉ 13 ký tự, để nguyên 64px thì nửa dưới ảnh trống huếch. **Verify:** chụp thật `og.png` 1200×630 (1 dòng, cân khung); chụp CV desktop 1280 + mobile 390; curl site production kiểm tra cả 5 thẻ + ảnh.
- 2026-08-18: **Thang vốn hoá VC-FDV: đổi nhãn `L`→`M` cho rổ >$300M, soạn sẵn bậc `L` = >$500M nhưng chưa kích hoạt** — reason: user hỏi chia 2 bậc (S/L ở $300M) có chuẩn không, hay nên 3 bậc S/M/L. Kéo tab DATA (76 dự án) tính median ×TGE theo khoảng vcFDV: `<$100M` ×4.25 (n=27) · `$100–300M` ×4.61 (n=28) · `$300–500M` ×2.70 (n=7) · `>$500M` ×2.73 (n=14); riêng 12 tháng gần nhất (40 dự án): ×3.38 (n=17) · ×3.73 (n=14) · ×2.82 (n=4) · ×1.49 (n=5). **Kết luận:** tách bậc ở nửa dưới $300M là vô nghĩa (2 khoảng đầu chênh nhau trong sai số), ngưỡng $300M hiện tại đúng là chỗ data gãy. Chỗ ĐÁNG tách bậc 3 lại là đầu to ($300–500M ×2.82 vs >$500M ×1.49 trong 2026) nhưng n=4 và n=5, quá ít để tin. Chi phí nếu tách sớm: rổ `>$500M` có 6 dự án gần nhất trải 313 ngày (box lấy 6 gần nhất mỗi rổ → cửa sổ kéo về 11/2025, trộn chế độ thị trường), và `predictFDV()` thiếu mẫu sẽ âm thầm fallback về toàn bộ pool. Nên: giữ nguyên toán 2 rổ ở `FDV_SPLIT = $300M`, chỉ đổi **nhãn** hiển thị `L`→`M` và khai sẵn bậc `L` = $500M qua `capLabel()` + `CAP_M`/`CAP_L`/`CAP_L_ACTIVE`. Bật khi rổ >$500M đủ ≥12 dự án trong 12 tháng gần nhất. **Verify:** `new Function()` parse sạch script inline; chụp thật desktop 1280 — cột Ticker ra S/M đúng ngưỡng (OP/ARB/SUI/WLD/SEI = M, HOOK/ARKM = S), chú giải trong box khớp hậu tố.
- 2026-08-18: **Tiêu đề Valuation dài trở lại (`Theo dõi altcoin để nhận định thị trường`) — sửa CHỖ CẮT CHỮ thay vì rút ngắn câu** — reason: 16/08 câu dài bị mobile cắt mất chữ nên đã rút còn "Theo dõi thị trường", nhưng đó là chữa triệu chứng: nguyên nhân thật là `.panel-head .val-intro > span` ép `white-space: nowrap` + `text-overflow: ellipsis`, tức **mọi** tiêu đề dài hơn 1 dòng đều sẽ mất chữ, không riêng câu đó. Fix gốc: cho xuống tối đa 2 dòng bằng `-webkit-line-clamp: 2` + `white-space: normal` + `line-height: 1.25`; hộp `.val-intro` đã cao sẵn 2 hàng (`calc(var(--row)*2)` ≈ 56px) nên 2 dòng 15px vừa khít, lưới hàng không đổi, và quá 2 dòng vẫn có ellipsis chặn nên không bao giờ tràn. **Verify:** chụp thật CDP ở 390px và 320px (cả 2 hiện đủ câu, xuống 2 dòng), desktop 1280px vẫn 1 dòng, tab AI + Airdrop không đổi vì tiêu đề ngắn.
- 2026-08-18: **Chốt châm ngôn `Sharing POVs on Crypto + AI` làm câu định vị duy nhất, gỡ tagline tiếng Việt khỏi CV** — reason: tagline tiếng Việt đặt hôm 17/08 nằm ở tab CV và toàn bộ thẻ meta/og, mà **tab CV không có toggle ngôn ngữ** nên đó là mặt tiếng Anh của site (khách quốc tế, X, Telegram preview đều đọc chỗ này); user chốt dùng nguyên văn tiếng Anh, kèm định vị "AI là tương lai, crypto là tiền tệ của tương lai". Sửa 7 chỗ trong `index.html` (hero tagline, meta description, og:title/description/image:alt, JSON-LD thêm `description`, bump `?v=4`) + vẽ lại `og.png`. **Giữ `jobTitle` = "Builder + Contributor"** thay vì nhét châm ngôn vào — `jobTitle` của schema.org là chức danh, Google đọc để hiện knowledge panel, bỏ khẩu hiệu vào là dùng sai field; châm ngôn đi vào field `description` đúng nghĩa hơn. Dòng phụ trên `og.png` đổi từ `Valuation · AI · Airdrop` sang câu niềm tin (bản giữ nguyên dòng cũ render sẵn ở `C:\tmp\cvshot\og-b.png` nếu user muốn đổi lại). **Luật mới ghi vào `CLAUDE.md`:** tiếng Việt chỉ được xuất hiện ở tab có toggle VI/EN + tài liệu nội bộ, không bao giờ ở tab CV / thẻ meta. **Verify:** `new Function()` parse sạch script inline; regex dấu tiếng Việt trên vùng `#cv-view` → 0 kết quả; screenshot thật CV desktop 1280 + mobile 390 (CDP `setDeviceMetricsOverride`) thấy đúng 1 dòng tagline không tràn.
- 2026-08-12: **BUG đã sửa — `functions/api/private.js` vẫn chặn rank `C` do whitelist server-side chưa cập nhật theo thang rank mới** — user báo không thấy dự án nào ở Rank C dù đã chọn C trong dropdown admin và lưu. Root cause: thang rank đổi sang `$ · S · A · B · C` (entry ngay dưới, cùng ngày) chỉ sửa phía client (`WTE_RANKS` trong `index.html`); server (`private.js`) vẫn giữ `RANKS = ['SS','S','A','B']` từ trước đó (09/08) → `cleanRank('C')` không khớp whitelist, âm thầm ép về mặc định `'SS'` (không báo lỗi). Verify qua `curl /api/wte` production: 24 project, rank chỉ có `S/A/B/SS`, 0 project `C`, xác nhận đúng triệu chứng. Fix: `RANKS` đổi thành `['S','A','B','C']`, mặc định khi sai/thiếu đổi từ `'SS'` (rank cũ không còn tồn tại trong thang mới) sang `'C'`. Đồng thời đổi nhãn tĩnh Airdrop từ "Work" → "Works" theo yêu cầu user. **Việc CHƯA làm:** những project đã lưu nhầm thành `SS` khi user cố chọn `C` (nếu có) vẫn đang nằm ở nhóm S do `groupOf()` map `SS`→`S` — user cần vào popup admin sửa lại rank đúng ý cho từng project đó, code không tự đoán được project nào bị ảnh hưởng.
- 2026-08-12: **Đổi hệ quy chiếu rank của Work to Earn: `$ · S · A · B · C`, bỏ hẳn S+ (`SS`)** — user chốt thang mới theo *quy mô kèo* thay vì tier chung chung: `$` = việc ra tiền ngắn hạn (gradient thương hiệu, đứng đầu, badge `$` thay chữ rank), `S` tím = kèo 10K, `A` xanh dương = kèo 1K, `B` xanh lá = kèo xxx, `C` trắng = kèo rác. `$` **không phải rank** — suy ra từ thẻ `Work-to-Earn`, nên dropdown Rank không có option này (`WTE_RANKS` = `WTE_GROUPS` bỏ `INCOME`). Gom toàn bộ thang về 3 hằng số + `groupOf()`/`groupLabel()` ở một chỗ, và **đổ dropdown Rank bằng JS** thay vì hardcode `<option>` — trước đó thang rank nằm rải ở 4 nơi (HTML dropdown, HTML nút lọc, map inline trong `cardHtml`, CSS `.rank-*`) nên đổi thang là phải nhớ sửa đủ 4 chỗ. Cấu trúc nhóm cũng chuẩn hoá: mọi nhóm là `.wte-group[id] > .wte-group-label? + .wte-rank-group`, id chuyển từ lưới ra wrapper để nhãn nhóm không bị `scrollIntoView` cắt mất; mọi nhóm đều có nhãn ("Income", "Rank S", "Rank A"…) chứ không chỉ mỗi nhóm `$`. **Data:** KV vẫn đang lưu `rank: 'SS'` (Arc + task cá nhân cũ) — `groupOf()` map `SS`→`S` để không mất card, user tự chỉnh lại rank từng dự án qua popup admin theo thang mới. **Verify:** headless Edge `--dump-dom` trên `/airdrop` với KV thật + stub 1 card mỗi rank → thanh lọc ra đúng `$ S A B C`, 5 nhóm đúng thứ tự, badge/class khớp 1-1 (`card--INCOME`/`badge=$` … `card--C`/`badge=C`), Arc (`SS` trong KV) rơi vào nhóm S, tổng 23 card không mất ai; screenshot 1100px xác nhận badge `$` gradient và badge `C` trắng viền xám không lệch cỡ so với 4 badge kia.
- 2026-08-12: **Card trong nhóm rank xếp theo `WTE_TYPES`, không còn theo thứ tự thêm vào KV** — user thêm project Injective (thẻ `Work-to-Earn`, rank S+) và thấy nó nằm sau Arc (`Stablechain`) dù `Work-to-Earn` đã được đặt đầu mảng `WTE_TYPES`. Root cause: `WTE_TYPES` chỉ được dùng để đổ dropdown admin, còn `renderWTE()` gom card theo rank rồi render **nguyên thứ tự mảng trả về từ `/api/wte`** (= thứ tự ghi vào KV) — đổi thứ tự trong `WTE_TYPES` không ảnh hưởng gì tới giao diện. Fix: chuyển `WTE_TYPES` từ mục ADMIN lên mục "AIRDROP — Work to Earn" (nó không còn là hằng số riêng của admin), thêm helper `typeOrder()`, `renderWTE()` sort từng nhóm rank theo helper này. Thẻ trống/lạ → cuối nhóm; cùng thẻ → giữ thứ tự KV (sort stable). Nhóm "Cá nhân" cố ý không sort. **Verify:** `new Function()` parse sạch block script; headless Edge `--dump-dom` trên `/airdrop` với KV data thật (23 project) → đủ 23 card, S+ ra `Work-to-Earn Injective` → `Stablechain Arc`, nhóm A hết lộn xộn (Stablechain → Trading → Layer-1 → Infra → AI → Layer-2 → Prediction → Payment → DeFi → Others).
- 2026-08-09: **Airdrop → Work chuyển từ Google Sheet sang Cloudflare KV, gộp chung với task cá nhân** — reason: user thấy sửa data qua Google Sheet phiền, tần suất sửa thấp (thêm 1-2 dự án lâu lâu) nên không cần giữ UX-sửa-hàng-loạt của spreadsheet, đổi sang sửa trực tiếp qua popup admin trên site. Thêm `functions/api/wte.js` (GET public, không mật khẩu, lọc `visibility==='public'` từ KV) thay cho gviz CSV fetch cũ; `functions/api/private.js` nhận `rank`/`visibility` từ client thay vì khoá cứng `rank:'SS'`. Task cũ (trước 09/08) không có field `visibility` → client coi mọi task thiếu field này là `personal` (đúng hành vi gốc), tránh mất data khi không migrate ngược. Đã migrate 22 project thật từ Sheet vào KV production (`visibility:'public'`) bằng Cloudflare KV REST API trực tiếp (đọc token từ `ezwallet/.env.txt` — token account-level, không phải secret riêng của ezwallet), giữ nguyên 4 task cá nhân có sẵn (Injective/Kaito/Săn GA/Creatorpad). Nút sửa (⋮) trên card đổi điều kiện hiện từ "card cá nhân" sang "admin đã mở khoá" — admin giờ sửa được cả card public. Popup thêm/sửa task đổi cấu trúc theo yêu cầu user (xem HANDOFF mới nhất ở đầu file để biết chi tiết UI). **Verify:** `node --check` sạch cả 2 Function + JS inline; test qua `wrangler pages dev` local (KV + password thật) trước khi đụng production; sau deploy kiểm tra `curl https://0xhieu.xyz/api/wte` trả đúng 22 project, Playwright headless xác nhận khách không thấy nút ⋮, admin thấy đủ, `/api/private` vẫn 401 với mật khẩu sai.
- 2026-08-07: **Nút camera chụp dashboard Valuation ra PNG** (cạnh trái toggle EN|VI) — chi tiết luật ở mục "Chụp ảnh dashboard" trên. **Chọn html2canvas ĐỂ TRONG REPO thay vì CDN** (user chốt, có cân nhắc 3 phương án): cv đang không nạp một script ngoài nào, dùng CDN sẽ phá vỡ điều đó — phụ thuộc mạng bên thứ 3, CDN lỗi là nút chết, và khách bị lộ IP sang bên đó. Phương án `getDisplayMedia` (không cần thư viện, ảnh render thật nên đẹp 100%) bị loại vì mỗi lần bấm trình duyệt bắt chọn màn hình/tab thủ công và không chạy trên mobile. Đổi lại repo gánh thêm ~195KB lib, bù bằng cách **lazy-load**: chỉ nạp khi bấm lần đầu nên người vào đọc không phải tải. Khung ảnh = dashboard **đúng như đang thấy** (bảng giữ nguyên số dòng đang hiện, không bung full ~80 token vì ảnh sẽ quá dài để đăng mạng xã hội). Kèm theo: gom camera + EN|VI vào `.val-head-ctrl` (bỏ inline style `position:absolute` cũ trên `.lang-toggle`, vẫn đúng pattern control-absolute-phải); thêm map `VAL_TITLES` cho `title`/`aria-label` của các nút chỉ-có-icon — trước đó 3 icon "i" hardcode "Giải thích" tiếng Việt kể cả khi đang ở mode EN. **Verify:** headless Edge trên route thật `/valuation` — nút hiện đúng cạnh trái EN|VI, cao bằng toggle; chặn `toBlob` để dán canvas kết quả ra trang rồi chụp lại, ảnh ra sạch: mất nút EN|VI/camera/icon "i" đúng ý đồ, gradient nút CTA đúng màu, mũi tên Watchlist thành `→` giữ đúng sáng/mờ, không dính scrollbar.
- 2026-08-06: **Vùng bấm của icon nhỏ — LUẬT: icon tô bằng CSS `mask` thì mask phải nằm ở `::before`, KHÔNG đặt trên chính nút** — user báo "icon hơi khó click". Root cause KHÔNG phải icon nhỏ (14px) mà là **Chromium hit-test theo vùng mask**: để `mask` trên nút thì chỉ mấy pixel của hình tam giác/chữ `i` mới ăn click, bấm vào ô 14px cũng trượt. Đo bằng `document.elementFromPoint` trên DOM thật: bản cũ lệch 5px khỏi tâm đã `miss`. **Cách sửa (giữ nguyên kích thước icon nhìn thấy, layout không đổi):** nút bỏ mask, cho `align-self: stretch` (cao trọn hàng, không tự chế số px) + `width` rộng ra + `margin` âm bù lại; mask chuyển xuống `::before` với `inset` đúng ô 14px ở giữa. Hover `translateX(3px)` cũng phải chuyển sang `::before`. Kết quả đo lại: tam giác **38×27**, icon `i` **30×27**, bấm lệch tới góc vẫn `HIT`. Mấy nút CHỮ (✕ đóng modal, ✕ tính lại, ⋮ sửa task) không dính mask nên chỉ cần phủ thêm `::after` trong suốt `inset: -8px -12px` (nút ✕ 24px → vùng bấm ~48×40, đo `HIT` ở lệch 18px ngang/14px dọc). **Đừng dùng padding** để nới: mask `center / contain` sẽ kéo icon phình to theo. Verify thêm: bấm icon `i` vẫn mở popup, bấm tam giác vẫn nhảy `/airdrop` + tìm thấy `#wte-card-tempo`.
- 2026-08-06: **Thêm box "Watchlist theo narrative" ở Valuation, XOÁ HẲN sub-tab Airdrop/Watchlist** — reason: xem watchlist theo narrative (narrative nào đang hot thì soi dự án nào nằm trong đó) hữu ích hơn một danh sách card rời bên Airdrop. Box dùng đúng khung `vc-q1`/`vc-q234` của Danger Zone/Trending Narratives nên tự thẳng hàng; cấu trúc + thứ tự sắp xếp xem mục riêng ở trên. Hai lựa chọn user chốt trong lúc làm: (1) narrative không có trong bảng xếp hạng vẫn **hiện, xếp cuối**, nhóm nào có dự án gọi vốn to nhất lên trước, dự án chưa điền narrative xuống cuối cùng (không ẩn ai — cùng tinh thần với quyết định 27/07 bỏ filter của Trending Narratives); (2) bên Airdrop **giữ chữ "Work" làm nhãn** thay vì bỏ trống hàng. Đổi kèm theo: `narrativeRanking()` tách khỏi `renderNarratives()` để 2 box dùng chung 1 nguồn thứ tự; cột E "Thing to do yet?" của Sheet Watchlist **hết tác dụng** (tam giác giờ do "có card bên Work hay không" quyết định) nên bỏ `hasWork`; `translateWL()`/`fmtRaise()`/`renderWL()`/`wlGoWork()`/`showArdTab()` + CSS `.wl-card/.wl-logo/.wl-name/.wl-arrow/.wl-meta/.wl-dot/.wl-empty` xoá theo vì không còn ai gọi (`arrow.svg` thành file mồ côi, giữ lại). **Verify:** `node --check` JS sạch; headless Edge trên route thật `/valuation` (desktop 1100px + mobile 420px) thấy box thẳng hàng với 3 box kia và xếp 1 cột đúng trên mobile; `--dump-dom` đếm đủ **65 hàng**, thứ tự đúng (Stablechain → Layer-1 → Infra → AI → … → Game/Others → nhóm chưa điền narrative; trong Stablechain: Tempo $500M > Arc $222M > KAST $90M > STRATO $52M); probe click tam giác Tempo trong DOM thật → `airdrop-view` hiện, URL `/airdrop`, tìm thấy `#wte-card-tempo`, thanh lọc rank hiện; bản EN ra "Watchlist by narrative" và giữ nguyên narrative gốc.
- 2026-08-05: **Scrollbar: chốt 1 class dùng chung `.thin-scroll`, bỏ sạch `scrollbar-width`/`scrollbar-color`** — xem mục "Scrollbar System" ở đầu file. Reason: user thấy 3 vùng cuộn (bảng inline · popup bảng · box Narrative/Danger) ra 3 kiểu khác nhau. Root cause: từ Chromium 121, `scrollbar-width`/`scrollbar-color` khác `auto` sẽ vô hiệu hoá `::-webkit-scrollbar`; code cũ set cả 2 kiểu ở mọi nơi nên mỗi vùng render một đường. **2 lần sửa đầu (thêm `display:block`, thêm webkit rules cho popup) đều vô nghĩa** vì webkit đang bị tắt sẵn — bài học: không phán "do cache", phải render thật ra ảnh mà đối chiếu.
- 2026-08-05: **Popup bảng TGE đổi sang cấu trúc "header tách khỏi vùng cuộn"** (`.tge-modal-head` + `.tge-modal-scroll`, JS `mkTable()` dựng 2 bảng rời thay vì clone gộp head+body vào 1 bảng) — reason: popup gộp chung nên thanh cuộn chạy dọc qua cả hàng header, khác hẳn bảng inline (header nằm ngoài vùng cuộn). Verify bằng headless Edge screenshot trên route thật `/valuation`.
- 2026-08-05: **Hover hàng bảng đổi xám `--off` → tím nhạt `rgba(97,85,245,0.1)`, và tô trọn hàng** — reason: user thấy vùng hover chỉ tô ~4/5 hàng và quá mờ. Root cause: khoảng cách giữa hàng làm bằng `border-spacing: 0 calc(var(--row)*0.25)` nằm NGOÀI `<td>` nên background không tô tới. Chuyển gap vào `padding` của `<td>` (chia đều trên/dưới để chữ vẫn giữa hàng), giữ nguyên tổng khoảng cách.
- 2026-08-05: **Modal "Dự đoán FDV TGE" nối vào toggle VI/EN + reset khi đóng + thêm nút ✕ góc phải-trên** — reason: modal này trước đây hoàn toàn không nối với `valLang` (label/placeholder/nút Close·Calculate/dòng "Not enough data" đều hardcode tiếng Anh dù đang ở mode VI), và chỉ có nút ✕ "tính mới" trong ô kết quả chứ không có nút thoát, nên đóng rồi mở lại vẫn thấy kết quả cũ. Thêm `predict-modal-title`/`calc-*-label`/`predict-cancel`/`calc-btn` vào `VAL_HEAD_LABELS`, thêm `VAL_PLACEHOLDERS`, và `closePredict()` giờ reset form + xoá input.
- 2026-08-05: **Viết lại nội dung 3 info popup Valuation** — tách ý bằng `1️⃣2️⃣` + dòng trống giữa các ý (bản cũ dồn 1 khối chữ, user thấy "chưa hấp dẫn vì thiếu khoảng trống"); Danger Zone tách 2 trường hợp (pump tạo đỉnh/TGE vùng đỉnh rồi nuke · dự án mạnh thật giữ FDV cao) + dòng 👉 kết luận; Trending Narratives đổi thành công thức rõ ràng "Trung vị của [FDV khi TGE] / [FDV mà VC đầu tư]"; câu cuối box TGE thành "...của dự án bạn đang quan tâm". Tiêu đề 3 popup + popup Predict trước đây hardcode tiếng Anh → nay dịch theo `valLang`.
- 2026-08-05: **Ngôn ngữ theo tab: About me luôn full English, Valuation/Airdrop có toggle EN|VI mặc định VI** — reason: About me dùng để đi xin việc, mục tiêu là global nên phải tiếng Anh cố định, không toggle. Valuation/Airdrop khán giả chính là người Việt nên mặc định VI, có toggle cho ai cần EN.
- 2026-07-27: **Trending Narratives: bỏ hẳn 2 điều kiện lọc (`count >= 2`, `medTGE >= 1`)** — user muốn xếp hạng TẤT CẢ narrative có data, không ẩn cái nào. Kiểm tra data thật (54 deal từ 02/2025, 12 narrative): trước đây 5 narrative bị ẩn — Trading/Bitcoin/Payment (mỗi cái chỉ 1 deal, fail `count>=2`), Identity/Privacy (medTGE 0.83/0.60, fail `medTGE>=1`). Giờ hiện đủ 12, kèm số lượng deal `(n)` màu mờ cạnh tên narrative (class `.td-size` có sẵn) để người xem tự đánh giá độ tin cậy — vì thiếu filter, 1 narrative chỉ có 1 deal (n=1) giờ hiển thị ngang hàng narrative có 11-12 deal nên cần tín hiệu để phân biệt độ tin cậy mẫu.
- 2026-07-27: **Trending Narratives: đổi tiêu chí xếp hạng + hiển thị từ median ×ATH sang median ×TGE** — reason: ×ATH dễ bị 1 coin pump đơn lẻ về sau (đỉnh giá) kéo cả narrative trông "hot" dù ban đầu thị trường không tin (case Identity: H ×0.76, BILL ×0.9 lúc TGE — đều bị chê — nhưng H pump ×16.9 sau đó kéo median ATH lên ảo). ×TGE phản ánh niềm tin thị trường ngay lúc list, đáng tin hơn cho việc "narrative nào đang hot". Xoá field `medATH` không còn dùng; đồng thời bỏ luôn điều kiện lọc `e.xATHm > 0` trong `renderNarratives` (dead dependency sau khi bỏ medATH — trước đó vô tình loại các deal chưa có ATH data dù chỉ cần ×TGE). List thay đổi hẳn: trước (theo ATH) top là Stablechain ×106.6/DeFi ×9.6/Layer-2 ×7.7/Prediction ×7.5 → sau (theo TGE) là Stablechain ×75.3/Layer-1 ×4.1/Infra ×3.5/AI ×3.5 (Infra là narrative mới xuất hiện nhờ bỏ gate ATH thừa).
- 2026-07-27: **Market Condition: gộp short-term + mid-term thành 1 median duy nhất (N=6)**, bỏ hẳn split-box 2 cột (Ngắn hạn/Trung hạn) — reason: user thấy 2 mốc không khác biệt đáng kể là dư thừa. Backtest bằng data thật (75 deal từ Sheet DATA, gviz CSV) cho từng N: đo % lần label Weak/Normal/Strong đổi giữa deal liền kề (flicker rate) — N=3:23.6%, N=4:15.5%, N=5:21.4% (số đang dùng trước đó — tệ hơn cả N=4/N=6), N=6:15.9%, N=7:10.3%, N=8:10.4%. Chọn N=6: ổn định ngang N=4 nhưng biên độ swing nhỏ hơn (mean ×2.21 vs ×2.33), và test riêng giai đoạn chuyển pha Strong→Weak (2025 Q1-Q2) cho thấy N=8 quá trễ (còn báo Normal 2 tháng sau khi thị trường đã rõ yếu) trong khi N=6 bắt kịp mà không bị flicker-back như N=5. Ngưỡng phân loại giữ nguyên `>=13 Strong / >=4.3 Normal / <4.3 Weak`. Rule cũ "8 rút còn 6 nếu span >60 ngày" (từ commit `d758e5e`, 2026-05-05) không có backtest gốc — đã kiểm chứng lại: tiền đề đúng (63% thời gian window 8-deal thật sự trải >60 ngày, có lúc tới 442 ngày) nhưng số N cụ thể (4/5/6/8) ảnh hưởng kết quả rõ rệt, không phải chi tiết vặt.
- 2026-07-27: Đổi short-term window Market Condition từ N=4 → N=5, sau đó gộp luôn vào quyết định N=6 ở trên (N=5 chỉ tồn tại vài phút trong session, không phải bản deploy).
- 2026-07-19: **Bảng Valuation: TẤT CẢ 6 cột căn giữa theo KHỐI** (mở rộng từ fix cột Ticker cùng ngày) — mỗi giá trị bọc trong `span.ck`, mỗi cột có `min-width: var(--ck1..--ck6)` = bề rộng giá trị dài nhất cột đó, cell `text-align:center` → trong mỗi cột mọi giá trị thẳng mép trái với nhau, cả khối nằm giữa cột. JS đo trong `renderTable` bằng probe ẩn tái tạo cấu trúc `#tge-section > table.val-table.val-table-body` (để CSS theo cột áp đúng font; không đo bảng thật vì có thể đang `display:none`), set vars trên `:root` nên modal TGE clone tbody tự ăn theo.
- 2026-07-19: **Hero + Highlights content refresh (ảnh thật thay placeholder)** — (1) `.hero-tagline` = "Former crypto analyst. Now a Web3 builder focused on creating content, building communities, and shipping small products." · **bỏ hẳn** dòng "Outside crypto: boxer, husband, dad of one." và câu "I don't sell dreams..." cũ trong `.hero-desc` (giờ chỉ còn 1 dòng tagline). (2) `highlights.txt` viết lại 5 caption theo thứ tự gần→xa (khớp mục Experience): `1.png` EZwallet on Arc Testnet · `2.png` 500+ member Telegram community · `3.png` OG across Zama/Web3 · `4.png` Recall Ambassador & top Yapper · `5.png` "Started from 0 in Feb 2025, 10K followers a year later". Ảnh 1-5 là screenshot THẬT user thả vào (`.jpg` cũ 3/4/5/7 đã xoá, thay bằng `.png`). Caption do user tự chốt (viết ngắn, mỗi câu = 1 nhãn Experience + mô tả đúng ảnh). Spec đưa ChatGPT lưu tại `Desktop/highlights-caption-spec.md`. **Lưu ý dọn dẹp còn treo:** commit `4786436` lỡ push `7.png` (ảnh trader Binance cũ) + `8.png` (Behance "Katty Fury" graphic-design cũ) do `git add -A` — 2 file này KHÔNG có trong `highlights.txt` nên không render, user để dành ô 6/7/8 cho ảnh tương lai (chưa xoá). Nếu thấy web hiện ảnh trader/designer ở ô 1-2 → chỉ là cache Cloudflare/browser, Ctrl+F5.
- 2026-07-18: **Highlights chuyển từ `highlights.json` sang `highlights.txt`** — format mỗi dòng `tên-ảnh | caption`, dòng `#` là ghi chú, thứ tự dòng = thứ tự hiển thị (dòng thời gian), tên ảnh tự prefix `highlights/` — reason: user muốn tự thêm ảnh (thường PNG) + viết caption + sắp thứ tự mà không phải đụng JSON (dễ vỡ vì dấu phẩy/ngoặc kép). Card thiếu ảnh vẫn tự ẩn (img error → remove). `highlights.json` đã xóa khỏi repo. Cùng session: tagline đổi thành "I share what I really think and what I actually do", dòng loss đổi "$53k" → ">$50K" (bớt cụ thể) + bỏ "Best tuition ever paid".
- 2026-07-18: **About/Experience/Highlights update theo brand DNA (about-me.md)** — user chọn qua checklist Desktop: (1) hero tagline mới "I don't sell dreams – I share what actually works in crypto, explained simply." + dòng đời thường "Outside crypto: boxer, husband, dad of one." (gộp trong `.hero-desc`, giữ nguyên lưới 11 hàng); (2) hero-tagline thêm "building products on Web3"; (3) mục 2026 thành "Web3 Builder & Community Builder" thêm bullet EZwallet (Arc Testnet); (4) mục 2025 thêm dòng đầu "Lost $53k on altcoins in early 2025..." (trung thực về loss = brand); (5) `highlights.json` thêm 4 entry placeholder (`eli5.jpg`, `build-tooling.jpg`, `anti-scam.jpg`, `ezwallet.jpg` trong `highlights/`) — render JS thêm `img error → card.remove()` nên **card thiếu ảnh tự ẩn, user chỉ cần thả ảnh đúng tên file vào là card hiện**. Lưu ý: dùng en-dash " – " thay em-dash theo luật trong about-me.md. Từng nghi "caption trùng lặp" trong Highlights → không phải bug, chỉ là artifact copy text (alt + caption).

- 2026-07-12: Thu gọn `cv` về đúng scope "website đọc Google Sheet để hiển thị" — archive toàn bộ code research/gọi-API + tiện ích dev vào `Desktop/cv-research-archive.md` rồi xóa 10 file (watchlist-research.js, vc-tier1.json, apps-script-webhook.gs, WATCHLIST-RESEARCH-SETUP.md, fetch-before-ath.js, before-ath-output.txt, pre-tge-watchlist-archive-2026-07-06.md, server.js, export-pdf.js, package.json) + node_modules/ — reason: user tách bot tìm kèo thành dự án riêng (`research_airdrop_bot`); repo cv chỉ giữ phần hiển thị (Valuation/Airdrop/Watchlist).
- 2026-07-12: Gỡ hẳn tab Personal + X-analysis — xóa `functions/api/x-analysis.js` (+ thư mục `functions/`), `.dev.vars`, block Personal/X trong `index.html` (view password-gate + `loadXAnalysis`, vốn là code chết không route nào tới) — reason: cv không liên quan X/Twitter, sau bước này cv không còn function/secret key nào.
- 2026-07-12: Xóa `fav_icon.png`/`logo.svg`/`logo_spacing.svg` + khôi phục `icon.png` bằng `git checkout` — reason: phát hiện đây là branding EZwallet lọt nhầm vào cv từ phiên 2026-07-10 (md5 khớp file trong `build_on_arc/ezwallet`); bản working `icon.png` đã bị ghi đè bằng logo "EZ", favicon THẬT của cv là mèo-kính (bản committed). Không phải do `git pull` phiên này (pull chỉ đổi index.html 1 dòng).
- 2026-07-12: Watchlist đổi được sang tiếng Anh khi bấm English — thêm `wlData={VI,EN}` + `translateWL()` (tách `gtranslate()` dùng chung với card Work), badge "Có việc/Chưa có" → mũi tên sáng(accent)/mờ(border), meta 11→13px màu `--sub` — reason: trước đó `switchLang()` không render lại Watchlist và badge hardcode tiếng Việt.
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
- 2026-07-31: **Task cá nhân riêng tư trong Airdrop → Work (`functions/api/private.js` + KV)** — user muốn thấy các việc cá nhân quan trọng hơn airdrop, xếp S+, **chỉ mình user thấy**. cv là site tĩnh public nên mọi thứ trình duyệt tải về thì khách cũng tải được → **không** dùng Google Sheet (mọi tab trong sheet đều public vì gviz cần link công khai), cũng **không** dùng kiểu chỉ ẩn UI bằng JS (F12 là lộ). Chốt: **Cloudflare Pages Function `/api/private` + KV binding `WORK`** (key `personal-tasks`; project Pages tên **`0xhieu-xyz`**, KHÔNG phải "cv" — cv là tên repo GitHub. Binding `WATCHLIST` thời bot Pre-TGE **đã không còn** trong Dashboard, kiểm tra 2026-07-31 thấy mục Bindings trống → tạo binding mới tên `WORK`), mật khẩu là **biến môi trường `ADMIN_PASS` trên Cloudflare Dashboard**, kiểm tra **ở server** — không có mật khẩu thì API trả 401 và không trả bất kỳ dữ liệu nào. UI: nút `admin` cạnh dropdown ngôn ngữ → popup nhập mật khẩu → đúng thì nút đổi thành `+`, hiện nhóm **"Cá nhân"** (EN: "Personal") nằm **trên** nhóm S+, mỗi card có nút ✕ → popup xác nhận rồi mới xoá. Form thêm task: tên · twitter · tiềm năng (★/★★/★★★) · phân loại (14 thẻ khớp dropdown Sheet) · rank khoá cứng S+ · Get started/Daily/Weekly kèm link — **mọi ô đều optional**. Mật khẩu giữ trong `sessionStorage` (đóng trình duyệt là phải nhập lại). Server tự bóc `< >` khỏi nội dung và chỉ nhận link `http(s)://` (chặn `javascript:`). Nhóm Cá nhân cố ý mang id `wte-personal` (KHÔNG phải `wte-rank-*`) để không phá scroll-spy của thanh lọc S+/S/A/B. Verify bằng `wrangler pages dev` + KV thật + Playwright: sai mật khẩu → 401, khách không gọi API lần nào và HTML không chứa nội dung task, task sống qua reload, xoá cần xác nhận. **Task cá nhân KHÔNG được dịch VI→EN** (là ghi chú riêng, giữ nguyên chữ user gõ).
- 2026-08-01: **Kiểm toán toàn dự án** — (a) **Không có code chết**: quét toàn bộ 922 dòng CSS + 1230 dòng JS, 8 class nghi ngờ (`.rank-A`, `.wte-card--SS`…) đều SỐNG vì được ghép động (`wte-card--${p.rank}`, `rank-${p.rank}`) — máy quét theo chuỗi tĩnh sẽ báo nhầm, đừng xoá. 0 hàm JS thừa. (b) **BUG đã sửa**: khi Google Sheet lỗi, cả 3 chỗ (Valuation `renderTable`, Work `renderWTE`, Watchlist `renderWL`) kẹt chữ "Loading…" vĩnh viễn vì `catch` chỉ `console.warn` còn cờ `loaded` vẫn false → thất bại trông y hệt đang tải. Thêm cờ `publicDataError`/`wteError`/`wlError` + helper `errBox(retryFn, en)` + `retryValuation/retryWTE/retryWL`. Tái hiện bug bằng Playwright chặn `docs.google.com`, verify nút Thử lại tải lại được 24 card. (c) **Ảnh nhẹ đi 94%**: `pfp.png` 1.9MB/1542px (hiển thị 72px, thừa 458 lần điểm ảnh) → `pfp.webp` 144x144 **5KB**; 6 highlights PNG 1.4MB → WebP **188KB** (ảnh chụp thì PNG là định dạng sai). Tổng ảnh tải về 3.5MB → 223KB. Bản gốc còn trong lịch sử git. (d) **`<head>`**: trước chỉ có `<title>0xhieu.xyz</title>`, KHÔNG có description/Open Graph → share link lên X/Telegram ra ô trống suốt thời gian dài. Thêm title có tên+vai trò, description, canonical, theme-color, OG + Twitter card, `og.png` 1200x630 (script tạo lại: `scratchpad/make-og.py`, nền trắng + dải gradient `#6155F5→#34C759` + dòng "Reading the market. / Working to earn."), JSON-LD `Person`.
- 2026-08-01: **Auto-deploy GitHub→Cloudflare Pages CHẠY BÌNH THƯỜNG** — issue "không tự deploy" ghi ngày 2026-07-21 đã hết. Kiểm chứng qua API: 3 commit liên tiếp (`8323632`, `35a3424`, `f2c99c9`) đều tự sinh deployment và `deploy success`. Không cần deploy tay nữa.
- 2026-08-01: **Quản Cloudflare bằng REST API** — có API token (Pages Edit · KV Edit · Workers Tail Read · DNS Edit · Cache Purge…) nên kiểm tra/cấu hình được bằng lệnh, không cần bấm dashboard. Account id `f9df99b7751b7dc3c80a22b6911c6f2b`, project Pages tên **`0xhieu-xyz`** (KHÁC tên repo GitHub là `CV`). Nhớ: env var + binding chỉ có hiệu lực từ **bản deploy kế tiếp**; soi `kv_namespaces`/`env_vars` của từng deployment qua `GET /pages/projects/0xhieu-xyz/deployments`. **KHÔNG dùng `wrangler.toml`** cho project này: docs Cloudflare nói file đó thành "source of truth" và khoá dashboard thành chỉ-đọc, nhưng không nói rõ số phận của secret → rủi ro làm chết `ADMIN_PASS`.

- 2026-08-01: **Form thêm task cá nhân: Get started / Daily / Weekly nhận NHIỀU dòng** — trước đó mỗi mục chỉ có đúng 1 cặp ô (việc + link), trong khi 1 dự án thường có 2-3 việc phải làm. Giờ mỗi mục là danh sách: nút `+` (`.pt-row-add`) thêm dòng, nút `✕` (`.pt-item-del`) xoá dòng, dòng cuối cùng ẩn `✕` bằng CSS `:only-child` để form luôn còn ít nhất 1 dòng. Dòng để trống bị bỏ qua khi gửi. Server đổi `oneItem(text, link)` → `itemList(mảng)` (cắt tối đa 20 dòng/mục, vẫn `clean`/`cleanLink` từng dòng như cũ) — **shape lưu trong KV không đổi** (`[{text, link}]`), renderer `section()` vốn đã map mảng nên không phải sửa. **Popup này (và chỉ popup này) không đóng khi bấm ra ngoài** — bấm nhầm backdrop là mất hết nội dung đang gõ, nên gỡ `ptaskModal` khỏi danh sách backdrop-close, chỉ nút Cancel mới thoát. Verify bằng `wrangler pages dev` + KV thật + Playwright, 15/15 (bấm ngoài không đóng · `+`/`✕` chạy · card ra đúng 2 mục Get Started 2 link · link `javascript:` bị chặn · sống qua reload · mở lại form reset sạch).
- 2026-08-01: **Card task cá nhân: nút `✕` → nút `⋮`, mở form SỬA; xoá chuyển vào trong form** — trước đó card chỉ xoá được, muốn đổi 1 chữ phải xoá rồi gõ lại từ đầu. Giờ `⋮` (`.wte-opt`, thay `.wte-del`) mở lại đúng form thêm task nhưng ở chế độ sửa: tiêu đề "Sửa task cá nhân", nút chính đổi `Add` → `Save`, mọi ô điền sẵn (nhóm rỗng vẫn để 1 dòng trống). Chữ **"Xoá task này"** màu đỏ `#E5484D` (`.pt-delete`) nằm ngay trên hàng Cancel/Save, chỉ hiện ở chế độ sửa; bấm vào vẫn qua popup xác nhận cũ (`pdel-modal`), huỷ thì form sửa còn nguyên, xoá thật thì đóng cả hai. Biến `ptEditId` (null = thêm mới) quyết định gọi `add` hay `update`. Server thêm action `update` + tách `sanitize()` dùng chung với `add` — **`id` và `rank` không bao giờ lấy từ client**, update chỉ ghi đè các trường người dùng nhập. Bỏ `PT_FIELDS` (thành thừa vì `openPtaskForm` giờ set từng ô).
- 2026-08-01: **BUG có sẵn: `setTimeout(() => $('pt-name').focus(), 50)` trong `openPtaskForm` cướp focus giữa lúc đang gõ** — mở form rồi gõ vào ô khác trong vòng 50ms thì focus nhảy về ô Tên, chữ đang gõ rơi hết vào đó (tái hiện: `name="AAAhttps://x.com/bbb"`, `twitter=""`). Phát hiện nhờ test Playwright fail chập chờn 1/3 lần — suýt bỏ qua vì tưởng test flaky. Sửa: gọi `focus()` thẳng, không hoãn (popup đã `display:flex` ở dòng ngay trên). **Bài học: test chập chờn thường là bug thật, đừng chạy lại cho tới khi xanh.**
- 2026-08-01: **Có agent khác (`Cowork Agent <cowork-agent@auto.run>`) làm việc song song trên repo này** — commit `fca9388` của nó `git add` gộp luôn phần `index.html` mà session khác đang sửa dở rồi push. Không rewrite history (đã push + là commit của agent khác), chỉ commit riêng phần còn lại. **Bài học: trước khi commit phải `git status` xem có ai vừa chen vào không, và đừng `git add -A` khi chưa soi diff.** Commit đó cũng đổi `<title>` về `0xhieu.xyz` (user xác nhận cố ý) — lưu ý `og:title` vẫn là bản dài, nên preview khi share link không bị cụt.
- 2026-08-03: **3 thay đổi bảng/box Valuation theo yêu cầu user:** (1) Cột Ticker trong "Tracking altcoins to read market conditions": suffix 4 mức `$/$$/$$$/$$$$` → nhị phân `(low)/(high)` tại ngưỡng $300M — đồng bộ ngưỡng với Recent TGE Multiples (trước đó 2 nơi dùng 2 ngưỡng khác nhau: 100M/200M/500M vs 300M). (2) Bảng đó: 6 cột trước chia lệch (Ticker/Narrative/TGE Date = 20% mỗi cột, ×TGE/×ATH/×ATM = 13.3% mỗi cột) → đổi thành `width: calc(100% / 6)` cho tất cả — 6 cột đều thật, giữ nguyên cơ chế canh-giữa-theo-khối (`span.ck` + `--ck1..--ck6` đo bề rộng giá trị dài nhất mỗi cột, thêm từ 2026-07-19). (3) **Xoá hẳn box "Market Condition" riêng**, gộp vào box "Recent TGE Multiples" — box mới chia đúng 6 hàng bằng nhau (`grid-template-rows: repeat(6, var(--row))`, class `.rt6-grid`/`.rt6-row`): 1 tiêu đề · 2 trống · 3 "Low FDV ×.. \| High FDV ×.." · 4 trống · 5 "Market condition: `<Level>`" · 6 "Predict TGE FDV" (đổi từ nút pill gradient `.predict-link` sang chữ gạch chân, giữ nguyên id nên listener JS không đổi). Dọn CSS mồ côi sau khi xoá: `.market-levels`, `.mkt-lvl`/`.mkt-lvl.mkt-active`, `.split-box`/`.split-col`/`.split-divider`/`.split-val`/`.split-lbl`, `.vc-q23`, `.vc-q4`. JS `renderAnalysis()`: bỏ toggle 3 nút Strong/Normal/Weak, gán thẳng `LEVELS[lvlIdx]` vào 1 span — **logic tính median/ngưỡng calibrate giữ nguyên 100%, chỉ đổi DOM target**. Verify: `node --check` JS không lỗi cú pháp, serve tĩnh local trả HTTP 200, grep xác nhận không còn tham chiếu tới id/class đã xoá. **CHƯA verify bằng mắt** (session đó không có browser/screenshot tool) — xem Pending.

- 2026-08-03 (session 2, cùng ngày): **Recent TGE Multiples — sửa lại vị trí header/item 2 lần theo phản hồi user.** Lần 1: đổi từ layout 6-hàng-đều-có-2-hàng-trống sang chia đúng 5 phần bằng nhau (`grid-template-rows: repeat(5,1fr)`, class `.rt5-*`), Low/High FDV thành box tím nhạt, nút Predict TGE FDV trở lại pill gradient (bỏ underline, theo yêu cầu "như cũ"). Lần 2 (user chỉ ra "vị trí chưa tương đồng với Danger Zone", đưa ví dụ hàng STABLE/ENA): nhận ra self-made `.rt5-grid` có tỉ lệ tiêu đề khác `.vc-q1` chuẩn (1/5 vs 1/6 chiều cao box) nên header/item lệch so với Danger Zone/Trending Narratives dù cùng 1 hàng lưới. Bỏ hẳn grid riêng, đổi sang dùng lại đúng khung `vc-q1`(title)+`vc-q234`(content) + class `.rt-item`/`.rt-box` xếp dọc height `var(--row)` — giờ mọi box tự thẳng hàng vì cùng 1 pattern, không phải tự tính tỉ lệ riêng cho từng box.
- 2026-08-03 (session 3): **Thêm icon info + popup giải thích 3 box Valuation + toggle EN|VI**, đồng bộ hoá luôn với toggle ngôn ngữ ở Airdrop (dropdown cũ → cùng component pill EN|VI), dịch VI cho toàn bộ nhãn UI tĩnh của Valuation (không đụng data), đổi chú thích ticker `(low)/(high)` → `(<$300M)/(>$300M)`, bỏ tiêu đề lặp trong popup bảng TGE. Xem chi tiết mục "Info popup (icon "i") + toggle EN|VI" ở trên. `info.svg` (đã có sẵn trong repo nhưng chưa từng được dùng/commit) giờ chính thức được dùng làm icon giải thích.

## Failed Approaches

- 2026-06-11: Apps Script + CoinGecko `market_chart/range` và `market_chart?days=max` → 401 (Demo key không có quyền) → bỏ.
- 2026-06-11: Apps Script + Binance klines → 451 geo-block (server Google ở Mỹ) → chuyển sang chạy local.
- 2026-06-11: Apps Script + CryptoCompare → yêu cầu API key, user đăng ký bị "Invalid SSL certificate" → bỏ.
- 2026-06-11: Apps Script + Gate.io → user từ chối dùng. OKX + CoinDesk Data API → chạy được nhưng coverage quá ít → bỏ.
- 2026-06-11: `fetch-before-ath.js` bản đầu lấy min kể cả candle listing → ra giá wick ảo (ARB 0.5, SUI 0.1) → fix bỏ candle đầu tiên của sàn.
- 2026-06-18: Tự đổi KV binding name `WATCHLIST` → `KV_BINDING` vì tưởng config sai → Dashboard thực tế là `WATCHLIST` → waste 2 commit. **Bài học: không đoán mò config/binding name, hỏi user hoặc xem Dashboard.**
- 2026-06-18: Filter Sync bỏ qua project raise < $5M → sai, Tier-1 (Coinbase Ventures, a16z CSX) invest seed $3-4M đầy → bỏ filter.
- 2026-06-18: Đặt modal HTML sau `</script>` → `getElementById` null → `null.addEventListener` crash toàn bộ JS → mất hết data hiển thị → fix dời modal lên trước script.
- 2026-08-03: **Thêm 3 box SURF API (Token of the Week / Recent VC Investments / Notable Fundraising)** lấp 3 slot trống trong grid Valuation, data từ `surf-content.json` (script `fetch-content.mjs` ở repo `surf-dashboard`, refresh thủ công). Build xong, verify layout/data đúng bằng headless screenshot → **user thấy 3 box không mang lại giá trị gì, yêu cầu gỡ hẳn**. Đã revert sạch: xoá 3 box HTML + CSS (`.surf-row*`) + JS (`fetchSurfContent`/`renderSurfContent`/`escSurf`/`fmtUnixDate`/hooks trong `renderAll`/`retryValuation`/init) + file `surf-content.json` khỏi repo `cv`. Script `fetch-content.mjs` vẫn còn ở repo `surf-dashboard` (không xoá, không thuộc phạm vi yêu cầu) nhưng **không còn được `cv` dùng tới**. Bài học: nên hỏi trước "nội dung này có thật sự hữu ích để đăng X không" bằng ví dụ cụ thể (data thật) trước khi build full UI, thay vì build xong mới cho xem.
