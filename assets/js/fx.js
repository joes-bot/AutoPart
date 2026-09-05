/* ============================================================
   伍壹零 · 高科技动效脚本（v8，仅首页引用）
   - Hero 粒子网络画布：浅色系淡蓝粒子 + 连线，离屏自动暂停
   - AI 政策匹配控制台：滚动触发「扫描 → 命中 → 报告生成」循环演算
   - 尊重 prefers-reduced-motion：全部动效自动降级为静态
   ============================================================ */
(function () {
  'use strict';

  var reduced = false;
  try { reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}

  /* ---------- 1. Hero 粒子网络 ---------- */
  (function particleNet() {
    var canvas = document.getElementById('fxCanvas');
    if (!canvas || reduced || !canvas.getContext) return;

    var ctx = canvas.getContext('2d');
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var W = 0, H = 0, pts = [], running = false, raf = 0;

    function resize() {
      var rect = canvas.getBoundingClientRect();
      W = rect.width; H = rect.height;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // 粒子密度随面积自适应，控制在 26–70 个
      var count = Math.max(26, Math.min(70, Math.round(W * H / 16000)));
      pts = [];
      for (var i = 0; i < count; i++) {
        pts.push({
          x: Math.random() * W,
          y: Math.random() * H,
          vx: (Math.random() - 0.5) * 0.35,
          vy: (Math.random() - 0.5) * 0.35,
          r: 1.2 + Math.random() * 1.8
        });
      }
    }

    var LINK = 130; // 连线阈值 px
    function draw() {
      ctx.clearRect(0, 0, W, H);
      var i, j, p, q, dx, dy, dist;

      for (i = 0; i < pts.length; i++) {
        p = pts[i];
        p.x += p.vx; p.y += p.vy;
        if (p.x < -10) p.x = W + 10; else if (p.x > W + 10) p.x = -10;
        if (p.y < -10) p.y = H + 10; else if (p.y > H + 10) p.y = -10;
      }

      // 连线
      for (i = 0; i < pts.length; i++) {
        for (j = i + 1; j < pts.length; j++) {
          p = pts[i]; q = pts[j];
          dx = p.x - q.x; dy = p.y - q.y;
          dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < LINK) {
            ctx.strokeStyle = 'rgba(2,132,199,' + (0.16 * (1 - dist / LINK)).toFixed(3) + ')';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.stroke();
          }
        }
      }
      // 粒子
      for (i = 0; i < pts.length; i++) {
        p = pts[i];
        ctx.fillStyle = 'rgba(2,132,199,0.28)';
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      if (running) raf = requestAnimationFrame(draw);
    }

    function start() {
      if (running) return;
      running = true;
      raf = requestAnimationFrame(draw);
    }
    function stop() {
      running = false;
      if (raf) cancelAnimationFrame(raf);
    }

    resize();
    window.addEventListener('resize', resize, { passive: true });

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        entries[0].isIntersecting ? start() : stop();
      }, { threshold: 0.02 }).observe(canvas);
    } else {
      start();
    }
    document.addEventListener('visibilitychange', function () {
      document.hidden ? stop() : start();
    });
  })();

  /* ---------- 2. AI 政策匹配控制台 ---------- */
  (function aiConsole() {
    var box = document.getElementById('aiConsole');
    if (!box || reduced) {
      // 静态降级：直接展示全部结果
      if (box) {
        box.querySelectorAll('.ai-match__item').forEach(function (el) { el.classList.add('is-in'); });
        var bar = box.querySelector('.ai-console__progress-track i');
        var label = box.querySelector('.ai-console__progress-label');
        if (bar) bar.style.width = '100%';
        if (label) label.textContent = '100% 已完成';
      }
      return;
    }

    var scanEl = document.getElementById('fxScanCount');
    var line2 = document.getElementById('fxLine2');
    var items = box.querySelectorAll('.ai-match__item');
    var bar = box.querySelector('.ai-console__progress-track i');
    var label = box.querySelector('.ai-console__progress-label');
    var started = false;
    var timers = [];

    function clearTimers() { timers.forEach(clearTimeout); timers = []; }
    function later(fn, ms) { timers.push(setTimeout(fn, ms)); }

    function countUp(el, target, dur) {
      var t0 = performance.now();
      (function step(now) {
        var p = Math.min(1, (now - t0) / dur);
        el.textContent = Math.floor(target * (1 - Math.pow(1 - p, 3))).toLocaleString('zh-CN');
        if (p < 1) requestAnimationFrame(step);
      })(t0);
    }

    function run() {
      clearTimers();
      // 重置
      items.forEach(function (el) { el.classList.remove('is-in'); });
      if (bar) bar.style.width = '0%';
      if (label) label.textContent = '0% 匹配中';
      if (line2) line2.classList.add('cursor-blink');

      // 第一步：政策库扫描计数
      later(function () {
        if (scanEl) countUp(scanEl, 12847, 1500);
      }, 200);

      // 第二步：名单解析完成 → 摘掉光标
      later(function () {
        if (line2) line2.classList.remove('cursor-blink');
      }, 1900);

      // 第三步：命中项逐条弹出（交叉推进进度条）
      var delays = [2200, 3100, 4000, 4900];
      var widths = [28, 55, 78, 100];
      delays.forEach(function (d, i) {
        later(function () {
          if (items[i]) items[i].classList.add('is-in');
          if (bar) bar.style.width = widths[i] + '%';
          if (label) label.textContent = i === 3 ? '100% 已完成' : widths[i] + '% 匹配中';
        }, d);
      });

      // 第四步：停留后循环
      later(run, 10500);
    }

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries, io) {
        if (entries[0].isIntersecting && !started) {
          started = true;
          io.unobserve(box);
          run();
        }
      }, { threshold: 0.3 }).observe(box);
    } else {
      run();
    }
    document.addEventListener('visibilitychange', function () {
      if (started && !document.hidden && !timers.length) run();
    });
  })();
})();
