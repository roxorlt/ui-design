// 页面模板公用脚本：外框导航、K 线示例、标注层。所有数据都是示例。
// 导航与产品一致，不在这里新增页面。手机底栏：全景 / 资金流 / 池子 / 更多。
const NAV = [["概览", [["overview", "总览"]]], ["宏观", [["macro", "宏观"]]], ["数据", [["data", "数据中心"], ["query", "数据查询"]]], ["研究", [["screener", "选股器"], ["pools", "池子"], ["factor", "因子研究"], ["reportmining", "研报挖掘"]]], ["策略与验证", [["strategies", "策略"], ["backtest", "回测"], ["experiments", "实验记录"]]], ["跟踪与告警", [["paper", "模拟盘"], ["monitor", "盯盘与告警"], ["panorama", "市场全景"], ["sectorflow", "板块资金流"]]], ["运维", [["tasks", "任务与调度"], ["health", "系统健康"], ["ops", "操作记录"]]]];
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
const sign = (p) => (p > 0 ? "+" : p < 0 ? "−" : "") + Math.abs(p).toFixed(2) + "%";
const dir = (p) => (p > 0 ? "up" : p < 0 ? "down" : "flat");
function prng(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const NAMES = ["澜屿科技", "样例电子", "演示医药", "模拟能源", "示范银行", "样本材料", "远岫汽车", "范例软件", "示例食品", "样例化工", "演示传媒", "模拟机械", "示范地产", "样本通信", "澈阳光伏", "范例证券", "示例家电", "样例物流", "演示农业", "模拟军工", "示范环保", "样本建材", "砚安保险", "范例旅游"];
function stocks(n, seed) { const r = prng(seed); return Array.from({ length: n }, (_, i) => { const pre = +(4 + r() * 60).toFixed(2); const p = +((r() - 0.45) * 8).toFixed(2); return { n: NAMES[i % NAMES.length] + (i >= NAMES.length ? " " + String.fromCharCode(65 + Math.floor(i / NAMES.length)) : ""), c: String(999001 + i), px: +(pre * (1 + p / 100)).toFixed(2), p, amt: +(1 + r() * 30).toFixed(2), turn: +(r() * 6).toFixed(2), vals: Array.from({ length: 24 }, () => r()) }; }).sort((a, b) => b.p - a.p); }
function spark(v, up) { const lo = Math.min(...v), hi = Math.max(...v); const d = v.map((x, i) => `${i ? "L" : "M"}${(i / (v.length - 1) * 64).toFixed(1)},${(20 - (x - lo) / (hi - lo || 1) * 20).toFixed(1)}`).join(""); return `<svg class="spark ${up ? "up" : "down"}" viewBox="0 0 64 20" preserveAspectRatio="none" aria-hidden="true"><path class="base" d="M0,${(20 - (v[0] - lo) / (hi - lo || 1) * 20).toFixed(1)}H64"/><path class="line" d="${d}"/></svg>`; }
function drawK(el, n) {
  const W = el.clientWidth, H = el.clientHeight; if (!W || !H) return; const r = prng(5); let c = 24; const bars = [];
  for (let i = 0; i < n; i++) { const o = c; c = Math.max(18, Math.min(30, c + (r() - 0.48) * 0.8)); const hi = Math.max(o, c) + r() * 0.4, lo = Math.min(o, c) - r() * 0.4; bars.push([o, hi, lo, c, 20 + r() * 60]); }
  const lo = Math.min(...bars.map((b) => b[2])) - 0.3, hi = Math.max(...bars.map((b) => b[1])) + 0.3; const pw = W - 44, ph = H * 0.78, vh = H * 0.16, bw = pw / n; const y = (v) => 6 + (hi - v) / (hi - lo) * (ph - 6);
  let s = ""; for (let t = 0; t <= 4; t++) { const v = lo + (hi - lo) * t / 4; s += `<line x1="0" x2="${pw}" y1="${y(v)}" y2="${y(v)}" stroke="var(--c-rule)"/><text x="${pw + 6}" y="${y(v) + 4}" style="font:11px var(--font-num);fill:var(--c-muted)">${v.toFixed(2)}</text>`; }
  bars.forEach((b, i) => { const up = b[3] >= b[0], col = up ? "var(--c-up)" : "var(--c-down)", x = i * bw; s += `<line x1="${x + bw / 2}" x2="${x + bw / 2}" y1="${y(b[1])}" y2="${y(b[2])}" stroke="${col}"/><rect x="${x + bw * 0.15}" y="${y(Math.max(b[0], b[3]))}" width="${bw * 0.7}" height="${Math.max(1, Math.abs(y(b[0]) - y(b[3])))}" fill="${up ? "var(--c-surface)" : col}" stroke="${col}"/><rect x="${x + bw * 0.15}" y="${H - b[4] / 80 * vh}" width="${bw * 0.7}" height="${b[4] / 80 * vh}" fill="${col}" opacity="0.45"/>`; });
  el.innerHTML = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="日 K 线">${s}</svg>`;
}
// 标注：给 [data-anno] 画框，写组件名和实测尺寸；[data-main] 另算主内容占内容区的比例
function annotate() {
  if (!/anno=1/.test(location.search)) return;
  document.querySelectorAll(".anno-box").forEach((b) => b.remove());
  const top = document.querySelector(".top").getBoundingClientRect().bottom;
  const tab = document.querySelector(".tabbar"); const tabH = tab && getComputedStyle(tab).display !== "none" ? tab.getBoundingClientRect().height : 0;
  const content = innerHeight - top - tabH;
  document.querySelectorAll("[data-anno]").forEach((el) => {
    const r = el.getBoundingClientRect(); if (!r.width || !r.height) return;
    const b = document.createElement("div"); b.className = "anno-box" + (el.hasAttribute("data-main") ? " main" : "");
    Object.assign(b.style, { left: r.left + scrollX + "px", top: r.top + scrollY + "px", width: r.width + "px", height: r.height + "px" });
    let t = `${el.dataset.anno}　${Math.round(r.width)}×${Math.round(r.height)}`;
    if (el.hasAttribute("data-main")) { const vis = Math.max(0, Math.min(r.bottom, innerHeight - tabH) - Math.max(r.top, top)); t = `${el.dataset.anno}　首屏可见 ${Math.round(vis)}px，占内容区 ${Math.round(vis / content * 100)}%`; }
    b.innerHTML = `<span>${t}</span>`; document.body.appendChild(b);
  });
}
addEventListener("load", () => setTimeout(annotate, 50));
addEventListener("resize", () => setTimeout(annotate, 50));
