# Watchlist Research — Hướng dẫn cài đặt

Script `watchlist-research.js` gom dự án chưa TGE từ **Surf API** + **Telegram @crypto_fundraising**,
lọc **VC Tier-1** (`vc-tier1.json`) + **ChatGPT** chấm "degen farm được không", rồi **gửi ứng viên
tới 1 Apps Script (cổng ghi)** → tab **"Danh sách chờ"**. Bạn tự thẩm rồi copy dòng ngon sang tab
**"Watchlist"** (cái website 0xhieu.xyz đọc).

```
Surf (100 dự án) ┐
                 ├─► lọc VC Tier-1 ─► ChatGPT chấm ─► POST ─► Apps Script ─► tab "Danh sách chờ" ─► BẠN thẩm ─► "Watchlist" ─► web
Telegram scrape  ┘
```

> Không cần Google Cloud / service account (Google chặn tạo key). Không cần `npm install` (Node ≥18 có sẵn fetch).

---

## Bước A — Tạo tab trong Google Sheet

Trong Sheet (`1m8_nwbP...`), tạo **2 tab**, hàng 1 là tiêu đề:

**Tab `Watchlist`** (web đọc):
`Tên dự án | X | Narrative | Gọi vốn | Có việc`

**Tab `Danh sách chờ`** (script ghi vào):
`Tên dự án | X | Narrative | Gọi vốn | Note`

> Cột C (Narrative) để dropdown 13 loại. GPT điền đúng 1 trong 13, không chắc để trống.

---

## Bước B — Cài Apps Script "cổng ghi" (làm trong chính Sheet, ~6 click)

1. Mở Sheet → menu **Extensions → Apps Script**.
2. Xoá code mẫu, **dán toàn bộ** file `apps-script-webhook.gs` (trong repo) vào.
3. Sửa dòng `const SECRET = '...'` thành 1 chuỗi bí mật tự nghĩ, vd `hieu-wl-2026-xyz`.
4. Bấm **Deploy → New deployment** → biểu tượng ⚙ (bánh răng) chọn **Web app**:
   - **Execute as:** Me
   - **Who has access:** Anyone
   → **Deploy** → **Authorize access** (chọn tài khoản, bấm Allow) → **copy "Web app URL"**.
5. (Test) Mở URL đó trên trình duyệt → thấy chữ `watchlist webhook OK` là đúng.

> Mỗi lần sửa code Apps Script phải **Deploy lại**: Manage deployments → Edit (bút chì) → Version: New version → Deploy.

---

## Bước C — Điền `.env`

Thêm vào file `.env` (thư mục `cv`) — **2 dòng mới**:
```
WL_WEBHOOK_URL=<Web app URL vừa copy ở Bước B>
WL_WEBHOOK_SECRET=hieu-wl-2026-xyz     # PHẢI trùng SECRET trong Apps Script
```
(SURF_API và OPENAI đã có sẵn trong `.env`.)

> `.env` là secret — không push GitHub, tự sync tay giữa 2 máy như thường lệ.

---

## Bước D — Chạy thử ở máy local

```bash
node watchlist-research.js --dry     # chỉ IN ra, KHÔNG gửi Sheet (test pipeline)
node watchlist-research.js           # chạy thật, gửi vào tab "Danh sách chờ"
```

Test nhẹ đỡ tốn credit Surf:
```bash
MAX_DETAIL=10 TG_PAGES=2 node watchlist-research.js --dry
```
- `MAX_DETAIL` = số dự án Surf gọi `detail` mỗi lần (mặc định 60, mỗi call 1 credit).
- `TG_PAGES` = số trang Telegram scrape (mặc định 5).

---

## Bước E — Deploy lên VPS + chạy tự động

1. Đưa code lên VPS: `git pull` (repo cv, code đã có trên GitHub).
2. Copy thủ công file **`.env`** lên VPS (không có trên GitHub). *(Không cần service-account.json nữa.)*
3. Hẹn giờ 1 lần/ngày (3h sáng) — chọn 1:

**cron:**
```bash
crontab -e
0 3 * * * cd /path/to/cv && /usr/bin/node watchlist-research.js >> watchlist-research.log 2>&1
```

**pm2 (bạn đang dùng sẵn):**
```bash
pm2 start watchlist-research.js --name wl-research --no-autorestart --cron-restart "0 3 * * *"
pm2 save
```

---

## Tinh chỉnh về sau

- **Thêm/bớt VC**: sửa `vc-tier1.json` (đang 38 quỹ).
- **Đổi độ gắt GPT**: sửa đoạn `sys` trong `gptJudge()` (hiện "nhẹ tay, nghi ngờ thì giữ").
- Script **chỉ thêm dòng mới**: dedup theo tên với cả 2 tab (Node đọc gviz + Apps Script dedup lần cuối) → không đụng dòng bạn đã nhập/duyệt.
