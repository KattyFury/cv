# REBUILD SPEC — 0xhieu.xyz

> **Tài liệu này để làm gì:** mang sang Claude Chat bàn bạc hướng rebuild site `0xhieu.xyz`.
> Chưa code gì. Mục tiêu của buổi bàn là **chốt được 4 quyết định** ở mục 9.
> Mọi số liệu dưới đây **đo từ code thật** (commit `5f0afd6`, 2026-09-20), không phải ước lượng.

---

## 0. Bối cảnh người đọc

Bạn (Claude Chat) **không có quyền đọc repo**. Tài liệu này là toàn bộ context bạn cần.

Chủ site: **vibecoder người Việt**, không có nền tảng lập trình, plan ở Claude Chat → giao Claude Code build từng bước. Trả lời bằng **tiếng Việt**, thuật ngữ kỹ thuật giữ tiếng Anh. Không dump lý thuyết, có nhiều phương án thì bày ra cho chọn chứ đừng tự chọn im lặng.

---

## 1. Site hiện tại là cái gì

Website cá nhân 1 người, host **Cloudflare Pages** (auto-deploy từ nhánh `main`, project Pages tên `0xhieu-xyz`).

Định vị (câu chốt, **dùng nguyên văn**, không dịch, không viết lại):

> **Sharing POVs on Crypto and AI**

4 tab, routing client-side (`history.pushState`), `_redirects` là catch-all `/* → /index.html 200`:

| Nav hiển thị | Route | Nội dung | Ngôn ngữ |
|---|---|---|---|
| **CV** | `/` | Hero + Experience + Highlights + Available for | Tiếng Anh cố định, **không** toggle |
| **Valuation** | `/valuation` | Bảng TGE 6 cột + 4 box phân tích | Toggle EN\|VI, mặc định VI |
| **AI** | `/ai` | Hub bài viết (4 box: INSIGHTS/LEARN/TOOLS/BUILD) | Toggle EN\|VI, mặc định VI |
| **Work** | `/airdrop` | Card "Work to Earn" + thanh lọc rank | Toggle EN\|VI, mặc định VI |

⚠️ Chú ý dòng cuối: nav **đã đổi tên thành "Work"** nhưng route vẫn `/airdrop`, id DOM vẫn `airdrop-view`, tài liệu nội bộ vẫn gọi "tab Airdrop". Đây là **drift có thật**, là một trong các thứ cần chốt (mục 6.4).

---

## 2. Kiến trúc hiện tại

### 2.1 Toàn bộ site nằm trong 1 file

`index.html` — **3.378 dòng · 171 KB**, HTML + CSS + JS inline chung một file.

| Vùng | Dòng | Số dòng | Ghi chú |
|---|---|---|---|
| `<head>` (meta, OG, JSON-LD, font) | 1–49 | 49 | |
| `<style>` | 50–1103 | **1.054** | 196 chỗ dùng `var(--*)`, 7 `@media` |
| `<body>` HTML | 1105–1592 | **488** | 4 view + lightbox + modal + rank filter |
| `<script>` | 1593–3375 | **1.783** | ~90 function, không module, không build step |

Không có `package.json`, không bundler, không framework, không test. Sửa file → push → Cloudflare deploy.

### 2.2 Backend (duy nhất)

3 Cloudflare Pages Functions, tổng **218 dòng**:

| File | Dòng | Việc |
|---|---|---|
| `functions/api/wte.js` | 20 | `GET /api/wte` — công khai, trả project Work-to-Earn có `visibility === 'public'` |
| `functions/api/private.js` | 104 | `POST /api/private` — cần `ADMIN_PASS`, CRUD task (KV key `personal-tasks`) |
| `functions/api/ai.js` | 94 | `GET` công khai + `POST` cần `ADMIN_PASS`, CRUD bài viết tab AI (KV key `ai-posts`) |

Cả 3 dùng **chung KV binding `WORK`** và **chung 1 mật khẩu `ADMIN_PASS`** (đặt ở Cloudflare Dashboard, **không nằm trong repo**). Mật khẩu giữ ở `sessionStorage`, verify **phía server**, sai → 401 và không trả bất kỳ data nào.

**Không có smart contract. Không có API key nào cho phần công khai.**

### 2.3 Data flow

