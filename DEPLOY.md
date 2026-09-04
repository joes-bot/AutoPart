# 部署指南：广州伍壹零信息技术有限公司官网

> **目标**：把 `site/` 目录里这个静态站点，用最低成本、长期可维护地托管到腾讯云上。
> 你的账号里**只有 COS 是有效的**，其他云服务都过期了——这恰好是这种官网最合适的产品。

---

## 0. 选型一览（为什么是它）

| 产品 | 用途 | 月成本（首年预估） | 备注 |
|---|---|---|---|
| 腾讯云 **COS**（对象存储） | 放静态文件 + 静态网站托管 | **≈ 0 元起**（≤10 GB） | 你已开通 |
| 腾讯云 **CDN** | 国内加速 + HTTPS + 自定义域名 | **每月赠送 10 GB 流量**，超出 0.18 元/GB | 备案后开启 |
| 域名（**`.cn` / `.com`**） | 网址入口 | `≈ 30-80 元/年` | 腾讯云直接注册 |
| 备案服务码 | 备案前提 | `≈ 10-30 元/个` | 一次性 |
| **合计** |  | **≤ 100 元 / 年**（基础包） | 中小流量几乎零运营成本 |

> 不需要买 CVM / 轻量服务器，**只买域名 + 用 COS 静态网站 + CDN**。

---

## 1. 注册 / 找回域名（必须先做）

> 域名是入口，没有它网站无法访问。

