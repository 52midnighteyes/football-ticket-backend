# Bug To Fix

## Done

### 1. Event module sudah dipisah sampai repository

- Status: fixed
- Scope:
  controller `event` sekarang tipis, business flow pindah ke service, dan query Prisma pindah ke repository.
- Files:
  `src/modules/event/event.controller.ts`
  `src/modules/event/event.service.ts`
  `src/modules/event/event.repository.ts`

### 2. Create/update event sekarang pakai param untuk ID organizer/event

- Status: fixed
- Scope:
  create event pakai `POST /api/event/organizer/:id`, sedangkan update/delete pakai `/:id` sebagai event id.
- Files:
  `src/modules/event/event.routes.ts`
  `src/modules/event/event.schemas.ts`

### 3. CRUD event MVP sudah aktif

- Status: fixed
- Scope:
  sudah ada create, get event dengan query filter, update full payload, dan soft delete.
- Files:
  `src/modules/event/event.routes.ts`
  `src/modules/event/event.controller.ts`
  `src/modules/event/event.service.ts`
  `src/modules/event/event.repository.ts`

### 4. Banner event lama dihapus saat update banner baru

- Status: fixed
- Scope:
  ketika upload banner baru saat update event, backend akan simpan banner baru lalu hapus banner lama dari Cloudinary.
- Files:
  `src/modules/event/event.service.ts`
  `src/libs/cloudinary/cloudinary.lib.ts`

### 5. Role guard reusable untuk route sudah ada

- Status: fixed
- Scope:
  middleware `roleGuard(...roles)` sudah bisa dipakai di route lain, dan event write route sudah menggunakannya.
- Files:
  `src/middlewares/roleGuard.middleware.ts`
  `src/modules/event/event.routes.ts`

### 6. Query event sekarang fleksibel dan where dirakit di service

- Status: fixed
- Scope:
  `GET /api/event` sekarang bisa filter dengan `id`, `organizerId`, `locationId`, `categoryId`, dan `status`, lalu object `where` Prisma dirakit dulu di service.
- Files:
  `src/modules/event/event.schemas.ts`
  `src/modules/event/event.service.ts`
  `src/modules/event/event.repository.ts`

### 7. Multipart event create/update sekarang diparse dengan urutan middleware yang benar

- Status: fixed
- Scope:
  `multer` sekarang dijalankan sebelum validasi body di route create/update event, jadi request `multipart/form-data` bisa lolos parsing dengan benar.
- Files:
  `src/modules/event/event.routes.ts`

## Remaining

### 1. Reset-token check selalu balikin sukses

- Status: open
- Files:
  `src/modules/auth/auth.controller.ts`
  `src/modules/auth/auth.service.ts`
- Dampak:
  endpoint `GET /api/auth/token/:token` selalu merespons `200` dengan message `"Token is valid"`, bahkan saat `checkResetTokenService()` mengembalikan `0`. Di frontend ini bisa bikin token expired/invalid tetap dianggap lolos verifikasi awal, lalu user baru gagal saat submit password baru.
- Fix nanti:
  branch hasil service di controller dan balikin `4xx` untuk token invalid/expired.

### 2. Semua request nge-log header dan body mentah

- Status: open
- Files:
  `src/app.ts`
- Dampak:
  password login, reset token, cookie, dan auth header ikut masuk log untuk semua route. Buat MVP ini riskan kalau server jalan di shared logs atau production.
- Fix nanti:
  hapus middleware ini, atau minimal batasi ke development saja dan redact field sensitif.

### 3. Reset password request bikin banyak token aktif sekaligus

- Status: open
- Files:
  `src/modules/auth/auth.service.ts`
- Dampak:
  setiap request lupa password bikin token baru, tapi token lama tetap valid sampai expired atau salah satunya dipakai. Kalau user spam request atau ada email lama yang kebocoran, lebih dari satu reset link masih bisa dipakai dalam window 15 menit.
- Fix nanti:
  revoke atau mark used token reset lama untuk user itu sebelum simpan token baru.