```
Google Sheet (tab DATA)
  └─ Apps Script syncAll() chạy daily 2h sáng
       └─ gọi CoinGecko /coins/markets → ghi ATH (cột J) + current price (cột N)
  └─ Website fetch gviz CSV → parse client-side → render (tab Valuation)

Google Sheet (tab Watchlist) ──gviz CSV──> box "Watchlist theo narrative"

Cloudflare KV `WORK`
  ├─ personal-tasks ──/api/wte, /api/private──> tab Work
  └─ ai-posts       ──/api/ai──────────────────> tab AI

Google Translate (gtx, keyless) ──> dịch VI→EN runtime cho tab AI + Work
highlights.txt + highlights/*.webp ──> grid Highlights ở CV
```

> **Đính chính một hiểu lầm hay gặp:** CoinGecko **không** được gọi từ browser. Nó do Apps Script gọi
> server-side 1 lần/ngày rồi ghi vào Sheet; client chỉ đọc CSV. Đừng đề xuất kiểu "thay CoinGecko client call".

### 2.4 Assets

| File | Size | Việc |
|---|---|---|
| `html2canvas.min.js` | 199 KB | DOM→PNG cho nút camera ở Valuation. **Để trong repo có chủ đích** (không CDN), chỉ nạp khi bấm camera lần đầu |
| `og.png` | 86 KB | Ảnh share 1200×630. Nguồn vẽ nằm **ngoài repo**: `C:\tmp\cvshot\og-gen.html` |
| `highlights/` | 270 KB | 6 ảnh (5 `.webp` + 1 `.png`) |
| `icon.png` 31 KB · `pfp.webp` 5 KB · `info.svg` · `right2.svg` · `camera.svg` · `arrow.svg` | | `arrow.svg` **không còn code nào dùng** từ 2026-08-06, giữ lại có chủ đích |

---

## 3. Design system hiện tại (đo từ CSS)

### 3.1 Token màu

```css
--white:  #FFFFFF   /* trắng thật, cố ý không ngả kem */
--off:    #F5F5F5
--border: #E5E5E5
--muted:  #8A8A8A
--sub:    #525252
--text:   #171717
--accent: #6155F5   /* tím — điểm chính của gradient thương hiệu */
--brand-1: #6155F5  /* tím */
--brand-2: #34C759  /* xanh lá */
--accent-gradient: linear-gradient(45deg, var(--brand-1), var(--brand-2))
```

### 3.2 Typography

**Một font duy nhất cho toàn site: `Roboto`** (weight 300/400/500/700, load từ Google Fonts).
Khai báo `font-family: 'Roboto'` lặp lại **25 lần** trong CSS.
Font-size **khóa cứng**, scale rời rạc: `19 / 15 / 14 / 13 / 12 / 11 / 10 px`.

### 3.3 Lưới & spacing

- **Grid 4px**: mọi margin/padding/gap phải là bội của 4 (`4·8·12·16·20·24·32·40·48·56·64`). Ngoại lệ: 1px/2px cho border.
- **Đơn vị hàng dọc**: `--row: calc(100vh / 30)` — màn hình chia đúng 30 hàng bằng nhau. Navbar cao đúng `2×--row` để đường kẻ xám rơi chính xác vào ranh giới hàng 2/3.
- Table cell padding chuẩn toàn site: `thead 8px 16px` · `td 12px 16px`.
- `--max: 900px` (bề ngang content) · `--box-h: 160px` (box 4-quarter ở Valuation) · `--modal-w: 340px`.
- Hero CV là lưới 10 hàng: `repeat(5, var(--row)) auto var(--row) auto var(--row) auto`. **Ba hàng chữ để `auto`** có chủ đích — ghim `var(--row)` thì mobile câu dài xuống 2–3 dòng sẽ tràn ô đè hàng dưới.

### 3.4 Responsive

Chỉ **7 media query**, breakpoint **không thống nhất**: `480px` (×3), `640px` (×2), `768px` max (×1), `768px` min (×1).

### 3.5 Không có dark mode

Site hiện tại chỉ có light mode.

---

## 4. Ràng buộc KHÓA — rebuild kiểu gì cũng không được phá

Đây là các quyết định đã chốt qua nhiều session, **có lý do cụ thể**, không phải tùy tiện:

