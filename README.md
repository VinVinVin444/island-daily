# ✧ 岛屿晨报 · 每日资讯网站

一个响应式静态网站，每天自动展示六个领域的新闻：**AI、GitHub/开源、纳指/投资、数码、国际新闻和 Obsidian 专栏**。面向关注科技动态的读者。

## 先看网页

打开项目里的 `index.html`，可直接看到演示数据（不是实时新闻）。部署后网页自动读取 `data/news.json`，每天呈现最新已发布数据。

## 免费上线：GitHub Pages（推荐）

1. 在 GitHub 新建一个 **Public（公开）仓库**，例如 `island-daily`。GitHub 免费计划通常需要公开仓库才能免费托管 Pages。
2. **解压整个 ZIP**，把文件和文件夹上传到仓库**根目录**，包含隐藏目录 `.github/workflows/daily.yml`。别把 `island-daily-web` 外层文件夹原样套进去。上传后 Commit 到 `main` 分支。
3. 打开仓库 **Settings → Pages → Build and deployment → Source → GitHub Actions**。
4. 打开仓库 **Actions → 更新晨报数据并发布网页 → Run workflow** 手动运行一次。若 `Settings → Actions → General` 的工作流写入权限受限，请允许 Actions 写入内容，以便存储历史简报。
5. 工作流完成后访问：`https://你的GitHub用户名.github.io/island-daily/`（仓库名需替换；也可以从 Pages 页面复制真实地址）。

**定时更新**：工作流每天 UTC 23:00（北京时间次日 07:00）运行。GitHub Actions 定时任务可能延迟，不保证精确在 07:00 更新。GitHub 还可能暂停长期无活动仓库的定时任务，必要时手动重新启用。

## 中文摘要怎么开？

**不配置 API**：免费抓取公开 RSS、显示来源标题/摘要（部分为英语），标记原始发布时间和近期回顾。网站不需要服务器。

**需要通过 API 生成公开新闻的中文摘要**：在仓库 **Settings → Secrets and variables → Actions → New repository secret** 添加：

- Name：`OPENAI_API_KEY`
- Secret：你自己的 OpenAI API 密钥

密钥仅供 GitHub Actions 后端运行，**不要写进任何 HTML/JS 文件或 GitHub 代码**。OpenAI API 按用量计费，和 ChatGPT Plus 订阅不是同一个计费额度。模型默认为 `gpt-4.1-mini`，可在 `.github/workflows/daily.yml` 更换为有权限使用的模型。AI 只根据 RSS 元数据生成摘要，不能替代完整事实核查。

## 数据源

| 领域 | 默认来源 |
|---|---|
| AI | OpenAI 官方 RSS、Google DeepMind、Hugging Face |
| GitHub/开源 | GitHub Changelog、GitHub Blog、Cloudflare Blog |
| 纳指/投资 | BBC Business、CNBC、纽约时报商业 RSS |
| 数码 | The Verge、BBC Technology |
| 全球新闻 | BBC World、BBC Top Stories |
| Obsidian | Obsidian 官方更新日志 `https://obsidian.md/changelog.xml` |

- **Obsidian 专栏每天保留**。如果没有新版本，将回顾最近一次官方发布并注明原发布日期；同时网页固定有官方路线图和开发文档链接。
- 其他领域优先选择最近 24 小时新闻；缺乏重大消息时回顾较近消息并标注。美国股市休市时不会编造收盘行情。
- 默认 RSS 实际可用性会受对方接口、反爬虫、频道调整影响，失败时会保留旧数据。只有足够的来源才能更新，不编造不存在的报道。
- RSS 图片**仅使用来源提供的公开配图链接**；若未提供或拒绝加载则不展示。请注意图片版权和提供者的转载规则。
- 网站显示的是新闻摘要、来源链接及 AI 生成的参考分析，投资数据应以交易所、基金公告为准。

## 往期、搜索、收藏与暗色模式

- 已生成的 JSON 存放在 `data/news.json`。
- 历史简报存放在 `data/archive/YYYY-MM-DD.json`，最多显示最近 120 期。
- 前端支持六大栏目筛选、关键字搜索、暗色模式和浏览器本地收藏（不同设备不同步）。
- 点击右上角 ↻ 是重新下载已发布的数据，并不是实时联网生成一份新新闻。

## 技术实现

- `index.html`：纯静态网页，无前端框架与数据库要求。
- `assets/app.js`：数据展示、筛选、搜索、收藏及历史。
- `assets/seed.js`：仅用于本地打开或网络失败时的演示版新闻。
- `scripts/update_news.py`：按发布时间和分类聚合 RSS，可选调用 OpenAI API 生成中文摘要。
- `.github/workflows/daily.yml`：定时执行、保存 JSON 归档并部署 GitHub Pages。

## 限制与准确性

