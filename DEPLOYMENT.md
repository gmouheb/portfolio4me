# Deployment Guide

This document describes how to deploy `portfolio4me` in production.

## Production Architecture

Recommended layout for your setup:

- `web`: nginx container serving the built Vite frontend on `127.0.0.1:8080`
- `api`: Node.js/Express container
- host nginx handling public HTTP/HTTPS and reverse proxying to the `web` container
- MongoDB Atlas as the external database
- persistent Docker volume for uploaded images

Public traffic flow:

```text
Browser -> host nginx (80/443) -> web container (127.0.0.1:8080)
                               -> /api/* -> Express API -> MongoDB Atlas
                               -> /uploads/* -> Express API static uploads
                               -> /* -> Vite build files
```

## Prerequisites

- A Linux server or VPS
- Docker
- Docker Compose plugin
- A domain name pointed to the server
- Ports `80` and `443` open in the firewall
- Your existing SMTP configuration, unchanged

## Required Files

The repo already includes:

- `Dockerfile`
- `docker-compose.yaml`
- `docker/nginx.conf`
- `deploy/nginx/portfolio4me.conf.example`

Create these on the server:

- `.env`

## Environment Variables

Create `.env` in the project root.

Keep SMTP exactly as it already works today, and keep using your MongoDB Atlas URI:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/portfolio?retryWrites=true&w=majority
PORT=5000
CLIENT_URL=https://mouhebgh.com
VITE_API_BASE_URL=/api
JWT_SECRET=replace-with-a-long-random-secret
ADMIN_USERNAME=portfolio_admin
ADMIN_PASSWORD=replace-with-a-strong-password
ADMIN_EMAIL=admin@mouhebgh.com
SMTP_FROM=your-existing-smtp-from-value
SMTP_APP_PASSWORD=your-existing-smtp-app-password
SMTP_APP_NAME=your-existing-smtp-app-name
APP_URL=https://mouhebgh.com
RESET_TOKEN_EXPIRES=15m
```

Notes:

- `CLIENT_URL` must match the public frontend origin.
- `APP_URL` is used in password reset links.
- `MONGODB_URI` should stay your MongoDB Atlas connection string.
- Do not replace your SMTP settings if they already work.
- The backend will fail to start if SMTP settings are invalid.

## DNS for `mouhebgh.com`

Point the domain to your server before requesting the certificate.

Use these records at your DNS provider:

- `A` record for `@` -> `51.45.42.247`
- `A` record for `www` -> `51.45.42.247`

If your DNS zone already has `AAAA` records for `@` or `www` and you are not serving IPv6 on this host, remove them to avoid partial failures over IPv6.

## Deployment Steps

### 1. Copy the project to the server

Example:

```bash
scp -r portfolio4me user@your-server:/opt/portfolio4me
```

Or clone it directly on the server.

### 2. Open the project directory

```bash
cd /opt/portfolio4me
```

### 3. Create the production `.env`

Copy from the example file and edit values:

```bash
cp .env.example .env
```

Then update the variables for your real domain, secrets, and mail credentials.

For this deployment, set:

```env
CLIENT_URL=https://mouhebgh.com
APP_URL=https://mouhebgh.com
```

### 4. Start the production stack

```bash
docker compose --profile prod up --build -d
```

This starts:

- `api`
- `web`

The `web` container is published only on `127.0.0.1:8080` for use behind host nginx.

### 5. Configure host nginx

Install nginx and Certbot on the host:

```bash
sudo apt update
sudo apt install -y nginx certbot python3-certbot-nginx
```

Copy the example config into nginx sites:

```bash
sudo cp deploy/nginx/portfolio4me.conf.example /etc/nginx/sites-available/portfolio4me
```

The included example is already prepared for:

- `mouhebgh.com`
- `www.mouhebgh.com`

Enable the site:

```bash
sudo ln -s /etc/nginx/sites-available/portfolio4me /etc/nginx/sites-enabled/portfolio4me
sudo nginx -t
sudo systemctl reload nginx
```

### 6. Issue the TLS certificate

Once your DNS points at the server and ports `80` and `443` are open:

```bash
sudo certbot --nginx -d mouhebgh.com -d www.mouhebgh.com
```

Certbot will update the nginx config with the correct certificate paths if needed.

### 7. Verify the deployment

Check containers:

```bash
docker compose ps
```

Check logs:

```bash
docker compose logs -f api
docker compose logs -f web
```

Health check:

```bash
curl http://localhost:8080/api/health
```

Expected response:

```json
{ "ok": true }
```

### 8. Access the application

Before DNS and HTTPS are ready, you can still test the container locally on the server:

- Frontend: `http://127.0.0.1:8080`
- API: `http://127.0.0.1:8080/api`