1. **Châm ngôn `Sharing POVs on Crypto and AI`** — dùng nguyên văn ở `.hero-tagline`, `meta description`, `og:title` / `og:description` / `og:image:alt`, JSON-LD `description`, và ảnh `og.png`.
2. **Tab CV là tiếng Anh, không ngoại lệ.** Tiếng Việt chỉ được xuất hiện ở tab có toggle VI/EN (Valuation · AI · Work) và trong tài liệu nội bộ. Đã sai 1 lần (2026-08-17), phải sửa lại.
3. **Câu niềm tin có 2 bản, CỐ Ý** — đừng "đồng bộ" lại làm một:
   - Bản dài 3 vế ở hero CV: *"I believe AI is the future of knowledge work, robots the future of manual labor, and crypto the future of money."*
   - Bản ngắn ở meta / OG / JSON-LD / og.png: *"AI is the future. Crypto is the money of the future."* (vì mấy chỗ đó giới hạn ký tự, ảnh preview không chứa nổi câu 3 vế).
4. **Đổi `og.png` thì PHẢI bump `?v=N`** ở cả `og:image` lẫn JSON-LD `image` — X/Telegram/Facebook cache ảnh theo URL. Đang ở `?v=6`.
5. **Scrollbar**: chỉ style bằng `::-webkit-scrollbar`. **Tuyệt đối không** set `scrollbar-width` / `scrollbar-color` cho Chromium — từ Chromium 121, 2 thuộc tính chuẩn đó (khi khác `auto`) vô hiệu hóa toàn bộ `::-webkit-scrollbar`, làm site ra **3 kiểu scrollbar khác nhau** (đã xảy ra, sửa 2026-08-05).
6. **Không dùng `wrangler.toml`** cho project này — file đó biến thành "source of truth" và khóa dashboard thành chỉ-đọc, rủi ro làm chết `ADMIN_PASS`.
7. **Thang rank Work-to-Earn khai 1 chỗ duy nhất** (`WTE_GROUPS` / `WTE_RANKS` / `RANK_LABEL`), dropdown admin đổ bằng JS chứ không hardcode `<option>`. Thêm/đổi nhóm phải sửa đồng bộ cả `RANKS` trong `private.js`.
8. **`WTE_TYPES` là nguồn duy nhất cho thẻ phân loại** — thứ tự phần tử = thứ tự ưu tiên, dùng chung cho dropdown admin lẫn thứ tự card trong mỗi nhóm.
9. **Không lôi asset / code / secret của project khác** (ezwallet, các bot airdrop) vào đây. Chúng ở repo riêng, stack khác.
10. **Đừng tách thêm bậc vốn hóa ở nửa dưới $300M** — data đã chứng minh `<$100M` và `$100–300M` hành xử y hệt (median ×TGE 4.25 vs 4.61 toàn lịch sử). Chỗ data thật sự gãy là **$300M**.

---

## 5. Công thức Valuation (đừng rebuild làm sai số)

```
vcPricePerToken = (fundraising × 1e6) / (vcAlloc / 100) / totalSupply
×TGE = priceTGE      / vcPricePerToken
×ATH = ath           / vcPricePerToken
×ATM = currentPrice  / vcPricePerToken
vcFDV = fundraising  / (vcAlloc / 100)   → nhãn S (<$300M) / M (>$300M)
```

- **ATH intraday filter**: nếu `ath_date` trùng ngày `tgeDate` (<24h) → hiển thị `—`. Lý do: CoinGecko lấy absolute high kể cả râu nến ngày listing, không phải giá trade được.
- **Market condition** = median ×TGE của 6 deal gần nhất: Weak `<4.3×` · Normal `4.3–13×` · Strong `≥13×`. Ngưỡng calibrate theo giai đoạn thị trường thật (Strong ≈ chu kỳ 2023–2024, Weak ≈ 2025–2026), **không phải** phân phối thống kê thuần.
- **Danger Zone**: lọc token đang có ×ATM ≥ 15. Backtest **17/17 token** từng vào vùng này đều về đáy. TGE <30 ngày mà đã vào vùng → badge ⚠ FAKE PUMP.
- **Trending Narratives**: xếp hạng theo **median ×TGE** (không dùng ×ATH — 1 coin pump lẻ về sau kéo cả nhóm trông "hot" dù ban đầu thị trường không tin).

---

## 6. Bốn trục rebuild cần bàn

Chủ site đã chọn **cả 4 trục**. Việc của buổi bàn là xếp thứ tự và chốt mức độ từng trục.

### 6.1 Trục A — Redesign giao diện

**Hiện trạng:** 1 font (Roboto) cho tất cả · palette tím `#6155F5` + xanh lá `#34C759` · không dark mode · hero thuần copy tiểu sử.

