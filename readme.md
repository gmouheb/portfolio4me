# Portfolio4Me

Full-stack portfolio platform with a Vite/React frontend, an Express/MongoDB API, and a protected admin dashboard for managing portfolio content.

## Stack

- Frontend: React, Vite, Tailwind CSS, Framer Motion
- Backend: Node.js, Express
- Database: MongoDB
- Auth: JWT stored in an `HttpOnly` cookie
- Media: local uploads served from `/uploads`

## Project Structure

- `src/`: frontend application
- `server/`: Express API, models, middleware, and utilities
- `docker/nginx.conf`: nginx config for the production frontend container
- `Dockerfile`: multi-stage image for frontend/backend dev and prod targets
- `docker-compose.yaml`: Compose services for `dev` and `prod` profiles

## Requirements

- Node.js 22+
- npm 10+
- MongoDB
- Docker + Docker Compose plugin
- A Gmail address plus Gmail App Password for password reset emails

The backend verifies the SMTP transport during startup. If `SMTP_FROM` or `SMTP_APP_PASSWORD` is invalid, the API will not start.

## Environment Variables

Copy `.env.example` to `.env` and update the values.

```env
MONGODB_URI=mongodb://localhost:27017/portfolio
PORT=5000
CLIENT_URL=http://localhost:5173
VITE_API_BASE_URL=/api
JWT_SECRET=replace-with-a-long-random-secret
ADMIN_USERNAME=portfolio_admin
ADMIN_PASSWORD=replace-with-a-strong-password
ADMIN_EMAIL=admin@example.com
SMTP_FROM=admin@example.com
SMTP_APP_PASSWORD=your-gmail-app-password
SMTP_APP_NAME=my_portfolio
APP_URL=http://localhost:5173
RESET_TOKEN_EXPIRES=15m
```

## Variable Notes

- `MONGODB_URI`: MongoDB connection string used by the API.
- `PORT`: Express server port. Default is `5000`.
- `CLIENT_URL`: allowed frontend origin for CORS.
- `VITE_API_BASE_URL`: frontend API base path. Default `/api`.
- `JWT_SECRET`: signing secret for admin JWTs.
- `ADMIN_USERNAME`: bootstrap admin username.
- `ADMIN_PASSWORD`: bootstrap admin password.
- `ADMIN_EMAIL`: bootstrap admin email and password-reset destination.
- `SMTP_FROM`: Gmail address used to send reset emails.
- `SMTP_APP_PASSWORD`: Gmail App Password used by Nodemailer.
- `SMTP_APP_NAME`: sender display name.
- `APP_URL`: public frontend URL used to generate reset-password links.
- `RESET_TOKEN_EXPIRES`: reset token lifetime, format `<number>m` or `<number>h`, for example `15m` or `1h`.

On first API startup, the server creates the admin user automatically if `ADMIN_USERNAME` does not already exist.

## Run Locally in Development

1. Install dependencies:

```bash
npm install
```

2. Create `.env` from `.env.example`.

3. Start MongoDB locally and make sure `MONGODB_URI` points to it.

4. Start the backend:

```bash
npm run server
```

5. In another terminal, start the frontend:

```bash
npm run dev
```

6. Open:

- App: `http://localhost:5173`
- Admin login: `http://localhost:5173/control-room/login`
- API: `http://localhost:5000`

You can also run frontend and backend together:

```bash
npm run dev:full
```

`npm run dev:full` still expects MongoDB and a valid `.env`.

## Run with Docker in Development

The `dev` profile starts:

- `mongo`
- `api-dev`
- `web-dev`

Start:

```bash
docker compose --profile dev up --build
```

Open:

- App: `http://localhost:5173`
- Admin login: `http://localhost:5173/control-room/login`
- API: `http://localhost:5000`
- MongoDB: `mongodb://localhost:27017`

Stop:

```bash
docker compose --profile dev down
```

Stop and remove volumes too:

```bash
docker compose --profile dev down -v
```

### Dev Container Notes

- `api-dev` mounts the repo and uses the backend target from `Dockerfile`.
- `web-dev` mounts the repo and proxies `/api` to `api-dev:5000`.
- Mongo data is persisted in the `mongo-data` volume.
- Uploaded images are persisted in the `uploads-data` volume.

