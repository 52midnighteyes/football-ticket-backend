# Simple Auth Boilerplate

Boilerplate backend sederhana berbasis TypeScript, Express, Prisma, PostgreSQL, Zod, JWT access token, dan refresh token berbasis cookie.

Project ini sudah memakai pola module assembly, jadi route tidak didaftarkan satu per satu di `server.ts`. Setiap module merakit dependency-nya sendiri lalu dikumpulkan di satu tempat.

## Status Project

Project ini masih raw dan masih akan terus gue refactor. Struktur yang ada sekarang sudah bisa dipakai buat development, tapi masih bakal gue rapihin lagi seiring progress fitur dan kebutuhan arsitektur.

## Stack

- TypeScript
- Express
- Prisma
- PostgreSQL
- Zod
- JWT
- Cookie-based refresh token

## Fitur Saat Ini

- register user
- login user
- access token berbasis JWT
- refresh token berbasis cookie `httpOnly`
- refresh token rotation
- logout
- input validation dengan Zod
- centralized error handling
- middleware verifikasi bearer token untuk route protected
- module-based folder structure

## Endpoint

### Public

- `GET /`
  Mengecek apakah API berjalan.

- `POST /api/auth/register`
  Register user baru.

- `POST /api/auth/login`
  Login user, return access token, dan set cookie refresh token.

- `POST /api/auth/refresh-token`
  Membuat access token baru dari refresh token cookie.

- `POST /api/auth/logout`
  Menghapus refresh token dari server lalu clear cookie.

## Auth Flow

### 1. Register

Client mengirim data register ke `POST /api/auth/register`.

Server akan:

- cek apakah email sudah terdaftar
- hash password dengan `argon2`
- simpan user ke database
- return access token dan user payload

### 2. Login

Client mengirim email dan password ke `POST /api/auth/login`.

Server akan:

- validasi email dan password
- generate access token
- generate refresh token acak
- hash refresh token sebelum disimpan ke database
- simpan versi hash ke tabel `RefreshToken`
- set cookie `refreshToken`
- return access token dan user payload

### 3. Refresh Token

Client memanggil `POST /api/auth/refresh-token` dengan cookie refresh token yang masih ada.

Server akan:

- ambil refresh token dari cookie
- hash token tersebut
- cari token di database
- jika valid, generate access token baru
- rotate refresh token lama dengan refresh token baru
- set cookie refresh token yang baru
- return access token baru dan user payload

Jika cookie tidak ada atau token tidak valid:

- cookie akan di-clear
- response akan return `401`

### 4. Logout

Client memanggil `POST /api/auth/logout`.

Server akan:

- ambil refresh token dari cookie
- hash token tersebut
- hapus token dari database jika ada
- clear cookie refresh token
- return response sukses

## Cookie Refresh Token

Refresh token disimpan di cookie dengan konfigurasi:

- `httpOnly: true`
- `secure: NODE_ENV === "production"`
- `sameSite: "lax"`
- `path: "/api/auth"`
- `maxAge: 14 hari`

Karena refresh token memakai cookie, frontend perlu mengirim request dengan credentials.

Contoh:

```ts
fetch("http://localhost:8080/api/auth/refresh-token", {
  method: "POST",
  credentials: "include",
});
```

## Role User

Public register hanya menerima role:

- `USER`
- `ORGANIZER`

Role `ADMIN` tetap ada di schema, tapi tidak bisa dibuat dari endpoint register publik.

## Struktur Folder

```txt
src/
  app.ts
  server.ts
  config/
  class/
  constant/
  helper/
  libs/
  middlewares/
    tokenVerification/
  modules/
    index.ts
    auth/
    user/
  types/
```

## Instalasi

### 1. Install dependency

```bash
npm install
```

### 2. Siapkan environment variables

Buat file `.env` lalu isi:

```env
DATABASE_URL=
PORT=8080
JWT_SECRET=
REFRESH_TOKEN_SECRET=
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

Keterangan singkat:

- `DATABASE_URL`: koneksi PostgreSQL
- `JWT_SECRET`: secret untuk access token
- `REFRESH_TOKEN_SECRET`: secret untuk hash refresh token
- `FRONTEND_URL`: origin frontend untuk CORS

### 3. Jalankan migration

```bash
npm run prisma:migrate
```

### 4. Generate Prisma client

```bash
npm run prisma:generate
```

### 5. Jalankan server

```bash
npm run dev
```

Server akan berjalan di port sesuai `PORT`.

## Scripts

- `npm run dev` menjalankan server development dengan `tsx watch`
- `npm run build` compile TypeScript ke folder `dist`
- `npm run check` type-check tanpa output build
- `npm run prisma:generate` generate Prisma client
- `npm run prisma:migrate` menjalankan migration development
- `npm run prisma:studio` membuka Prisma Studio

## Schema Inti

### User

Menyimpan data user utama:

- `id`
- `firstName`
- `lastName`
- `email`
- `password`
- `role`

### RefreshToken

Menyimpan refresh token yang sudah di-hash:

- `id`
- `hashedToken`
- `userId`
- `expiresAt`
- `createdAt`

## Route Protected

Boilerplate ini sudah punya middleware bearer token di:

- `src/middlewares/tokenVerification/tokenVerification.middleware.ts`

Middleware ini membaca header:

```txt
Authorization: Bearer <access_token>
```

Lalu hasil verifikasi akan disimpan ke:

```ts
req.user
```

Contoh pemakaian di route:

```ts
router.get("/me", verifyToken.accessToken, controller.me);
```

## Pola Module

Setiap module bertanggung jawab merakit dependency-nya sendiri.

Contoh di auth module:

1. buat repository
2. inject ke service
3. inject service ke controller
4. inject controller ke router
5. return `{ path, router }`

Assembler semua module ada di:

- `src/modules/index.ts`

`server.ts` hanya memanggil:

```ts
const app = createApp(createModules());
startApp(app);
```

## Cara Menambah Module Baru

Misalnya ingin menambah module `profile`.

### 1. Buat folder module

Contoh struktur:

```txt
src/modules/profile/
  profile.controller.ts
  profile.service.ts
  profile.repository.ts
  profile.route.ts
  profile.module.ts
```

### 2. Rakit dependency di module

Contoh `profile.module.ts`:

```ts
import { createProfileController } from "./profile.controller.js";
import { createProfileRoute } from "./profile.route.js";
import { createProfileService } from "./profile.service.js";
import { createProfileRepository } from "./profile.repository.js";

export const createProfileModule = () => {
  const profileRepository = createProfileRepository();
  const profileService = createProfileService(profileRepository);
  const profileController = createProfileController(profileService);

  return {
    path: "/api/profile",
    router: createProfileRoute(profileController),
  };
};
```

### 3. Daftarkan ke assembler module

Edit `src/modules/index.ts`:

```ts
import { createAuthModule } from "./auth/auth.module.js";
import { createProfileModule } from "./profile/profile.module.js";
import type { AppModule } from "../types/module.type.js";

export const createModules = (): AppModule[] => {
  return [createAuthModule(), createProfileModule()];
};
```

Setelah itu app akan otomatis me-loop semua module dan register route-nya.

## Catatan

- `build` tidak otomatis menjalankan `prisma generate`, jadi setelah schema berubah tetap jalankan `npm run prisma:generate`.
- Refresh token disimpan dalam bentuk hash, bukan plain token.
- Saat frontend memakai cookie refresh token, pastikan request mengirim credentials.
