// 页面模板公用脚本：外框导航、K 线示例、标注层。所有数据都是示例。
// 导航与现有产品一致（同 mockups/mock.js），不在这里新增页面；自选是页面内的筛选，不进主导航。
const NAV = [["概览", [["overview", "总览"]]], ["宏观", [["macro", "宏观"]]], ["数据", [["data", "数据中心"], ["query", "数据查询"]]], ["研究", [["screener", "选股器"], ["pools", "池子"], ["factor", "因子研究"], ["reportmining", "研报挖掘"]]], ["策略与验证", [["strategies", "策略"], ["backtest", "回测"], ["experiments", "实验记录"]]], ["跟踪与告警", [["paper", "模拟盘"], ["monitor", "盯盘与告警"], ["panorama", "市场全景"], ["sectorflow", "板块资金流"]]], ["运维", [["tasks", "任务与调度"], ["health", "系统健康"], ["ops", "操作记录"]]]];
const ICON = { overview: '<path d="M3 10.5 12 4l9 6.5V20h-6v-6H9v6H3z"/>', monitor: '<path d="M6 16V11a6 6 0 1 1 12 0v5l1.5 2h-15zM10 20h4"/>', panorama: '<path d="M4 4h7v9H4zM13 4h7v5h-7zM13 11h7v9h-7zM4 15h7v5H4z"/>', health: '<path d="M3 12h4l2-5 4 10 2-5h6"/>', more: '<path d="M4 7h16M4 12h16M4 17h16"/>', search: '<circle cx="11" cy="11" r="6.5"/><path d="m16 16 4 4"/>' };
const svgI = (k) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICON[k]}</svg>`;
function shell(page) {
  const rail = document.querySelector(".rail");
  rail.innerHTML = NAV.map(([g, items]) => `<h6>${g}</h6>` + items.map(([id, t]) => `<a href="#" ${id === page ? 'aria-current="page"' : ""}>${t}</a>`).join("")).join("");
  document.querySelector(".tabbar").innerHTML = [["overview", "总览"], ["monitor", "告警"], ["panorama", "全景"], ["health", "健康"], ["more", "更多"]].map(([id, t]) => `<a href="#" ${id === page ? 'aria-current="page"' : ""}>${svgI(id)}<span>${t}</span></a>`).join("");
  document.querySelectorAll("[data-icon]").forEach((el) => (el.innerHTML = svgI(el.dataset.icon)));
  document.querySelectorAll('a[href="#"]').forEach((a) => a.addEventListener("click", (e) => e.preventDefault()));
}
const sign = (p) => (p > 0 ? "+" : p < 0 ? "−" : "") + Math.abs(p).toFixed(2) + "%";
const dir = (p) => (p > 0 ? "up" : p < 0 ? "down" : "flat");
function prng(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const NAMES = ["示例科技", "样例电子", "演示医药", "模拟能源", "示范银行", "样本材料", "示意汽车", "范例软件", "示例食品", "样例化工", "演示传媒", "模拟机械", "示范地产", "样本通信", "示意光伏", "范例证券", "示例家电", "样例物流", "演示农业", "模拟军工", "示范环保", "样本建材", "示意保险", "范例旅游"];
function stocks(n, seed) { const r = prng(seed); return Array.from({ length: n }, (_, i) => { const pre = +(4 + r() * 60).toFixed(2); const p = +((r() - 0.45) * 8).toFixed(2); return { n: NAMES[i % NAMES.length] + (i >= NAMES.length ? " " + String.fromCharCode(65 + Math.floor(i / NAMES.length)) : ""), c: String(999001 + i), px: +(pre * (1 + p / 100)).toFixed(2), p, amt: +(1 + r() * 30).toFixed(2), turn: +(r() * 6).toFixed(2), vals: Array.from({ length: 24 }, () => r()) }; }).sort((a, b) => b.p - a.p); }
function spark(v, up) { const lo = Math.min(...v), hi = Math.max(...v); const d = v.map((x, i) => `${i ? "L" : "M"}${(i / (v.length - 1) * 64).toFixed(1)},${(20 - (x - lo) / (hi - lo || 1) * 20).toFixed(1)}`).join(""); return `<svg class="spark ${up ? "up" : "down"}" viewBox="0 0 64 20" preserveAspectRatio="none" aria-hidden="true"><path class="base" d="M0,${(20 - (v[0] - lo) / (hi - lo || 1) * 20).toFixed(1)}H64"/><path class="line" d="${d}"/></svg>`; }
function drawK(el, n) {
  const W = el.clientWidth, H = el.clientHeight; if (!W || !H) return; const r = prng(5); let c = 24; const bars = [];
  for (let i = 0; i < n; i++) { const o = c; c = Math.max(18, Math.min(30, c + (r() - 0.48) * 0.8)); const hi = Math.max(o, c) + r() * 0.4, lo = Math.min(o, c) - r() * 0.4; bars.push([o, hi, lo, c, 20 + r() * 60]); }
  const lo = Math.min(...bars.map((b) => b[2])) - 0.3, hi = Math.max(...bars.map((b) => b[1])) + 0.3; const pw = W - 44, ph = H * 0.78, vh = H * 0.16, bw = pw / n; const y = (v) => 6 + (hi - v) / (hi - lo) * (ph - 6);
  let s = ""; for (let t = 0; t <= 4; t++) { const v = lo + (hi - lo) * t / 4; s += `<line x1="0" x2="${pw}" y1="${y(v)}" y2="${y(v)}" stroke="var(--c-rule)"/><text x="${pw + 6}" y="${y(v) + 4}" style="font:11px var(--font-num);fill:var(--c-muted)">${v.toFixed(2)}</text>`; }
  bars.forEach((b, i) => { const up = b[3] >= b[0], col = up ? "var(--c-up)" : "var(--c-down)", x = i * bw; s += `<line x1="${x + bw / 2}" x2="${x + bw / 2}" y1="${y(b[1])}" y2="${y(b[2])}" stroke="${col}"/><rect x="${x + bw * 0.15}" y="${y(Math.max(b[0], b[3]))}" width="${bw * 0.7}" height="${Math.max(1, Math.abs(y(b[0]) - y(b[3])))}" fill="${up ? "var(--c-surface)" : col}" stroke="${col}"/><rect x="${x + bw * 0.15}" y="${H - b[4] / 80 * vh}" width="${bw * 0.7}" height="${b[4] / 80 * vh}" fill="${col}" opacity="0.45"/>`; });
  el.innerHTML = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="日 K 线示例，随机生成">${s}</svg>`;
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
