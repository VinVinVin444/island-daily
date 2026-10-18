# 私人分析配置（与公共晨报严格分离）

这是可选功能。当前公开网站不会展示或包含“与你有关”的明文。
即使有人通过查看网页源码、浏览 data/news.json 也看不到私人分析。

## 设置流程

1. 在 GitHub 新建一个 **Private** 仓库 `VinVinVin444/island-daily-private`，仅用于保存每天的私人分析。
2. 将该私有仓库授权给 ChatGPT 的 GitHub 连接。之后每日 ChatGPT 定时任务才能尝试更新其中的 `latest.json`。
3. 在公开仓库的 Settings → Secrets and variables → Actions 创建两个 **Repository secrets**：
    - `ISLAND_PRIVATE_PASSWORD`：自己设定的强密钥，建议随机生成至少 20 个字符。**不要在聊天里发送、也不要提交进任何仓库。**
    - `ISLAND_PRIVATE_READ_TOKEN`：GitHub 细粒度只读令牌，仅允许读取新建的私有仓库（Contents: Read）。
4. 私有仓库 `latest.json` 格式为：
```json
{
  "date": "2026-10-18",
  "items": [
    {"url": "https://example.org/real-news", "impact": "私人中文分析"}
  ]
}
```
5. 在公开仓库 Actions 手动执行「更新晨报数据并发布网页」；工作流在内存中获取私人仓库内容、用 PBKDF2-SHA256 + AES-256-GCM 加密，只把 `data/private/personal.enc.json` 密文上传到公共网站。
6. 网站右上角点「🔒 私人分析」，输入与 Repository Secret **一致的密钥**，浏览器在本地解密。错误密钥不显示分析，密码不会存储在浏览器的 localStorage。

⚠️ 公共仓库旧提交和 GitHub Pages 旧构建曾含有通用的“与你有关”固定文字。删除最新版本数据**不会清除 Git 历史、缓存或第三方归档**。如需清理以前公开的内容，需单独处理仓库历史并考虑重建站点。以后绝不要把私人明文写入公开仓库。

个人分析需要先写入新建的私有仓库。当前未配置私有仓库及密钥时，网页只展示公共新闻，不会假装私人分析已生效。
