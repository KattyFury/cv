/**
 * Apps Script "cổng ghi" cho Watchlist research.
 * Nhận POST từ watchlist-research.js -> dedup -> ghi vào tab "Danh sách chờ".
 *
 * CÁCH CÀI (làm trong chính Google Sheet):
 *  1. Mở Sheet -> menu Extensions -> Apps Script.
 *  2. Xoá hết code mẫu, dán TOÀN BỘ file này vào.
 *  3. Sửa dòng SECRET bên dưới thành 1 chuỗi bí mật tự nghĩ (vd 'hieu-wl-2026-xyz').
 *     -> Chuỗi này phải TRÙNG với WL_WEBHOOK_SECRET trong .env.
 *  4. Bấm Deploy -> New deployment -> (bánh răng) chọn "Web app".
 *       - Execute as: Me
 *       - Who has access: Anyone
 *     -> Deploy -> Authorize access (cho phép) -> copy "Web app URL".
 *  5. Bỏ URL đó vào .env:  WL_WEBHOOK_URL=<url vừa copy>
 *
 * Mỗi lần sửa code phải Deploy lại (Manage deployments -> Edit -> New version).
 */

const SECRET  = 'ĐỔI_CHUỖI_BÍ_MẬT_NÀY';   // <-- SỬA, trùng WL_WEBHOOK_SECRET trong .env
const PENDING = 'Danh sách chờ';           // tab để ghi ứng viên
const LIVE    = 'Watchlist';               // tab web đọc (dùng để dedup)

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    if (body.secret !== SECRET) return json_({ ok: false, error: 'bad secret' });

    const ss   = SpreadsheetApp.getActive();
    const pend = ss.getSheetByName(PENDING);
    if (!pend) return json_({ ok: false, error: 'Không thấy tab "' + PENDING + '"' });

    const norm = s => String(s || '').toLowerCase().replace(/[^a-z0-9]/g, ' ').trim();

    // gom tên đã có ở cả 2 tab (cột A, bỏ header)
    const seen = {};
    [PENDING, LIVE].forEach(function (t) {
      const sh = ss.getSheetByName(t);
      if (!sh || sh.getLastRow() < 2) return;
      const vals = sh.getRange(2, 1, sh.getLastRow() - 1, 1).getValues();
      for (let i = 0; i < vals.length; i++) if (vals[i][0]) seen[norm(vals[i][0])] = 1;
    });

    const rows = body.rows || [];
    const toAppend = [];
    let skipped = 0;
    rows.forEach(function (r) {
      const name = r[0];
      if (!name) return;
      if (seen[norm(name)]) { skipped++; return; }
      seen[norm(name)] = 1;
      toAppend.push([r[0] || '', r[1] || '', r[2] || '', r[3] || '', r[4] || '']);
    });

    if (toAppend.length) {
      pend.getRange(pend.getLastRow() + 1, 1, toAppend.length, 5).setValues(toAppend);
    }
    return json_({ ok: true, added: toAppend.length, skipped: skipped });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  }
}

// GET để test nhanh bằng trình duyệt (mở URL thấy "watchlist webhook OK")
function doGet() {
  return ContentService.createTextOutput('watchlist webhook OK');
}

function json_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}
