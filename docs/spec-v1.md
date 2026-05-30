# Spesifikasi Fitur v1 — siakad-paud

Ringkasan: rilis v1 berfokus pada fitur inti yang production-ready — bukan MVP minimal. Target timeline: 2 minggu (lihat milestone).

**Tujuan**

- Menyediakan alur PPDB lengkap sampai konversi ke data siswa.
- Menyediakan manajemen data siswa, guru, dan orang tua/wali.
- Menyediakan fitur finansial dasar: buat invoice, rekam pembayaran, dan laporan ringkas.
- Menjamin kualitas dasar: validasi input, revalidasi cache, dan alur rollback sederhana.

**Scope (In-scope)**

- PPDB: form pendaftaran, antrian, approve/reject, konversi ke `Student`.
- Siswa: tambah manual, hapus, daftar siswa dengan metadata (kelas, status).
- Guru: tambah/hapus, daftar.
- Orang Tua/Wali: daftar (read-only, diturunkan dari `Student`).
- Keuangan: buat invoice, rekam pembayaran, snapshot revenue, status invoice otomatis (UNPAID/PARTIAL/PAID).
- Database: menggunakan Prisma + Postgres, schema sudah ada.

**Scope (Out-of-scope)**

- Integrasi payment gateway live (hanya rekam manual).
- Multi-tenant, RBAC lanjutan, dan audit logs lengkap.
- Fitur mobile-specific styling atau offline mode.

**Feature Details & Acceptance Criteria**

- PPDB (pendaftaran)
  - Deskripsi: Form input calon siswa masuk tabel `Admission` dengan status `PENDING`.
  - UI flows: halaman `/ppdb` menampilkan form dan tabel antrian 10 pendaftar terbaru.
  - Server actions: `createAdmission`, `approveAdmission`, `rejectAdmission`.
  - Acceptance:
    - Saat submit form valid, baris `Admission` dibuat dan muncul di tabel (revalidate).
    - Admin dapat menolak dengan alasan; status menjadi `REJECTED` dan catatan tersimpan.
    - Admin dapat menerima, yang membuat `Student` baru dan marks `Admission` -> `APPROVED` dengan `convertedToId` terisi.

- Manajemen Siswa
  - Deskripsi: CRUD ringan: create (manual), read (list), delete.
  - UI flows: halaman `/siswa` menampilkan form tambah dan tabel; tombol `Hapus` untuk tiap baris.
  - Server actions: `createStudent`, `deleteStudent`.
  - Acceptance:
    - Menambah siswa membuat record `Student` dengan field wajib (fullName, birthDate, guardianName, guardianPhone).
    - Menghapus siswa menghapus record (cascade menghapus attendances, invoices, payments sesuai Prisma schema).

- Manajemen Guru & Orang Tua
  - Deskripsi: CRUD ringan untuk guru; daftar read-only untuk wali.
  - UI flows: `/guru` untuk tambah/hapus; `/orangtua` menampilkan daftar unik wali.
  - Server actions: `createTeacher`, `deleteTeacher`.
  - Acceptance:
    - Guru dapat ditambahkan dengan nama; email/telepon optional.
    - Wali ditampilkan sebagai daftar teragregasi dari `Student`.

- Finansial (Invoice & Payment)
  - Deskripsi: Admin dapat membuat invoice, merekam pembayaran, melihat ringkasan.
  - UI flows: `/keuangan` — buat invoice, rekam pembayaran, ringkasan invoice & revenue.
  - Server actions: `createInvoice`, `recordPayment` (sudah ada).
  - Acceptance:
    - Membuat invoice menghasilkan kode unik `INV-YYYYMM-XXXX` dan record `Invoice`.
    - Mencatat pembayaran menambahkan `Payment` dan mengubah `Invoice.status` menjadi `PARTIAL` atau `PAID` sesuai total.
    - Ringkasan menampilkan `remaining` yang benar dan `revenue` total.

**Data & Schema**

- Gunakan model Prisma yang ada: `Admission`, `Student`, `Teacher`, `Invoice`, `Payment`, `Attendance`, dll. (lihat `prisma/schema.prisma`).
- Perubahan migrasi: tidak diperlukan untuk fitur ini (schema sudah mendukung flows). Jika perlu perubahan, buat migration baru dengan `prisma migrate dev`.

**API / Server Actions**

- Server actions Next.js sudah digunakan. Harus:
  - Validasi input minimal pada server.
  - Gunakan transaksi untuk operasi yang mengubah banyak tabel (contoh: approveAdmission membuat Student + update Admission).
  - Revalidate path yang relevan setelah perubahan (`revalidatePath('/ppdb')`, dll.).

**UX / UI**

- Form sederhana dengan validasi required di input.
- Tabel ringkas menampilkan 10-20 item; pesan fallback saat DB tidak tersedia.
- Gunakan tombol aksi kecil untuk fungsi sensitif (Terima/Tolak, Hapus).

**Non-functional Requirements**

- Performance: semua list paginated/take-limited (<=100 rows) untuk v1.
- Observability: console.error logging pada catch; plan: tambahkan Sentry di masa depan.
- Security: sanitize inputs via server validation; no public uploads.
- Backup: pastikan backup DB di lingkungan produksi.

**Testing & QA**

- Unit/Integration:
  - Test server actions logic (validate creation, approve flow, payment status calculation).
- E2E flows (recommended with Playwright):
  - PPDB -> Admin approve -> Student muncul -> Buat invoice -> Rekam pembayaran -> Invoice status PAID.
- Linting & Typecheck: `npm run lint` dan TypeScript check.

**Milestones (2 minggu)**

- Hari 1-2: Audit & spec finalisasi, environment setup, migrate jika perlu.
- Hari 3-7: Implement PPDB, Siswa, Guru/Orangtua, halaman dasar keuangan.
- Hari 8-11: Implement invoice/payment logic, polish UI, add basic validations.
- Hari 12-14: Tests (unit + E2E smoke), bugfix, prepare deployment checklist.

**Acceptance for release v1**

- Semua fitur in-scope bekerja end-to-end di environment staging.
- Alur PPDB sampai pembayaran dapat dijalankan tanpa error fatal.
- Lint/typecheck passing; critical errors fixed.

**Next Steps**

1. Review spec dan konfirmasi asumsi (timeline 2 minggu).
2. Implement test cases for critical flows.
3. Prepare staging environment and run smoke E2E.

---

Dokumen ini disimpan di `docs/spec-v1.md`.
