Act as an expert full-stack developer specialized in Next.js (App Router), TypeScript, Tailwind CSS, Shadcn/ui, and Prisma ORM. We are building a high-performance, secure, and user-friendly School Information System for a PAUD/TK (Preschool/Kindergarten).

Please understand the following comprehensive business processes, system requirements, and the specific technical tasks to guide our entire coding session:

=========================================
CORE BUSINESS PROCESSES & REQUIREMENTS
=========================================

1. Modul Penerimaan Peserta Didik Baru (PPDB / Pendaftaran)
   - Karakteristik pendaftaran PAUD berbeda dengan sekolah besar karena banyak data sensitif anak yang harus tercatat sejak awal.
   - Formulir Pendaftaran Online/Offline: Kontrol input data calon siswa.
   - Data Anak wajib: Nama lengkap, nama panggilan (sangat penting untuk guru TK), TTL, NIK, jumlah bersaudara, riwayat imunisasi/kesehatan, dan kebutuhan khusus/alergi.
   - Data Orang Tua/Wali wajib: Nama ayah/ibu, NIK, pekerjaan, nomor WhatsApp (wajib aktif), dan alamat rumah.
   - Unggah Dokumen Pendukung: Fitur untuk mengunggah scan Akta Kelahiran, Kartu Keluarga (KK), dan KTP Orang Tua.
   - Validasi & Seleksi Administrasi: Status pendaftaran (Pending, Diterima, Ditolak).
   - Pembayaran Biaya Masuk (Uang Pangkal): Integrasi konfirmasi pembayaran komponen awal (pendaftaran, seragam, gedung, buku/alat peraga) sebelum siswa resmi mendapatkan Nomor Induk Siswa (NIS).

2. Modul Manajemen Siswa & Kedisiplinan
   - Database Profil Siswa: Berisi rekam jejak lengkap siswa yang aktif, lulus, atau mutasi (pindah sekolah) secara dinamis sepanjang tahun ajaran.
   - Presensi Harian Siswa: Sistem pencatatan kehadiran (Hadir, Izin, Sakit, Alpa). Khusus PAUD, fitur ini terhubung atau memberikan notifikasi otomatis ke orang tua saat anak sudah sampai di sekolah demi keamanan.
   - Manajemen Mutasi & Kelulusan: Proses untuk meluluskan satu angkatan atau mencatat siswa yang keluar di tengah semester.

3. Modul Manajemen Kelas & Pembagian Kelompok Belajar
   - Di tingkat PAUD, pembagian kelas didasarkan pada rentang usia (misal: Daycare, Kelompok Bermain/KB, TK A, dan TK B).
   - Pemetaan Kelas (Floating Siswa): Fitur untuk memasukkan siswa ke dalam kelas tertentu di awal tahun ajaran baru.
   - Penugasan Wali Kelas & Guru Pendamping: Menentukan guru utama dan asisten guru yang bertanggung jawab atas kelas tersebut.
   - Kapasitas Kelas: Batasan maksimal jumlah anak per kelas demi menjaga rasio ideal guru dan murid (misal 1 guru berbanding 10-15 anak).

4. Modul Manajemen Guru & Staf (Kepegawaian)
   - Biodata Pendidik & Tenaga Kependidikan (PTK): Data pribadi, pendidikan terakhir, nomor Sertifikasi (jika ada), Jabatan (Kepala Sekolah, Guru Kelas, Staff Administrasi).
   - Presensi & Jam Mengajar Guru: Rekap kehadiran guru setiap hari untuk keperluan evaluasi kinerja.
   - Logbook/Tugas Guru: Tempat guru mengunggah Rencana Pelaksanaan Pembelajaran Harian (RPPH) atau Rencana Pelaksanaan Pembelajaran Mingguan (RPPM) agar manajemen bisa memantau kesiapan mengajar.

