# Luật thiết kế — 0xhieu.xyz

> Trạng thái chốt 2026-09-24. Mọi tab tuân đúng file này; code nằm ở khối `<style>` duy nhất trong `index.html`, viết theo thành phần, cùng thứ tự các mục dưới đây.
> Gốc là Figma `qPitw8s3XP5ennmBmhzYQF` (frame 1424 × 944), nhưng từ 2026-09-24 **file này thắng Figma**: bản sang + bản sáng đã đi khác Figma ở màu header/nút, tiêu đề card và khoảng cách dưới navbar.

---

## 1. Chữ

| | Desktop | Mobile (≤ 640px) |
|---|---|---|
| Font | **Roboto** (`--font`) | **Roboto Condensed** toàn site (`--font` trỏ sang `--font-c`) |
| Thang | **18 · 15 · 12** | **18 · 16 · 14** — tối thiểu 14 |
| Ngoại lệ | Bảng altcoin (Valuation) luôn dùng Condensed | Bảng altcoin được nhỏ hơn 14 (12) |

Phân cấp bằng **cỡ + đậm/thường + đen/xám**, không thêm cỡ mới.

| Cỡ desktop | Kiểu | Dùng cho |
|---|---|---|
| **18** Bold đen | Tiêu đề màn · tên người · tiêu đề mục CV · vai trò timeline. Tên người là thứ 18 duy nhất ở hero |
| **15** Bold | Tiêu đề card · nút · tab nav · năm timeline · tagline |
| **15** Regular xám | Thân bài · bullet · caption |
| **12** | Chip · nhãn nhóm · số trong bảng · dòng phụ header card |

Nhãn nhóm, tab nav, header bảng, dòng phụ header card: **VIẾT HOA + giãn chữ** `.04–.08em`.

## 2. Màu

| Token | Mã | Dùng cho |
|---|---|---|
| `--ink` | `#000000` | Chữ chính |
| `--text` | `#171717` | Chữ mặc định của body |
| `--sub2` | `#4B5563` | Chữ phụ (nơi ở, niềm tin, bullet, nhãn form) |
| `--w-mute` | `#78716C` | Chữ phụ / icon nghỉ · tab nav chưa chọn |
| `--w-dim` | `#A8A29E` | Chữ nhạt nhất (trạng thái trống) |
| `--w-line` | `#E7E5E4` | Viền card **1px** · kẻ mảnh cạnh tiêu đề · kẻ dưới header |
| `--chip` | `#F5F5F4` | Nền chip chỉ-đọc · máng toggle · hover dòng bảng |
| `--head-bg` | `#FAFAF9` | Nền header card + header bảng |
| `--amber` | `#FFA111` | Thương hiệu (mèo đen mắt amber): vạch tab đang chọn · chấm timeline · ô rank · nền nút chính |
| `--amber-ink` | `#B86B00` | Chữ/icon amber **trên nền sáng** (amber gốc quá nhạt trên trắng) |
| `--shadow` | `0 1px 2px rgba(0,0,0,.06), 0 8px 24px rgba(0,0,0,.08)` | Thẻ nổi + nút |
| `--lift` | `0 2px 4px rgba(0,0,0,.08), 0 16px 32px rgba(0,0,0,.12)` | Thẻ khi hover (kèm nhích lên 2px) |

**Không dùng nền đen** cho navbar, header, nút. Đen chỉ còn ở chữ và nút mèo (Agent).

## 3. Thành phần — lặp y hệt ở mọi tab

| Thành phần | Spec |
|---|---|
| **Navbar** | trắng mờ (blur) · kẻ dưới `--w-line` · cao 48 · logo = ảnh mèo 24 + chữ 18 · tab chữ hoa 15, đang chọn có vạch amber 24×2 ở đáy |
| **Card** | trắng · radius 8 · viền 1px `--w-line` · `--shadow` · hover `--lift` + nhích 2px |
| **Header card** | cao 40 · nền `--head-bg` · kẻ dưới · **icon amber + tiêu đề canh TRÁI** · Bold 15 đen |
| **Chip** (chỉ đọc) | nền `--chip` · radius 8 · cao 32 · chữ 12 |
| **Hàng bấm được** (task Work, bài AI) | như chip; hover: nền trắng + viền + vạch amber bên trái + ô mũi tên ↗ nền amber |
| **Nhãn nhóm** (Work) | cao 32 · icon amber + chữ hoa 12 xám + kẻ mảnh kéo hết ngang |
| **Tiêu đề mục** (CV) | icon amber + chữ 18 + kẻ mảnh kéo hết ngang |
| **Nút chính** | tròn radius 24 · nền amber · chữ đen · bóng |
| **Nút phụ** | tròn radius 24 · trắng · viền `--w-line` · bóng (Twitter/Telegram/Email, Huỷ, Xoá) |
| **Nút Admin** | vuông radius 8 · trắng · viền · bóng |
| **Toggle VI/EN** | máng `--chip` radius 8 cao 32 · viên đang chọn trắng + bóng nhẹ |
| **Icon** | SVG inline nét **1.5**, 16px, tô `currentColor` — bộ chung `WTE_ICON` + `wteIcon()` trong JS. Riêng camera/plus là CSS mask (32×32) |

**Luật phân biệt** (đừng phá): radius **24** = bấm được · radius **8** = chỉ đọc (trừ nút Admin/toggle).

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
| CV — timeline | 3 cột `128 / 64 / 944`, chấm amber 8px ở tâm rãnh, item cách 48 |

Màn ≤ 1024: 3 cột → 2, AI → 1 cột. Màn ≤ 640: mọi lưới → 1 cột.
