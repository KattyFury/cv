# SPEC v3 — Valuation (đã chốt)

> Kết quả buổi bàn ngày 2026-09-21. Đây là **quyết định đã chốt** cho tab Valuation.
> Thứ tự ưu tiên khi mâu thuẫn: **tài liệu này > Figma > `0xhieu_REBUILD_SPEC_v2.md` > `REBUILD_SPEC.md`**.
> Figma: `qPitw8s3XP5ennmBmhzYQF`, frame Valuation = node `60:66`.
> Mọi số trong tài liệu này **đo từ data thật hoặc gọi API thật**, không suy đoán.

---

## 0. Sửa lại spec v2

| Spec v2 ghi | Thực tế chốt | Vì sao |
|---|---|---|
| §1 "không đổi palette (tím `#6155F5` → xanh `#34C759`)" | **Bỏ. Dùng palette Figma: nền đen + accent amber** | Chủ site: "tuân thủ thiết kế mới, bỏ thiết kế cũ" |
| §4.5 narrative `stablecoin` | **`stablechain`** | Data thật dùng `Stablechain`; Figma cũng dùng `stablechain`; XPL (Plasma) và STABLE là *chain* chuyên stablecoin, không phải *coin* |
| §4.5 "Stablechain có vẻ là stablecoin, cần xác nhận" | **Không phải.** Giữ `stablechain` | như trên |
| §4.6 "job chạy ở Worker riêng có Cron Trigger" | **Chạy trong dự án binance, đẩy sang cv** | Tránh rủi ro Binance chặn Cloudflare colo (HTTP 451 đã xảy ra với Apps Script) |

---

## 1. Kho dữ liệu — KV, tách 2 key

Bỏ Google Sheet. Dùng KV binding **`WORK`** đã có sẵn, thêm 2 key:

```
KV WORK
 ├─ personal-tasks   (tab Work, đã có)
 ├─ ai-posts         (tab AI, đã có)
 ├─ val-projects     ← MỚI: data nguồn, CHỈ admin ghi
 └─ val-prices       ← MỚI: giá, CHỈ job ghi
```

**Tách 2 key là có chủ đích:** admin sửa dự án và job ghi giá không bao giờ đụng cùng một key, nên không có chuyện bên này ghi đè bên kia. 78 dự án ≈ 40KB, thừa sức trong giới hạn 25MB của KV.

### `val-projects` — data nguồn, nhập tay

| Trường | Kiểu | Ghi chú |
|---|---|---|
| `ticker` | string | khóa chính, viết hoa, bỏ `$` đầu |
| `tgeDate` | `YYYY-MM-DD` | chuẩn hoá khi nhập, **không** lưu `dd/mm/yyyy` |
| `cgId` | string | CoinGecko id, chữ thường |
| `narrative` | enum 15 giá trị | xem §3 |
| `fundraising` | number | USD, lưu **số**, không lưu chuỗi `"$178.500.000"` |
| `vcAlloc` | number | phần trăm, lưu `17` không phải `"17,00%"` |
| `totalSupply` | number | |
| `priceTGE` | number | giá lúc TGE — lịch sử, không đổi |
| `binanceSymbol` | string \| null | vd `OPUSDT`; null = không có trên Binance |

### `val-prices` — job ghi mỗi ngày

```json
{
  "OP": {
    "atm": 0.0996,
    "ath": 4.865,
    "athDate": "2024-03-06",
    "atl": 0.396,
    "atlDate": "2022-06-18",
    "updatedAt": "2026-09-21T19:00:00Z"
  }
}
```

**Không lưu bất kỳ bội số nào** (×TGE, ×ATH, ×ATL, ×ATM). Tất cả tính ở client lúc render — một nguồn duy nhất, không lệch.

> ⚠️ Bản cũ có lỗi này: box "Narrative đang hot" dùng `xTGEm` (cột K, Sheet tính sẵn) trong khi bảng dùng `multiple(e)` (JS tự tính). Hai số có thể lệch nhau. Bản mới **cấm** lưu bội số.

