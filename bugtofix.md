# Bug To Fix

## 1. Reset-token check selalu balikin sukses
- File: `src/modules/auth/auth.controller.ts:178`
- File: `src/modules/auth/auth.service.ts:356`
- Dampak: endpoint `GET /api/auth/token/:token` selalu merespons `200` dengan message `"Token is valid"`, bahkan saat `checkResetTokenService()` mengembalikan `0`. Di frontend ini bisa bikin token expired/invalid tetap dianggap lolos verifikasi awal, lalu user baru gagal saat submit password baru.
- Fix nanti: branch hasil service di controller dan balikin `4xx` untuk token invalid/expired.

## 2. Semua request nge-log header dan body mentah
- File: `src/app.ts:27`
- Dampak: password login, reset token, cookie, dan auth header ikut masuk log untuk semua route. Buat MVP ini riskan banget kalau server jalan di shared logs atau production.
- Fix nanti: hapus middleware ini, atau minimal batasi ke development saja dan redact field sensitif.

## 3. Reset password request bikin banyak token aktif sekaligus
- File: `src/modules/auth/auth.service.ts:288`
- Dampak: setiap request lupa password bikin token baru, tapi token lama tetap valid sampai expired atau salah satunya dipakai. Kalau user spam request atau ada email lama yang kebocoran, lebih dari satu reset link masih bisa dipakai dalam window 15 menit.
- Fix nanti: revoke/mark used token reset lama untuk user itu sebelum simpan token baru.
