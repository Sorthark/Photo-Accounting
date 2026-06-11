# Photo Accounting — 阿里云部署指南（moirark.com）

按顺序完成以下步骤。每步做完可在浏览器或终端自测。

---

## 第一步：购买 ECS 云服务器

1. 登录 [阿里云控制台](https://ecs.console.aliyun.com/)
2. **创建实例**，推荐配置：
   - 地域：离用户近的（如华东）
   - 镜像：**Ubuntu 22.04 64位**
   - 规格：2核2G 即可（个人记账够用）
   - 带宽：按量或 3–5 Mbps 固定带宽
   - 安全组：新建并勾选 **22、80、443**
3. 设置 **root 密码** 或绑定 **SSH 密钥**
4. 创建后记下 **公网 IP**（例如 `47.xxx.xxx.xxx`）

---

## 第二步：域名 DNS 解析

域名在阿里云时：

1. 打开 [云解析 DNS](https://dns.console.aliyun.com/)
2. 找到 `moirark.com` → **解析设置** → **添加记录**

| 记录类型 | 主机记录 | 记录值 | TTL |
|----------|----------|--------|-----|
| A | `@` | 你的 ECS 公网 IP | 10 分钟 |
| A | `www` | 同上 | 10 分钟 |

> 若主域名已做其他网站，可改用子域名，例如主机记录填 `photo`，访问地址为 `https://photo.moirark.com`，下文 `DOMAIN` 改为 `photo.moirark.com`。

等待 5–10 分钟，本地执行：

```bash
ping moirark.com
```

应解析到你的 ECS IP。

---

## 第三步：安全组放行端口

ECS → **安全组** → **配置规则** → **入方向** 确认已有：

| 端口 | 协议 | 授权对象 |
|------|------|----------|
| 22 | TCP | 你的 IP 或 0.0.0.0/0（仅调试期） |
| 80 | TCP | 0.0.0.0/0 |
| 443 | TCP | 0.0.0.0/0 |

**不要**对公网开放 3001，由 Nginx 反代即可。

---

## 第四步：SSH 登录服务器

Windows PowerShell：

```powershell
ssh root@你的ECS公网IP
```

首次连接输入 `yes`，再输入 root 密码。

---

## 第五步：一键部署（推荐）

在服务器上执行：

```bash
curl -fsSL https://raw.githubusercontent.com/Sorthark/Photo-Accounting/main/scripts/aliyun-server-setup.sh -o setup.sh
# 若脚本尚未推送，可手动 git clone 后执行：
# git clone https://github.com/Sorthark/Photo-Accounting.git /var/www/photo-accounting
# cd /var/www/photo-accounting && sudo bash scripts/aliyun-server-setup.sh

sudo DOMAIN=moirark.com bash setup.sh
```

或手动克隆后运行仓库内脚本：

```bash
git clone https://github.com/Sorthark/Photo-Accounting.git /var/www/photo-accounting
cd /var/www/photo-accounting
sudo DOMAIN=moirark.com bash scripts/aliyun-server-setup.sh
```

---

## 第六步：申请 HTTPS 证书

脚本跑完后，仍在服务器执行：

```bash
certbot --nginx -d moirark.com -d www.moirark.com
```

按提示输入邮箱、同意条款。成功后 Nginx 会自动改成 443 + 证书。

验证自动续期：

```bash
certbot renew --dry-run
```

---

## 第七步：验收

浏览器打开：

- https://moirark.com
- https://moirark.com/api/health → 应返回 `{"ok":true,...}`

登录：`admin` / `123456`，**上线后请在设置里改密码或新建账号**。

---

## 常用运维命令

```bash
cd /var/www/photo-accounting

# 查看日志
pm2 logs photo-accounting

# 重启
pm2 restart photo-accounting

# 更新代码
git pull && npm install && npm install --prefix server && npm run build
pm2 restart photo-accounting

# 数据库位置（备份用）
ls -la server/data/photo-accounting.db
```

---

## 故障排查

| 现象 | 处理 |
|------|------|
| 域名打不开 | 检查 DNS 是否生效、`ping moirark.com` |
| 502 Bad Gateway | `pm2 status` 看进程是否 online |
| 证书失败 | 确认 80 端口可从公网访问，DNS 已指向本机 |
| 登录后接口 401 | 检查 `server/.env` 中 `CLIENT_ORIGIN` 是否为 `https://moirark.com` |

---

## 环境变量说明（`server/.env`）

```env
PORT=3001
JWT_SECRET=生产环境务必使用长随机串
CLIENT_ORIGIN=https://moirark.com
```

`CLIENT_ORIGIN` 必须与浏览器地址栏一致（含 `https://`）。
