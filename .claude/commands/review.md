# Code Review SIMAD

Lakukan code review menyeluruh untuk perubahan yang ada. Fokus pada:

1. **Keamanan**: cek XSS, injeksi, data yang di-expose ke client
2. **Performa**: re-render tidak perlu, fetch tanpa loading state, image tanpa lazy load
3. **Konvensi proyek**:
   - Apakah menggunakan CSS design tokens (`--dash-*`) atau hardcode warna?
   - Apakah komponen interaktif sudah `"use client"`?
   - Apakah TipTap/BlockEditor sudah di-`dynamic` import dengan `ssr: false`?
4. **Proteksi**: apakah ada perubahan di `src/app/page.tsx`, `src/components/home/`, atau `src/app/profil/`? **Tandai sebagai pelanggaran keras.**
5. **TypeScript**: ada `any` yang bisa diganti tipe lebih spesifik?

Tampilkan hasilnya dalam format:
- ✅ Baik
- ⚠️ Perlu perhatian
- ❌ Harus diperbaiki
