# Luật thiết kế — 0xhieu.xyz

> Trạng thái chốt 2026-09-26. Mọi tab tuân đúng file này; code nằm ở khối `<style>` duy nhất trong `index.html`, viết theo thành phần, cùng thứ tự các mục dưới đây.
> Gốc là Figma `qPitw8s3XP5ennmBmhzYQF` (frame 1424 × 944), nhưng từ 2026-09-24 **file này thắng Figma**: bản sang + bản sáng đã đi khác Figma ở màu header/nút, tiêu đề card và khoảng cách dưới navbar.

---

## 1. Chữ

| | Desktop | Mobile (≤ 640px) |
|---|---|---|
| Font | **Font hệ thống** (`--font`, không tải webfont ngoài) | Stack hẹp hơn (`--font-c`) toàn site |
| Thang | **18 · 15 · 12** | **18 · 16 · 14** — tối thiểu 14 |
| Ngoại lệ | Bảng altcoin (Valuation) luôn dùng `--font-c` | Bảng altcoin được nhỏ hơn 14 (12) |

`--font` = `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif` (chốt 2026-09-26, bỏ Google Fonts Roboto để trang không phụ thuộc webfont ngoài). `--font-c` là stack có thêm `Arial Narrow`/`Segoe UI Semibold` cho chỗ cần chữ hẹp, không còn là 1 font Condensed thật.

Phân cấp bằng **cỡ + đậm/thường + đen/xám**, không thêm cỡ mới.

| Cỡ desktop | Kiểu | Dùng cho |
|---|---|---|
| **18** Bold đen | Tiêu đề màn · tên người · tiêu đề mục CV · vai trò timeline. Tên người là thứ 18 duy nhất ở hero |
| **15** Bold | Tiêu đề card · nút · tab nav · năm timeline · tagline |
| **15** Regular xám | Thân bài · bullet · caption |
| **12** | Chip · nhãn nhóm · số trong bảng · dòng phụ header card |

Nhãn nhóm, tab nav, header bảng, dòng phụ header card: **VIẾT HOA + giãn chữ** `.04–.08em`.

## 2. Màu

**Đen là màu chủ đạo nhưng dùng tiết chế** — chữ, icon, nút chính, vạch tab đang chọn. **Trắng** làm nền. **Xám trung tính** (không ngả vàng) cho chữ phụ và nhấn nhá. **Màu sắc duy nhất trên trang là màu rank** ở tab Work (chốt 2026-09-25 — user: "trắng xám và cam vốn không cùng nhau").

| Token | Mã | Dùng cho |
|---|---|---|
| `--ink` | `#111111` | Đen chủ đạo: chữ chính · icon · nút chính · vạch tab · chấm timeline |
| `--text` | `#171717` | Chữ mặc định của body |
| `--sub2` | `#525252` | Chữ phụ (nơi ở, niềm tin, bullet, nhãn form) |
| `--w-mute` | `#737373` | Chữ phụ / icon nghỉ · tab nav chưa chọn · hover |
| `--w-dim` | `#A3A3A3` | Chữ nhạt nhất (trạng thái trống, dấu bullet) |
| `--w-line` | `#E5E5E5` | Viền card 1px · kẻ mảnh · viền avatar |
| `--chip` | `#F5F5F5` | Nền chip chỉ-đọc · máng toggle · hover dòng bảng |
| `--head-bg` | `#EFEFEF` | Nền header card + header bảng + dải Daily (đậm hơn `#FAFAFA` cũ — user thấy mờ, khó phân biệt với nền trắng) |
| `--shadow` / `--lift` | bóng mềm 2 lớp | Thẻ nổi / thẻ khi hover |

**Màu rank** (chỉ ở ô rank trên card Work + nút đang chọn của thanh lọc):