## Run in Production Mode Locally

For a non-Docker production-like run:

1. Install dependencies.
2. Set `.env` for production values.
3. Build the frontend:

```bash
npm run build
```

4. Start the API:

```bash
NODE_ENV=production npm run server
```

5. Serve `dist/` behind nginx or another static file server. The included Docker production flow already does this.

## Run with Docker in Production

The `prod` profile starts:

- `mongo`
- `api`
- `web`

Start:

```bash
docker compose --profile prod up --build -d
```

Open:

- App: `http://localhost:8080`
- API through nginx: `http://localhost:8080/api`
- Direct backend port: `http://localhost:5000`

Stop:

```bash
docker compose --profile prod down
```

Stop and remove volumes too:

```bash
docker compose --profile prod down -v
```

### Prod Container Notes

- `web` is an nginx container serving `dist/`.
- nginx proxies `/api/*` to the API container and `/uploads/*` to the backend uploads directory.
- `api` runs with `NODE_ENV=production`.
- `mongo-data` persists MongoDB data.
- `uploads-data` persists uploaded images.

## Docker Files

### `Dockerfile`

Targets:

- `frontend-dev`: Vite dev server on port `5173`
- `backend-dev`: Express API on port `5000`
- `frontend-build`: production frontend build step
- `frontend-prod`: nginx image serving the built frontend
- `backend-prod`: production API image

### `docker-compose.yaml`

Profiles:

- `dev`: local development with hot reload and mounted source code
- `prod`: local production-style deployment with nginx in front of the API

## API Reference

Base URLs:

- Local backend direct: `http://localhost:5000`
- Docker dev frontend proxy: `http://localhost:5173`
- Docker prod nginx proxy: `http://localhost:8080`

When using the frontend, requests usually go through `/api`.

### Authentication

Admin-only endpoints require either:

- the `admin_session` cookie set by `POST /api/auth/login`, or
- `Authorization: Bearer <token>` for endpoints that support bearer auth such as `GET /api/auth/me`

### Public Endpoints

#### `GET /api/health`

Returns service health.

Response:

```json
{ "ok": true }
```

#### `GET /api/portfolio`

Returns all public portfolio content.

Response shape:

```json
{
  "profile": {
    "_id": "string",
    "name": "string",
    "title": "string",
    "tagline": "string",
    "about": "string",
    "location": "string",
    "email": "string",
    "phone": "string",
    "highlights": ["string"],
    "socialLinks": [
      {
        "label": "string",
        "href": "string"
      }
    ],
    "createdAt": "date",
    "updatedAt": "date"
  },
  "skills": [
    {
      "_id": "string",
      "title": "string",
      "items": ["string"],
      "order": 0,
      "createdAt": "date",
      "updatedAt": "date"
    }
  ],
  "experience": [
    {
      "_id": "string",
      "company": "string",
      "role": "string",
      "period": "string",
      "highlights": ["string"],
      "order": 0,
      "createdAt": "date",
      "updatedAt": "date"
    }
  ],
  "projects": [
    {
      "_id": "string",
      "title": "string",
      "description": "string",
      "stack": ["string"],
      "githubUrl": "string",
      "liveUrl": "string",
      "imageUrl": "string",
      "createdAt": "date",
      "updatedAt": "date"
    }
  ],
  "certifications": [
    {
      "_id": "string",
      "name": "string",
      "issuer": "string",
      "date": "string",
      "credentialUrl": "string",
      "imageUrl": "string",
      "order": 0,
      "createdAt": "date",
      "updatedAt": "date"
    }
  ],
  "blogs": [
    {
      "_id": "string",
      "title": "string",
      "excerpt": "string",
      "content": "string",
      "linkUrl": "string",
      "imageUrl": "string",
      "publishedAt": "string",
      "order": 0,
      "createdAt": "date",
      "updatedAt": "date"
    }
  ]
}
```

#### `POST /api/contact`

Creates a contact message.

Body:

```json
{
  "name": "string, required, max 120",
  "email": "string, required, valid email",
  "subject": "string, optional, max 200",
  "message": "string, required, max 4000"
}
```

