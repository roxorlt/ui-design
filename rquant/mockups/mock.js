// 改后示意的共用脚本：导航、示例数据、迷你图表。所有数值都是示例。
const NAV = [["概览",[["overview","总览"]]],["宏观",[["macro","宏观"]]],["数据",[["data","数据中心"],["query","数据查询"]]],["研究",[["screener","选股器"],["pools","池子"],["factor","因子研究"],["reportmining","研报挖掘"]]],["策略与验证",[["strategies","策略"],["backtest","回测"],["experiments","实验记录"]]],["跟踪与告警",[["paper","模拟盘"],["monitor","盯盘与告警"],["panorama","市场全景"],["sectorflow","板块资金流"]]],["运维",[["tasks","任务与调度"],["health","系统健康"],["ops","操作记录"]]]];
const ICON = {
  overview:'<path d="M3 10.5 12 4l9 6.5V20h-6v-6H9v6H3z"/>',
  monitor:'<path d="M6 16V11a6 6 0 1 1 12 0v5l1.5 2h-15zM10 20h4"/>',
  panorama:'<path d="M4 4h7v9H4zM13 4h7v5h-7zM13 11h7v9h-7zM4 15h7v5H4z"/>',
  health:'<path d="M3 12h4l2-5 4 10 2-5h6"/>',
  more:'<path d="M4 7h16M4 12h16M4 17h16"/>',
  search:'<circle cx="11" cy="11" r="6.5"/><path d="m16 16 4 4"/>'
};
const svgI = (k) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICON[k]}</svg>`;
function shell(page) {
  const rail = document.querySelector(".rail");
  if (rail) rail.innerHTML = NAV.map(([g, items]) => `<h6>${g}</h6>` + items.map(([id, t]) => `<a href="#" ${id === page ? 'aria-current="page"' : ""}>${t}</a>`).join("")).join("");
  const tb = document.querySelector(".tabbar");
  if (tb) tb.innerHTML = [["overview","总览"],["monitor","告警"],["panorama","全景"],["health","健康"],["more","更多"]].map(([id,t]) => `<a href="#" ${id === page ? 'aria-current="page"' : ""}>${svgI(id)}<span>${t}</span></a>`).join("");
  document.querySelectorAll("[data-icon]").forEach(el => el.innerHTML = svgI(el.dataset.icon));
}
function prng(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
function series(n, start, vol, seed, lo, hi) { const r = prng(seed); let v = start; const out = []; for (let i = 0; i < n; i++) { v += (r() - 0.5) * vol; v = Math.max(lo, Math.min(hi, v)); out.push(v); } return out; }
function linePath(vals, w, h, lo, hi) { return vals.map((v, i) => `${i ? "L" : "M"}${(i / (vals.length - 1) * w).toFixed(1)},${(h - (v - lo) / (hi - lo) * h).toFixed(1)}`).join(""); }
function spark(vals, up) { const lo = Math.min(...vals), hi = Math.max(...vals); return `<svg class="spark ${up ? "up" : "down"}" viewBox="0 0 64 20" preserveAspectRatio="none" aria-hidden="true"><path class="base" d="M0,${(20 - (vals[0] - lo) / (hi - lo || 1) * 20).toFixed(1)}H64"/><path class="line" d="${linePath(vals, 64, 20, lo, hi)}"/></svg>`; }
// 方块图（squarified treemap）
function squarify(items, x, y, w, h) {
  const total = items.reduce((a, b) => a + b.v, 0); const out = []; let rest = items.slice(); let X = x, Y = y, W = w, H = h;
  const worst = (row, side, scale) => { const s = row.reduce((a, b) => a + b.v, 0) * scale; const mx = Math.max(...row.map(r => r.v)) * scale, mn = Math.min(...row.map(r => r.v)) * scale; return Math.max(side * side * mx / (s * s), (s * s) / (side * side * mn)); };
  const scale = (w * h) / total;
  while (rest.length) {
    const side = Math.min(W, H); let row = [rest[0]]; let i = 1;
    while (i < rest.length && worst(row.concat(rest[i]), side, scale) <= worst(row, side, scale)) { row.push(rest[i]); i++; }
    const s = row.reduce((a, b) => a + b.v, 0) * scale; const thick = s / side; let off = 0;
    row.forEach(r => { const len = r.v * scale / thick; if (W >= H) out.push({ ...r, x: X, y: Y + off, w: thick, h: len }); else out.push({ ...r, x: X + off, y: Y, w: len, h: thick }); off += len; });
    if (W >= H) { X += thick; W -= thick; } else { Y += thick; H -= thick; }
    rest = rest.slice(i);
  }
  return out;
}
const pct = (p) => `${p > 0 ? "+" : p < 0 ? "−" : ""}${Math.abs(p).toFixed(2)}%`;
function heatColor(p) { // p = 涨跌中位数 %，±3% 封顶
  const t = Math.max(-1, Math.min(1, p / 3)); const a = 0.15 + Math.abs(t) * 0.6; // 最深 75%，保证主文字色在色块上 ≥ 4.5:1
  return t >= 0 ? `color-mix(in srgb, var(--c-up) ${Math.round(a * 100)}%, var(--c-surface))` : `color-mix(in srgb, var(--c-down) ${Math.round(a * 100)}%, var(--c-surface))`;
}
function drawTreemap(el, items) {
  const r = el.getBoundingClientRect(); const cells = squarify(items.slice().sort((a, b) => b.v - a.v), 0, 0, r.width, r.height);
  el.innerHTML = cells.map(c => { const big = c.w > 64 && c.h > 34; return `<div class="tm-c" style="left:${c.x}px;top:${c.y}px;width:${c.w}px;height:${c.h}px;background:${heatColor(c.p)}" title="${c.n} ${pct(c.p)}">${big ? `<b>${c.n}</b><span class="num">${pct(c.p)}</span>` : ""}</div>`; }).join("");
}
