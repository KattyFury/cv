# Watchlist Research — Hướng dẫn cài đặt

Script `watchlist-research.js` gom dự án chưa TGE từ **Surf API** + **Telegram @crypto_fundraising**,
lọc **VC Tier-1** (`vc-tier1.json`) + **ChatGPT** chấm "degen farm được không", rồi ghi ứng viên
vào tab **"Danh sách chờ"** của Google Sheet. Bạn tự thẩm rồi copy dòng ngon sang tab **"Watchlist"**
(cái website 0xhieu.xyz đọc).

```
Surf (100 dự án) ┐
                 ├─► lọc VC Tier-1 ─► ChatGPT chấm ─► tab "Danh sách chờ" ─► BẠN thẩm ─► tab "Watchlist" ─► web
Telegram scrape  ┘
```

---

## Bước A — Tạo tab trong Google Sheet

Trong Sheet (`1m8_nwbP...`), tạo **2 tab** với hàng 1 là tiêu đề:

**Tab `Watchlist`** (web đọc — nếu chưa có):
`Tên dự án | X | Narrative | Gọi vốn | Có việc`

**Tab `Danh sách chờ`** (script ghi vào):
`Tên dự án | X | Narrative | Gọi vốn | Note`

> Cột C (Narrative) cứ để dropdown 13 loại của bạn. GPT sẽ điền đúng 1 trong 13, không chắc để trống.

---

## Bước B — Tạo Service Account (robot Google, để Node ghi được Sheet)

1. Vào https://console.cloud.google.com → tạo **project mới** (hoặc chọn project có sẵn).
2. **Enable Google Sheets API**: menu → *APIs & Services → Library* → gõ "Google Sheets API" → **Enable**.
3. *APIs & Services → Credentials → Create Credentials → **Service account*** → đặt tên bất kỳ → Create → Done.
4. Bấm vào service account vừa tạo → tab **Keys → Add Key → Create new key → JSON** → tải file về.
5. Đổi tên file thành **`service-account.json`**, để trong thư mục `cv` (cạnh `watchlist-research.js`).
6. Mở file JSON, copy giá trị **`client_email`** (dạng `xxx@yyy.iam.gserviceaccount.com`).
7. Mở Google Sheet → **Share** → dán email đó → chọn quyền **Editor** → Send (bỏ tick notify).

> File `service-account.json` là secret — đã có trong `.gitignore`, KHÔNG bao giờ push lên GitHub.
> Đồng bộ thủ công giữa 2 máy như file `.env`.

---

## Bước C — Chạy thử ở máy local

`.env` phải có sẵn `SURF_API` và `OPENAI` (đã có).

```bash
npm install                              # cài google-spreadsheet, google-auth-library
node watchlist-research.js --dry         # chỉ IN ra, không ghi Sheet (test)
node watchlist-research.js               # chạy thật, ghi vào tab "Danh sách chờ"
```

Chỉnh giới hạn để test nhẹ (đỡ tốn credit Surf):
```bash
MAX_DETAIL=10 TG_PAGES=2 node watchlist-research.js --dry
```

- `MAX_DETAIL` = số dự án Surf gọi `detail` mỗi lần (mặc định 60). Mỗi call = 1 credit.
- `TG_PAGES` = số trang Telegram scrape (mặc định 5).

---

## Bước D — Deploy lên VPS + chạy tự động

1. Đưa code lên VPS: `git pull` (repo cv) — code đã có trên GitHub.
2. Copy thủ công 2 file secret lên VPS (không có trên GitHub): **`.env`** + **`service-account.json`**.
3. `npm install` trên VPS.
4. Hẹn giờ chạy 1 lần/ngày (3h sáng) — chọn 1 trong 2 cách:

**Cách 1 — cron:**
```bash
crontab -e
# thêm dòng (sửa /path/to/cv cho đúng):
0 3 * * * cd /path/to/cv && /usr/bin/node watchlist-research.js >> watchlist-research.log 2>&1
```

**Cách 2 — pm2 (bạn đang dùng pm2 sẵn):**
```bash
pm2 start watchlist-research.js --name wl-research --no-autorestart --cron-restart "0 3 * * *"
pm2 save
```

---

## Tinh chỉnh về sau

- **Thêm/bớt VC**: sửa `vc-tier1.json` (đang có 38 quỹ).
- **Đổi độ gắt GPT**: sửa đoạn `sys` trong hàm `gptJudge()` (hiện để "nhẹ tay, nghi ngờ thì giữ").
- **Note format**: `Nguồn · VC · lý do GPT` (SURF / Telegram).
- Script **chỉ thêm dòng mới**, dedup theo tên với cả 2 tab — không đụng dòng bạn đã nhập/duyệt.
