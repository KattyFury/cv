# HANDOFF — CV / Portfolio (0xhieu.xyz)

**Date:** 2026-06-05  
**Repo:** https://github.com/KattyFury/CV  
**Live:** Cloudflare Pages (auto-deploy từ main branch)  
**Local:** `node server.js` → http://localhost:8080

---

## Stack

- Static HTML (`index.html`) — toàn bộ site trong 1 file
- Node.js `server.js` — dev server port 8080, SPA fallback
- Google Sheets CSV — data source (read-only từ website)
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
| J | 9 | ATH (dùng cho ×ATH, ×ATM filter) |
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
**Trigger:** Daily 2am (setup bằng `setupDailyTrigger()`)

Chỉ sync 2 cột:
- Col L: ATH (`c.ath`)
- Col N: current price (`c.current_price`)

Cột J (beforeATH) **bỏ trống** — đã thử CoinGecko (401), Binance (451 geo-block), OKX (ít data), CryptoCompare (cần key, SSL issue), Gate.io (user từ chối), CoinDesk API (ít data). Chưa có giải pháp free hoạt động tốt.

---

## WTE Cards (Airdrop tab)

- Logo: lấy từ `unavatar.io/twitter/{handle}` — extract handle từ cột Twitter
- Rank badge (S/A/B) nằm góc phải card, đứng sau Type
- Colors: S=#FF5A36, A=#FFA111, B=#FFD447

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

1. **beforeATH (cột J)** — chưa có giải pháp. Cân nhắc:
   - CryptoCompare free key (đăng ký free, ~100k calls/tháng) — user gặp SSL issue khi đăng ký
   - Nhập tay cho ~15-20 token lớn
   - Bybit API (chưa thử)

2. **×ATH filter** — hiện filter ATH cùng ngày TGE. Nhưng một số token ATH trong 1-3 ngày đầu cũng có thể là pump ảo. Cân nhắc mở rộng window filter.

3. **CoinGecko API key** — đang dùng Demo key `CG-Z7aWtTW1pcctWZeu9eebaDTw` (trong `.env.txt`). Key này từng bị commit lên GitHub (đã fix với `.gitignore`). Nên regenerate nếu cần bảo mật.

---

## Files quan trọng

```
index.html          — toàn bộ website (HTML + CSS + JS)
server.js           — dev server
export-pdf.js       — xuất PDF bằng Puppeteer
.env.txt            — API keys (gitignored)
.gitignore          — bao gồm .env, node_modules, .claude/
```

---

## Lệnh thường dùng

```bash
node server.js          # chạy local
node export-pdf.js      # xuất cv.pdf (cần server đang chạy)
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

---

## Failed Approaches

(chưa có)
