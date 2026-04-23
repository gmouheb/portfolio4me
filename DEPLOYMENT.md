# Deployment Guide

This document describes how to deploy `portfolio4me` in production.

## Production Architecture

Recommended layout for your setup:

- `web`: nginx container serving the built Vite frontend
- `api`: Node.js/Express container
- MongoDB Atlas as the external database
- persistent Docker volume for uploaded images

Public traffic flow:

```text
Browser -> nginx (web) -> /api/* -> Express API -> MongoDB Atlas
                      -> /uploads/* -> Express API static uploads
                      -> /* -> Vite build files
```

## Prerequisites

- A Linux server or VPS
- Docker
- Docker Compose plugin
- A domain name pointed to the server
- Ports `80` and optionally `443` open in the firewall
- Your existing SMTP configuration, unchanged

## Required Files

The repo already includes:

- `Dockerfile`
- `docker-compose.yaml`
- `docker/nginx.conf`

Create these on the server:

- `.env`

## Environment Variables

Create `.env` in the project root.

Keep SMTP exactly as it already works today, and keep using your MongoDB Atlas URI:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/portfolio?retryWrites=true&w=majority
PORT=5000
CLIENT_URL=https://your-domain.com
VITE_API_BASE_URL=/api
JWT_SECRET=replace-with-a-long-random-secret
ADMIN_USERNAME=portfolio_admin
ADMIN_PASSWORD=replace-with-a-strong-password
ADMIN_EMAIL=admin@your-domain.com
SMTP_FROM=your-existing-smtp-from-value
SMTP_APP_PASSWORD=your-existing-smtp-app-password
SMTP_APP_NAME=your-existing-smtp-app-name
APP_URL=https://your-domain.com
RESET_TOKEN_EXPIRES=15m
```

Notes:

- `CLIENT_URL` must match the public frontend origin.
- `APP_URL` is used in password reset links.
- `MONGODB_URI` should stay your MongoDB Atlas connection string.
- Do not replace your SMTP settings if they already work.
- The backend will fail to start if SMTP settings are invalid.

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

### 4. Start the production stack

```bash
docker compose --profile prod up --build -d
```

This starts:

- `api`
- `web`

### 5. Verify the deployment

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

### 6. Access the application

If you expose nginx directly from Compose:

- Frontend: `http://your-server:8080`
- API: `http://your-server:8080/api`

If you place a reverse proxy in front of it:

- Frontend: `https://your-domain.com`
- API: `https://your-domain.com/api`

Admin login:

- `/control-room/login`

## Domain and Reverse Proxy

The included Compose setup exposes nginx on port `8080`.

For a real deployment, you usually want one of these:

### Option 1: map nginx directly to port 80

Edit `docker-compose.yaml`:

```yaml
web:
  ports:
    - "80:80"
```

Then restart:

```bash
docker compose --profile prod up --build -d
```

### Option 2: keep `8080` and use a host nginx reverse proxy

Host nginx example:

```nginx
server {
  listen 80;
  server_name your-domain.com;

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

This approach is useful if you want TLS termination and certificate management on the host.

## HTTPS

Use HTTPS in production.

Common approaches:

- use host nginx + Certbot
- use a cloud load balancer or proxy in front of the server

If TLS is terminated upstream, keep these values aligned:

- `CLIENT_URL=https://your-domain.com`
- `APP_URL=https://your-domain.com`

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