---

## 2. Nguồn giá + job hằng ngày

### Nguồn

| Cần gì | Lấy từ | Phủ |
|---|---|---|
| Giá hiện tại, ATH, **ngày ATH** | **CoinGecko** `/coins/markets` | 78/78 |
| **Đáy trước ATH** | **Binance** `/api/v3/klines` interval `1d` | ~58/78 |

×ATH lấy từ CoinGecko cho **tất cả** dự án — một cách tính duy nhất cho cả cột, không trộn nguồn.

**Đã kiểm coverage Binance bằng cách gọi thật** (18 ticker mẫu): 12 có trên Spot USDT · 5 không có ở đâu (STABLE, CAMP, KGEN, DOS, TMX) · **MYX chỉ có trên Futures** (`fapi`). Job phải thử Spot trước, hụt thì thử Futures, hụt nữa thì `atl = null`.

### Chỗ chạy

Thêm một file vào dự án **`D:\Files\Claude\1_Agents\binance`** (máy chạy 24/7), mỗi ngày:
1. Gọi CoinGecko lấy giá + ATH + ngày ATH cho 78 dự án
2. Gọi Binance klines lấy đáy-trước-ATH cho dự án có `binanceSymbol`
3. `POST` sang cv kèm `ADMIN_PASS` → cv ghi vào `val-prices`

**Không chia sẻ dòng code nào giữa hai dự án — chỉ nói chuyện qua HTTP + mật khẩu.** Đúng luật "không lôi code dự án khác vào cv" trong `CLAUDE.md`.

> ⚠️ **Dùng `fetch` REST thẳng, KHÔNG dùng `binance-cli`.**
> Đã verify: `binance-cli spot klines --start-time 0 --limit 1` vẫn trả nến mới nhất (tháng 9/2026) thay vì nến đầu tiên; ép cả `--start-time` lẫn `--end-time` thì trả mảng rỗng. **CLI bỏ qua tham số thời gian** → không lấy được lịch sử. REST thì chuẩn: `startTime=0&limit=1` trả đúng nến 01/06/2022 của OP.

### Phân trang

Binance trả tối đa 1000 nến/lần. OP có **1574 nến** → cần 2 lần gọi, lấy `openTime` nến cuối + 86400000 làm `startTime` lần sau.

---

## 3. Narrative — 15 giá trị

```
stablechain  layer-1   infra     ai        layer-2
prediction   trading   bitcoin   payment   defi
identity     privacy   game      social    desci
```

Tất cả **chữ thường**, viết y hệt trên.

### Chuyển đổi data cũ

| Sheet hiện tại | Số dự án | Sang |
|---|---|---|
| Layer-1 | 17 | `layer-1` |
| Infra | 13 | `infra` |
| AI | 13 | `ai` |
| Layer-2 | 10 | `layer-2` |
| DeFi | 7 | `defi` |
| Privacy | 3 | `privacy` |
| Trading | 2 | `trading` |
| Stablechain | 2 | `stablechain` |
| Prediction | 2 | `prediction` |
| Identity | 2 | `identity` |
| Game | 2 | `game` |
| Social · Payment · Bitcoin | 1 mỗi loại | `social` · `payment` · `bitcoin` |
| **Others** (BIO) | 1 | **`desci`** |
| **(trống)** (DOS) | 1 | **`ai`**, và điền `cgId = dappos` |

`dappos` **đã verify** trên CoinGecko: id `dappos`, symbol `DOS`, tên DAPPOS, market-cap rank 537.

> Figma vẽ `modular` cho TIA — **đó là chữ bịa trong bản mock**. Data thật ghi TIA là `Layer-1`. Không thêm `modular` vào danh sách.

---

## 4. Bảng — 7 cột