Success response:

```json
{
  "message": "Message sent successfully",
  "id": "mongodb_object_id"
}
```

Validation failures return `400`.

### Auth Endpoints

#### `POST /api/auth/login`

Logs in the bootstrap admin and sets the `admin_session` cookie.

Body:

```json
{
  "username": "string, required",
  "password": "string, required"
}
```

Success response:

```json
{
  "user": {
    "username": "string"
  }
}
```

Error responses:

- `400`: username or password missing
- `401`: invalid credentials

#### `GET /api/auth/me`

Returns the current authenticated admin.

Auth:

- `Cookie: admin_session=...`, or
- `Authorization: Bearer <jwt>`

Success response:

```json
{
  "user": {
    "username": "string"
  }
}
```

Error responses:

- `401`: missing, invalid, or expired token

#### `POST /api/auth/logout`

Clears the auth cookie.

Success response:

- `204 No Content`

#### `POST /api/auth/forgot-password`

Generates a reset token and emails a reset link to the admin email.

Body:

```json
{
  "email": "string, required, valid email"
}
```

Success response:

```json
{
  "message": "If the account exists, a reset email has been sent"
}
```

Notes:

- The response is intentionally the same whether the account exists or not.
- Rate limited to 5 requests per 15 minutes per client key.

#### `POST /api/auth/reset-password`

Resets the admin password using the emailed token.

Body:

```json
{
  "token": "string, required",
  "password": "string, required"
}
```

Success response:

```json
{
  "message": "Password reset successfully"
}
```

Error responses:

- `400`: token/password missing
- `400`: invalid or expired token
- `400`: password strength validation failed

### Admin Endpoints

All routes below require a logged-in admin.

#### `GET /api/admin/portfolio`

Returns the full admin dataset including contact messages.

Response shape:

```json
{
  "profile": {},
  "skills": [],
  "experience": [],
  "projects": [],
  "certifications": [],
  "blogs": [],
  "messages": []
}
```

#### `POST /api/admin/uploads/image`

Uploads an image file.

Content type:

- `multipart/form-data`

Form fields:

- `image`: required image file, max `5 MB`

Success response:

```json
{
  "imageUrl": "/uploads/1710000000000-file-name.jpg"
}
```

Error responses:

- `400`: missing file
- `500`: invalid file type currently bubbles through the generic error handler

#### `PUT /api/admin/messages/:id`

Updates a stored contact message.

Path params:

- `id`: MongoDB ObjectId

Body:

```json
{
  "subject": "string, optional, max 200",
  "message": "string, required, max 4000",
  "read": "boolean, optional"
}
```

#### `DELETE /api/admin/messages/:id`

Deletes a contact message.

Path params:

- `id`: MongoDB ObjectId

Success response:

- `204 No Content`

#### `PUT /api/admin/profile/:id`

Updates the single profile document.

Path params:

- `id`: MongoDB ObjectId

Body:

```json
{
  "name": "string, required, max 120",
  "title": "string, required, max 160",
  "tagline": "string, required, max 240",
  "about": "string, required, max 5000",
  "location": "string, optional, max 120",
  "email": "string, optional, valid email",
  "phone": "string, optional, max 60",
  "highlights": ["string, max 12 items, each max 120"],
  "socialLinks": [
    {
      "label": "string, optional, max 60",
      "href": "string, optional, valid URL"
    }
  ]
}
```

#### `POST /api/admin/skills`

Creates a skill group.

Body:

```json
{
  "title": "string, required, max 120",
  "items": ["string, max 50 items, each max 80"],
  "order": "number, optional"
}
```

#### `PUT /api/admin/skills/:id`

Updates a skill group.

Path params:

- `id`: MongoDB ObjectId

Body:

```json
{
  "title": "string, required, max 120",
  "items": ["string, max 50 items, each max 80"],
  "order": "number, optional"
}
```

#### `DELETE /api/admin/skills/:id`

Deletes a skill group.

Path params:

- `id`: MongoDB ObjectId

Success response:

- `204 No Content`

#### `POST /api/admin/experience`

Creates an experience entry.

Body:

