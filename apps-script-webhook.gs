/**
 * Apps Script "cổng ghi" cho Watchlist research.
 * Nhận POST từ watchlist-research.js -> dedup -> ghi vào tab "Danh sách chờ".
 *
 * ⚠ QUAN TRỌNG: Sheet này ĐÃ có code Apps Script lấy giá (ATH/current price).
 *   ĐỪNG xoá/đè code đó. Hãy THÊM FILE MỚI:
 *
 * CÁCH CÀI:
 *  1. Mở Sheet -> Extensions -> Apps Script.
 *  2. Bên trái, cạnh "Files" bấm dấu "+" -> "Script" -> đặt tên "watchlist-webhook".
 *  3. Dán TOÀN BỘ file này vào file mới đó (KHÔNG đụng file code giá cũ).
 *  4. Sửa dòng WL_SECRET bên dưới thành 1 chuỗi bí mật tự nghĩ (vd 'hieu-wl-2026-xyz').
 *     -> Phải TRÙNG với WL_WEBHOOK_SECRET trong .env.
 *  5. Bấm Deploy -> New deployment -> (bánh răng) chọn "Web app":
 *       - Execute as: Me
 *       - Who has access: Anyone
 *     -> Deploy -> Authorize access -> copy "Web app URL".
 *  6. Bỏ URL đó vào .env:  WL_WEBHOOK_URL=<url vừa copy>
 *
 * Mỗi lần sửa code phải Deploy lại (Manage deployments -> Edit -> New version).
 *
 * (Tên biến/hàm đặt tiền tố WL_ / wl... để KHÔNG trùng với code lấy giá sẵn có.)
 */

const WL_SECRET  = 'ĐỔI_CHUỖI_BÍ_MẬT_NÀY';   // <-- SỬA, trùng WL_WEBHOOK_SECRET trong .env
const WL_PENDING = 'Danh sách chờ';           // tab để ghi ứng viên
const WL_LIVE    = 'Watchlist';               // tab web đọc (dùng để dedup)

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    if (body.secret !== WL_SECRET) return wlJson_({ ok: false, error: 'bad secret' });

    const ss   = SpreadsheetApp.getActive();
    const pend = ss.getSheetByName(WL_PENDING);
    if (!pend) return wlJson_({ ok: false, error: 'Không thấy tab "' + WL_PENDING + '"' });

    const nm = s => String(s || '').toLowerCase().replace(/[^a-z0-9]/g, ' ').trim();

    // gom tên đã có ở cả 2 tab (cột A, bỏ header)
    const seen = {};
    [WL_PENDING, WL_LIVE].forEach(function (t) {
      const sh = ss.getSheetByName(t);
      if (!sh || sh.getLastRow() < 2) return;
      const vals = sh.getRange(2, 1, sh.getLastRow() - 1, 1).getValues();
      for (let i = 0; i < vals.length; i++) if (vals[i][0]) seen[nm(vals[i][0])] = 1;
    });

    const rows = body.rows || [];
    const toAppend = [];
    let skipped = 0;
    rows.forEach(function (r) {
      const name = r[0];
      if (!name) return;
      if (seen[nm(name)]) { skipped++; return; }
      seen[nm(name)] = 1;
      toAppend.push([r[0] || '', r[1] || '', r[2] || '', r[3] || '', r[4] || '']);
    });

    if (toAppend.length) {
      pend.getRange(pend.getLastRow() + 1, 1, toAppend.length, 5).setValues(toAppend);
    }
    return wlJson_({ ok: true, added: toAppend.length, skipped: skipped });
  } catch (err) {
    return wlJson_({ ok: false, error: String(err) });
  }
}

// GET để test nhanh bằng trình duyệt (mở URL thấy "watchlist webhook OK")
function doGet() {
  return ContentService.createTextOutput('watchlist webhook OK');
}

function wlJson_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}
