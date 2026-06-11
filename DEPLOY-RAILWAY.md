# Photo Accounting — Railway 部署指南（moirark.com）

约 15 分钟完成。前后端同一服务，无需改 Linux。

---

## 第一步：推送最新代码到 GitHub

本地若刚加了 `railway.toml`，先推送：

```bash
git add railway.toml DEPLOY-RAILWAY.md package.json server/package.json
git commit -m "Add Railway deployment config"
git push origin main
```

---

## 第二步：注册并创建 Railway 项目

1. 打开 https://railway.app ，用 **GitHub** 登录
2. 点击 **New Project** → **Deploy from GitHub repo**
3. 选择 **Sorthark/Photo-Accounting**（若看不到，点 **Configure GitHub App** 授权仓库）
4. Railway 会自动读取 `railway.toml` 并开始构建

等待首次 Deploy 完成（约 2–5 分钟）。

---

## 第三步：生成公网访问地址

1. 进入该 **Service** → **Settings** → **Networking**
2. 点击 **Generate Domain**，得到类似：

   `photo-accounting-production-xxxx.up.railway.app`

3. 浏览器打开该地址，应能看到登录页  
4. 测试 API：`https://你的域名.up.railway.app/api/health`

---

## 第四步：配置环境变量

Service → **Variables** → **Raw Editor**，粘贴（把 JWT 换成随机长串）：

```env
JWT_SECRET=在这里粘贴至少32位随机字符
CLIENT_ORIGIN=https://你的域名.up.railway.app
```

生成随机 JWT（本地 PowerShell）：

```powershell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 48 | ForEach-Object {[char]$_})
```

保存后 Railway 会自动重新部署。  
**不要手动设置 `PORT`**，Railway 会自动注入。

---

## 第五步：挂载持久卷（重要！否则数据会丢）

SQLite 数据库必须写在卷上。

1. Service → 右键或 **Settings** 找到 **Volumes**
2. **Add Volume**
3. **Mount Path** 填：

   ```
   /app/server/data
   ```

4. 保存并等待重新部署

> 路径必须是 `/app/server/data`，与代码里 `server/data/photo-accounting.db` 一致。

---

## 第六步：绑定自定义域名 moirark.com

### 6.1 在 Railway 添加域名

**Settings** → **Networking** → **Custom Domain** → 添加：

- `moirark.com`
- `www.moirark.com`（可选）

Railway 会显示需要配置的 **CNAME 目标**（形如 `xxxx.up.railway.app`）。

### 6.2 在阿里云 DNS 添加记录

打开 [云解析 DNS](https://dns.console.aliyun.com/) → `moirark.com`：

| 类型 | 主机记录 | 记录值 |
|------|----------|--------|
| CNAME | `www` | Railway 提供的 CNAME 目标 |

**根域名 `@`：**

- 若阿里云支持 **CNAME 扁平化**（别名记录）：主机 `@`，记录值填 Railway CNAME  
- 若不支持：先用 `www.moirark.com` 访问，或在阿里云开启「显性 URL」跳转 `@` → `www`

等待 DNS 生效（5–30 分钟）。Railway 会自动签发 HTTPS 证书。

### 6.3 更新环境变量

域名生效后，把 Variables 里的 `CLIENT_ORIGIN` 改为：

```env
CLIENT_ORIGIN=https://moirark.com
```

若主要用 www：

```env
CLIENT_ORIGIN=https://www.moirark.com
```

须与浏览器地址栏 **完全一致**（含 `https://`）。

---

## 第七步：验收

- https://moirark.com（或你的 Railway 域名）
- `/api/health` 返回 `{"ok":true,...}`
- 注册新用户或登录 `admin` / `123456`
- 录入一条事项，**重新 Deploy 一次**，确认数据仍在（验证 Volume 生效）

---

## 常用运维

| 操作 | 方式 |
|------|------|
| 更新代码 | `git push` → Railway 自动重新部署 |
| 看日志 | Railway → Service → **Deployments** → 某次部署 → **View logs** |
| 备份数据库 | Volume 内 `photo-accounting.db`，可用 Railway CLI 或后续加导出功能 |

---

## 费用说明

Railway 按用量计费，新账号通常有试用额度。个人记账流量很小，一般远低于 ECS 固定月费。可在 **Project → Usage** 查看消耗。

---

## 故障排查

| 现象 | 处理 |
|------|------|
| 构建失败 | 看 Deploy logs，确认 Node ≥ 20 |
| 打开是空白 / 502 | 等健康检查通过；看 `start:server` 是否启动 |
| 登录后数据消失 | 检查 Volume 是否挂在 `/app/server/data` |
| 跨域错误 | `CLIENT_ORIGIN` 与访问域名不一致 |
