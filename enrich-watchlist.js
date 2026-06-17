// Chạy: node enrich-watchlist.js
// Lấy x_handle cho mỗi project → lưu vào watchlist-data.json
// Dùng local wrangler (localhost:8788) để proxy qua SURF_API key

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const FILE = join(import.meta.dirname, 'watchlist-data.json');
const API  = 'http://localhost:8788/api/watchlist?action=detail&q=';

const projects = JSON.parse(readFileSync(FILE, 'utf8'));
const todo = projects.filter(p => !p.logo_url);
console.log(`Enriching ${todo.length} projects (${projects.length - todo.length} already done)...\n`);

let ok = 0, fail = 0;

for (const p of todo) {
  try {
    const res  = await fetch(API + encodeURIComponent(p.name));
    const body = await res.json();
    const ov   = body.data?.overview;

    if (ov?.x_handle) {
      p.x_handle = ov.x_handle;
      p.logo_url = ov.logo_url || '';
      ok++;
      console.log(`✓ [${p.id}] ${p.name} → @${ov.x_handle}`);
    } else {
      fail++;
      console.log(`✗ [${p.id}] ${p.name} → no x_handle`);
    }

    // ghi file sau mỗi project để không mất data nếu bị interrupt
    writeFileSync(FILE, JSON.stringify(projects, null, 2), 'utf8');
    await new Promise(r => setTimeout(r, 200)); // nhẹ tay với API
  } catch (e) {
    fail++;
    console.log(`✗ [${p.id}] ${p.name} → error: ${e.message}`);
  }
}

console.log(`\nDone: ${ok} enriched, ${fail} failed`);
