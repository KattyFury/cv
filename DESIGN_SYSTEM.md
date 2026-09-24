# Quy luật thiết kế — 0xhieu.xyz

> Rút ra bằng cách đọc **cả 4 frame Figma** (`55:2` CV · `60:66` Valuation · `70:33` AI · `71:121` Work), không phải đoán. Mọi tab phải tuân đúng bảng này. Figma chỗ nào tự mâu thuẫn thì file này thắng — đã ghi rõ chỗ nào.
>
> File: `qPitw8s3XP5ennmBmhzYQF` · mỗi frame **1424 × 944**.

---

## 1. Chữ — chỉ 3 cỡ

**Bỏ hẳn 21px** (chốt 2026-09-22). Phân cấp làm bằng **cỡ + đậm/thường + đen/xám**, không thêm cỡ mới.

| Cỡ | Kiểu | Màu | Dùng cho |
|---|---|---|---|
| **18** | Bold | đen | Tiêu đề màn hình · tên người. **Chỉ một lần mỗi màn** |
| **15** | Bold | amber | Tiêu đề card (nằm trên thanh header đen) |
| **15** | Bold | đen | Nút · nhãn năm ở timeline |
| **15** | Regular | xám | Chữ thân bài · bullet · caption |
| **12** | Bold | đen | Nhãn nhóm (`GET STARTED` · `DAILY` · `WEEKLY`) · số liệu trong bảng |
| **12** | Bold | amber | Dòng phụ trong header card (`high-potential / work-to-earn`) |
| **12** | Regular | đen | Nội dung trong chip |
| **12** | Regular | xám | Cột phụ trong bảng (Narrative · TGE) |

Font: **Roboto Condensed** cho toàn site (chốt 2026-09-24, thay Inter) — token `--font`, không khai font nào khác. Không dùng cỡ nào ngoài 18 / 15 / 12.

Nhãn nhóm, nav, header bảng, dòng phụ trên nền đen: **VIẾT HOA + giãn chữ** `.04–.08em`.

---

## 2. Màu

| Token | Mã | Dùng cho |
|---|---|---|
| `--ink` | `#000000` | Chữ chính · nền navbar · nền header card |
| `--amber` | `#FFA111` | Chữ trên nền đen · tab đang chọn · mũi tên `►` · chấm timeline |
| `--sub2` | `#4B5563` | Chữ phụ |
| `--line2` | `#ABABAB` | Viền (**0.5px**) · đường kẻ timeline · tab chưa chọn |
| `--chip` | `#F5F5F4` | Nền chip chỉ-đọc · máng toggle (bản sang 2026-09-24, thay `#D9D9D9`) |
| `--shadow` | `0 1px 2px rgba(0,0,0,.06), 0 8px 24px rgba(0,0,0,.08)` | Thẻ nổi + nút bấm được (bóng mềm 2 lớp, thay bóng đen 50%) |
| `--lift` | `0 2px 4px rgba(0,0,0,.08), 0 16px 32px rgba(0,0,0,.12)` | Thẻ khi hover (kèm nhích lên 2px) |
| `--w-line` | `#E7E5E4` | Viền card **1px** · đường kẻ mảnh cạnh tiêu đề |
| `--w-mute` | `#78716C` | Chữ phụ / icon nghỉ trên nền trắng |
| `--w-dim` | `#A8A29E` | Chữ phụ trên nền đen · tab nav chưa chọn |
| `--head-bg` | gradient `#1A1A1A → #000` | Nền header mọi card |

> Figma tự mâu thuẫn: máng VI/EN là `#D9D9D9` ở frame Valuation nhưng `#ABABAB` ở AI/Work. **Chốt dùng `--chip`** — bớt một màu, và máng toggle bản chất cũng là vùng chứa chỉ-đọc.

---

## 3. Hình khối — lặp y hệt ở mọi tab

