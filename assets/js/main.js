/* ============================================================
   伍壹零 · 交互脚本
   - 多页面共用：汉堡菜单、计算器、灯箱（dialog）、滚动渐入、年份、FAQ
   - 计算器口径：重点群体 7,800 元/人/年（广东省定额）× 3 年
     · 服务费率 30%，符合人数 ≥30 人时按 20%–25% 区间（以签约方案为准）
   ============================================================ */
(function () {
  'use strict';

  // 标记 JS 已就绪（配合 .js-ready .reveal 防内容不可见）
  document.documentElement.classList.add('js-ready');

  // 根据当前 origin 动态补全 og:url / og:image / twitter:image 的绝对 URL
  // 仅对执行 JS 的爬虫与分享插件有效（LinkedInBot / Twitterbot / FB debugger 等）；
  // 微信 / QQ / 企业微信爬虫只看 HTML 源码，已在 HTML 中写死了绝对 URL 占位（部署时改域名）。
  (function fixOg() {
    var p = window.location.protocol;
    if (p === 'file:') return;
    var origin = window.location.origin;
    if (!origin || origin.indexOf('http') !== 0) return;
    var setMeta = function (sel, val) {
      document.querySelectorAll(sel).forEach(function (m) { m.setAttribute('content', val); });
    };
    // 已有绝对 URL 且不是当前 origin 时（即部署后的真实域名），保留不动
    var currentOgImage = document.querySelector('meta[property="og:image"]');
    var currentOgUrl = document.querySelector('meta[property="og:url"]');
    if (currentOgImage) {
      var imgVal = currentOgImage.getAttribute('content') || '';
      if (imgVal.indexOf('https://www.wuyiling.com.cn') === 0 || imgVal.indexOf('http://www.wuyiling.com.cn') === 0) {
        // 仍是示例域名占位符 → 替换为当前 origin
        setMeta('meta[property="og:image"]', origin + '/assets/img/og-share.png');
        setMeta('meta[property="og:image:secure_url"]', origin + '/assets/img/og-share.png');
        setMeta('meta[name="twitter:image"]', origin + '/assets/img/og-share.png');
      }
    }
    if (currentOgUrl) {
      var urlVal = currentOgUrl.getAttribute('content') || '';
      if (urlVal.indexOf('https://www.wuyiling.com.cn') === 0 || urlVal.indexOf('http://www.wuyiling.com.cn') === 0) {
        setMeta('meta[property="og:url"]', origin + window.location.pathname);
      }
    }
  })();

  // 年份
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // 顶栏滚动阴影
  var topbar = document.getElementById('topbar');
  var onScroll = function () {
    if (!topbar) return;
    if (window.scrollY > 8) topbar.classList.add('is-scrolled');
    else topbar.classList.remove('is-scrolled');
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // 高亮当前页面 nav 项
  (function () {
    var path = location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav a, .nav-drawer a').forEach(function (a) {
      var href = a.getAttribute('href') || '';
      if (href === path) a.classList.add('is-active');
    });
  })();

  /* ---------- 滚动锁定（原地） ----------
     旧方案 body{overflow:hidden} 在部分浏览器会导致页面滚动位置丢失（灯箱打开时跳回顶部）。
     新方案：body 置为 position:fixed 并用负 top 抵消当前滚动，视觉零位移；
     解锁时恢复原位（instant，避免 smooth 滚动动画）。 */
  var lockY = 0;
  function lockScroll() {
    if (document.body.style.position === 'fixed') return;
    lockY = window.scrollY || document.documentElement.scrollTop || 0;
    document.body.style.position = 'fixed';
    document.body.style.top = (-lockY) + 'px';
    document.body.style.left = '0';
    document.body.style.right = '0';
    document.body.style.width = '100%';
  }
  function unlockScroll() {
    if (document.body.style.position !== 'fixed') return;
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.left = '';
    document.body.style.right = '';
    document.body.style.width = '';
    try { window.scrollTo({ top: lockY, left: 0, behavior: 'instant' }); }
    catch (e) { window.scrollTo(0, lockY); }
  }

  // 汉堡菜单
  var burger = document.getElementById('burger');
  var drawer = document.getElementById('navDrawer');
  if (burger && drawer) {
    burger.addEventListener('click', function () {
      var open = drawer.classList.toggle('is-open');
      burger.classList.toggle('is-open', open);
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      burger.setAttribute('aria-label', open ? '关闭菜单' : '打开菜单');
      if (open) lockScroll(); else unlockScroll();
    });
    drawer.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        drawer.classList.remove('is-open');
        burger.classList.remove('is-open');
        burger.setAttribute('aria-expanded', 'false');
        unlockScroll();
      }
    });
  }

  // 数字滚动
  function animateCount(el) {
    var target = parseFloat(el.getAttribute('data-count') || '0');
    var suffix = el.getAttribute('data-suffix') || '';
    var decimals = parseInt(el.getAttribute('data-decimals') || '0', 10);
    if (!target) return;
    var duration = 1400;
    var start = performance.now();
    function step(now) {
      var p = Math.min(1, (now - start) / duration);
      var eased = 1 - Math.pow(1 - p, 3);
      var v = target * eased;
      var txt = decimals > 0 ? v.toFixed(decimals) : Math.floor(v).toLocaleString('en-US');
      el.textContent = txt + suffix;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  // 滚动渐入 + 数字滚动触发
  if ('IntersectionObserver' in window) {
    var revealIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          revealIO.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });

    // 视口内的元素立即显示，避免首屏闪一下
    var winH = window.innerHeight || document.documentElement.clientHeight;
    document.querySelectorAll('.reveal').forEach(function (el) {
      var rect = el.getBoundingClientRect();
      if (rect.top < winH && rect.bottom > 0) {
        el.classList.add('is-in');
      } else {
        revealIO.observe(el);
      }
    });

    var countIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          countIO.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });
    document.querySelectorAll('[data-count]').forEach(function (el) { countIO.observe(el); });
  } else {
    document.querySelectorAll('.reveal').forEach(function (el) { el.classList.add('is-in'); });
    document.querySelectorAll('[data-count]').forEach(function (el) { animateCount(el); });
  }

  // 收益计算器
  (function () {
    var input = document.getElementById('headcount');
    var range = document.getElementById('headcountRange');
    var outTotal = document.getElementById('outTotal');
    var outFee = document.getElementById('outFee');
    var outNet = document.getElementById('outNet');
    var outRate = document.getElementById('outRate');
    var outUnit = document.getElementById('outUnit');
    if (!input || !outTotal) return;

    var PER_YEAR = 7800;   // 广东省定额
    var YEARS = 3;

    function formatCNY(n) { return '¥ ' + Math.round(n).toLocaleString('zh-CN'); }
    function calc(n) {
      n = Math.max(1, Math.min(500, parseInt(n, 10) || 1));
      var total = n * PER_YEAR * YEARS;
      // 按指令动态费率：1–29 人 30%，30–49 人 25%，50 人及以上 20%
      var feeRate = n >= 50 ? 0.20 : (n >= 30 ? 0.25 : 0.30);
      var fee = total * feeRate;
      var net = total - fee;
      return { n: n, total: total, fee: fee, net: net, rate: feeRate };
    }
    function render(r) {
      outTotal.textContent = formatCNY(r.total);
      outNet.textContent = formatCNY(r.net);
      if (outFee) outFee.textContent = formatCNY(r.fee) + '（' + Math.round(r.rate * 100) + '%）';
      if (outRate) outRate.textContent = Math.round(r.rate * 100) + '%';
      if (outUnit) outUnit.textContent = r.n + ' 人 × 7,800 元/年 × 3 年';
    }
    var initial = calc(input.value);
    render(initial);

    input.addEventListener('input', function () {
      var n = parseInt(input.value, 10) || 1;
      if (range) range.value = Math.min(200, Math.max(1, n));
      render(calc(n));
    });
    if (range) {
      range.addEventListener('input', function () {
        input.value = range.value;
        render(calc(range.value));
      });
    }
    document.querySelectorAll('.calc__btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var step = parseInt(btn.getAttribute('data-step') || '0', 10);
        var n = (parseInt(input.value, 10) || 1) + step;
        n = Math.max(1, Math.min(500, n));
        input.value = n;
        if (range) range.value = Math.min(200, Math.max(1, n));
        render(calc(n));
      });
    });
  })();

  // 案例灯箱（dialog）：原地打开、点击图片/背景/× 关闭，滚动位置全程保持
  (function () {
    var lb = document.getElementById('lightbox');
    var lbImg = document.getElementById('lightboxImg');
    var lbCap = document.getElementById('lightboxCap');
    var lbClose = document.getElementById('lightboxClose');
    if (!lb || !lbImg) return;
    function openLB(src, cap) {
      if (!src) return;
      lbImg.onerror = function () { closeLB(); };
      lbImg.src = src;
      lbImg.alt = cap || '';
      if (lbCap) lbCap.textContent = cap || '';
      if (typeof lb.showModal === 'function') { if (!lb.open) lb.showModal(); }
      else { lb.setAttribute('open', ''); }
      lockScroll();
    }
    function closeLB() {
      if (typeof lb.close === 'function') { if (lb.open) lb.close(); }
      else { lb.removeAttribute('open'); }
      unlockScroll();
    }
    /* —— 注入服务卡片「📄 政策依据」标签：读取卡片所在 tier 容器的 data-policy / data-policy-cap，
       在每个 .card 顶部插入按钮（带 data-case，复用下方灯箱绑定）。必须在 [data-case] 绑定之前执行。 —— */
    document.querySelectorAll('[data-policy]').forEach(function (sec) {
      var src = sec.getAttribute('data-policy');
      var cap = sec.getAttribute('data-policy-cap') || '政策依据';
      if (!src) return;
      sec.querySelectorAll('.card').forEach(function (card) {
        if (card.querySelector('.card-policy-tag')) return;
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'mini-tag mini-tag--brand card-policy-tag';
        btn.setAttribute('data-case', src);
        btn.setAttribute('data-cap', cap);
        btn.textContent = '📄 政策依据';
        card.insertBefore(btn, card.firstChild);
      });
    });

    document.querySelectorAll('[data-case]').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        openLB(btn.getAttribute('data-case') || '', btn.getAttribute('data-cap') || '');
      });
    });
    if (lbClose) lbClose.addEventListener('click', function (e) { e.preventDefault(); closeLB(); });
    // 点击图片本身 = 收起（cursor: zoom-out）
    lbImg.addEventListener('click', function () { closeLB(); });
    if (lb) {
      lb.addEventListener('click', function (e) { if (e.target === lb) closeLB(); });
      lb.addEventListener('cancel', function () { unlockScroll(); });
      lb.addEventListener('close', function () {
        unlockScroll();
        if (lbImg) { lbImg.src = ''; lbImg.onerror = null; }
      });
    }
  })();

  // FAQ 折叠
  document.querySelectorAll('.faq__q').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var item = btn.closest('.faq__item');
      if (item) item.classList.toggle('is-open');
    });
  });

  // 平滑锚点滚动
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var href = a.getAttribute('href');
      if (!href || href === '#' || href.length < 2) return;
      var target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      var top = target.getBoundingClientRect().top + window.scrollY - 76;
      window.scrollTo({ top: top, behavior: 'smooth' });
    });
  });
})();
