// 改后示意的共用脚本：导航、示例数据、迷你图表。所有数值都是示例。
const NAV = [["概览",[["overview","总览"]]],["宏观",[["macro","宏观"]]],["数据",[["data","数据中心"],["query","数据查询"]]],["研究",[["screener","选股器"],["pools","池子"],["factor","因子研究"],["reportmining","研报挖掘"]]],["策略与验证",[["strategies","策略"],["backtest","回测"],["experiments","实验记录"]]],["跟踪与告警",[["paper","模拟盘"],["monitor","盯盘与告警"],["panorama","市场全景"],["sectorflow","板块资金流"]]],["运维",[["tasks","任务与调度"],["health","系统健康"],["ops","操作记录"]]]];
// 图标与产品现有导航图标一致：24 视框、1.7 描边、圆角端点
const ICON = {
  overview: '<path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
  macro: '<path d="M3 20h18M5 16l4-5 4 3 6-8M15 6h4v4"/>',
  data: '<path d="M4 6c0-1.7 3.6-3 8-3s8 1.3 8 3v12c0 1.7-3.6 3-8 3s-8-1.3-8-3zM4 6c0 1.7 3.6 3 8 3s8-1.3 8-3M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3"/>',
  query: '<path d="M4 6c0-1.7 3.6-3 8-3s8 1.3 8 3-3.6 3-8 3-8-1.3-8-3zM4 6v12c0 1.7 3.6 3 8 3M20 6v5M15 17.5a2.5 2.5 0 1 0 5 0 2.5 2.5 0 1 0-5 0M19.5 19.5L22 22"/>',
  screener: '<path d="M3.5 4.5h17l-6.5 8v6l-4 2v-8z"/>',
  pools: '<rect x="2.5" y="9" width="6" height="6" rx="1.2"/><rect x="15.5" y="3" width="6" height="6" rx="1.2"/><rect x="15.5" y="15" width="6" height="6" rx="1.2"/><path d="M8.5 12h3.5M12 6v12M12 6h3.5M12 18h3.5"/>',
  factor: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
  reportmining: '<path d="M6 2h9l5 5v15H6zM14 2v6h6M9 17v-3M12 17v-6M15 17v-4"/>',
  strategies: '<path d="M12 3l9 5-9 5-9-5zM3 13l9 5 9-5M3 17.5l9 5 9-5"/>',
  backtest: '<path d="M3.5 3.5v17h17"/><path d="M7 15l4-4.5 3 3 5.5-6.5"/>',
  experiments: '<path d="M9 3h6M10 3v6l-5.5 9.5A1.5 1.5 0 0 0 5.8 21h12.4a1.5 1.5 0 0 0 1.3-2.5L14 9V3M7.5 15h9"/>',
  paper: '<rect x="3" y="6" width="18" height="14" rx="2"/><path d="M3 10.5h18M16 15.5h2"/><path d="M6 6l9-3 1.5 3"/>',
  monitor: '<path d="M6 9a6 6 0 1 1 12 0c0 6.5 2.5 8 2.5 8h-17S6 15.5 6 9z"/><path d="M10 20.5a2 2 0 0 0 4 0"/>',
  panorama: '<rect x="3" y="3" width="10" height="10" rx="1"/><rect x="15" y="3" width="6" height="6" rx="1"/><rect x="15" y="11" width="6" height="10" rx="1"/><rect x="3" y="15" width="10" height="6" rx="1"/>',
  sectorflow: '<path d="M3 17l5-6 4 3 4-7 5 5M3 21h18"/>',
  tasks: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
  health: '<path d="M3 12h4l2.5-6.5 5 13 2.5-6.5h4"/>',
  ops: '<path d="M9 4h6M9 4a1 1 0 0 0-1 1v1h8V5a1 1 0 0 0-1-1M8 6H6v14h12V6h-2M9 11h6M9 15h4"/>',
  more: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  search: '<circle cx="11" cy="11" r="6.5"/><path d="m16 16 4 4"/>'
};
const svgI = (k) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICON[k] || ""}</svg>`;
// 手机底部标签栏：全景 / 资金流 / 池子 / 更多
const TABS = [["panorama", "全景"], ["sectorflow", "资金流"], ["pools", "池子"]];
const HLABEL = { ok: "正常", warn: "注意", crit: "异常" };
// 示例状态，可用 ?unread=0|3|120 &health=ok|warn|crit &more=1 预览
const Q = new URLSearchParams(location.search);
const DEMO = { unread: Q.has("unread") ? +Q.get("unread") : 3, health: HLABEL[Q.get("health")] ? Q.get("health") : "ok" };
const pageTitle = (id) => { for (const [, items] of NAV) for (const [k, t] of items) if (k === id) return t; return ""; };
const unreadText = (n) => (n > 99 ? "99+" : String(n));
function bellHTML(n) { return `<button type="button" class="icon-btn bell only-phone" aria-label="告警，${n ? unreadText(n) + " 条未读" : "没有未读"}">${svgI("monitor")}${n ? `<span class="badge" aria-hidden="true">${unreadText(n)}</span>` : ""}</button>`; }
function hstatHTML(s) { return `<button type="button" class="hstat ${s} only-phone" aria-label="系统健康：${HLABEL[s]}"><i aria-hidden="true"></i></button>`; }
// 「更多」弹层：只列不在底栏里的页面；总览置顶；告警行带未读数，健康行带状态文字
function moreSheetHTML(page) {
  const inBar = new Set(TABS.map((t) => t[0]));
  const extra = (id) => id === "monitor" && DEMO.unread ? `<span class="cnt" aria-label="${unreadText(DEMO.unread)} 条未读">${unreadText(DEMO.unread)}</span>` : id === "health" ? `<span class="st ${DEMO.health}">${HLABEL[DEMO.health]}</span>` : "";
  const row = (id, t, cls) => `<a href="#" class="${cls || ""}" ${id === page ? 'aria-current="page"' : ""}>${svgI(id)}<span>${t}${cls === "pin" ? "<small>今日链路和需要关注</small>" : ""}</span>${extra(id)}</a>`;
  let h = `<div class="items">${row("overview", "总览", "pin")}</div>`;
  for (const [g, items] of NAV) { const rest = items.filter(([id]) => id !== "overview" && !inBar.has(id)); if (rest.length) h += `<h6>${g}</h6><div class="items">${rest.map(([id, t]) => row(id, t)).join("")}</div>`; }
  return `<div class="scrim more-scrim" data-close></div><aside class="drawer more-sheet" role="dialog" aria-modal="true" aria-label="全部页面" id="more-sheet"><div class="drawer-h"><h2>全部页面</h2><button type="button" class="x" aria-label="关闭" data-close>×</button></div><div class="drawer-b">${h}</div></aside>`;
}
function shell(page) {
  const rail = document.querySelector(".rail");
  if (rail) rail.innerHTML = NAV.map(([g, items]) => `<h6>${g}</h6>` + items.map(([id, t]) => `<a href="#" ${id === page ? 'aria-current="page"' : ""}>${t}</a>`).join("")).join("");
  const tb = document.querySelector(".tabbar");
  const inBar = TABS.some(([id]) => id === page);
  if (tb) tb.innerHTML = TABS.map(([id, t]) => `<a href="#" ${id === page ? 'aria-current="page"' : ""}>${svgI(id)}<span>${t}</span></a>`).join("")
    + `<button type="button" class="more${!inBar && page ? " on" : ""}" aria-haspopup="dialog" aria-controls="more-sheet" aria-expanded="false" aria-label="更多页面${!inBar && page ? "，当前：" + pageTitle(page) : ""}">${svgI("more")}<span aria-hidden="true">更多</span></button>`;
  const search = document.querySelector('.top [data-icon="search"]');
  if (search && !document.querySelector(".top .bell")) search.insertAdjacentHTML("beforebegin", hstatHTML(DEMO.health) + bellHTML(DEMO.unread));
  document.querySelectorAll("[data-icon]").forEach((el) => (el.innerHTML = svgI(el.dataset.icon)));
  const btn = tb && tb.querySelector(".more"); let box = null;
  const close = () => { if (!box) return; box.remove(); box = null; btn.setAttribute("aria-expanded", "false"); btn.focus(); };
  const open = () => { if (box) return close(); box = document.createElement("div"); box.innerHTML = moreSheetHTML(page); document.body.appendChild(box); btn.setAttribute("aria-expanded", "true");
    box.querySelectorAll("[data-close]").forEach((el) => el.addEventListener("click", close)); box.querySelector(".x").focus(); };
  if (btn) btn.addEventListener("click", open);
  addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });
  if (Q.get("more") === "1" && btn) open();
  document.querySelectorAll('a[href="#"]').forEach((a) => a.addEventListener("click", (e) => e.preventDefault()));
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