**Vấn đề quan sát được:**
- Số liệu quant (×TGE, ×ATH, ×ATM, %, ngày tháng) dùng **cùng font với văn xuôi** → data không đọc ra là data.
- Không dark mode, trong khi audience là dân crypto-native (xác suất cao dùng OS dark mode).
- Hero không hề nhắc đến việc **có một mô hình quant thật** đứng sau site — Danger Zone backtest 17/17 là proof-stat mạnh nhưng đang nằm khuất trong tab Valuation.

> ⚠️ **Một ghi chú cũ đã lỗi thời, đính chính ở đây:** có một design direction cũ ghi accent là **amber `#FFA111`** với palette giấy ấm (`--paper:#fbfaf7`...). **Code hiện tại KHÔNG còn amber** — đã chuyển sang tím/xanh gradient `#6155F5 → #34C759`, và `--white` được chú thích rõ trong CSS là "trắng thật, cố ý không ngả kem". Direction paper-warm cũ **mâu thuẫn trực tiếp** với quyết định đang có trong code. Cần chốt lại chứ đừng áp direction cũ.

**Cần chốt:**
- Giữ palette tím/xanh hiện tại, hay đổi hẳn?
- Có tách font theo vai trò không (display / body / **mono cho số**)?
- Dark mode: làm hay không? Nếu làm, toggle tay hay theo `prefers-color-scheme`?
- Có đưa proof-stat lên hero không?

### 6.2 Trục B — Tách file / dọn code

**Hiện trạng:** 3.378 dòng trong 1 file. Không build step.

**Đánh đổi thật:**

| | Giữ 1 file | Tách `index.html` + `styles.css` + `app.js` | Tách sâu theo module |
|---|---|---|---|
| Deploy | Push là xong | Push là xong | Cần build step |
| Số HTTP request | 1 | 3 | tùy bundler |
| Dễ sửa cho vibecoder | Ctrl+F trong 1 file | Biết file nào chứa gì | Phải hiểu module graph |
| Rủi ro khi AI sửa | AI phải nuốt cả 171 KB | AI đọc đúng file cần | Thấp nhất |
| Công sức rebuild | 0 | Thấp — cắt dán, không đổi logic | Cao — viết lại JS |

**Cần chốt:** dừng ở mức nào? Lưu ý thẳng: tách file **không** tự làm code sạch hơn, nó chỉ làm code **tìm được**.

### 6.3 Trục C — Đổi stack

**Hiện trạng:** static thuần, không dependency, không build.

**Đánh đổi thật:**

| | Giữ static | Astro / Vite | Next.js |
|---|---|---|---|
| Deploy Cloudflare Pages | Đang chạy tốt | OK | OK nhưng nặng hơn |
| Pages Functions hiện có | Giữ nguyên | Giữ nguyên | Phải viết lại theo route convention |
| Thời gian build | 0 | vài giây | vài chục giây |
| Cần Node + `npm install` | Không | Có | Có |
| Dependency phải bảo trì | 0 | vài chục | vài trăm |
| Lợi ích thật cho site 4 tab | — | component hóa, dark mode dễ hơn | gần như không thêm gì |

> **Ý kiến thẳng:** đây là site tĩnh 4 tab của 1 người, không có content pipeline, deploy đang **không cần Node**.
> Đổi stack là trục **tốn nhất mà lợi ít nhất** trong 4 trục. Nên bàn kỹ hoặc bỏ.
> Nhưng đây là quyết định của chủ site — nếu chốt làm thì làm đàng hoàng, đừng làm nửa vời.

**Cần chốt:** có đổi thật không, và đổi để giải **vấn đề cụ thể nào** mà static đang không giải được?

### 6.4 Trục D — Rebuild nội dung / cấu trúc tab

**Vấn đề đã ghi nhận:**

1. **Naming drift**: nav ghi "Work", route `/airdrop`, DOM id `airdrop-view`, tài liệu gọi "tab Airdrop". Đổi route sẽ làm **gãy link cũ** đã share ra ngoài → cần redirect.
2. **Tab Valuation khó hiểu với số đông** (đã chốt hướng 2026-08-01, **chưa làm**). Các box hiện chỉ bày số cho người đã biết đọc.
   - ⚠️ Chủ site **đã bác 3 phương án**: đổi tên tab · thêm khối giải thích ở CV · đụng vào tagline. Đừng đề xuất lại.
   - Hướng còn lại được chấp nhận: **làm chính các BOX dễ hiểu hơn** — diễn giải con số đang nói gì, ngưỡng nào tốt/xấu, vì sao nhìn chỉ số đó. Tinh thần tương tự cho tab Work.
