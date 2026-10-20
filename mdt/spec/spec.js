/* 门店通设计规范 v1.0：目录、结构标注、模板缩放、动效演示 */
(function(){
var reduceMQ = matchMedia('(prefers-reduced-motion: reduce)');

/* 手机目录 */
var btn = document.getElementById('tocBtn'), toc = document.getElementById('toc');
if (btn && toc) {
  function setOpen(o){ toc.classList.toggle('open', o); btn.setAttribute('aria-expanded', o ? 'true' : 'false'); btn.textContent = o ? '关闭目录' : '目录'; }
  btn.addEventListener('click', function(){ setOpen(!toc.classList.contains('open')); });
  toc.addEventListener('click', function(e){ if (e.target.closest('a')) setOpen(false); });
  document.addEventListener('keydown', function(e){ if (e.key === 'Escape' && toc.classList.contains('open')) { setOpen(false); btn.focus(); } });
}

/* 目录里标出当前小节 */
var subLinks = [].slice.call(document.querySelectorAll('.toc .sub a'));
if (subLinks.length && 'IntersectionObserver' in window) {
  var map = {};
  subLinks.forEach(function(a){ map[a.getAttribute('href').slice(1)] = a; });
  var io = new IntersectionObserver(function(es){
    es.forEach(function(en){ if (en.isIntersecting) { subLinks.forEach(function(a){ a.classList.remove('is-here'); }); var a = map[en.target.id]; if (a) a.classList.add('is-here'); } });
  }, {rootMargin: '0px 0px -70% 0px'});
  Object.keys(map).forEach(function(id){ var s = document.getElementById(id); if (s) io.observe(s); });
}

/* 结构标注：给 [data-pin] 元素加编号 */
function pins(){
  document.querySelectorAll('.anat').forEach(function(box){
    box.querySelectorAll('.pin').forEach(function(p){ p.remove(); });
    var br = box.getBoundingClientRect();
    box.querySelectorAll('[data-pin]').forEach(function(el){
      var r = el.getBoundingClientRect();
      if (!r.width && !r.height) return;
      var p = document.createElement('span');
      p.className = 'pin'; p.setAttribute('aria-hidden', 'true'); p.textContent = el.getAttribute('data-pin');
      var x = r.left - br.left + box.scrollLeft - 9, y = (el.getAttribute('data-pin-at') === 'bottom' ? r.bottom - br.top - 9 : r.top - br.top - 9) + box.scrollTop;
      x = Math.max(0, Math.min(x, box.scrollWidth - 18)); y = Math.max(0, y);
      p.style.left = x + 'px'; p.style.top = y + 'px';
      box.appendChild(p);
    });
  });
}

/* 页面模板：按容器宽度缩放 1440×900 画框，并标出区块 */
function zones(frame, scale){
  frame.querySelectorAll('.zone').forEach(function(z){ z.remove(); });
  var fr = frame.getBoundingClientRect(), items = [];
  frame.querySelectorAll('[data-zone]').forEach(function(el, i){
    var r = el.getBoundingClientRect();
    var z = document.createElement('div'); z.className = 'zone'; z.setAttribute('aria-hidden', 'true');
    var top = (r.top - fr.top) / scale, left = (r.left - fr.left) / scale;
    var w = r.width / scale, h = Math.min(r.height / scale, frame.offsetHeight - top);
    z.style.cssText = 'left:' + left + 'px;top:' + top + 'px;width:' + w + 'px;height:' + h + 'px';
    var s = document.createElement('span'); s.textContent = i + 1;
    /* 编号骑在区块左上角，尽量不压内容；贴着画框边的区块不往外移 */
    var k = scale < 1 ? Math.min(2, 1 / scale) : 1;
    s.style.transform = 'scale(' + k + ') translate(' + (left < 8 ? '0' : '-50%') + ',' + (top < 8 ? '0' : '-50%') + ')';
    z.appendChild(s); frame.appendChild(z);
    items.push(el.getAttribute('data-zone'));
  });
  /* 标注文字放在画框下方的图例里，不压在内容上 */
  var host = frame.closest('.frame-wrap') || frame;
  var lg = host.nextElementSibling;
  if (!lg || !lg.classList.contains('zone-legend')) {
    lg = document.createElement('ol'); lg.className = 'legend zone-legend';
    host.parentNode.insertBefore(lg, host.nextSibling);
  }
  lg.innerHTML = items.map(function(t, i){ return '<li><i>' + (i + 1) + '</i>' + t.replace(/&/g, '&amp;').replace(/</g, '&lt;') + '</li>'; }).join('');
}
function frames(){
  document.querySelectorAll('.frame-wrap').forEach(function(w){
    var f = w.querySelector('.frame'), W = +w.dataset.w, H = +w.dataset.h;
    var s = Math.max(w.clientWidth / W, w.clientWidth < 700 ? 0.5 : 0);
    f.style.transform = 'scale(' + s + ')';
    w.style.height = (H * s) + 'px';
    var z = w.querySelector('.frame-sizer');
    if (!z) { z = document.createElement('div'); z.className = 'frame-sizer'; z.setAttribute('aria-hidden', 'true'); w.appendChild(z); }
    z.style.width = (W * s) + 'px';
    zones(f, s);
  });
  document.querySelectorAll('.frame-m').forEach(function(f){ if (f.querySelector('[data-zone]')) zones(f, 1); });
}
/* 标注开关：每个模板框上方一个按钮 */
document.querySelectorAll('.frame-wrap, .frame-m').forEach(function(f){
  if (!f.querySelector('[data-zone]')) return;
  var b = document.createElement('button'); b.type = 'button'; b.className = 'btn btn-ghost zone-tg'; b.textContent = '隐藏区块框'; b.setAttribute('aria-pressed', 'false');
  b.addEventListener('click', function(){ var off = f.classList.toggle('nozone'); b.textContent = off ? '显示区块框' : '隐藏区块框'; b.setAttribute('aria-pressed', off ? 'true' : 'false'); });
  f.parentNode.insertBefore(b, f);
});
var t; function relayout(){ clearTimeout(t); t = setTimeout(function(){ frames(); pins(); }, 60); }
window.addEventListener('resize', relayout);
window.addEventListener('load', function(){ frames(); pins(); });
if (document.fonts && document.fonts.ready) document.fonts.ready.then(function(){ frames(); pins(); });
frames(); pins();

/* 横滑筛选条：单选 + 方向键 + 选中项滚入可视区 */
document.querySelectorAll('.chipbar').forEach(function(bar){
  var bs = [].slice.call(bar.querySelectorAll('[role=radio]'));
  function show(b){ var l = b.offsetLeft - bar.clientWidth / 2 + b.offsetWidth / 2; bar.scrollTo({left: l, behavior: reduceMQ.matches ? 'auto' : 'smooth'}); }
  bs.forEach(function(b, i){
    b.tabIndex = b.getAttribute('aria-checked') === 'true' ? 0 : -1;
    b.addEventListener('click', function(){ bs.forEach(function(x){ x.setAttribute('aria-checked', 'false'); x.tabIndex = -1; }); b.setAttribute('aria-checked', 'true'); b.tabIndex = 0; show(b); });
    b.addEventListener('keydown', function(e){ var d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0; if (!d) return; e.preventDefault(); var n = bs[(i + d + bs.length) % bs.length]; n.focus(); n.click(); });
  });
});

/* 普通芯片：切换选中 */
document.querySelectorAll('.chips button.chip').forEach(function(c){
  c.addEventListener('click', function(){ var g = c.parentNode; g.querySelectorAll('button.chip').forEach(function(x){ x.setAttribute('aria-pressed', x === c ? 'true' : 'false'); }); });
});

/* ===== 动效演示 ===== */
var rmT = document.getElementById('rmToggle');
function isRM(){ return reduceMQ.matches || (rmT && rmT.checked); }
if (rmT) {
  if (reduceMQ.matches) { rmT.checked = true; rmT.disabled = true; }
  else { var n = document.getElementById('rmNote'); if (n) n.textContent = '勾选后，本页演示按「减少动态效果」的方式播放：状态直接切换，没有过渡。'; }
  rmT.addEventListener('change', function(){ document.querySelectorAll('.mo-scope').forEach(function(s){ s.classList.toggle('rm', rmT.checked); }); });
}
function ms(name, el){ var v = getComputedStyle(el || document.documentElement).getPropertyValue(name).trim(); return isRM() ? 0 : (parseFloat(v) || 0); }
function enter(el, cls){ el.classList.add(cls || 'from'); void el.offsetWidth; requestAnimationFrame(function(){ el.classList.remove(cls || 'from'); }); }
function wait(t){ return new Promise(function(r){ setTimeout(r, t); }); }

var pageData = [
  ['长沙星驰星沙店', '42', '近 30 天直播仅 3 场'], ['太原星驰长风店', '44', '本周未发布内容'], ['南昌星驰红谷店', '51', '线索平均 6 小时才跟进']
], pageData2 = [
  ['拉萨星驰城关店', '72', '场均观看 1,250 人'], ['合肥星驰滨湖店', '74', '本周发布 1 条'], ['福州星驰仓山店', '77', '2 个账号授权即将过期']
];
function pageHTML(d, cls){ return '<table class="tbl"><tbody>' + d.map(function(r){ return '<tr><td class="main">' + r[0] + '</td><td><span class="health ' + cls + '">' + r[1] + '<i><b style="width:' + r[1] + '%"></b></i></span></td><td class="sub">' + r[2] + '</td></tr>'; }).join('') + '</tbody></table>'; }
var mp = document.getElementById('moPage'), pageI = 0;
if (mp) mp.innerHTML = pageHTML(pageData, 'bad');

function leadRows(){ var n = ['张先生', '李女士', '王先生', '赵女士']; return '<table class="tbl mo-fade from" id="moListReal"><tbody>' + n.map(function(x, i){ return '<tr><td><span class="lv' + (i ? '' : ' lv-a') + '">' + (i ? 'B' : 'A') + '</span></td><td class="main">' + x + '</td><td class="sub">星驰 X5</td><td><span class="tag tag-accent">待跟进</span></td></tr>'; }).join('') + '</tbody></table>'; }
function skelRows(){ var h = '<div style="padding:12px 16px;display:grid;gap:20px">'; for (var i = 0; i < 4; i++) h += '<div style="display:grid;grid-template-columns:20px 1fr 1fr 64px;gap:16px;align-items:center"><span class="skel" style="height:20px"></span><span class="skel"></span><span class="skel" style="width:70%"></span><span class="skel" style="height:22px"></span></div>'; return h + '</div>'; }
var ml = document.getElementById('moList'); if (ml) ml.innerHTML = skelRows();

var hlRows = [['杭州星驰西湖店官方号', '门店号', ''], ['苏州星驰园区店官方号', '门店号', ''], ['西湖店销售号', '门店号', ''], ['销售顾问A 的个人号', '个人号', ''], ['园区店直播号', '门店号', ''], ['西湖店售后小助手', '门店号', '<span class="tag tag-neg">已过期</span>'], ['销售顾问B 的个人号', '个人号', ''], ['园区店售后号', '门店号', '']];
var hl = document.getElementById('moHl');
if (hl) hl.querySelector('tbody').innerHTML = hlRows.map(function(r, i){ return '<tr class="mo-row" id="moHl' + i + '"><td class="main">' + r[0] + '</td><td class="sub">' + r[1] + '</td><td>' + r[2] + '</td></tr>'; }).join('');

var running = {};
var plays = {
  page: function(){
    var tabs = document.querySelectorAll('[data-tab]'); pageI = 1 - pageI;
    tabs.forEach(function(t){ t.setAttribute('aria-selected', +t.dataset.tab === pageI ? 'true' : 'false'); });
    mp.innerHTML = pageI ? pageHTML(pageData2, 'warn') : pageHTML(pageData, 'bad');
    enter(mp); return wait(ms('--dur-base', mp));
  },
  sheet: function(){ var o = document.getElementById('moSheet'); o.classList.add('open'); return wait(ms('--dur-base', o) + 1000).then(function(){ o.classList.remove('open'); return wait(ms('--dur-fast', o)); }); },
  drawer: function(){ var o = document.getElementById('moDrawer'); o.classList.add('open'); return wait(ms('--dur-slow', o) + 1000).then(function(){ o.classList.remove('open'); return wait(ms('--dur-base', o)); }); },
  list: function(){
    ml.innerHTML = skelRows();
    if (isRM()) ml.querySelectorAll('.skel').forEach(function(s){ s.style.animation = 'none'; });
    return wait(900).then(function(){ ml.innerHTML = leadRows(); var r = document.getElementById('moListReal'); void r.offsetWidth; requestAnimationFrame(function(){ r.classList.remove('from'); }); });
  },
  number: function(){
    var cells = document.querySelectorAll('#moStrip .mo-cell'), nums = document.querySelectorAll('#moStrip .mo-num');
    var a = nums[0].textContent === '8,456';
    var vals = a ? ['8,471', '1.48', '157'] : ['8,456', '1.48', '158'];
    var old = [].map.call(nums, function(n){ return n.textContent; });
    nums.forEach(function(n, i){ if (old[i] !== vals[i]) { n.textContent = vals[i]; enter(n); cells[i].classList.add('hl'); } });
    var chip = document.getElementById('moChip'); chip.textContent = vals[2]; enter(chip);
    if (isRM()) return wait(10);
    return wait(2000).then(function(){ cells.forEach(function(c){ c.classList.remove('hl'); }); return wait(ms('--dur-slow', cells[0])); });
  },
  press: function(){
    var b1 = document.getElementById('moPress1'), b2 = document.getElementById('moPress2');
    b1.classList.add('is-pressed');
    return wait(Math.max(160, ms('--dur-instant', b1) * 2)).then(function(){ b1.classList.remove('is-pressed'); return wait(400); }).then(function(){ b2.classList.add('is-pressed'); return wait(160); }).then(function(){ b2.classList.remove('is-pressed'); });
  },
  skel: function(){
    var s = document.querySelectorAll('#moSkel .skel');
    s.forEach(function(x){ x.style.animation = isRM() ? 'none' : ''; });
    return wait(3000).then(function(){ s.forEach(function(x){ x.style.animation = 'none'; }); });
  },
  hl: function(){
    var box = document.getElementById('moHlBox'), row = document.getElementById('moHl5');
    hl.querySelectorAll('.mo-row').forEach(function(r){ r.classList.remove('hl'); });
    box.scrollTo({top: 0, behavior: 'auto'});
    return wait(300).then(function(){
      var top = row.offsetTop - box.clientHeight / 2 + row.offsetHeight / 2;
      box.scrollTo({top: top, behavior: isRM() ? 'auto' : 'smooth'});
      return wait(isRM() ? 0 : 320);
    }).then(function(){
      row.classList.add('hl');
      if (isRM()) return; /* 减少动效：高亮常驻 */
      return wait(ms('--dur-highlight', row)).then(function(){ row.classList.remove('hl'); });
    });
  }
};
document.querySelectorAll('[data-play]').forEach(function(b){
  b.addEventListener('click', function(){
    var k = b.dataset.play; if (running[k]) return; running[k] = true;
    b.setAttribute('aria-busy', 'true');
    Promise.resolve(plays[k]()).then(function(){ running[k] = false; b.removeAttribute('aria-busy'); });
  });
});
})();
