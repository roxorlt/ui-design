// rQuant 设计规范页的演示脚本。所有数据都是假数据。
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const mq = matchMedia("(prefers-reduced-motion: reduce)");
  const reduced = () => mq.matches || document.body.dataset.sim === "reduce";
  const cssMs = (name) => { const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim(); return parseFloat(v) || 0; };
  const dur = (name) => (reduced() && name !== "--dur-flash-gap" ? 0 : cssMs(name));
  const sign = (p) => (p > 0 ? "+" : p < 0 ? "−" : "") + Math.abs(p).toFixed(2) + "%";
  const dir = (p) => (p > 0 ? "up" : p < 0 ? "down" : "flat");

  // ---------- 目录 ----------
  const btn = $("#tocBtn"), toc = $("#toc");
  if (btn) btn.addEventListener("click", () => { const o = toc.classList.toggle("open"); btn.setAttribute("aria-expanded", o); btn.textContent = o ? "关闭目录" : "目录"; });
  if (toc) toc.addEventListener("click", (e) => { if (e.target.closest("a") && toc.classList.contains("open")) { toc.classList.remove("open"); btn.setAttribute("aria-expanded", false); btn.textContent = "目录"; } });
  const subs = $$(".toc .sub a");
  if (subs.length && "IntersectionObserver" in window) {
    const map = new Map(subs.map((a) => [a.getAttribute("href").slice(1), a]));
    const io = new IntersectionObserver((es) => { es.forEach((e) => { if (e.isIntersecting) { subs.forEach((a) => a.classList.remove("on")); const a = map.get(e.target.id); if (a) a.classList.add("on"); } }); }, { rootMargin: "0px 0px -75% 0px" });
    map.forEach((_, id) => { const h = document.getElementById(id); if (h) io.observe(h); });
  }

  // ---------- 专业词解释：电脑悬停 / 聚焦，手机点按 ----------
  let pop = null;
  const hideTip = () => { if (pop) { pop.remove(); pop = null; } };
  const showTip = (el) => { hideTip(); pop = document.createElement("span"); pop.className = "tip-pop"; pop.setAttribute("role", "tooltip"); pop.textContent = el.dataset.tip; el.style.position = "relative"; el.appendChild(pop);
    const r = pop.getBoundingClientRect(); if (r.right > innerWidth - 8) { pop.style.left = "auto"; pop.style.right = "0"; } };
  $$(".tip[data-tip]").forEach((el) => {
    el.addEventListener("mouseenter", () => showTip(el)); el.addEventListener("mouseleave", hideTip);
    el.addEventListener("focus", () => showTip(el)); el.addEventListener("blur", hideTip);
    el.addEventListener("click", (e) => { e.stopPropagation(); pop && pop.parentNode === el ? hideTip() : showTip(el); });
  });
  document.addEventListener("click", hideTip);
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") hideTip(); });

  // ---------- 模板截图：按真实宽度渲染 iframe 再缩放 ----------
  function layoutShots() {
    $$(".shot").forEach((s) => {
      const W = +s.dataset.w, H = +s.dataset.h, x = +s.dataset.x || 0, y = +s.dataset.y || 0, cw = +s.dataset.cw || W, ch = +s.dataset.ch || H;
      let f = s.querySelector("iframe");
      if (!f) { f = document.createElement("iframe"); f.src = s.dataset.src; f.title = s.getAttribute("aria-label") || "模板预览"; f.loading = "lazy"; f.tabIndex = -1; f.width = W; f.height = H; s.appendChild(f); }
      const max = +s.dataset.max || cw; const pcs = getComputedStyle(s.parentElement); const avail = Math.min(s.parentElement.clientWidth - parseFloat(pcs.paddingLeft) - parseFloat(pcs.paddingRight), max);
      const k = Math.min(1, avail / cw);
      s.style.width = cw * k + "px"; s.style.height = ch * k + "px";
      f.style.width = W + "px"; f.style.height = H + "px";
      f.style.transform = `translate(${-x * k}px, ${-y * k}px) scale(${k})`;
    });
  }
  layoutShots(); addEventListener("resize", layoutShots);

  // ---------- 浮层 ----------
  function trap(box, onClose) {
    const prev = document.activeElement;
    const f = () => $$("button, a[href], input, [tabindex]:not([tabindex='-1'])", box).filter((x) => !x.disabled);
    const key = (e) => {
      if (e.key === "Escape") { e.preventDefault(); close(); }
      if (e.key === "Tab") { const l = f(); if (!l.length) return; const a = l[0], z = l[l.length - 1]; if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); } else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); } }
    };
    document.addEventListener("keydown", key);
    const close = () => { document.removeEventListener("keydown", key); onClose(); if (prev && prev.focus) prev.focus(); };
    setTimeout(() => { const l = f(); (l[0] || box).focus(); }, 0);
    return close;
  }
  function leave(els, ms, done) { els.forEach((e) => e.classList.add("leaving")); setTimeout(() => { els.forEach((e) => e.remove()); done && done(); }, ms); }
  function openDialog(host) {
    const s = document.createElement("div"); s.className = "scrim";
    s.innerHTML = '<div class="dialog" role="dialog" aria-modal="true" aria-labelledby="dlgT"><h2 id="dlgT">删除方案「低估值高股息」？</h2><p>删除后不能恢复，用这个方案的 2 条盯盘规则会停用。</p><div class="acts"><button class="btn" data-x>保留</button><button class="btn" data-del style="color:var(--c-crit)">删除方案</button></div></div>';
    host.appendChild(s);
    const close = trap(s, () => leave([s, s.firstChild], dur("--dur-fast")));
    s.addEventListener("click", (e) => { if (e.target === s || e.target.closest("[data-x]")) close(); if (e.target.closest("[data-del]")) { close(); toast(host, "已删除方案", false); } });
  }
  function openDrawer(host) {
    const s = document.createElement("div"); s.className = "scrim"; s.style.placeItems = "stretch";
    const d = document.createElement("aside"); d.className = "drawer"; d.setAttribute("role", "dialog"); d.setAttribute("aria-modal", "true"); d.setAttribute("aria-label", "示例科技详情");
    if (host !== document.body) d.style.width = "min(320px, 100%)";
    d.innerHTML = '<div class="drawer-h"><h2>示例科技</h2><span class="m-l num">999001</span><button class="x" aria-label="关闭" data-x>×</button></div><div class="drawer-b"><dl class="mgrid" style="grid-template-columns:1fr 1fr;padding:0"><div><dt>现价</dt><dd class="up">24.86</dd></div><div><dt>涨跌幅</dt><dd class="up">+1.30%</dd></div><div><dt>今开</dt><dd class="down">24.71</dd></div><div><dt>最高</dt><dd class="up">25.36</dd></div><div><dt>成交额</dt><dd>12.80亿</dd></div><div><dt>换手率</dt><dd>2.31%</dd></div></dl><p class="cap" style="margin-top:12px">示例数据，代码和名称为虚构。</p></div>';
    host.appendChild(s); host.appendChild(d);
    const close = trap(d, () => leave([s, d], dur("--dur-base")));
    s.addEventListener("click", close); d.addEventListener("click", (e) => { if (e.target.closest("[data-x]")) close(); });
  }
  let toastTimer = null;
  function toast(host, text, undo = true) {
    $$(".toast", host).forEach((t) => t.remove()); clearTimeout(toastTimer);
    const t = document.createElement("div"); t.className = "toast"; t.setAttribute("role", "status");
    t.innerHTML = `<span>${text}</span>` + (undo ? '<button class="act">撤销</button>' : "");
    host.appendChild(t);
    const kill = () => leave([t], dur("--dur-fast"));
    let left = undo ? 6000 : 4000; let start = Date.now();
    const arm = () => { start = Date.now(); toastTimer = setTimeout(kill, left); };
    t.addEventListener("mouseenter", () => { clearTimeout(toastTimer); left -= Date.now() - start; });
    t.addEventListener("mouseleave", arm);
    t.addEventListener("click", (e) => { if (e.target.closest(".act")) { kill(); setTimeout(() => toast(host, "已撤销", false), dur("--dur-fast") + 20); } });
    arm();
  }
  $$("[data-demo='overlay'] [data-open]").forEach((b) => b.addEventListener("click", () => { const k = b.dataset.open; if (k === "dialog") openDialog(document.body); if (k === "drawer") openDrawer(document.body); if (k === "toast") toast(document.body, "已加入自选"); }));
  $$("[data-demo='motion-overlay'] [data-mo]").forEach((b) => b.addEventListener("click", () => { const host = b.closest(".frame"); const k = b.dataset.mo; if (k === "dialog") openDialog(host); if (k === "drawer") openDrawer(host); if (k === "toast") toast(host, "已加入自选"); }));

  // ---------- 示例股票 ----------
  const STOCKS = [["示例科技", "999001", 24.54, 1.3, 12.8], ["样例电子", "999002", 8.19, -0.86, 5.37], ["演示医药", "999003", 31.4, 0, 2.05], ["模拟能源", "999004", 6.02, 10.0, 9.12], ["示范银行", "999005", 4.87, 0.41, 3.66], ["样本材料", "999006", 15.33, -2.15, 4.4], ["远岫汽车", "999007", 41.2, -0.37, 7.95]];

  // 指标兼作筛选
  const mf = $("[data-demo='mfilter']");
  if (mf) {
    const body = $("[data-rows]", mf), out = $("[data-out]", mf);
    const draw = (f) => { const rows = STOCKS.filter((s) => f === "up" ? s[3] > 0 : f === "down" ? s[3] < 0 : f === "limit" ? s[3] >= 9.9 : true);
      body.innerHTML = rows.map((s) => `<tr><td>${s[0]} <span class="muted num">${s[1]}</span></td><td class="r ${dir(s[3])}">${sign(s[3])}</td></tr>`).join("");
      out.textContent = f ? `筛选：${({ up: "上涨", down: "下跌", limit: "涨停" })[f]}，${rows.length} 只　点指标取消` : `全部 ${rows.length} 只`; };
    $$("button.m", mf).forEach((b) => b.addEventListener("click", () => { const on = b.getAttribute("aria-pressed") !== "true"; $$("button.m", mf).forEach((x) => x.setAttribute("aria-pressed", "false")); b.setAttribute("aria-pressed", on); draw(on ? b.dataset.f : null); }));
    draw(null);
  }
  // 排序
  const so = $("[data-demo='sort']");
  if (so) {
    const body = $("[data-rows]", so), out = $("[data-out]", so); let key = "p", desc = true;
    const draw = () => { const i = key === "p" ? 3 : 4; const rows = STOCKS.slice().sort((a, b) => (desc ? b[i] - a[i] : a[i] - b[i]));
      body.innerHTML = rows.map((s) => `<tr><td>${s[0]} <span class="muted num">${s[1]}</span></td><td class="r ${dir(s[3])}">${sign(s[3])}</td><td class="r">${s[4].toFixed(2)}</td></tr>`).join("");
      $$("th[aria-sort]", so).forEach((th) => th.setAttribute("aria-sort", th.querySelector(".sort").dataset.k === key ? (desc ? "descending" : "ascending") : "none"));
      out.textContent = `按${key === "p" ? "涨跌幅" : "成交额"}从${desc ? "高到低" : "低到高"}`; };
    $$(".sort", so).forEach((b) => b.addEventListener("click", () => { if (b.dataset.k === key) desc = !desc; else { key = b.dataset.k; desc = true; } draw(); }));
    draw();
  }
  // 展开全部
  const mo = $("[data-demo='more']");
  if (mo) {
    const body = $("[data-rows]", mo), out = $("[data-out]", mo), b = $("[data-btn]", mo); const N = 46; let open = false;
    const ev = ["降准", "LPR 下调", "CPI 公布", "PMI 公布", "社融公布", "美联储议息"]; let seed = 7; const rnd = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
    const rows = Array.from({ length: N }, (_, i) => { const d = new Date(2026, 8, 30 - i * 3); const p = (rnd() - 0.5) * 2.4; return `<tr><td class="num">${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}</td><td>${ev[i % ev.length]}</td><td class="r ${dir(+p.toFixed(2))}">${sign(+p.toFixed(2))}</td></tr>`; });
    const draw = () => { body.innerHTML = rows.slice(0, 20).join(""); if (open) { const t = document.createElement("tbody"); body.insertAdjacentHTML("beforeend", rows.slice(20).join("")); $$("tr", body).slice(20).forEach((tr) => tr.classList.add("fade-in")); }
      b.innerHTML = open ? "收起，只看前 20 行" : `展开全部（共 <span class="num">${N}</span> 行）`; out.textContent = open ? `共 ${N} 行` : `共 ${N} 行，显示 20 行`; };
    b.addEventListener("click", () => { if (open) { open = false; draw(); mo.scrollIntoView({ block: "start" }); return; } b.setAttribute("aria-busy", "true"); b.textContent = `正在加载 ${N - 20} 行…`; setTimeout(() => { b.removeAttribute("aria-busy"); open = true; draw(); }, 400); });
    draw();
  }
  // 表单
  const fm = $("[data-demo='form'] form");
  if (fm) {
    const code = $("#f-code"), name = $("#f-name");
    const chk = (inp, ok) => { const e = document.getElementById(inp.id + "-e"); inp.setAttribute("aria-invalid", !ok); e.hidden = ok; return ok; };
    code.addEventListener("input", () => { code.value = code.value.replace(/\D/g, ""); if (code.getAttribute("aria-invalid") === "true" && /^\d{6}$/.test(code.value)) chk(code, true); });
    code.addEventListener("blur", () => { if (code.value) chk(code, /^\d{6}$/.test(code.value)); });
    name.addEventListener("blur", () => { if (name.value) chk(name, name.value.length <= 20); });
    fm.addEventListener("reset", () => { [code, name].forEach((i) => chk(i, true)); });
    fm.addEventListener("submit", (e) => { e.preventDefault(); const a = chk(code, /^\d{6}$/.test(code.value)), c = chk(name, name.value.trim().length > 0 && name.value.length <= 20); if (!a) return code.focus(); if (!c) return name.focus();
      const sb = $("button[type=submit]", fm); sb.setAttribute("aria-busy", "true"); setTimeout(() => { sb.removeAttribute("aria-busy"); toast(document.body, "已保存规则", false); }, 700); });
  }

  // ---------- 动效 ----------
  const sim = $("#simReduce"), sys = $("#sysReduce");
  const syncSys = () => { if (sys) sys.textContent = mq.matches ? "系统设置：已开启减少动态效果，本页演示按降级效果播放" : "系统设置：未开启减少动态效果"; };
  syncSys(); mq.addEventListener && mq.addEventListener("change", syncSys);
  if (sim) sim.addEventListener("change", () => { if (sim.checked) document.body.dataset.sim = "reduce"; else delete document.body.dataset.sim; });

  // 曲线小圆点
  $$("[data-play='ease']").forEach((b) => b.addEventListener("click", () => {
    const i = $(`[data-dot='${b.dataset.ease}']`); const track = i.parentElement; const dist = track.clientWidth - 24;
    i.style.transition = "none"; i.style.transform = "translateX(0)"; void i.offsetWidth;
    const d = reduced() ? 0 : cssMs("--dur-slow") * 3;
    i.style.transition = `transform ${d}ms var(--ease-${b.dataset.ease})`; i.style.transform = `translateX(${dist}px)`;
  }));

  // 闪烁
  const lastFlash = new WeakMap();
  function flash(el, up) {
    const now = performance.now(); const gap = cssMs("--dur-flash-gap");
    if (lastFlash.has(el) && now - lastFlash.get(el) < gap) return false;
    lastFlash.set(el, now);
    el.classList.remove("flash-up", "flash-down"); void el.offsetWidth; el.classList.add(up ? "flash-up" : "flash-down");
    clearTimeout(el._ft); el._ft = setTimeout(() => el.classList.remove("flash-up", "flash-down"), reduced() ? gap : Math.max(cssMs("--dur-flash"), 50));
    return true;
  }
  const tk = $("[data-demo='ticker']");
  if (tk) {
    const body = $("[data-rows]", tk), tbtn = $("[data-tick-toggle]", tk), tburst = $("[data-tick-burst]", tk), ttime = $("[data-tick-time]", tk);
    const data = STOCKS.slice(0, 5).map((s) => ({ n: s[0], c: s[1], pre: s[2], px: +(s[2] * (1 + s[3] / 100)).toFixed(2), amt: s[4] }));
    body.innerHTML = data.map((d, i) => `<tr><td>${d.n} <span class="muted num">${d.c}</span></td><td class="r" data-px="${i}"></td><td class="r" data-pc="${i}"></td><td class="r" data-am="${i}"></td></tr>`).join("");
    const paint = (i) => { const d = data[i]; const p = (d.px / d.pre - 1) * 100; const k = dir(+p.toFixed(2)); const a = $(`[data-px='${i}']`, body), b = $(`[data-pc='${i}']`, body), c = $(`[data-am='${i}']`, body);
      a.textContent = d.px.toFixed(2); b.textContent = sign(+p.toFixed(2)); c.textContent = d.amt.toFixed(2); [a, b].forEach((x) => { x.classList.remove("up", "down", "flat"); x.classList.add(k); }); };
    data.forEach((_, i) => paint(i));
    let seed = 11; const rnd = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
    const move = (i) => { const d = data[i]; const old = d.px; const step = Math.max(0.01, +(d.pre * 0.002).toFixed(2)); d.px = +(d.px + (rnd() > 0.5 ? step : -step)).toFixed(2); d.amt += 0.01 + rnd() * 0.05; paint(i);
      const up = d.px > old; const f1 = flash($(`[data-px='${i}']`, body), up); flash($(`[data-pc='${i}']`, body), up); return f1; };
    const stamp = () => { const t = new Date(); ttime.textContent = `更新于 ${String(t.getHours()).padStart(2, "0")}:${String(t.getMinutes()).padStart(2, "0")}:${String(t.getSeconds()).padStart(2, "0")}（假数据，每 1.5 秒）`; };
    let timer = null;
    const tick = () => { data.forEach((_, i) => { if (rnd() < 0.5) move(i); }); stamp(); };
    const stop = () => { clearInterval(timer); timer = null; tbtn.textContent = "开始刷新"; };
    tbtn.addEventListener("click", () => { if (timer) stop(); else { tick(); timer = setInterval(tick, 1500); tbtn.textContent = "暂停刷新"; } });
    tburst.addEventListener("click", () => { if (timer) stop(); let n = 0, f = 0; const go = () => { if (move(0)) f++; n++; if (n < 5) setTimeout(go, 200); else ttime.textContent = `示例科技 1 秒内变了 5 次，只闪了 ${f} 次；其余只换数`; }; go(); });
    // 离开视口自动暂停，避免后台空转
    if ("IntersectionObserver" in window) new IntersectionObserver((es) => es.forEach((e) => { if (!e.isIntersecting && timer) stop(); })).observe(tk);
  }
  // 正反例：循环闪烁和计数器
  const lf = $("[data-loopflash]"), ct = $("[data-counter]");
  if (lf && ct) {
    let v = 24.86, w = 24.86;
    setInterval(() => { if (document.hidden) return; const r = lf.getBoundingClientRect(); if (r.bottom < 0 || r.top > innerHeight) return;
      const nv = +(v + (Math.random() > 0.5 ? 0.02 : -0.02)).toFixed(2); lf.textContent = nv.toFixed(2); lf.className = "m-v up"; flash(lf, nv > v); v = nv;
      const target = +(w + (Math.random() > 0.5 ? 0.37 : -0.29)).toFixed(2);
      if (reduced()) { ct.textContent = target.toFixed(2); w = target; return; }
      const from = w, t0 = performance.now(); const step = (t) => { const k = Math.min(1, (t - t0) / 1200); ct.textContent = (from + (target - from) * k).toFixed(2); if (k < 1) requestAnimationFrame(step); }; requestAnimationFrame(step); w = target;
    }, 2000);
  }
  // 页面切换（内容淡入）
  const ps = $("[data-demo='pageswitch']");
  if (ps) {
    const views = ['<dl class="mgrid" style="padding:0"><div><dt>今开</dt><dd class="down">24.71</dd></div><div><dt>最高</dt><dd class="up">25.36</dd></div><div><dt>最低</dt><dd class="down">24.40</dd></div><div><dt>成交额</dt><dd>12.80亿</dd></div></dl>', '<dl class="mgrid" style="padding:0"><div><dt>营收</dt><dd>48.2亿</dd></div><div><dt>净利润</dt><dd>6.13亿</dd></div><div><dt>毛利率</dt><dd>31.4%</dd></div><div><dt>负债率</dt><dd>42.0%</dd></div></dl>', '<dl class="mgrid" style="padding:0"><div><dt>主力净流入</dt><dd class="up">+1.26亿</dd></div><div><dt>散户净流入</dt><dd class="down">−0.84亿</dd></div><div><dt>北向持股</dt><dd>3.12%</dd></div><div><dt>融资余额</dt><dd>9.40亿</dd></div></dl>'];
    const v = $("[data-view]", ps); const show = (i) => { v.innerHTML = views[i]; v.classList.remove("fade-in"); void v.offsetWidth; v.classList.add("fade-in"); };
    $$(".seg button", ps).forEach((b) => b.addEventListener("click", () => { $$(".seg button", ps).forEach((x) => x.setAttribute("aria-selected", x === b)); show(+b.dataset.v); }));
    v.innerHTML = views[0];
  }
  // 列表加载
  const ll = $("[data-demo='listload']");
  if (ll) {
    const body = $("[data-rows]", ll);
    const rowsHTML = () => STOCKS.slice(0, 5).map((s) => `<tr><td>${s[0]} <span class="muted num">${s[1]}</span></td><td class="r ${dir(s[3])}">${sign(s[3])}</td><td class="r">${s[4].toFixed(2)}</td></tr>`).join("");
    const skel = () => Array.from({ length: 5 }, () => '<tr><td><span class="skel">示例名称 999000</span></td><td class="r"><span class="skel">+0.00%</span></td><td class="r"><span class="skel">00.00</span></td></tr>').join("");
    body.innerHTML = rowsHTML();
    $("[data-play='list']", ll).addEventListener("click", () => { body.innerHTML = ""; const t1 = setTimeout(() => { body.innerHTML = skel(); }, cssMs("--delay-skeleton")); setTimeout(() => { clearTimeout(t1); body.innerHTML = rowsHTML(); body.classList.remove("fade-in"); void body.offsetWidth; body.style.animationDuration = dur("--dur-fast") + "ms"; body.classList.add("fade-in"); }, 900); });
  }
  // 骨架：慢请求 vs 快请求
  const sk = $("[data-demo='skel']");
  if (sk) {
    const strip = $("[data-skel]", sk); const vals = $$(".m-v", strip); const orig = vals.map((x) => x.innerHTML);
    const run = (ms) => { vals.forEach((x) => { x.style.visibility = "hidden"; }); const t1 = setTimeout(() => vals.forEach((x) => { x.style.visibility = ""; x.classList.add("skel"); }), cssMs("--delay-skeleton"));
      setTimeout(() => { clearTimeout(t1); vals.forEach((x, i) => { x.style.visibility = ""; x.classList.remove("skel"); x.innerHTML = orig[i]; }); }, ms); };
    $("[data-play='skel']", sk).addEventListener("click", () => run(1200));
    $("[data-play='skelfast']", sk).addEventListener("click", () => run(200));
  }

  // ---------- 模板标注开关 ----------
  const at = document.getElementById("annoToggle");
  if (at) at.addEventListener("change", () => { $$(".shot iframe").forEach((f) => { const u = f.getAttribute("src").replace(/\?anno=1/, ""); f.setAttribute("src", at.checked ? u + "?anno=1" : u); }); });
})();

// 数据表横滑：放不下才加 .over（显示右侧渐隐和「左右滑动查看全部列」），滑到最右去掉渐隐
(function () {
  const wraps = document.querySelectorAll(".tscroll-wrap");
  function check() { wraps.forEach((w) => { const sc = w.firstElementChild; const over = sc.scrollWidth > sc.clientWidth + 1; w.classList.toggle("over", over); w.classList.toggle("end", over && sc.scrollLeft + sc.clientWidth >= sc.scrollWidth - 2); sc.tabIndex = over ? 0 : -1; if (over) sc.setAttribute("aria-label", "表格可左右滑动"); else sc.removeAttribute("aria-label"); }); }
  wraps.forEach((w) => w.firstElementChild.addEventListener("scroll", check, { passive: true }));
  addEventListener("resize", check); addEventListener("load", check); check();
})();