1. 进入 [腾讯云域名注册](https://console.cloud.tencent.com/domain)，登录你的腾讯云账号。
2. 搜索想用的域名。推荐选择：
   - **`gzwyl.cn`** —— 拼音首字母 + 行业（`gz 510.cn` 备选）
   - **`wuyiling.cn`**
   - **`gzwyl.com`** —— 国际域名，SEO 友好
3. 加入购物车 → 付款 → 实名认证（个人 / 企业均可，**企业主体后续备案更顺**）。
4. **.cn 首年约 29-35 元，.com 首年约 60-78 元**（新用户有活动价更便宜）。
5. 注册完成后，进入「域名管理」确认状态为「正常」。

> **小贴士**：先想好主域名（用哪个就放哪里），建议 `.cn` 主用 + `.com` 301 跳转，长期对企业形象、SEO 都好。

---

## 2. 备案（大陆访问 → 必做，香港/海外免做）

> 关键：你之前备案可能已失效，**重新走一遍流程**。

### 2.1 备案的前提条件（你目前的卡点）

腾讯云备案必须有一项：
- **方案 A**：账号下有 ≥ 3 个月的包年包月云服务器（CVM / 轻量）
- **方案 B**：账号下有「**备案服务码**」

> 你的服务器已过期，所以走 **方案 B**。

### 2.2 获取备案服务码（最便宜的合规路径）

进入 [腾讯云备案控制台](https://console.cloud.tencent.com/beian) → 「**备案授权码**」→ 点击「**生成授权码**」。

- 提示"没有可用云服务"——证明你账号名下没有符合条件的服务器。
- 两种解决方式：
  1. **官方购买备案服务码**：搜索「腾讯云 备案服务码 购买」，价格约 **10-30 元/个**（一次性）。
  2. **第三方代购**：搜"腾讯云 备案授权码"，注意选择信誉商家，**价格更便宜**。
- 拿到一串「备案授权码」，进入下一步。

### 2.3 提交备案申请

1. 在 [备案小程序](https://cloud.tencent.com/product/ba) 或 PC 端 [我的备案](https://console.cloud.tencent.com/beian) 点「**新增网站**」。
2. **主体信息**：填写「广州伍壹零信息技术有限公司」（营业执照号、社会信用代码、法定代表人、应急电话等）。
3. **网站信息**：
   - 网站名称：`广州伍壹零信息技术有限公司` 或 `伍壹零企业服务`
   - 域名：填你刚注册的（如 `gzwyl.cn` 和 `www.gzwyl.cn`）
   - 云服务：选「**备案授权码**」→ 粘贴 2.2 拿到的码
4. 上传材料：
   - 营业执照
   - 法人身份证（正反面）
   - 《网站备案真实性核验单》（系统生成，下载打印，法人签字 + 盖章后拍照上传）
5. 提交初审 → 腾讯云 1-2 个工作日审核 → 工信部短信核验 → 管局审核 7-20 天。
6. **审核通过**后，备案号会下发。

> **时间预估**：顺利的话 7-15 天完成。

### 2.4 备案期间你能做什么

- **先把网站文件上传到 COS**（第 3 步），拿到一个腾讯云的临时访问链接（如 `https://xxx-12345.cos-website.ap-guangzhou.myqcloud.com`）。
- 这个临时链接**只在备案审核期间用于自己/客户预览**，不要对外宣传。
- 也可以用 **GitHub Pages / Netlify / Vercel** 临时托管用来内部预览（**零成本、不需备案**），但微信/百度收录不便。

---

## 3. 创建 COS 存储桶 + 上传文件

### 3.1 创建桶

1. 进入 [对象存储 COS 控制台](https://console.cloud.tencent.com/cos/bucket) → 「**创建存储桶**」。
2. 关键配置：
   - **名称**：`wuyiling-www`（自定义，3-63 字符，小写字母数字 -）
   - **地域**：**广州（ap-guangzhou）**—— 国内访问最快，备案后可绑自定义域名
   - **访问权限**：**公有读私有写**（必须！否则网站访问不到）
   - 其他默认。
3. 创建后进入桶 → 左侧「**基础配置**」→ 「**静态网站**」→ 「**编辑**」→ 开启：
   - 索引文档：`index.html`
   - 错误文档：`404.html`
   - 强制 HTTPS：**开启**

### 3.2 上传文件

1. 进入桶 → 「**文件列表**」→ 「**上传文件**」→ 「**上传文件夹**」。
2. 选择本仓库的 `site/` 整个目录上传。
   - 也可用 [COSBrowser 客户端](https://cloud.tencent.com/document/product/436/11365) 拖拽上传，效率更高。
   - 进阶：可用 `coscmd` / `coscli` 命令行工具做自动化部署，参考 [腾讯云文档](https://cloud.tencent.com/document/product/436/10976)。

### 3.3 测试临时访问

- 在「**静态网站**」配置里，复制「**访问节点**」链接，形如：
  ```
  https://wuyiling-www-1234567890.cos-website.ap-guangzhou.myqcloud.com
  ```
- 浏览器打开，应能看到网站。
- 移动端：在手机浏览器打开同一链接即可测试响应式。

---

## 4. 绑定自定义域名 + CDN + HTTPS（备案完成后）

> 这一步让网站能用 `www.gzwyl.cn` 访问，并启用 CDN 加速 + 免费 HTTPS。

### 4.1 绑定自定义域名

1. COS 桶 → 「**域名管理**」→ 「**自定义源站域名**」→ 「**添加域名**」：
   - 域名：`www.gzwyl.cn`（先加 www，主域留作 301 跳转）
   - 加速类型：**静态加速**（CDN）
   - 强制 HTTPS：**开启**
   - 源站类型：**COS 源站**（自动选当前桶）
2. 系统会提示「**需要先开通 CDN**」→ 一键开通。
3. 复制系统分配的 **CNAME 值**（形如 `wuyiling-www-12345.cdn.dnsv1.com`），下一步用。

### 4.2 DNS 解析

1. 进入 [DNSPod / 腾讯云解析](https://console.cloud.tencent.com/domain) → 选中 `gzwyl.cn` → 添加记录：
   | 主机记录 | 记录类型 | 记录值 | 备注 |
   |---|---|---|---|
   | `www` | CNAME | `wuyiling-www-12345.cdn.dnsv1.com.` | 主访问 |
   | `@` | URL 转发 | `https://www.gzwyl.cn` | 根域跳 www（301 永久） |
2. 等待 DNS 生效（通常 5-30 分钟），可用 `nslookup www.gzwyl.cn` 验证。

### 4.3 配置 CDN HTTPS

1. 进入 [CDN 控制台](https://console.cloud.tencent.com/cdn) → 域名列表 → 找到 `www.gzwyl.cn`。
2. 「**高级设置**」→ 「**HTTPS 配置**」：
   - 申请免费证书（TrustAsia DV）→ 1-10 分钟签发
   - 「**强制跳转 HTTPS**」：**开启**
   - 「**HTTP 2.0**」：**开启**
   - 「**HTTPS 回源**」：**开启**
3. 「**回源配置**」→ 确认回源是「**COS 源站**」。

### 4.4 配置 404 / 缓存策略

1. 「**缓存配置**」→ 高级缓存过期设置，添加：
   - `*.html` → 0 秒（不缓存，每次回源，方便实时更新）
   - `*.css, *.js` → 1 天
   - `*.jpg, *.png, *.svg, *.webp` → 30 天
   - `/` → 0 秒
2. 「**错误码配置**」→ 添加 `404 → /404.html`。

---

## 5. 上线检查清单

完成后逐条勾选：

- [ ] 浏览器访问 `https://www.gzwyl.cn` 正常打开，首屏 < 2s
- [ ] 手机访问 `https://www.gzwyl.cn` 排版正常，汉堡菜单可用
- [ ] 顶部导航锚点跳转正常
- [ ] 「收益测算」交互式计算器可用
- [ ] 案例图可点击放大，灯箱可关闭（Esc / 点遮罩 / 右上角）
- [ ] 备案号已在页面底部展示（按工信部要求）
- [ ] 控制台查看 CDN 流量 / COS 存储使用情况
- [ ] 在 [站长工具](https://www.chinaz.com/seo) 提交 sitemap
- [ ] 在 [百度搜索资源平台](https://ziyuan.baidu.com) 验证站点，提交 sitemap

---

## 6. 日常维护 & 更新网站

### 6.1 内容更新（最常用）

**方法 A - COSBrowser**（推荐新手）
1. 安装 [COSBrowser](https://cloud.tencent.com/document/product/436/11365)
2. 登录 → 选桶 → 直接拖拽新文件覆盖 → 完事

**方法 B - 命令行**（推荐进阶）
```bash
# 安装
pip install coscmd
# 配置（在 https://console.cloud.tencent.com/cam/capi 拿 SecretId/SecretKey）
coscmd config -a AKIxxxxxxxxxx -s xxxxxxxxxxxxxxxx -b wuyiling-www-12345 -r ap-guangzhou
# 增量上传（自动跳过未变更文件）
cd site/
coscmd upload -r . /
# 强制刷新 CDN（重要！否则用户看不到更新）
coscmd refresh -u https://www.gzwyl.cn/
```

**方法 C - Git + 自动部署**（推荐有 Git 经验的）
- 把 `site/` 推到 GitHub / Gitee
- 用腾讯云「Coding 持续集成」或 GitHub Actions 自动部署到 COS
- 参考：[CODING HTML COS Demo](https://coding-public.coding.net/public/html-cos-demo/html-cos-demo/git/files)

### 6.2 案例图怎么换

每张图都是 800px 宽、JPEG 质量 82%，单张 25-160KB。
- 把新的图按同样命名规则覆盖上传即可（如 `case-01.jpg`）
- 命名规则见 `site/assets/img/cases/` 目录

### 6.3 替换客服微信二维码

- 当前用的图是 PDF 里附的二维码（`site/assets/img/cases/wechat-qr.jpg`）
- 把它换成你自己的微信二维码（建议生成 ≤ 372×372，< 50KB）

### 6.4 修改文案 / 颜色

- 所有文案在 `site/index.html` 中
- 颜色变量在 `site/assets/css/style.css` 顶部 `:root {}`：
  ```css
  --c-primary: #0B2B5B;  /* 主色 */
  --c-blue:    #1A6FD4;  /* 辅色 */
  --c-accent:  #E8A33D;  /* 强调 */
  ```
  改这一个值，全站联动。

---

## 7. 成本 & 续费

| 项目 | 续费提醒 | 预估年成本 |
|---|---|---|
| 域名（.cn） | 到期前 30 天邮件提醒 | 35-60 元 |
| 域名（.com） | 同上 | 70-85 元 |
| COS 存储 | 包年 0.118 元/GB·月，10 GB 内几乎免费 | 1-15 元 |
| COS 请求 | 极小，可忽略 | 1 元内 |
| CDN 流量 | 月送 10GB 超出 0.18 元/GB | 0-30 元 |
| HTTPS 证书 | 自动续期 | 0 元 |
| **合计** | | **约 100-200 元 / 年** |

> 假设月均 UV 2000，PV 8000，平均单页 2MB，CDN 流量约 16GB → 超出 6GB × 0.18 = 1.08 元/月。

---

## 8. 备案号合规要求（重要！）

备案通过后，按工信部规定，**网站底部必须展示备案号**并链接到工信部：

打开 `site/index.html`，找到 `<footer class="footer">`，在 `footer__bottom` 里第一行加：

```html
<p>
  <a href="https://beian.miit.gov.cn/" target="_blank" rel="noopener" style="color:inherit">
    粤ICP备XXXXXXXX号-1
  </a>
</p>
```

如果做了公安备案，添加：
```html
<p>
  <a href="http://www.beian.gov.cn/portal/registerSystemInfo" target="_blank" rel="noopener" style="color:inherit">
    <img src="/assets/img/gongan.png" alt="" style="height:14px;vertical-align:-2px;margin-right:4px" />
    粤公网安备 XXXXXXXXXXXXX 号
  </a>
</p>
```

---

## 9. 进阶：可选优化

- **多端预览**：用 [PageSpeed Insights](https://pagespeed.web.dev/) 测速，应在 90+
- **SEO 提交**：百度站长 / 360 站长 / Bing Webmaster 全部提交 sitemap
- **数据埋点**：如果想知道有多少访问，加百度统计 / Google Analytics（免费）
- **微信小程序 / 公众号菜单**：把 `https://www.gzwyl.cn` 加到公众号自定义菜单，微信里打开体验最佳
- **HTTPS 升级 HSTS**：在 CDN 配置里开启，避免降级攻击

---

## 10. 常见问题

**Q1：备案期间，网站能访问吗？**
A：可以用 COS 临时访问节点（`xxx.cos-website.ap-guangzhou.myqcloud.com`）给客户预览，但不能用作正式网址。

**Q2：必须用腾讯云的备案服务码吗？**
A：可以用阿里云 / 华为云等其他平台的备案服务码，但跨平台更麻烦。推荐直接腾讯云解决。

**Q3：可以用别的服务器替代备案服务码吗？**
A：可以，买一个 68 元/年的轻量应用服务器（≥3 个月包月）就能生成 2 个备案授权码。1 年实际就是 68 元。

**Q4：网站会被攻击 / 被刷流量吗？**
A：COS + CDN 默认有基础防护。如果担心，按 [防盗刷指引](https://cloud.tencent.com/document/product/436/65282) 配置：
- COS 桶设置「防盗链」（Referer 白名单）
- CDN 设置「访问控制」（IP / UA 黑白名单 / QPS 限速）
- 开启「带宽封顶配置」，超阈值自动下线（推荐设 50-100 Mbps）

**Q5：怎么把 PDF 里的真实凭证图替换成新案例？**
A：照着 `case-01.jpg` 同样的规格（800px 宽、JPEG 质量 82%）做一张图，命名 `case-10.jpg`，再在 `index.html` 里的 `.case-grid` 后面追加一项：
```html
<li><button class="case" data-full="assets/img/cases/case-10.jpg" ...>...</button></li>
```

---

## 11. 联系协助

如果以上任何一步卡住：
- 腾讯云工单：[https://console.cloud.tencent.com/workorder](https://console.cloud.tencent.com/workorder)
- 腾讯云备案服务热线：95711 转 1
- 我们公司客服：180-2719-8522

祝上线顺利。