3. **4 box Valuation vốn có layout nội bộ khác nhau** (pill row / nút phẳng / list phẳng). Khi đặt cạnh nhau trong một bản redesign, chúng đọc như "mấy người lạ" chứ không phải một bộ. Chủ site — vốn là **graphic designer trước khi vào crypto** — đã tự bắt lỗi này ở lần pitch trước.

**Cần chốt:** trục D làm tới đâu, và làm **trước hay sau** trục A?

---

## 7. Nợ kỹ thuật đã biết (không phát sinh từ rebuild)

1. **Rank `SS` còn sót trong KV** — do bug ngày 12/08. `groupOf()` đang map `SS`→`S` như shim. Phải vào admin sửa tay từng bản ghi; code không tự biết cái nào dính.
2. **Bậc vốn hóa `L` (>$500M) đã soạn nhưng chưa bật** — điều kiện bật: rổ đó có ≥12 dự án TGE trong 12 tháng gần nhất (hiện mới 5). Đặt `CAP_L_ACTIVE = true` **chưa đủ**, còn 3 việc nữa. Lý do chưa bật: `predictFDV()` cần ≥2 mẫu cùng rổ, thiếu thì **âm thầm fallback về toàn bộ pool mà không báo gì** → số hiện ra không biết đến từ đâu.
3. **`arrow.svg`** không còn code nào dùng (từ 2026-08-06) — giữ lại có chủ đích, đừng tự xóa.
4. **Google Sheet tab "Work"** không còn code nào đọc (từ 09/08) — vẫn giữ trên Drive để đối chiếu.
5. **×ATH filter** đang bỏ ATH cùng ngày TGE; một số token pump ảo 1–3 ngày đầu vẫn lọt → cân nhắc mở rộng window.
6. **Breakpoint responsive không thống nhất** (480/640/768) — nếu rebuild CSS thì đây là lúc gộp.

---

## 8. Rủi ro của rebuild

| Rủi ro | Mức | Ghi chú |
|---|---|---|
| Làm sai công thức Valuation → số hiện ra sai mà **không ai biết** | **Cao** | Không có test. Phải đối chiếu số trước/sau bằng mắt trên data thật |
| Đổi route `/airdrop` → gãy link đã share ra ngoài | Trung bình | Cần giữ redirect |
| Rebuild CSS làm lệch lưới 30 hàng / grid 4px | Trung bình | Là ràng buộc đã chốt, rất dễ phá khi viết lại |
| Đụng `functions/api/*` làm chết `ADMIN_PASS` | Trung bình | Mật khẩu ở Dashboard, không ở repo — sửa sai là mất quyền admin |
| Quên bump `?v=` của `og.png` | Thấp | Ảnh share đứng hình bản cũ |
| Rebuild đồng thời cả 4 trục → không biết cái gì làm gãy cái gì | **Cao** | Lý do nên xếp thứ tự, làm từng trục một |

---

## 9. BỐN QUYẾT ĐỊNH CẦN CHỐT TRONG BUỔI BÀN

1. **Thứ tự 4 trục** — làm trục nào trước?
   (Gợi ý để cãi: D trước A, vì chốt nội dung xong mới biết cần design gì; B trước A nếu muốn CSS mới viết thẳng vào file riêng ngay từ đầu, khỏi cắt dán 2 lần.)
2. **Palette** — giữ tím `#6155F5` + xanh `#34C759`, hay đổi? (nhắc lại: direction amber trong ghi chú cũ đã mâu thuẫn với code hiện tại.)
3. **Stack** — có đổi thật không, và đổi để giải **vấn đề cụ thể nào**?
4. **Mức tách file** — 1 file / 3 file / module hóa?

---

## 10. Output mong đợi từ buổi bàn

Một file spec thứ hai, **cụ thể hơn tài liệu này**, ghi rõ:

- Thứ tự các bước, mỗi bước là một diff nhỏ **duyệt được riêng**
- Với mỗi bước: đụng vào file nào, vùng nào, verify bằng cách nào (kéo data thật, mở trang xem)
- Cái gì **cố tình không làm** trong lần rebuild này

---

*Nguồn số liệu: commit `5f0afd6` · repo `KattyFury/cv` · đo ngày 2026-09-20.*
