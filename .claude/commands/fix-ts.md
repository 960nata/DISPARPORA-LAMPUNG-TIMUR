# Fix TypeScript Errors

Jalankan `npx tsc --noEmit` dan perbaiki semua error TypeScript di `src/` (abaikan error di `node_modules` dan `.next`).

Prioritas:
1. Error di file yang sedang aktif dikerjakan
2. Error tipe `any` yang eksplisit bisa diganti
3. Missing return types di komponen dan fungsi publik

Jangan ubah logika, hanya perbaiki tipe.