这是一套**可部署、可运行的自动化模板**，不等于已替你部署到 GitHub，也不等于有专业编辑每日人工审稿。机器按 RSS 信息挑选和归纳新闻，重要事实需要点击原文核实；没有 API 密钥时无法保证中文内容。此项目不会使用现有 ChatGPT 自动任务的内容作为新闻数据：ChatGPT 的定时消息与网页更新是两条独立流程。

## 中文翻译策略（2026-10）

自动更新首先使用公开 RSS 标题和摘要。若仓库配置了 `OPENAI_API_KEY`，会优先生成较完整的中文摘要及个性化影响分析；否则会尽力使用免费的在线翻译服务将英文标题和 RSS 摘要译为中文，**不保证服务可用或翻译完全准确**。第三方翻译接口可能限流、失效，失败时保留英文原文，并显示提示。

与用户相关的内容在新闻顶部优先显示，不依赖外部翻译工具。个性化分析未配置 AI API 时是按领域预设的中文建议，不应视为逐篇新闻的深度人工分析。新闻内容仍应以链接中的原始来源为准。

## 「与你有关」访问密钥（简单模式）

公开仓库内的 `data/access.json` 保存访问码的 SHA-256 哈希，网站只在输入正确访问码后展示 `impact` 字段；访问码本身不会写进源码。**这只是网页显示控制，不是安全加密**：新闻 JSON 仍是公开内容，熟悉浏览器开发者工具的人可以直接读取 `impact`。

每天 ChatGPT 定时简报若有 GitHub 写入权限，可直接将新闻与个人分析更新到 `data/news.json`；无需创建私库。若要更换访问码，计算新密钥的 SHA-256 后替换 `data/access.json` 的 `key_sha256`，再由 GitHub Pages 自动部署。无需在 ChatGPT 聊天中输入新密码。

抓取程序每次最多选择 **25 条**（AI 4、开发 3、市场 4、数码 3、国际 3、Obsidian 最多 8），缺少合格新闻不填充虚假条目。RSS 抓取的新新闻没有个性化分析时不会自动补造固定建议。


## 网站内手动更新新闻

新增 `立即采集新新闻` 功能：使用 `UPDATE_PASSWORD` 在网页内发送 `POST https://island-daily-refresh.evinvin486.workers.dev/refresh`，由 Cloudflare Worker 在服务端验证密码后，携带 Worker Secret `GITHUB_TOKEN` 调用 GitHub REST `workflow_dispatch`，触发仓库 `daily.yml`。前端**不会**接触 GitHub Token，也不会把更新密码持久化存储。任务被接受后前端在约五分钟内定期检测新 JSON。另一个「刷新已发布内容」只负责刷新显示。

必须先在 Cloudflare 的 Edit code 部署对应的 Worker 代码，并在生产环境 Secret 设置 `UPDATE_PASSWORD` 与 `GITHUB_TOKEN`。更新按钮以 Worker 返回 `success:true` 作为启动成功条件；按钮状态不代表新闻最终抓取、翻译或 GitHub Pages 发布已成功。



## 更新密码的本地记忆（可选）

首次输入 `UPDATE_PASSWORD` 且 Worker 返回成功后，若勾选「在这台设备记住更新密码」（默认勾选），网站会将更新密码存入该浏览器 `localStorage`，下一次点击「立即采集」便直接触发 Worker，无需再输入。页面提供「清除已记住的密码」按钮。密码错误（HTTP 401）时自动删除本地记录并要求重新输入；网络故障不自动清除。公开网页源码或仓库内**不写入实际更新密码或 GitHub Token**。本地存储不是强加密，不应在公用电脑启用，也应知晓同源脚本、浏览器扩展或获得本机访问的人可能读取这段密码。


## Obsidian 多来源战略观察

新增：[Obsidian 官方博客](https://obsidian.md/blog/)（RSS）、[CEO Steph Ango / kepano](https://stephango.com/about) 的个人 RSS（过滤 Obsidian 相关内容）、[官方开发者论坛](https://forum.obsidian.md/c/developers-api/14)（标为**社区讨论，不能等同官方决策**）、[GitHub 官方发行记录](https://github.com/obsidianmd/obsidian-releases/releases) Atom、以及[官方路线图](https://obsidian.md/roadmap/) HTML 快照变更检测，另保留官方 Changelog RSS。每个来源分别限额，优先展示近期更新，但 CEO 和产品战略会保留较长历史窗口并显示实际日期；旧观点不会冒充今日新闻。官方路线图首次采集只标记为『首次观察快照』，后续发生实际差异才标记『检测到变化』；观测时间不是官方发布时间。RSS、页面如不可用则跳过或沿用已知快照，绝不编造结果。源码使用 BeautifulSoup 解析路线图的 Active/Planned 标题；如官方页面结构变化会在日志警告。
