# Football Ticket Backend

Backend API sederhana untuk sistem ticketing sepak bola berbasis TypeScript, Express, Prisma, dan PostgreSQL.

Saat ini backend yang benar-benar expose ke client masih berpusat di sistem auth, tetapi schema database, reward referral, point, coupon, email template, upload helper, dan middleware umum sudah ikut disiapkan di project ini.

## Stack

- TypeScript
- Express 5
- Prisma
- PostgreSQL
- Neon Prisma Adapter
- Zod
- JWT
- Argon2
- Nodemailer
- Cloudinary
- Multer

## Systems Implemented

### 1. Authentication System

System auth yang sudah aktif di backend:

- register user
- login user
- refresh access token dengan refresh token cookie
- logout
- verify email/account
- update password saat user sudah login
- request forgot password
- reset password via token

Flow yang sudah diimplementasikan:

- password di-hash pakai Argon2 + pepper
- access token dikirim sebagai JWT bearer token
- refresh token disimpan di cookie `httpOnly`
- refresh token di-hash sebelum disimpan ke database
- reset password token dikirim lewat email
- verify account token dikirim lewat email

### 2. Referral Reward System

Referral system yang sudah ada:

- user baru bisa register dengan `referrerCode`
- backend menyimpan `referrerUserId` pada user yang direferensikan
- saat user berhasil verify account, referrer akan mendapatkan point reward
- user yang mendaftar via referral juga akan mendapatkan coupon reward

### 3. Point System

Point system yang sudah tersedia di level schema dan repository:

- tabel `points`
- tabel `point_histories`
- pencatatan point earned
- source point untuk referral reward
- expiry point untuk reward referral

Saat ini point belum punya endpoint public sendiri, tetapi logic reward-nya sudah dipakai di flow verifikasi user.

### 4. Coupon System

Coupon system yang sudah tersedia di level schema dan repository:

- tabel `coupons`
- source coupon `REFERRAL_REGISTER`
- expiry coupon untuk reward referral

Saat ini coupon belum punya endpoint public sendiri, tetapi logic pembuatannya sudah dipakai di flow verifikasi user referral.

### 5. Email Notification System

Sistem email yang sudah ada:

- email welcome + verification
- email request forgot password
- template email berbasis Handlebars
- pengiriman email via Nodemailer Gmail transport

### 6. Validation and Error Handling

System guard yang sudah aktif:

- request validation dengan Zod
- centralized error handler
- custom `AppError`
- bearer token verification middleware
- JSON parse error handling
- Prisma error mapping
- Multer error mapping

### 7. File Upload Utility

Utility yang sudah disiapkan:

- multer memory storage
- filter mime type image
- upload helper ke Cloudinary
- delete helper dari Cloudinary

Saat ini utility upload sudah ada di project, tetapi belum dipasang ke endpoint public.

## Public API Endpoints

Semua endpoint public yang aktif sekarang ada di prefix `/api/auth`.

### General

- `GET /`
  Health check sederhana untuk memastikan API hidup.

### Auth

- `POST /api/auth/register`
  Register user baru.

- `POST /api/auth/login`
  Login user dan return access token + set refresh token cookie.

- `POST /api/auth/refresh-token`
  Generate access token baru dari refresh token cookie.

- `POST /api/auth/logout`
  Revoke refresh token aktif dan clear cookie.

- `POST /api/auth/verify/:token`
  Verifikasi account user menggunakan token dari email.

- `POST /api/auth/update-password`
  Update password user login menggunakan bearer access token.

- `POST /api/auth/request-forgot-password`
  Mengirim email reset password jika account ditemukan.

- `POST /api/auth/forgot-password/:token`
  Reset password menggunakan token dari email forgot password.

## Cookie Refresh Token

Refresh token saat ini memakai cookie dengan konfigurasi:

- `httpOnly: true`
- `secure: NODE_ENV === "production"`
- `sameSite: "lax"`
- `path: "/api/auth"`
- `maxAge: 14 hari`

Frontend harus mengirim request dengan `credentials: "include"` saat akses endpoint refresh token atau logout.

Contoh:

```ts
fetch("http://localhost:8080/api/auth/refresh-token", {
  method: "POST",
  credentials: "include",
});
```

## Auth Payload Rules

Rule utama yang sekarang dipakai:

- role register public hanya `CUSTOMER` atau `ORGANIZER`
- password minimum 8 karakter
- password wajib punya 1 uppercase
- password wajib punya 1 angka
- password wajib punya 1 special character
- password maksimum 20 karakter

## Database Models Already Used

Model yang sudah benar-benar kepakai di implementation sekarang:

- `User`
- `RefreshToken`
- `PasswordResetToken`
- `Point`
- `PointHistory`
- `Coupon`

Schema event, transaction, voucher, rating, ticket, dan location juga sudah ada di Prisma, tetapi belum expose route public di app saat ini.

## Environment Variables

Project ini butuh env berikut:

```env
DATABASE_URL=
PORT=8080
JWT_SECRET=
REFRESH_TOKEN_SECRET=
VERIFY_TOKEN_SECRET=
RESET_TOKEN_SECRET=
PEPPER=
NODEMAILER_EMAIL=
NODEMAILER_PASS=
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

## Scripts

- `npm run dev` menjalankan server development dengan `tsx watch`
- `npm run build` compile TypeScript ke folder `dist`
- `npm run check` menjalankan type-check tanpa output build
- `npm run prisma:generate` generate Prisma client
- `npm run prisma:migrate` menjalankan migration development
- `npm run prisma:studio` membuka Prisma Studio

## Current Structure

```txt
src/
  app.ts
  server.ts
  class/
  config/
  constant/
  helper/
  libs/
  middlewares/
    tokenVerification/
  modules/
    auth/
    coupon/
    point/
    user/
  templates/
    emails/
prisma/
  schema.prisma
  migrations/
```

## Implementation Log

### 2026-04-09 00:46:33 +07:00

System yang sudah implemented sampai timestamp ini:

- auth register, login, refresh token, logout, verify account, forgot password, dan update password
- JWT access token + cookie-based refresh token flow
- hashing password dengan Argon2 + pepper
- hashing refresh token dan reset password token sebelum simpan ke database
- referral tracking via `referrerCode`
- reward referral berupa point untuk referrer
- reward referral berupa coupon untuk referred user setelah verify
- penambahan model `Point`, `PointHistory`, dan `Coupon`
- repository internal untuk point dan coupon
- email template Handlebars untuk verification dan forgot password
- utility upload image ke Cloudinary
- request validation dengan Zod
- centralized error handling
- Prisma schema untuk auth, reward, event, transaction, dan ticketing core entities

## Notes

- App yang aktif saat ini baru mendaftarkan `AuthRouter` di [src/app.ts](src/app.ts).
- Endpoint untuk event, transaction, coupon, dan point belum dipublish ke app walaupun schema dan sebagian repository-nya sudah ada.
- Setelah schema Prisma berubah, jalankan `npm run prisma:generate` bila client belum ikut ter-update.
