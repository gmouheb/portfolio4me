# Clean Deployment

This file is the shortest safe path to deploy `portfolio4me` on a VPS and keep local testing separate from production.

## 1. Files To Prepare

On the server, you should have:

- `docker-compose.yaml`
- `.env`
- `deploy/nginx/portfolio4me.conf.example`

For local-only testing, use:

- `.env.local`
- `docker-compose.local.yaml`

## 2. Production DNS

Point the domain to the server IP:

- `A` record for `@` -> `51.45.42.247`
- Optional `A` record for `www` -> `51.45.42.247`

If `www` does not exist in DNS yet, request the certificate only for `mouhebgh.com`.

## 3. Production .env

Create `.env` in the project root:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/portfolio?retryWrites=true&w=majority
PORT=5000
CLIENT_URL=https://mouhebgh.com
VITE_API_BASE_URL=/api
JWT_SECRET=replace-with-a-long-random-secret
ADMIN_USERNAME=admin
ADMIN_PASSWORD=replace-with-a-strong-password
ADMIN_EMAIL=admin@example.com
SMTP_FROM=admin@example.com
SMTP_APP_PASSWORD=replace-with-a-real-app-password
SMTP_APP_NAME=my_portfolio
APP_URL=https://mouhebgh.com
RESET_TOKEN_EXPIRES=15m
```

If HTTPS is not ready yet, temporarily use:

```env
CLIENT_URL=http://mouhebgh.com
APP_URL=http://mouhebgh.com
```

Then switch both values back to `https://mouhebgh.com` after TLS is working.

## 4. Production Docker

The production web container must stay behind host nginx. It should not own public port `80`.

Deploy:

```bash
docker compose --profile prod down
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

Not:

```text
0.0.0.0:80->80/tcp
```

## 5. Host Nginx

Copy the nginx example:

```bash
sudo cp deploy/nginx/portfolio4me.conf.example /etc/nginx/sites-available/portfolio4me
sudo ln -sf /etc/nginx/sites-available/portfolio4me /etc/nginx/sites-enabled/portfolio4me
sudo nginx -t
sudo systemctl restart nginx
```

The first nginx config should be HTTP-only and proxy to:

```text
http://127.0.0.1:8080
```

## 6. HTTPS

Install dependencies:

```bash
sudo apt update
sudo apt install -y nginx certbot python3-certbot-nginx
```

Issue a certificate:

Only root domain:

```bash
sudo certbot --nginx -d mouhebgh.com
```

Root plus `www`:

```bash
sudo certbot --nginx -d mouhebgh.com -d www.mouhebgh.com
```

Only use the `www` command if `www.mouhebgh.com` exists in DNS.

## 7. Switch Back To HTTPS

After Certbot succeeds:

1. update `.env`
2. set:

```env
CLIENT_URL=https://mouhebgh.com
APP_URL=https://mouhebgh.com
```

3. redeploy:

```bash
docker compose --profile prod up --build -d
```

## 8. Final Checks

Run:

```bash
curl -I https://mouhebgh.com
curl https://mouhebgh.com/api/health
```

Expected API response:

```json
{"ok":true}
```

Check forgot-password from the browser at:

```text
https://mouhebgh.com/control-room/forgot-password
```

## 9. Local Testing

Use the local-only files:

```bash
cp .env.local.example .env.local
docker compose -f docker-compose.local.yaml --env-file .env.local up --build
```

Open:

- `http://localhost:8080`
- `http://localhost:8080/control-room/login`
- `http://localhost:8080/api/health`

Stop:

```bash
docker compose -f docker-compose.local.yaml --env-file .env.local down
```