| Rank | Token | Mã | Chữ trên nền |
|---|---|---|---|
| `$` | `--amber` | `#FFA111` cam | đen |
| `S` | `--rank-s` | `#6155F5` tím | trắng |
| `A` | `--rank-a` | `#0088FF` xanh dương | trắng |
| `B` | `--rank-b` | `#34C759` xanh lá | trắng |
| `C` | `--rank-c` | `#A3A3A3` xám | trắng |

## 3. Thành phần — lặp y hệt ở mọi tab

| Thành phần | Spec |
|---|---|
| **Navbar** | trắng mờ (blur) · kẻ dưới · cao 48 · logo = ảnh mèo 24 + chữ 18 · tab chữ hoa 15, cách nhau 16, đang chọn chữ đen + vạch đen 24×2 ở đáy |
| **Card / box** | trắng · **radius 16** · viền 1px `--w-line` · `--shadow` · hover `--lift` + nhích 2px. Áp cho: card Work · box Valuation · hub AI · bảng altcoin · ảnh Highlights · popup |
| **Header card** | cao 40 · nền `--head-bg` · kẻ dưới · icon đen + tiêu đề canh TRÁI · Bold 15 đen |
| **Chip** (chỉ đọc) | nền `--chip` · **radius 8** (lồng trong box 16) · cao 32 · chữ 12 |
| **Hàng bấm được** (task Work, bài AI) | như chip; hover: nền trắng + viền + vạch đen bên trái + ô mũi tên ↗ nền đen |
| **Nhãn nhóm** (Work) | cao 32 · icon đen + chữ hoa 12 xám + kẻ mảnh kéo hết ngang. **Daily** = dải nền `--head-bg` tràn 2 mép card, lề trong vẫn 16 như các nhóm khác |
| **Tiêu đề mục** (CV) | icon đen + chữ 18 + kẻ mảnh kéo hết ngang |
| **Nút chính** | tròn radius 24 · nền đen · chữ trắng · bóng |
| **Nút phụ** | tròn radius 24 · trắng · viền `--w-line`, hover viền đen (Twitter/Telegram/Email, Huỷ, Xoá) |
| **Nút Admin** | vuông radius 8 · trắng · viền · bóng |
| **Toggle VI/EN** | máng `--chip` radius 8 cao 32 · viên đang chọn trắng + bóng nhẹ |
| **Icon** | SVG inline nét **1.5**, 16px, tô `currentColor` — bộ chung `WTE_ICON` + `wteIcon()` trong JS. Riêng camera/plus là CSS mask (32×32) |

**Luật phân biệt** (đừng phá): radius **24** = bấm được · radius **16** = box · radius **8** = chip chỉ-đọc (trừ nút Admin/toggle).

## 4. Lưới

Mọi khoảng cách là **bội số của 8**.

- **Dọc:** navbar 48 → khe **24** (mobile 16) → hàng tiêu đề màn cao 32 → khe 16 → nội dung.
- **Ngang:** lề 48 (mobile 16), content rộng tối đa **1328**.
- **Trong card:** header 40 → khe 8 → nhãn/chip 32 → khe 8 → … → đệm đáy 16 (mobile 8). Đệm ngang 16 (mobile 8).

| Chỗ | Chia |
|---|---|
| Valuation — 3 box | 3 cột × 432 + khe 16, box cao 176 |
| Valuation — bảng | 7 cột × 176, khe 16 nhét trong padding ô (184 · 192×5 · 184) |
| AI | 2 × 2 card 656 × 368, khe 16 |
| Work | card cùng rank 2 cột × 656, khe 16; khác rank cách 48 (mobile 32) |
| CV — Highlights | 3 cột × 432, ảnh 3:2 |
| CV — timeline | 3 cột `128 / 64 / 944`, chấm đen 8px ở tâm rãnh, item cách 48 |

Màn ≤ 1024: 3 cột → 2, AI → 1 cột, header card Work xuống 2 hàng (tên/rank hàng 1 · headline hàng 2 — tránh đè chữ khi card 2 cột co hẹp lại). Màn ≤ 640: mọi lưới → 1 cột.
