# Buat Block Baru untuk BlockEditor

Buat block type baru untuk `src/components/admin/BlockEditor.tsx`.

**Nama block**: $ARGUMENTS

Ikuti pola yang sudah ada:
1. Buat komponen `[Nama]Block` dengan props `{ data, onChange }`
2. Daftarkan ke `BLOCK_TYPES` di `BlockPicker` (icon + label + description)
3. Tambahkan ke switch/case di `renderBlock()`
4. Data block disimpan sebagai JSON di field `data` — jangan simpan file binary langsung

Pastikan:
- Komponen menggunakan `--dash-*` CSS tokens untuk styling
- Ada tombol untuk clear/reset konten block
- Tidak memerlukan SSR (block editor sudah `dynamic` import)
