# Persija Jakarta API

This is a simple backend for a Persija Jakarta company profile (code challenge/task), built with TypeScript, Express, Prisma, and PostgreSQL.

It includes:

- JWT auth with refresh tokens (stored in an `httpOnly` cookie)
- Blog CRUD with image uploads (Cloudinary)
- Pagination, filtering, sorting, and rate limiting
- Soft delete (archive instead of hard delete)
- Validation via Zod

---

## Main features (what you can do)

- **Register / Login** → get access token + refresh token cookie
- **Refresh token flow** → `/api/auth/refresh-token` keeps you logged in without retyping password
- **Protected endpoints** → send `Authorization: Bearer <token>`
- **Blog posts** → create/update with image upload (`multipart/form-data` + `file` field)
- **Soft delete** → archive a blog instead of removing it
- **Publish toggle** → flip publish state without editing the post
- **List blog posts** with search, category filter, pagination, and sorting

---

## API endpoints (short list)

### Auth

- `POST /api/auth/register` → create account
- `POST /api/auth/login` → login (returns access token + refresh cookie)
- `POST /api/auth/refresh-token` → refresh access token using cookie
- `POST /api/auth/logout` → clear refresh cookie

> Note: Most private endpoints require `Authorization: Bearer <token>`.

### Blog

- `GET /api/blogs` → list blogs (supports search + pagination + sort)
- `GET /api/blogs/:id` → get blog by ID
- `POST /api/blogs` → create blog (auth + upload image)
- `PUT /api/blogs/:id` → edit blog (auth + upload image)
- `PATCH /api/blogs/:id/archive` → soft delete a blog
- `PATCH /api/blogs/toggle-publish/:id` → toggle publish state

**Note:** for create/update use `multipart/form-data` with a `file` field for the image.

---