| # | Cột | Nguồn |
|---|---|---|
| 1 | Ticker | `val-projects` |
| 2 | Narrative | `val-projects` |
| 3 | TGE | `val-projects.tgeDate` |
| 4 | ×TGE | tính |
| 5 | **×ATL** | tính — **cột mới, đứng TRƯỚC ×ATH** |
| 6 | ×ATH | tính |
| 7 | ×ATM | tính |

### Lưới — 7 cột khớp grid tốt hơn 6 cột

```
7 × 176px + 6 gutter × 16px = 1232 + 96 = 1328 ✓
176 = 48×4 − 16  →  mỗi cột đúng 4 ô lưới; 7 × 4 = 28 cột
```

Bản 6 cột trong Figma đang là 1328 ÷ 6 = 221,33px — **lệch lưới**. Thêm ×ATL thì bảng tự về đúng grid. Figma cần vẽ lại bảng thành 7 cột × 176.

### Công thức

```
vcPricePerToken = (fundraising ÷ (vcAlloc/100)) ÷ totalSupply
vcFDV           = fundraising ÷ (vcAlloc/100)

×TGE = priceTGE     ÷ vcPricePerToken
×ATL = atl          ÷ vcPricePerToken
×ATH = ath          ÷ vcPricePerToken
×ATM = currentPrice ÷ vcPricePerToken
```

Cả 4 bội số đi **cùng một đường** (giá ÷ giá VC). Bản cũ tính ×TGE qua tỉ lệ FDV còn 2 cái kia qua giá — gom lại một kiểu.

### ×ATL — định nghĩa chốt

**Đáy = điểm thấp nhất trong khoảng [ngày lên sàn → ngày ATH].** Không phải đáy toàn lịch sử.

Lý do chọn cách này, kiểm trên 10 token thật:

| Cách | Số token có số để hiện |
|---|---|
| Đáy toàn lịch sử, ẩn nếu rơi sau ATH | **1/8** |
| Đáy trước ATH | **8/8** |

Hầu hết alt TGE 2022–2024 đang ở đáy lịch sử *ngay lúc này* (2026 gấu) → đáy nằm sau ATH → cách kia làm cột trống gần hết.

Cách này kể đúng câu chuyện cần kể — OP: list 1,232 → rơi 0,396 (÷3) ngày 18/06/2022 → rồi mới lên 4,865. Và luật "chỉ hiện nếu đáy trước ATH" **tự động thỏa**, vì đáy-trước-ATH theo định nghĩa luôn nằm trước ATH.

`atl = null` (không có trên Binance, hoặc ATH rơi đúng ngày lên sàn nên không có khoảng trước) → hiện `—`.

### Bộ lọc ATH ngày listing

`athDate == tgeDate` → ×ATH hiện `—`.

> ⚠️ Bản cũ: bộ lọc này là **code chết**. Dòng 2189 kiểm `e.athDate` nhưng `fetchPublicData()` không bao giờ gán trường đó. Việc lọc thật ra do Apps Script làm (nó chỉ không ghi ATH). Bỏ Sheet = mất Apps Script → **phải làm lại ở client**, nay có `athDate` trong `val-prices` nên làm được.

### Ticker đậm / nhạt

**Đậm = vcFDV ≥ $300M · Nhạt = < $300M.** Bỏ hẳn ký hiệu S/M.

Ngưỡng $300M chứ không phải median, vì: chia 21 đậm / 57 nhạt nên đậm là thiểu số, đọc ra ngay (median $136M sẽ chia 39/39, một nửa bảng in đậm là mất tác dụng); và box "Hệ số TGE gần đây" đã chia FDV thấp/cao ở đúng $300M nên người đọc nối được hai chỗ.

Phân bố thật của 78 dự án: `<$100M` 29 · `$100–300M` 28 · `$300–500M` 7 · `$500M–1B` 9 · `>$1B` 5.

### Định dạng số

Dấu phẩy thập phân kiểu Việt: `4,82` · `0,418`. Ô trong bảng **không có dấu `×`** — chỉ header mang `×TGE` / `×ATL` / `×ATH` / `×ATM`.

