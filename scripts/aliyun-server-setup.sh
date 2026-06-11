#!/bin/bash
# Photo Accounting — 阿里云 Ubuntu 服务器初始化脚本
# 用法：sudo bash aliyun-server-setup.sh
# 运行前请已：购买 ECS、DNS 解析、安全组放行 22/80/443

set -e

DOMAIN="${DOMAIN:-moirark.com}"
APP_DIR="${APP_DIR:-/var/www/photo-accounting}"
REPO_URL="${REPO_URL:-https://github.com/Sorthark/Photo-Accounting.git}"

echo "==> 安装系统依赖..."
apt-get update -qq
apt-get install -y -qq curl git nginx certbot python3-certbot-nginx

echo "==> 安装 Node.js 20..."
if ! command -v node &>/dev/null || [[ $(node -v | cut -d. -f1 | tr -d v) -lt 20 ]]; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y -qq nodejs
fi
node -v
npm -v

echo "==> 安装 pm2..."
npm install -g pm2

echo "==> 克隆/更新项目到 ${APP_DIR}..."
mkdir -p "$(dirname "$APP_DIR")"
if [ -d "$APP_DIR/.git" ]; then
  cd "$APP_DIR" && git pull
else
  git clone "$REPO_URL" "$APP_DIR"
  cd "$APP_DIR"
fi

echo "==> 安装依赖并构建..."
npm install
npm install --prefix server

if [ ! -f server/.env ]; then
  JWT=$(openssl rand -hex 32)
  cat > server/.env <<EOF
PORT=3001
JWT_SECRET=${JWT}
CLIENT_ORIGIN=https://${DOMAIN}
EOF
  echo "==> 已生成 server/.env（JWT_SECRET 已随机生成）"
else
  echo "==> server/.env 已存在，跳过"
fi

npm run build

echo "==> 启动应用 (pm2)..."
pm2 delete photo-accounting 2>/dev/null || true
pm2 start npm --name photo-accounting -- run start
pm2 save
pm2 startup systemd -u root --hp /root 2>/dev/null || pm2 startup

echo "==> 配置 Nginx..."
cat > /etc/nginx/sites-available/photo-accounting <<NGINX
server {
    listen 80;
    server_name ${DOMAIN} www.${DOMAIN};

    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
NGINX

ln -sf /etc/nginx/sites-available/photo-accounting /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx

echo ""
echo "============================================"
echo "  基础部署完成！"
echo "  下一步在服务器执行 HTTPS 证书："
echo "  certbot --nginx -d ${DOMAIN} -d www.${DOMAIN}"
echo ""
echo "  完成后访问: https://${DOMAIN}"
echo "  默认账号: admin / 123456"
echo "============================================"
