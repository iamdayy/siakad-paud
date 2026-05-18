# SIAKAD-PAUD

Bootstrap awal untuk sistem informasi sekolah PAUD/TK berbasis Next.js App Router, TypeScript, Tailwind CSS, shadcn/ui-ready utilities, dan Prisma ORM.

## Menjalankan proyek

```bash
npm install
npm run dev
```

## Environment

Salin `.env.example` menjadi `.env` lalu sesuaikan:

```bash
cp .env.example .env
```

## Script utama

- `npm run dev` - menjalankan aplikasi lokal
- `npm run lint` - menjalankan ESLint
- `npm run build` - build produksi Next.js
- `npm run prisma:generate` - generate Prisma Client
- `npm run db:push` - sinkronkan schema Prisma ke database
- `npm run db:migrate` - membuat migration Prisma saat schema final siap
