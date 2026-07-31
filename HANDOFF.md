# HANDOFF — CV / Portfolio (0xhieu.xyz)

**Date:** 2026-07-21  
**Repo:** https://github.com/KattyFury/cv  
**Live:** Cloudflare Pages, project `0xhieu-xyz` (git-integration auto-deploy từ main — **hiện đang KHÔNG trigger được**, xem Pending #3; deploy tay bằng `wrangler pages deploy` cho tới khi fix)  
**Local dev:** site tĩnh — mở thẳng `index.html`, hoặc `python -m http.server` bất kỳ port nào (route `/valuation` cần SPA fallback về `index.html` giống `_redirects`)  
**Local path:** `D:\Files\Claude\build_for_me\cv`

---

## ⭐ HANDOFF mới nhất (2026-07-21) — Rebrand màu + đọc chữ + dọn dead code

**Scope không đổi** (chốt 2026-07-12, chi tiết ở Decisions Log): cv **chỉ là website tĩnh đọc Google Sheet để hiển thị** (About · Valuation · Airdrop). Không backend, không function, không secret. Bot research là dự án khác (`research_airdrop_bot`).

**Trạng thái hiện tại sau session 21/07:**
1. **Bảng màu thương hiệu đổi hẳn** — gradient chính `linear-gradient(45deg, #6155F5 0% → #34C759 100%)` (tím đậm → xanh lá, chéo dưới-trái lên trên-phải), dùng cho nút CTA (`Predict TGE FDV`, `Calculate`, `lang-btn.active`) + badge rank **S+/SS**. Rank tier còn lại: **S**=`#6155F5` (tím), **A**=`#0088FF` (xanh dương, KHÔNG nằm trong gradient — user giữ riêng), **B**=`#34C759` (xanh lá). Biến CSS: `--accent`/`--accent-gradient`/`--brand-1`/`--brand-2` ở đầu `:root`.
2. **Bảng màu trung tính đổi sang xám/đen/trắng thật** (bỏ hẳn tông kem/nâu ấm cũ) — `--white:#FFF`, `--text:#171717` (gần đen), `--sub:#525252` (chữ phụ, xám vừa-đậm), `--muted:#8A8A8A` (xám nhạt hơn), `--off`/`--border` cũng chuyển xám trung tính. Lý do: bản màu ấm cũ đọc khó, user phàn nàn "dark dark khó đọc".
3. **About/Experience content viết lại toàn bộ** — tagline, cả 5 mốc Experience (2026/2025/2023-24/2022/Pre-2022) đổi wording theo bản user chốt. **Bỏ hẳn câu chuyện "học từ 1 OG 10 năm kinh nghiệm"** ở mốc 2022 (đồng bộ với việc bỏ highlight 2022B).
4. **Highlights đổi hẳn sang naming theo năm Experience**: `<year><A/B/C...>.png` (nhiều ảnh cùng năm thì tăng chữ cái) thay vì số thứ tự 1-5 cũ. Hiện có: `2022A`, `2025A/B/C`, `2026A/B` (đã xoá `2022B` theo yêu cầu user — ảnh + caption "em trai ăn tối CZ" bị coi là khoe khoang không cần thiết). `2023-2024` chưa có ảnh, để trống có chủ đích (comment `#` trong `highlights.txt`).
5. **Bảng Valuation — header giờ cũng nằm trong cơ chế căn khối** (trước đó chỉ áp cho data row): `th` dùng chung `span.ck` + `--ck1..--ck6`, JS đo bề rộng tính cả text header khi tìm giá trị dài nhất mỗi cột — tránh trường hợp tên cột dài hơn mọi giá trị thật mà không được tính.
6. **Dead-code sweep session này**: xoá CSS orphan `.hero-desc` (tàn dư hero nhiều dòng cũ), `.stat-single` (định nghĩa cho Danger Zone nhưng cuối cùng dùng list riêng), `.ard-coming-soon`/`.ard-cs-icon`/`.ard-cs-text` (placeholder "Coming soon" cũ của Airdrop, giờ có nội dung thật); xoá JS orphan `fetchCoinGeckoData()` (~43 dòng, code fetch ATH/price client-side từ thời trước khi chuyển qua Google Apps Script sync) và `fmtPrice()` (duplicate cũ, bản đang dùng thật là `fmtTokenPrice()`).
7. Nút "Predict TGE FDV" (`.predict-link`) đổi `font-weight: 700 → 500` — 2 comment cũ trong code tự mâu thuẫn nhau về weight "chuẩn" (1 nói 400, 1 nói 700/bold); chốt lại 500 cho khớp các nút CTA khác (`Calculate`, `lang-btn`, `nav-btn.active` đều 500).

**Core files:** `index.html`, `_redirects`, `highlights.txt` + `highlights/`, `icon.png` (mèo-kính), `pfp.png`, `arrow.svg`, `CLAUDE.md`, `HANDOFF.md`.

**`.env` / `.dev.vars`:** đã xoá 2026-07-21 (key bot research cũ, không code nào trong cv dùng). Đã xoá luôn `.claude/worktrees/` (3 worktree rác ~20MB) + 3 branch không còn dùng (`airdrop-role-safety`, `feature/airdrop-work-to-earn`, `claude/admiring-saha-abe3fb`, cả local lẫn remote) theo yêu cầu "dự án chỉ là dự án, không rác".

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

- **Static HTML** (`index.html`) — toàn bộ site (HTML + CSS + JS) trong 1 file, host trên **Cloudflare Pages**.
- **KHÔNG có backend / Cloudflare Functions / secret key** — mọi data đọc từ nguồn public.
- Nguồn data (đều public, keyless):
  - **Google Sheets CSV** (gviz) — Valuation (tab DATA) + Airdrop Work/Watchlist.
  - **CoinGecko** free API — giá / ATH (fetch live trong `index.html`).
  - **Google Translate** (gtx) — dịch VI→EN cho Airdrop.
- **Google Apps Script** (nằm trong Sheet, chạy daily 2h) — sync ATH + current price vào DATA tab.

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

## WTE Cards (Airdrop tab)

- Logo: lấy từ `unavatar.io/twitter/{handle}` — extract handle từ cột Twitter
- Rank badge (SS/S/A/B) nằm góc phải card, đứng sau Type
- Colors (2026-07-21): SS/S+=gradient `#6155F5→#34C759`, S=#6155F5 (tím), A=#0088FF (xanh dương), B=#34C759 (xanh lá)
- CSS classes dùng rank trực tiếp: `.wte-card--SS`, `.rank-SS` — valid vì SS là alphanumeric

---

## Watchlist Tab (sub-tab trong Airdrop)

**Vị trí:** Airdrop view → 2 sub-tab **Work | Watchlist** (không phải nav riêng, không có route riêng).

### Data source
- Đọc trực tiếp Google Sheet tab **`Watchlist`** qua gviz CSV (`sheet=Watchlist`) — **public, không key, không KV, không backend**.
- Cột: **A** tên · **B** X handle · **C** narrative · **D** gọi vốn (vd `$500M`) · **E** "có việc" YES/NO.
- Logo lấy từ `unavatar.io/twitter/{handle}`.

### Render
- Card gọn: tên (link X) + dòng meta `narrative · gọi vốn` (13px, màu `--sub`) + mũi tên trạng thái.
- **Mũi tên** = icon `arrow.svg` (user tự vẽ), tô màu bằng CSS mask + `currentColor`:
  - **Sáng** (accent) = cột E YES. Nếu tên khớp 1 card Work → **bấm được**, nhảy sang Work + highlight 1.5s (`wlGoWork`).
  - **Mờ** (border) = cột E NO.

### Ngôn ngữ (VI/EN)
- Mặc định VI. Dropdown **English** → dịch narrative + gọi vốn qua Google Translate (`gtranslate()` — hàm dùng chung với card Work), cache trong `wlData.EN`. Text trạng thái rỗng cũng đổi theo ngôn ngữ.

---

## Pending / Known Issues

1. **×ATH filter** — website + Apps Script đang bỏ ATH cùng ngày TGE (râu nến listing). Một số token pump ảo 1-3 ngày đầu; cân nhắc mở rộng window filter.

2. **Làm cho số đông HIỂU tab Valuation là gì** (user chốt hướng 2026-08-01, CHƯA làm) — hiện các box (Market condition · Recent TGE multiples · Danger Zone · Trending Narratives) chỉ bày số cho người đã biết đọc. Người lạ vào không hiểu đây là **cách user đọc thị trường**, đúc kết từ kinh nghiệm quan sát market. **Hướng: làm chính các BOX dễ hiểu hơn** — không đổi tên tab, không thêm khối mới ở About me, không đụng tagline (user đã bác 3 phương án đó). Việc cần làm nằm bên trong từng box: diễn giải con số đang nói lên điều gì, ngưỡng nào là tốt/xấu, vì sao user nhìn chỉ số đó. Cùng tinh thần cho tab Airdrop (mạch "làm việc kiếm tiền").

3. **`highlights/` và ảnh** — từ 2026-08-01 ảnh dùng WebP (`pfp.webp`, `highlights/*.webp`). Tên file trong `highlights.txt` phải khớp đuôi thật. Thêm ảnh mới nên nén WebP (~750x500, dưới ~150KB) để không kéo trang nặng lại.

---

## Files quan trọng

```
index.html            — toàn bộ website (HTML + CSS + JS)
_redirects            — Cloudflare Pages SPA fallback (/* → /index.html)
icon.png              — favicon + icon iPhone home screen (mèo-kính, mắt cam)
pfp.png               — avatar Hieu Nguyen (About me)
arrow.svg             — icon mũi tên cho Watchlist (tô màu qua CSS mask)
highlights.txt + highlights/  — ảnh highlights ở About me (mỗi dòng "tên-ảnh | caption", thứ tự dòng = thứ tự hiển thị)
.gitignore            — .env, node_modules, .claude/, .dev.vars, .wrangler/
```
> Đã xóa khỏi repo: `functions/`, `server.js`, `export-pdf.js`, `package.json`, `.dev.vars`, toàn bộ file research/bot (archive tại `Desktop/cv-research-archive.md`).

---

## Lệnh thường dùng

```bash
# Site tĩnh — mở thẳng index.html trong browser để xem, hoặc:
npx serve .                 # hoặc bất kỳ static server nào
git add -A && git commit -m "..." && git push
```

---

## Decisions Log

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

## Failed Approaches

- 2026-06-11: Apps Script + CoinGecko `market_chart/range` và `market_chart?days=max` → 401 (Demo key không có quyền) → bỏ.
- 2026-06-11: Apps Script + Binance klines → 451 geo-block (server Google ở Mỹ) → chuyển sang chạy local.
- 2026-06-11: Apps Script + CryptoCompare → yêu cầu API key, user đăng ký bị "Invalid SSL certificate" → bỏ.
- 2026-06-11: Apps Script + Gate.io → user từ chối dùng. OKX + CoinDesk Data API → chạy được nhưng coverage quá ít → bỏ.
- 2026-06-11: `fetch-before-ath.js` bản đầu lấy min kể cả candle listing → ra giá wick ảo (ARB 0.5, SUI 0.1) → fix bỏ candle đầu tiên của sàn.
- 2026-06-18: Tự đổi KV binding name `WATCHLIST` → `KV_BINDING` vì tưởng config sai → Dashboard thực tế là `WATCHLIST` → waste 2 commit. **Bài học: không đoán mò config/binding name, hỏi user hoặc xem Dashboard.**
- 2026-06-18: Filter Sync bỏ qua project raise < $5M → sai, Tier-1 (Coinbase Ventures, a16z CSX) invest seed $3-4M đầy → bỏ filter.
- 2026-06-18: Đặt modal HTML sau `</script>` → `getElementById` null → `null.addEventListener` crash toàn bộ JS → mất hết data hiển thị → fix dời modal lên trước script.