---

## 5. Admin

Nút Admin, nhập mật khẩu xong hiện **2 icon: `add` và `camera`**.

> Figma mới vẽ 1 ô 32×32 ở x=1151. Cần ô thứ hai ở **x=1103** (cách nhau 16).

### Bấm `add` → danh sách quản lý

- Hiện **toàn bộ** dự án, **sửa và xóa được** từng dòng.
- **Chỉ hiện data nguồn**: TGE date · ticker · API ID · narrative · fundraised · VC allo · total supply · giá TGE · cặp Binance.
- **Không hiện** ×TGE / ×ATL / ×ATH / ×ATM, cũng không hiện ATH/ATM/đáy do job ghi.
- Gọn, không rối mắt.

Đúng bằng nội dung key `val-projects` — kiến trúc 2 key đã tách sẵn nên không phải lọc gì thêm.

---

## 6. Bốn box — giữ nguyên logic, chờ chủ site chỉnh

Logic hiện tại đã báo cáo đầy đủ (Cổng 2). Chưa đổi gì ngoài 2 điểm:
- Box "Narrative đang hot" **thôi dùng `xTGEm`**, chuyển sang ×TGE tính ở client như bảng.
- Nhãn S/M biến mất khỏi box "Hệ số TGE gần đây" (theo §4).

Tóm tắt logic đang chạy:

| Box | Luật |
|---|---|
| Hệ số TGE gần đây | Điều kiện thị trường = median ×TGE của 6 dự án mới nhất (`≥13` Mạnh · `4.3–13` Bình thường · `<4.3` Yếu). FDV thấp/cao chia ở $300M, mỗi rổ 6 dự án mới nhất, nếu dự án thứ 6 cách dự án đầu >60 ngày thì rút còn 4 |
| Vùng nguy hiểm | ×ATM ≥ 15, TGE mới nhất lên đầu, TGE <30 ngày → badge ⚠ PUMP LÁO |
| Narrative đang hot | Chỉ dự án TGE từ 01/02/2025, xếp theo median ×TGE giảm dần |
| Watchlist theo narrative | Thứ tự narrative ăn theo box trên; trong cùng narrative: gọi vốn nhiều → ít |

**Dự đoán FDV TGE** giữ nguyên MODEL D 7 bước, nhưng cần sửa **3 chỗ fallback âm thầm** (bước 1 rổ <2 mẫu → lấy cả pool; bước 3 <3 mẫu → lấy tất; bước 5 <2 mẫu → giữ nguyên): phải báo ra màn hình số đang đến từ đâu, thay vì im lặng.

---

## 7. Còn treo

1. Box phân tích rộng **432** (chia đều 1328÷3) hay **416** (đúng lưới 48, thừa 48px)? Trục dọc đã chuẩn grid, chỉ trục ngang lệch.
2. Figma phải vẽ lại bảng **7 cột × 176** và thêm icon thứ hai ở x=1103.
3. Trường nào **bắt buộc** khi thêm dự án? Thiếu `cgId` hoặc `binanceSymbol` thì có chặn lưu không?
4. Tab `Watchlist` trên Google Sheet (box thứ 4) có chuyển sang KV cùng đợt không?
5. Cách chuyển 78 dòng từ Sheet sang KV: chạy một lần bằng script, hay nhập tay qua form?
6. **Nút tròn 80×80 góc dưới phải = chú mèo đeo kính = Agent.** Có ở cả 4 frame Figma. Đây là **dự án riêng**, không nằm trong rebuild này — Agent cần `ANTHROPIC_API_KEY` mà cv là trang public, để key ở client là lộ ngay. Chú mèo trên cv chỉ nên là **cửa vào**, não nằm chỗ khác. Bàn riêng sau.

---

*Đo từ: `index.html` @ `5f0afd6` · Sheet DATA 78 dòng kéo ngày 21/09/2026 · Binance REST + CoinGecko gọi thật cùng ngày.*