```json
{
  "company": "string, required, max 160",
  "role": "string, required, max 160",
  "period": "string, required, max 80",
  "highlights": ["string, max 20 items, each max 240"],
  "order": "number, optional"
}
```

#### `PUT /api/admin/experience/:id`

Updates an experience entry.

Path params:

- `id`: MongoDB ObjectId

Body:

```json
{
  "company": "string, required, max 160",
  "role": "string, required, max 160",
  "period": "string, required, max 80",
  "highlights": ["string, max 20 items, each max 240"],
  "order": "number, optional"
}
```

#### `DELETE /api/admin/experience/:id`

Deletes an experience entry.

Path params:

- `id`: MongoDB ObjectId

Success response:

- `204 No Content`

#### `POST /api/admin/certifications`

Creates a certification entry.

Body:

```json
{
  "name": "string, required, max 160",
  "issuer": "string, required, max 160",
  "date": "string, required, max 80",
  "credentialUrl": "string, optional, valid URL",
  "imageUrl": "string, optional, valid URL",
  "order": "number, optional"
}
```

#### `PUT /api/admin/certifications/:id`

Updates a certification entry.

Path params:

- `id`: MongoDB ObjectId

Body:

```json
{
  "name": "string, required, max 160",
  "issuer": "string, required, max 160",
  "date": "string, required, max 80",
  "credentialUrl": "string, optional, valid URL",
  "imageUrl": "string, optional, valid URL",
  "order": "number, optional"
}
```

#### `DELETE /api/admin/certifications/:id`

Deletes a certification entry.

Path params:

- `id`: MongoDB ObjectId

Success response:

- `204 No Content`

#### `POST /api/admin/blogs`

Creates a blog entry.

Body:

```json
{
  "title": "string, required, max 180",
  "excerpt": "string, required, max 500",
  "content": "string, optional, max 12000",
  "linkUrl": "string, optional, valid URL",
  "imageUrl": "string, optional, valid URL",
  "publishedAt": "string, optional, max 80",
  "order": "number, optional"
}
```

#### `PUT /api/admin/blogs/:id`

Updates a blog entry.

Path params:

- `id`: MongoDB ObjectId

Body:

```json
{
  "title": "string, required, max 180",
  "excerpt": "string, required, max 500",
  "content": "string, optional, max 12000",
  "linkUrl": "string, optional, valid URL",
  "imageUrl": "string, optional, valid URL",
  "publishedAt": "string, optional, max 80",
  "order": "number, optional"
}
```

#### `DELETE /api/admin/blogs/:id`

Deletes a blog entry.

Path params:

- `id`: MongoDB ObjectId

Success response:

- `204 No Content`

#### `POST /api/admin/projects`

Creates a project.

Body:

```json
{
  "title": "string, required, max 160",
  "description": "string, required, max 5000",
  "stack": ["string, max 30 items, each max 80"],
  "githubUrl": "string, optional, valid URL",
  "liveUrl": "string, optional, valid URL",
  "imageUrl": "string, optional, valid URL"
}
```

#### `PUT /api/admin/projects/:id`

Updates a project.

Path params:

- `id`: MongoDB ObjectId

Body:

```json
{
  "title": "string, required, max 160",
  "description": "string, required, max 5000",
  "stack": ["string, max 30 items, each max 80"],
  "githubUrl": "string, optional, valid URL",
  "liveUrl": "string, optional, valid URL",
  "imageUrl": "string, optional, valid URL"
}
```

#### `DELETE /api/admin/projects/:id`

Deletes a project.

Path params:

- `id`: MongoDB ObjectId

Success response:

- `204 No Content`

## Rate Limits

- `POST /api/auth/login`: 10 requests per 15 minutes
- `POST /api/auth/forgot-password`: 5 requests per 15 minutes
- `POST /api/contact`: 8 requests per 15 minutes

## Uploaded Files

- Files are stored in `uploads/`.
- Public URLs use `/uploads/<filename>`.
- Only `image/*` MIME types are accepted.
- Max file size is `5 MB`.

## Useful Commands

```bash
npm run dev
npm run server
npm run dev:full
npm run build
npm test
docker compose --profile dev up --build
docker compose --profile prod up --build -d
```
