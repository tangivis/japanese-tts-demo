# 部署指南

## 方法一：Nginx 部署

### 1. 构建项目
```bash
# 安装依赖
npm install

# 构建生产版本
npm run build
```

### 2. 部署步骤
```bash
# 创建目录
sudo mkdir -p /var/www/japanese-tts

# 复制构建文件
sudo cp -r dist/* /var/www/japanese-tts/

# 设置权限
sudo chown -R www-data:www-data /var/www/japanese-tts
sudo chmod -R 755 /var/www/japanese-tts
```

### 3. Nginx 配置
创建 `/etc/nginx/sites-available/tts_demo.conf`：

```nginx
server {
    listen 80;
    server_name tts.keiten-jp.com;
    
    # 重定向到 HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name tts.keiten-jp.com;
    
    # SSL 证书配置
    ssl_certificate /etc/ssl/certs/tts.keiten-jp.com.crt;
    ssl_certificate_key /etc/ssl/private/tts.keiten-jp.com.key;
    
    # SSL 安全配置
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-RSA-AES128-SHA256:ECDHE-RSA-AES256-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    # 网站根目录
    root /var/www/japanese-tts;
    index index.html;
    
    # 处理 Vue Router 的 history 模式
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # 静态资源缓存和压缩
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        add_header Vary Accept-Encoding;
    }
    
    # 启用 gzip 压缩
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/javascript
        application/xml+rss
        application/json
        application/font-woff
        application/font-woff2
        image/svg+xml;
    
    # 安全头
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    
    # 日志
    access_log /var/log/nginx/tts.keiten-jp.com.access.log;
    error_log /var/log/nginx/tts.keiten-jp.com.error.log;
}
```

### 4. 启用配置
```bash
# 启用站点
sudo ln -s /etc/nginx/sites-available/tts_demo.conf /etc/nginx/sites-enabled/

# 获取 SSL 证书 (使用 Let's Encrypt)
sudo certbot --nginx -d tts.keiten-jp.com

# 测试配置
sudo nginx -t

# 重启 Nginx
sudo systemctl restart nginx

# 设置开机自启动
sudo systemctl enable nginx
```

## 方法二：Cloudflare Pages 部署

### 方法1: Git 仓库连接（推荐）
1. 将代码推送到 GitHub/GitLab
2. 登录 Cloudflare Dashboard
3. 进入 Pages → Create a project
4. 连接你的 Git 仓库
5. 配置构建设置：
   - **Framework preset**: Vue
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Node.js version**: `18` 或 `20`

### 方法2: 直接上传
```bash
# 安装 Wrangler CLI
npm install -g wrangler

# 登录 Cloudflare
wrangler login

# 构建项目
npm run build

# 部署到 Pages
wrangler pages deploy dist --project-name japanese-tts-demo
```

### 方法3: 使用 GitHub Actions 自动部署
创建 `.github/workflows/deploy.yml`：

```yaml
name: Deploy to Cloudflare Pages

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Build
      run: npm run build
    
    - name: Deploy to Cloudflare Pages
      uses: cloudflare/wrangler-action@v3
      with:
        apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
        accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
        command: pages deploy dist --project-name japanese-tts-demo
```

## 部署说明

### 项目特点
- 这是一个纯前端 Vue 3 + Vite 静态应用
- 构建后只有 `index.html` 和 `assets/` 目录
- TTS 功能通过浏览器 Web Speech API 实现，无需后端

### 部署选择
- **Nginx 部署**：适合有服务器控制权，需要自定义配置的场景
- **Cloudflare Pages**：免费 HTTPS + 全球 CDN，适合静态网站

### 开机自启动
Nginx 部署后，只要设置了 `systemctl enable nginx`，系统重启后项目会自动可访问。