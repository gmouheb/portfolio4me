# Full Deployment Guide

This guide covers the full production deployment flow for `portfolio4me`, from cloning the repository to DNS, Docker, nginx, and HTTPS.

## 1. Install Base Tools

```bash
sudo apt update
sudo apt install -y git curl ca-certificates gnupg nginx certbot python3-certbot-nginx
```

Install Docker:

```bash
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker $USER
newgrp docker
```

Verify:

```bash
docker --version
docker compose version
nginx -v
certbot --version
```

## 2. Clone The Repository

```bash
cd ~
git clone https://github.com/gmouheb/portfolio4me.git
cd portfolio4me
```

## 3. Create Production `.env`

Create `.env`:

```bash
nano .env
```

Initial HTTP-safe values:

```env
MONGODB_URI=your-mongodb-uri
PORT=5000
CLIENT_URL=http://mouhebgh.com
VITE_API_BASE_URL=/api
JWT_SECRET=replace-with-a-long-random-secret
ADMIN_USERNAME=admin
ADMIN_PASSWORD=replace-with-a-strong-password
ADMIN_EMAIL=ghabrimouheb@gmail.com
SMTP_FROM=ghabrimouheb@gmail.com
SMTP_APP_PASSWORD=your-gmail-app-password
SMTP_APP_NAME=my_portfolio
APP_URL=http://mouhebgh.com
RESET_TOKEN_EXPIRES=15m
```

After HTTPS is working, change only these two values:

```env
CLIENT_URL=https://mouhebgh.com
APP_URL=https://mouhebgh.com
```

## 4. Verify Docker Compose Production Ports

In `docker-compose.yaml`, production `web` must use:

```yaml
ports:
  - "127.0.0.1:8080:80"
```

It must not use:

```yaml
- "80:80"
```

## 5. Start The App

```bash
docker compose --profile prod up --build -d
```

Verify:

```bash
docker ps --format 'table {{.ID}}\t{{.Names}}\t{{.Ports}}'
```

Expected for the web container:

```text
127.0.0.1:8080->80/tcp
```

## 6. Configure DNS

At your DNS provider, add:

- `A` record for `@` -> `51.45.42.247`

Optional:

- `A` record for `www` -> `51.45.42.247`

Only request a certificate for `www` if that DNS record exists.

## 7. Create Host nginx Config

Important:

- Start with HTTP only on port `80`
- Do not add the `443` server block yet
- Do not paste explanatory text into the nginx file
- First make sure nginx starts successfully with the HTTP-only config
- Only add the final `443` HTTPS block after Certbot succeeds

Create `/etc/nginx/sites-available/portfolio4me` with:

```nginx
server {
  listen 80;
  listen [::]:80;
  server_name mouhebgh.com;

  location / {
    proxy_pass http://127.0.0.1:8080;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
```

Enable it:

```bash
sudo ln -sf /etc/nginx/sites-available/portfolio4me /etc/nginx/sites-enabled/portfolio4me
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
```

## 8. Test HTTP

```bash
curl -I http://mouhebgh.com
curl http://mouhebgh.com/api/health
```

Expected:

- HTTP homepage returns `200`
- API returns `{"ok":true}`

## 9. Make Sure Docker Does Not Own Port 80

```bash
sudo ss -lptn 'sport = :80'
docker ps --format 'table {{.ID}}\t{{.Names}}\t{{.Ports}}'
```

Host nginx should own port `80`.

Docker should only expose:

```text
127.0.0.1:8080->80/tcp
```

## 10. Request HTTPS Certificate

At this point, nginx should still be HTTP-only.

Before running Certbot, verify:

```bash
sudo nginx -t
sudo systemctl restart nginx
curl -I http://mouhebgh.com
```

Only continue if HTTP works first.

If only root domain exists:

```bash
sudo certbot --nginx -d mouhebgh.com
```

If both root and `www` exist:

```bash
sudo certbot --nginx -d mouhebgh.com -d www.mouhebgh.com
```

## 11. Replace nginx With Final HTTPS Config

Only do this step after Certbot succeeds.

This is the point where you add port `443`.

Use this content in `/etc/nginx/sites-available/portfolio4me`:

```nginx
server {
  listen 80;
  listen [::]:80;
  server_name mouhebgh.com;

  return 301 https://$host$request_uri;
}

server {
  listen 443 ssl http2;
  listen [::]:443 ssl http2;
  server_name mouhebgh.com;

  ssl_certificate /etc/letsencrypt/live/mouhebgh.com/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/mouhebgh.com/privkey.pem;
  include /etc/letsencrypt/options-ssl-nginx.conf;
  ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

  client_max_body_size 10m;

  location / {
    proxy_pass http://127.0.0.1:8080;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
```

Reload nginx:

```bash
sudo nginx -t
sudo systemctl restart nginx
```

## 12. Open Cloud Firewall

If HTTPS works locally on the server but not publicly, open these inbound ports in your cloud firewall or security group:

- TCP `22`
- TCP `80`
- TCP `443`

## 13. Verify HTTPS Locally

```bash
curl -vk https://127.0.0.1
```

## 14. Verify HTTPS Publicly

```bash
curl -I https://mouhebgh.com
curl https://mouhebgh.com/api/health
```

Expected:

- HTTPS homepage returns `200`
- API returns `{"ok":true}`

## 15. Switch `.env` To HTTPS

Edit `.env`:

```env
CLIENT_URL=https://mouhebgh.com
APP_URL=https://mouhebgh.com
```

## 16. Redeploy App

```bash
docker compose --profile prod up --build -d
```

## 17. Final Browser Checks

Open:

- `https://mouhebgh.com`
- `https://mouhebgh.com/control-room/login`
- `https://mouhebgh.com/control-room/forgot-password`

## 18. Useful Commands

Containers:

```bash
docker compose ps
docker compose logs -f api
docker compose logs -f web
```

nginx:

```bash
sudo systemctl status nginx --no-pager -l
sudo nginx -t
sudo ss -lptn 'sport = :80'
sudo ss -lptn 'sport = :443'
```

Cert:

```bash
sudo ls -l /etc/letsencrypt/live/mouhebgh.com/
systemctl status certbot.timer
```

## 19. Common Failure Cases

- `https://mouhebgh.com` hangs:
  - cloud firewall does not allow `443`
- Certbot fails with NXDOMAIN for `www`:
  - `www` DNS record does not exist
- nginx cannot bind to `80`:
  - Docker container still exposes `80:80`
- forgot-password works in curl but not browser:
  - origin mismatch or stale env/CORS
- reset email link uses the wrong scheme:
  - `APP_URL` is still set to the wrong origin

## 20. Local Production-Style Testing

Use the local files already added to the repo:

- `.env.local.example`
- `docker-compose.local.yaml`

Run:

```bash
cp .env.local.example .env.local
docker compose -f docker-compose.local.yaml --env-file .env.local up --build
```

Open:

- `http://localhost:8080`
- `http://localhost:8080/api/health`

Stop:

```bash
docker compose -f docker-compose.local.yaml --env-file .env.local down
```