5. Modul Manajemen Keuangan
   - Penerimaan Kas (Pendapatan): Tagihan SPP Bulanan otomatis dibuat setiap bulan untuk seluruh siswa aktif. Harus ada status (Lunas / Belum Lunas) dan otomatisasi denda jika terlambat.
   - Biaya Non-SPP: Biaya catering bulanan, jemputan, uang kegiatan (outing class/study tour), atau pembelian buku.
   - Metode Pembayaran: Fitur cetak kwitansi digital dan pencatatan apakah pembayaran via Transfer Bank, Cash, atau Payment Gateway.
   - Pengeluaran Kas (Belanja Sekolah): Gaji guru dan staf, biaya operasional (listrik, air, internet, ATK), serta pembelian Alat Permainan Edukatif (APE), baik interior maupun eksterior.
   - Laporan Keuangan: Neraca sederhana, laporan arus kas (pemasukan vs pengeluaran), dan rekap tunggakan SPP per kelas untuk memudahkan penagihan ke orang tua.

6. Modul Komunikasi & Laporan Perkembangan Anak (Raport)
   - Penilaian PAUD menggunakan penilaian deskriptif kualitatif (bukan angka).
   - Pencatatan Penilaian Berkala: Guru bisa menginput perkembangan anak berdasarkan indikator: Belum Berkembang (BB), Mulai Berkembang (MB), Berkembang Sesuai Harapan (BSH), dan Berkembang Sangat Baik (BSB).
   - Buku Penghubung Digital (Daily Report): Fitur harian tempat guru melaporkan porsi makan anak, durasi tidur siang (untuk daycare/fullday), mood anak, dan aktivitas penting hari itu kepada orang tua.
   - E-Raport: Cetak raport narasi per semester yang merangkum aspek nilai agama & moral, fisik-motorik, kognitif, bahasa, sosial-emosional, dan seni.

7. Ekspektasi Tampilan & Dashboard Utama (Staf/Admin)
   - Dashboard harus informatif, bersih, dan user-friendly agar tidak melelahkan mata.
   - Begitu log in, staf bisa langsung melihat secara real-time:
     1. Jumlah siswa yang tidak masuk hari ini.
     2. Total SPP yang sudah masuk bulan ini beserta daftar siswa yang menunggak.
     3. Notifikasi jika ada dokumen pendaftaran baru yang perlu divalidasi.

=========================================
TECHNICAL IMPLEMENTATION TASKS
=========================================
We will build this system modularly. Please be ready to generate the code for each specific task outlined below when I call them:

TASK 1: Database Schema (Prisma ORM)
Generate a `schema.prisma` for PostgreSQL with appropriate Enums (Role, RegistrationStatus, StudentStatus, AttendanceStatus, InvoiceStatus, AssessmentIndicator) and interconnected Models (User, Student, Parent, Class, Teacher, Invoice, DailyReport, Assessment) handling all referential integrity and indexes.

TASK 2: Admin Dashboard Home Page (Server Component)
Create `app/(dashboard)/admin/page.tsx` using Tailwind CSS and Shadcn/ui. Display Stat Cards for today's absent students, monthly SPP collected vs arrears, and a table showing pending PPDB applicants requiring validation with a clean, eye-friendly layout.

TASK 3: PPDB Multi-Step Form (Client Component)
Create a multi-step form with React Hook Form and Zod validation. Step 1: Data Anak (including nickname and allergies), Step 2: Data Orang Tua (including active WhatsApp and jobs), Step 3: Document uploads (Birth certificate, KK, KTP).

TASK 4: Daily Student Attendance (Server Action)
Write `app/actions/attendance.ts` to process bulk attendance arrays (PRESENT, PERMITTED, SICK, ABSENT) via a Prisma transaction and trigger a mock function (`sendWhatsAppNotification`) to notify parents in real-time when the student arrives.

TASK 5: Automated SPP Invoicing (Cron Job API Route)
Create an authorized API Route Handler `app/api/cron/generate-spp/route.ts` that runs monthly, fetches all ACTIVE students, generates UNPAID invoices, and includes logic for calculating late payment fines.

TASK 6: Qualitative Assessment & Daily Report Forms (UI & Logic)
Build mobile-friendly interfaces for teachers to input Daily Reports (food intake, nap duration, mood) and E-Raports based on the 6 developmental aspects using the BB, MB, BSH, and BSB indicators.

-----------------------------------------
This is our master architectural blueprint. Do you understand the domain context and the breakdown of tasks? Please acknowledge, and I will tell you which TASK to generate first.