| Thành phần | Spec |
|---|---|
| **Card** | trắng · radius **8** · viền `0.5px --line2` · `--shadow` · **header đen cao 40** |
| **Header card** | nền `--ink` cao **40**, chữ Bold 15 amber |
| **Chip** (chỉ đọc) | nền `--chip` · radius **8** · cao **32** · chữ 12 · padding trái 8 |
| **Nhãn nhóm** | cao **32**, chữ Bold 12 đen, canh trái |
| **Nút vuông** | radius **8** · trắng · viền · bóng → *Admin* |
| **Nút tròn** | radius **24** · nền đen · chữ amber · bóng → *mọi nút hành động* |
| **Toggle** | máng `--chip` radius 8 cao 32 · viên đang chọn trắng + viền + bóng |
| **Icon** | ô **32×32**, cách nhau **16** |
| **Icon SVG** | nét **1.5**, 16px, amber khi đứng cạnh tiêu đề. Bộ dùng chung: `WTE_ICON` + `wteIcon()` trong JS |
| **Tiêu đề card** | canh **TRÁI**, icon amber đứng trước (2026-09-24, thay canh giữa của Figma) |
| **Tiêu đề mục (CV)** | icon amber + chữ 18 + đường kẻ mảnh kéo hết bề ngang |
| **Hàng bấm được** | hover: nền trắng + viền + vạch amber trái + ô ↗ đen |

**Luật phân biệt** (đừng phá): radius **24** = bấm được · radius **8** = chỉ đọc.

---

## 4. Lưới

Mọi khoảng cách là **bội số của 8**.

### Dọc — giống hệt nhau ở cả 4 tab

```
0    navbar (cao 48)
96   tiêu đề màn hình (cao 32)
144  nội dung bắt đầu
```

Trong card: header 40 → khe 8 → chip 32 → khe 8 → chip 32 …, đệm đáy 16.

### Ngang

Lề **48**, content **48 → 1376** (rộng **1328**). Cách chia đã dùng:

| Tab | Chia |
|---|---|
| Valuation | 3 cột × **432** + 2 khe 16 |
| AI | 2 cột × **656** + 1 khe 16 |
| Work | card **656** (nửa trái) |
| Bảng Valuation | 7 cột × 176, khe 16 (nhét trong padding ô) |

---

## 5. Từng tab

### CV (`55:2`)
Hero (avatar 81 · tên 18 Bold · nơi ở 15 xám · tagline · niềm tin · 3 nút tròn) → Experience dạng timeline `128 / 64 / 944`, chấm amber 8px tại `x=208`, item cách nhau 48 → Highlights 3 cột × 432 → Available for (chip).

### Valuation (`60:66`)
Bảng 7 cột + 3 card × 432. Xem `REBUILD_SPEC_V3_VALUATION.md`.

### AI (`70:33`)
4 card **656 × 368**, lưới 2×2, khe 16. Card ở `y=144` và `y=528`. Header đen 40, chữ amber Bold 15 **canh giữa**. Trong thân: chip 32, dòng đầu ở `y=192` (khe 8 sau header). Mỗi chip: tiêu đề bài **trái** (12 Regular đen) · ngày + `►` **phải**.

### Work (`71:121`)
Card **656 × 256**, header đen 40 **đè lên mép trên thân** (header `y=144`, thân `y=160`). Header 3 vùng: tên dự án **trái** (Bold 15 amber) · `high-potential / narrative` **giữa** (Bold 12 amber) · `rank: $` **phải** (Bold 15 amber).

Thân: nhãn nhóm 32 (Bold 12 đen) → chip 32 → nhãn → chip … Card cách nhau **32**.

---

## 6. Cách kiểm

Chrome headless, profile mới mỗi lần:

```
chrome --headless=new --disable-gpu --no-sandbox --hide-scrollbars \
  --user-data-dir=<thư mục MỚI> --screenshot=out.png \
  --window-size=1424,944 --virtual-time-budget=20000 <url>
```

Hay fail vu vơ → đổi `--window-size` vài px rồi chạy lại. `python -m http.server` không có SPA fallback nên `/valuation` trả 404; chụp thẳng trên production sau khi deploy thì chắc ăn hơn.
