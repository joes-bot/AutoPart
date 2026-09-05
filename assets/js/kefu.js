/* ============================================================
   伍壹零 · 在线实时客服组件（v8.2）
   - 悬浮按钮 + 聊天面板，全站可用（动态注入 DOM，无需改页面结构）
   - 510 Bot：本地规则引擎，常见问题秒级应答（纯前端，无后端依赖）
   - 人工转接：联动企业微信「微信客服」
     ▶ 使用方法（二选一，填一项即可生效）：
       1) 在企业微信管理后台「微信客服 → 客服账号」复制客服链接，
          填入下方 url（形如 https://work.weixin.qq.com/kfid/kfcxxxxxxxx）。
          微信内点击直接拉起客服会话；浏览器内打开二维码页。
       2) 若已接入微信 JS-SDK，填 corpId 与 kfId，微信内走
          wx.openCustomerServiceChat 拉起原生客服。
     ▶ 两项均未配置时，自动降级为「拨打 400 热线」引导。
   - 视觉：延续 v8 浅色科技风（渐变描边 / HUD 光点 / 打字机指示）
   ============================================================ */
(function () {
  'use strict';

  /* ======== ★ 企业微信客服配置（上线前填写） ★ ======== */
  var WECHAT_KEFU = {
    url: 'https://work.weixin.qq.com/kfid/kfc02f7eaeed1e76135',     // 例：'https://work.weixin.qq.com/kfid/kfcxxxxxxxxxxxx'
    corpId: '',  // 企业微信 CorpID（可选，配合 JS-SDK）
    kfId: ''     // 微信客服 ID（可选，配合 JS-SDK）
  };
  var HOTLINE = '400-6-020-510';
  var HOTLINE_TEL = 'tel:4006020510';
  /* ==================================================== */

  if (document.getElementById('kfFab')) return; // 防重复注入

  var inWeChat = /MicroMessenger/i.test(navigator.userAgent);

  /* ---------- 1. 构建样式锚点 ---------- */
  var link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = (document.querySelector('script[src*="kefu.js"]') ? '' : '') + 'assets/css/kefu.css';
  document.head.appendChild(link);

  /* ---------- 2. 注入 DOM ---------- */
  var wrap = document.createElement('div');
  wrap.id = 'kfFab';
  wrap.innerHTML =
    '<button class="kf-fab__btn" id="kfFabBtn" type="button" aria-label="打开在线客服">' +
      '<svg width="27" height="27" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
        '<path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"/>' +
      '</svg>' +
      '<span class="kf-fab__badge"><i></i>在线</span>' +
    '</button>' +
    '<div class="kf-panel" id="kfPanel" role="dialog" aria-label="在线客服" aria-hidden="true">' +
      '<div class="kf-head">' +
        '<div class="kf-head__avatar">' +
          '<svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="7" width="16" height="12" rx="3"/><path d="M12 7V4M8 4h8"/><circle cx="9" cy="13" r="1" fill="currentColor" stroke="none"/><circle cx="15" cy="13" r="1" fill="currentColor" stroke="none"/></svg>' +
        '</div>' +
        '<div class="kf-head__meta">' +
          '<div class="kf-head__title">510 智能客服</div>' +
          '<div class="kf-head__sub"><i></i>AI 秒级应答 · 企业微信人工在线</div>' +
        '</div>' +
        '<button class="kf-head__human" id="kfHuman" type="button">转人工</button>' +
        '<button class="kf-head__close" id="kfClose" type="button" aria-label="关闭客服窗口">' +
          '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>' +
        '</button>' +
      '</div>' +
      '<div class="kf-body" id="kfBody"></div>' +
      '<div class="kf-chips" id="kfChips"></div>' +
      '<form class="kf-foot" id="kfForm">' +
        '<input class="kf-foot__input" id="kfInput" type="text" placeholder="输入您的问题，如：能领多少补贴？" autocomplete="off" />' +
        '<button class="kf-foot__send" type="submit" aria-label="发送">' +
          '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4 20-7z"/></svg>' +
        '</button>' +
      '</form>' +
    '</div>';
  document.body.appendChild(wrap);

  var panel = document.getElementById('kfPanel');
  var body = document.getElementById('kfBody');
  var chipsBox = document.getElementById('kfChips');
  var input = document.getElementById('kfInput');
  var form = document.getElementById('kfForm');
  var fabBtn = document.getElementById('kfFabBtn');

  /* ---------- 3. 消息渲染 ---------- */
  function scrollBottom() { body.scrollTop = body.scrollHeight; }

  function addMsg(html, who) {
    var div = document.createElement('div');
    div.className = 'kf-msg' + (who === 'user' ? ' kf-msg--user' : ' kf-msg--bot');
    div.innerHTML = html;
    body.appendChild(div);
    scrollBottom();
    return div;
  }

  function addTyping() {
    var div = document.createElement('div');
    div.className = 'kf-msg kf-msg--bot kf-msg--typing';
    div.innerHTML = '<span class="kf-dot"></span><span class="kf-dot"></span><span class="kf-dot"></span>';
    body.appendChild(div);
    scrollBottom();
    return div;
  }

  function botReply(html, delay) {
    var t = addTyping();
    setTimeout(function () {
      t.remove();
      addMsg(html, 'bot');
    }, delay || 650);
  }

  /* ---------- 4. 快捷问题 ---------- */
  var CHIPS = ['能领多少补贴', '怎么收费', '服务流程', '需要什么材料', '政策依据', '转人工客服'];
  CHIPS.forEach(function (c) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'kf-chip';
    b.textContent = c;
    b.addEventListener('click', function () { ask(c); });
    chipsBox.appendChild(b);
  });

  /* ---------- 5. 规则引擎（常见问题 → 秒级应答） ---------- */
  var RULES = [
    { k: /补贴|金额|能拿|能领|领多少|多少钱.*(补贴|领)/, a: '按广东省现行标准，招用 <strong>1 名</strong>重点群体人员（脱贫人口、登记失业半年以上人员、退役军人等），每年可扣减税费 <strong class="kf-gold">7,800 元</strong>，最长 <strong>3 年</strong>、按人头累计。<br/>例：招用 10 人，3 年最高可减 <strong class="kf-gold">¥ 23.4 万</strong>。<br/>把参保人数告诉我们，<strong>最快 24 小时</strong>出专属初评报告。' },
    { k: /收费|费用|价格|付费|服务费|佣金|抽成/, a: '我们是<strong>「补贴到账后付费」</strong>模式——<strong class="kf-gold">不到账，不收一分钱</strong>。<br/>服务费在补贴实际到账后按签约方案收取，规模越大费率越优（30 人以上费率下调）。' },
    { k: /流程|怎么.*办|怎么.*做|如何.*申报|步骤/, a: '全程只需 <strong>3 步</strong>：<br/>① 您提供最近一个月社保参保名单（不碰敏感材料）；<br/>② <strong>24 小时</strong>内出政策匹配初评报告；<br/>③ 确认合作后我们全程代办，<strong>补贴到账后再付费</strong>。<br/>材料我来整、流程我来跑、结果我来说。' },
    { k: /材料|资料|需要.*什么|准备/, a: '筛查阶段<strong>只需要参保人数或社保名单</strong>，不需要财务报表、不需要员工敏感信息；正式申报阶段所需的营业执照等基础材料，管家会列清单逐项指导。' },
    { k: /政策|依据|文件|红头|粤财税/, a: '政策原文站内可查、官方可溯源：<br/>· 财政部等四部门公告 2023 年第 <strong>15 号</strong><br/>· <strong>粤财税〔2023〕34 号</strong>（广东省定额 7,800/9,000 元）<br/>执行期至 <strong>2027-12-31</strong>。可在「首页 → 政策溯源」点击查看官网原文截图。' },
    { k: /电话|联系|热线|400/, a: '服务热线：<strong class="kf-gold">' + HOTLINE + '</strong><br/>工作日 9:00–18:00；也可直接<a class="kf-link" href="' + HOTLINE_TEL + '">点击拨打</a>，或提交<a class="kf-link" href="contact.html">在线免费诊断</a>。' },
    { k: /地址|在哪|哪里|上门|拜访/, a: '公司地址：广州市荔湾区广州国际智能科技园（岭南 V 谷）<strong>B3 栋一楼</strong>。<br/>欢迎预约到访，也可先在线免费诊断。' },
    { k: /高企|高新|资质|专精特新/, a: '资质认定是我们的五大服务方向之一：国家高新技术企业认定后，企业所得税<strong class="kf-gold">减按 15%</strong> 征收，同时也是多数奖补与招投标的前置门槛。<br/>详情见「服务能力」页。' },
    { k: /风险|合规|稽查|安全/, a: '申报前我们会同步做一轮<strong>财税合规体检</strong>，把风险挡在递交之前；重点人员资格按月核对（全国防返贫监测信息系统动态比对），确保申报、退回、滞纳金风险全程可控。' }
  ];
  var HUMAN_INTENT = /人工|客服|真人|找人来|转接|咨询顾问/;

  function goHuman() {
    botReply('正在为您接入<strong>企业微信人工客服</strong>…', 500);
    setTimeout(function () {
      if (WECHAT_KEFU.url) {
        // 微信内 / 手机端：必须用当前页跳转拉起客服（window.open 会被微信拦截）
        // 电脑端：新窗口打开（展示扫码页）
        var isMobile = /Mobile|Android|iPhone|iPad/i.test(navigator.userAgent);
        if (inWeChat || isMobile) { window.location.href = WECHAT_KEFU.url; }
        else { window.open(WECHAT_KEFU.url, '_blank'); }
        addMsg('已打开企业微信客服窗口：微信内点击可直接进入会话；电脑浏览器请用微信扫码。<br/>着急的话也可直接拨打 <a class="kf-link" href="' + HOTLINE_TEL + '"><strong>' + HOTLINE + '</strong></a>。', 'bot');
      } else if (inWeChat && WECHAT_KEFU.corpId && WECHAT_KEFU.kfId && typeof window.wx !== 'undefined' && wx.openCustomerServiceChat) {
        try {
          wx.openCustomerServiceChat({
            extInfo: { url: WECHAT_KEFU.url || '' },
            corpId: WECHAT_KEFU.corpId,
            kfId: WECHAT_KEFU.kfId
          });
        } catch (e) { phoneFallback(); }
      } else {
        phoneFallback();
      }
    }, 900);
  }
  function phoneFallback() {
    addMsg('人工客服通道即将开放，当前可先拨打服务热线 <a class="kf-link" href="' + HOTLINE_TEL + '"><strong class="kf-gold">' + HOTLINE + '</strong></a>（工作日 9:00–18:00），或<a class="kf-link" href="contact.html">提交在线免费诊断</a>，顾问将在 24 小时内回电。', 'bot');
  }

  function ask(text) {
    addMsg(text.replace(/</g, '&lt;'), 'user');
    if (HUMAN_INTENT.test(text)) { goHuman(); return; }
    for (var i = 0; i < RULES.length; i++) {
      if (RULES[i].k.test(text)) { botReply(RULES[i].a); return; }
    }
    botReply('这个问题我记下来啦，为了让您得到更准确的答复，可以：<br/>· 拨打服务热线 <a class="kf-link" href="' + HOTLINE_TEL + '"><strong>' + HOTLINE + '</strong></a><br/>· <button type="button" class="kf-inline-human" id="kfInlineHuman">转企业微信人工客服 →</button><br/>也可以先留下企业人数，我们为您做<strong>免费政策初评</strong>。');
    setTimeout(function () {
      var b = document.getElementById('kfInlineHuman');
      if (b) b.addEventListener('click', goHuman);
    }, 750);
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var v = (input.value || '').trim();
    if (!v) return;
    input.value = '';
    ask(v);
  });

  document.getElementById('kfHuman').addEventListener('click', function () {
    ask('转人工客服');
  });

  /* ---------- 6. 开关面板 ---------- */
  function openPanel() {
    panel.classList.add('is-open');
    panel.setAttribute('aria-hidden', 'false');
    fabBtn.classList.add('is-active');
    if (!body.children.length) {
      botReply('您好，我是伍壹零智能助手 <strong>510 Bot</strong> 🤖<br/>补贴金额、收费标准、申报流程——常见问题我都能秒答；点击下方快捷问题，或直接输入您的问题。', 400);
      setTimeout(function () {
        addMsg('想直接找顾问？点击右上角<strong>「转人工」</strong>即可接入企业微信客服，或拨打 <a class="kf-link" href="' + HOTLINE_TEL + '"><strong>' + HOTLINE + '</strong></a>。', 'bot');
      }, 1400);
    }
    setTimeout(function () { try { input.focus({ preventScroll: true }); } catch (e) {} }, 350);
  }
  function closePanel() {
    panel.classList.remove('is-open');
    panel.setAttribute('aria-hidden', 'true');
    fabBtn.classList.remove('is-active');
  }
  fabBtn.addEventListener('click', function () {
    panel.classList.contains('is-open') ? closePanel() : openPanel();
  });
  document.getElementById('kfClose').addEventListener('click', closePanel);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && panel.classList.contains('is-open')) closePanel();
  });
})();
