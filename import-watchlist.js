// Chạy: node import-watchlist.js
// Đọc các file surf-table*.csv từ Desktop → tạo watchlist-data.json

import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

const DESKTOP = join(homedir(), 'Desktop');
const OUT     = join(import.meta.dirname, 'watchlist-data.json');

function parseRaise(str) {
  if (!str) return 0;
  const s = str.replace(/[$,]/g, '');
  if (s.endsWith('B')) return parseFloat(s) * 1e9;
  if (s.endsWith('M')) return parseFloat(s) * 1e6;
  if (s.endsWith('K')) return parseFloat(s) * 1e3;
  return parseFloat(s) || 0;
}

function parseRoundDate(str) {
  // "Seed2026-04-30" → { round: "Seed", date: "2026-04-30" }
  const m = str.match(/^(.*?)(\d{4}-\d{2}-\d{2})$/);
  if (m) return { round: m[1].trim(), date: m[2] };
  return { round: str, date: '' };
}

function parseCSVLine(line) {
  const out = []; let cur = '', inQ = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (inQ) {
      if (c === '"' && line[i + 1] === '"') { cur += '"'; i++; }
      else if (c === '"') inQ = false;
      else cur += c;
    } else {
      if (c === '"') inQ = true;
      else if (c === ',') { out.push(cur.trim()); cur = ''; }
      else cur += c;
    }
  }
  out.push(cur.trim());
  return out;
}

// Đọc tất cả surf-table*.csv trên Desktop
const files = readdirSync(DESKTOP)
  .filter(f => f.startsWith('surf-table') && f.endsWith('.csv'))
  .sort()
  .map(f => join(DESKTOP, f));

console.log(`Found ${files.length} CSV files:`, files.map(f => f.split(/[/\\]/).pop()));

const projects = [];

for (const file of files) {
  const lines = readFileSync(file, 'utf8').split('\n').filter(l => l.trim());
  for (const line of lines) {
    if (line.startsWith('#,')) continue; // header
    const cols = parseCSVLine(line);
    if (cols.length < 6) continue;

    const [idStr, name, category, raiseStr, roundDate, ...backerParts] = cols;
    const id        = parseInt(idStr) || 0;
    const backers   = backerParts.join(',').split(',').map(b => b.trim()).filter(Boolean);
    const raise_num = parseRaise(raiseStr);
    const { round, date } = parseRoundDate(roundDate);

    if (!name || !id) continue;

    projects.push({ id, name, category, raise: raiseStr, raise_num, round, date, backers });
  }
}

// Sort by id
projects.sort((a, b) => a.id - b.id);

writeFileSync(OUT, JSON.stringify(projects, null, 2), 'utf8');
console.log(`✓ Wrote ${projects.length} projects to watchlist-data.json`);
