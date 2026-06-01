# SIAKAD PAUD Ceria Bintang 🌟

Sistem Informasi Akademik berskala Enterprise untuk PAUD/TK (Pendidikan Anak Usia Dini / Taman Kanak-Kanak). Dibangun menggunakan ekosistem Next.js App Router terbaru yang memadukan kecepatan akses, keamanan data tingkat tinggi, serta desain antarmuka yang modern, dinamis, dan premium.

## 🚀 Teknologi Inti
- **Framework**: [Next.js 15](https://nextjs.org/) (App Router) dengan TypeScript
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) dengan komponen [Shadcn UI](https://ui.shadcn.com/)
- **Database**: [PostgreSQL (Neon Serverless)](https://neon.tech/) dihubungkan via [Prisma ORM](https://www.prisma.io/)
- **Storage**: [Cloudflare R2](https://www.cloudflare.com/developer-platform/r2/) (Kompatibel S3) untuk penyimpanan dokumen & foto terisolasi.
- **Email & Notifikasi**: *Nodemailer* untuk Invoice, Tagihan, dan Alert
- **Automasi**: Vercel Cron Jobs (Endpoint SPP Bulanan)
- **Testing**: Playwright E2E Testing

---

## 💎 Fitur Utama (Modul Sistem)

Aplikasi ini mencakup seluruh siklus operasional harian sekolah dari Pendaftaran hingga Kelulusan:

### 1. Penerimaan Peserta Didik Baru (PPDB)
- **Portal Publik (`/ppdb-public`)**: Calon pendaftar dapat mengisi formulir *multi-step* dari rumah.
- **Unggah Dokumen Pintar**: Integrasi Cloudflare R2 (S3 API) dengan *Signed URLs* untuk mengunggah dokumen penting (Akte, KK, KTP). Aman dari akses publik yang tidak diizinkan.
- **Validasi Admin**: Filter administrasi dengan satu klik "Terima" atau "Tolak". Status anak akan langsung dimutasi menjadi Siswa Aktif jika disetujui.

### 2. Manajemen Siswa, Orang Tua & Kelas
- **CRUD Super Cepat**: Pendataan biodata lengkap dengan *Progressive Enhancement* via Server Actions.
- **Bulk Import/Export Excel (`xlsx`)**: Memindahkan ribuan data historis dari file Excel, sistem otomatis mendaftarkan relasi akun *Parent* dan memberikan hak akses.
- **Portal Khusus Orang Tua (`/parent`)**: Orang tua memiliki akun akses sendiri (berdasarkan NIK/WA) untuk memantau nilai anak dan tagihan tanpa melihat data anak lain.
- **Manajemen Kelas & Penugasan**: Pembagian siswa TK A, TK B, Daycare secara modular dan penempatan Wali Kelas/Asisten Guru.

### 3. Keuangan & Invoice Terautomasi (Billing SaaS)
- **Dashboard Arus Kas Real-time**: Pemasukan vs Pengeluaran instan dengan UI bergradasi premium.
- **Tagihan Massal (Bulk Invoices)**: *Generate* tagihan (Uang Pangkal, Buku, Outing) untuk satu kelas utuh atau seluruh sekolah hanya dalam 1 detik.
- **Cron Job SPP (`/api/cron/generate-spp`)**: Sistem otomasi bulanan. Setiap tanggal jatuh tempo, sistem akan mengecek, memunculkan tagihan SPP, menghitung biaya denda keterlambatan secara adaptif, dan membuat laporan tunggakan.
- **Surat Tagihan PDF & Email**: Pustaka `pdfkit` berjalan di server (*Serverless Functions*) merakit e-Kwitansi/Invoice PDF yang dilengkapi Kop Surat resmi PAUD, lalu dikirim via Email ke orang tua sebagai **Pengingat Tunggakan**.

### 4. Akademik, Raport & Presensi
- **Buku Penghubung Digital**: Laporan *Daily Report* harian (Durasi Tidur, Nafsu Makan, Aktivitas) untuk anak PAUD/Daycare yang dibagikan harian ke ponsel orang tua.
- **E-Raport Semester Interaktif (Skalabel)**: Sistem pengisian raport berorientasi pada **Tahun Ajaran & Semester** dengan fitur **Simpan Draft** dan **Publikasikan**. Menggunakan pemfilteran berdasarkan periode semester berjalan dan menyimpan riwayat historis (termasuk kelas asal saat lulus). Tampilan form penuh (Full Page Form) terdedikasi untuk ruang ketik narasi yang lebih lega.
- **Cetak Raport PDF Otomatis**: Generate dokumen raport murni menggunakan CSS Print (*A4 ready*). Dokumen bersih dari elemen UI dashboard dan langsung siap dicetak serta ditandatangani.
- **Presensi Harian & Logbook Guru**: Modul kehadiran guru dan unggahan Rencana Pelaksanaan Pembelajaran (RPPH/RPPM) per kelas.
- **Kenaikan Kelas & Mutasi Terintegrasi**: Fitur perpindahan siswa massal antar kelas (Promosi/Kenaikan Kelas), kelulusan, dan pencabutan siswa dengan sangat presisi dari satu UI yang sama.

### 5. Pengumuman & Komunikasi Profesional
- **Pengumuman PWA & Notifikasi**: Menerbitkan pengumuman yang mendukung **Batas Waktu Kedaluwarsa (Expiry)**. Pengumuman otomatis menghilang setelah melewati masa aktif yang ditentukan admin.
- **Notifikasi WhatsApp Broadcast Profesional**: Pemberitahuan otomatis (diterima, lulus, presensi anak hadir, dan validasi bayar SPP) dengan *template* teks formal dan profesional yang dikirimkan via integrasi Fonnte/WA API.
- **Sistem Paginasi & Pencarian Skalabel**: Sinkronisasi state *Search Bar* & *Pagination* via URL Query Params (`?page=1&query=John`) untuk tabel data yang sangat besar. Mengoptimalkan beban *database* hingga 10x lipat.

---

## 🛠 Panduan Instalasi & Menjalankan

### Persyaratan Lingkungan (Environment)
Salin `.env.example` menjadi `.env` lalu lengkapi isinya:

```bash
cp .env.example .env
```
Variabel penting yang harus diisi:
- `DATABASE_URL`: URI koneksi ke *Postgres/Neon*.
- `JWT_SECRET`: Kunci enkripsi token autentikasi.
- `R2_...` & `AWS_...`: Variabel ember Cloudflare R2 untuk fitur unggah PPDB & Logbook Guru.
- `SMTP_...`: Konfigurasi SMTP (e.g. Gmail App Password atau Resend) untuk pengiriman tagihan PDF ke Email.
- `CRON_SECRET`: *Secret key* untuk memicu Endpoint Cron Job secara aman.

### Menjalankan Server Lokal

```bash
# 1. Install semua dependensi
npm install

# 2. Sinkronisasi skema database Prisma (Otomatis membuat tabel di Postgres)
npm run db:push

# 3. Jalankan environment pengembangan
npm run dev
```

Aplikasi bisa langsung dibuka pada [http://localhost:3000](http://localhost:3000). 
Default akun yang di-*seed* di database (jika telah menggunakan `npm run db:seed` atau daftar manual):
- Admin/TU
- Guru / Wali Kelas
- Kepala Sekolah
- Orang Tua Murid

### End-to-End (E2E) Testing
Sistem dijamin stabil menggunakan Playwright.
```bash
# Instalasi browser testing
npx playwright install --with-deps

# Jalankan pengujian aliran pengguna (Login -> Dashboard -> Logout)
npx playwright test
```

---

## 💎 UX / Developer Highlights
- **`ActionForm` Global Wrapper**: Seluruh *Modal/Dialog* dari *Shadcn UI* telah disuntikkan skrip Auto-Close Pintar. Saat operasi *Create/Update/Delete* berhasil di-*commit* ke database, Modal otomatis tertutup dan menampilkan notifikasi sukses hijau di pojok layar berkat `sonner`. Tidak ada lagi UI yang macet!
- **`NextTopLoader`**: Bilah *loading* transisi bernuansa emas (Amber) yang berjalan halus tanpa mengganggu estetika *Dashboard*.

> "Membangun landasan operasional PAUD yang modern, transparan, dan dapat dipercaya orang tua." 🎓