Once host nginx and TLS are ready:

- Frontend: `https://mouhebgh.com`
- API: `https://mouhebgh.com/api`

Admin login:

- `/control-room/login`

## Domain and Reverse Proxy

The included Compose setup is intended to stay behind host nginx. The production `web`
container is exposed only on `127.0.0.1:8080`.

Host nginx example:

```nginx
server {
  listen 80;
  server_name mouhebgh.com www.mouhebgh.com;

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

This is the recommended approach because TLS termination and certificate management stay on
the host, not inside the app containers.

## HTTPS

Use HTTPS in production.

Common approaches:

- use host nginx + Certbot
- or use a cloud load balancer or proxy in front of the server

If TLS is terminated upstream, keep these values aligned:

- `CLIENT_URL=https://mouhebgh.com`
- `APP_URL=https://mouhebgh.com`

## Updating the App

When you deploy a new version:

```bash
cd /opt/portfolio4me
docker compose --profile prod up --build -d
```

If you pulled code changes first:

```bash
git pull
docker compose --profile prod up --build -d
```

## Stopping the App

```bash
docker compose --profile prod down
```

To remove containers and volumes:

```bash
docker compose --profile prod down -v
```

Be careful: `-v` also removes MongoDB data and uploaded images.

## MongoDB Atlas

You said you want to keep using MongoDB Atlas. That is the right production choice here.

Use your Atlas URI in `.env`, for example:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/portfolio?retryWrites=true&w=majority
```

Make sure Atlas network access allows connections from your Lightsail server.

You will typically need one of these:

- allow the Lightsail public IP in Atlas network access
- or temporarily allow `0.0.0.0/0` while testing, then tighten it later

## Persistent Data

The production stack stores uploaded files in Docker volumes:

- `uploads-data`: uploaded images

Uploaded files survive normal container restarts and `docker compose down`.

## Backup Recommendations

Back up at least:

- MongoDB Atlas data
- uploaded images
- `.env`

Minimum backup targets:

- `uploads-data`
- deployment configuration and secrets

## Common Issues

### API container exits on startup

Usually caused by one of these:

- invalid `MONGODB_URI`
- missing `JWT_SECRET`
- invalid SMTP credentials
- `CLIENT_URL` or `APP_URL` not set correctly

Check:

```bash
docker compose logs api
```

### Password reset emails do not send

Check:

- `SMTP_FROM`
- `SMTP_APP_PASSWORD`
- your existing SMTP/App Password configuration

### Frontend loads but API calls fail

Check:

- `CLIENT_URL`
- nginx proxy path `/api`
- API container health
- browser network errors

### Uploaded images are missing after redeploy

Check that `uploads-data` is still attached and you did not run:

```bash
docker compose --profile prod down -v
```

## AWS Lightsail Notes

If deploying on AWS Lightsail:

- create an Ubuntu instance
- install Docker and Docker Compose plugin
- open ports `80` and `443`
- optionally attach a static IP
- point your domain DNS to the instance
- deploy the project under `/opt/portfolio4me`

The included Docker production flow works well on a single Lightsail instance, even when MongoDB is hosted in Atlas.

## Recommended First Production Test

After deployment:

1. Open the homepage.
2. Open `/control-room/login`.
3. Log in with the bootstrap admin credentials from `.env`.
4. Confirm `GET /api/health` returns `{ "ok": true }`.
5. Create a test project in the admin dashboard.
6. Upload a test image.
7. Submit a test contact message.
8. Trigger a password reset email.
