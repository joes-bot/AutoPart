/* ============================================================
   伍壹零 · 图片清单（手工维护）
   ============================================================
   ▍如何添加一张案例 / 凭证图片：
   1. 把图片文件放进 assets/img/cases/（建议 jpg，宽度 ≥600px）
   2. 在下方对应数组的末尾，按格式复制一行并修改：

      { src: 'assets/img/cases/新图片.jpg', title: '⑩ 某某企业', amount: '¥ 金额', tag: '行业', cap: '放大后显示的说明文字' },

   3. 无金额的凭证可省略 amount；保存刷新即可，网格自动重排。

   ▍合作伙伴标识：不需要改这个文件。
   把 logo-01.png、logo-02.png …（两位数编号，必须连续）
   放进 assets/img/partners/ 即可自动上墙。
   ============================================================ */

window.GALLERY = {

  /* CASE 01 · 税务审核通知（重点群体税收优惠） */
  tax: [
    { tag: '科技', src: 'assets/img/cases/case-01.jpg', title: '① 某科技企业',     amount: '¥ 14,950',  cap: '① 某科技企业 · 14,950 元 · 重点群体税收优惠' },
    { tag: '技术服务', src: 'assets/img/cases/case-02.jpg', title: '② 某技术服务企业', amount: '¥ 18,209',  cap: '② 某技术服务企业 · 18,209 元 · 重点群体税收优惠' },
    { tag: '检测科技', src: 'assets/img/cases/case-03.jpg', title: '③ 某检测科技企业', amount: '¥ 24,700',  cap: '③ 某检测科技企业 · 24,700 元 · 重点群体税收优惠' },
    { tag: '食品制造', src: 'assets/img/cases/case-04.jpg', title: '④ 某食品制造企业', amount: '¥ 18,850',  cap: '④ 某食品制造企业 · 18,850 元 · 重点群体税收优惠' },
    { tag: '餐饮', src: 'assets/img/cases/case-05.jpg', title: '⑤ 某餐饮企业',     amount: '¥ 14,950',  cap: '⑤ 某餐饮企业 · 14,950 元 · 重点群体税收优惠' },
    { tag: '保安服务', src: 'assets/img/cases/case-06.jpg', title: '⑥ 某保安服务企业', amount: '¥ 15,750',  cap: '⑥ 某保安服务企业 · 15,750 元 · 重点群体税收优惠' },
    { tag: '制造', src: 'assets/img/cases/case-07.jpg', title: '⑦ 某制造企业',     amount: '¥ 29,900',  cap: '⑦ 某制造企业 · 29,900 元 · 重点群体税收优惠' },
    { tag: '保安服务', src: 'assets/img/cases/case-08.jpg', title: '⑧ 某保安服务企业', amount: '¥ 35,100',  cap: '⑧ 某保安服务企业 · 35,100 元 · 重点群体税收优惠' },
    { tag: '科技 · 11 人', src: 'assets/img/cases/case-09.jpg', title: '⑨ 某科技公司 · 11 人', amount: '¥ 100,300', cap: '⑨ 某科技公司 · 11 名重点群体人员 × 人均 9,118 元 · 合计约 100,300 元' }
  ],

  /* CASE 02 · 退税到账银行回单 */
  bank: [
    { src: 'assets/img/cases/bank-01.jpg', title: '退税到账 · 凭证 1', cap: '退税到账银行回单 · 凭证 1' },
    { src: 'assets/img/cases/bank-02.jpg', title: '退税到账 · 凭证 2', cap: '退税到账银行回单 · 凭证 2' }
  ],

  /* CASE 03 · 在执行项目 */
  recent: [
    { src: 'assets/img/cases/recent-01.jpg', title: '在途 · 凭证 1', cap: '2026 在途项目 · 凭证 1' },
    { src: 'assets/img/cases/recent-02.jpg', title: '在途 · 凭证 2', cap: '2026 在途项目 · 凭证 2' },
    { src: 'assets/img/cases/recent-03.jpg', title: '在途 · 凭证 3', cap: '2026 在途项目 · 凭证 3' },
    { src: 'assets/img/cases/recent-04.jpg', title: '在途 · 凭证 4', cap: '2026 在途项目 · 凭证 4' },
    { src: 'assets/img/cases/recent-05.jpg', title: '在途 · 凭证 5', cap: '2026 在途项目 · 凭证 5' }
  ],

  /* CASE 04 · 大额中央资金项目（缩略图，点击放大查看） */
  project: [
    { src: 'assets/img/cases/project-jiangxi.jpg', title: '城市更新项目实景', amount: '中央预算内资金 + 超长期特别国债', cap: '城市更新项目实景 · 中央预算内资金 + 超长期特别国债' }
  ]
};
