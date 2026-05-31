import { z } from "zod";

// ─── Step 1: Data Anak ─────────────────────────────────────────────────────────

export const childDataSchema = z.object({
  childName: z
    .string({ message: "Nama lengkap anak wajib diisi" })
    .min(2, "Nama lengkap minimal 2 karakter")
    .max(120, "Nama terlalu panjang"),
  nickName: z.string().max(60).optional().or(z.literal("")),
  birthPlace: z.string().max(100).optional().or(z.literal("")),
  birthDate: z
    .string({ message: "Tanggal lahir wajib diisi" })
    .min(1, "Tanggal lahir wajib diisi"),
  gender: z.enum(["Laki-laki", "Perempuan"], {
    message: "Jenis kelamin wajib dipilih",
  }),
  childNik: z
    .string()
    .max(16, "NIK maksimal 16 digit")
    .optional()
    .or(z.literal("")),
  allergies: z.string().max(500).optional().or(z.literal("")),
  specialNeeds: z.string().max(500).optional().or(z.literal("")),
});

// ─── Step 2: Data Orang Tua ────────────────────────────────────────────────────

export const parentDataSchema = z
  .object({
    fatherName: z.string().max(120).optional().or(z.literal("")),
    motherName: z.string().max(120).optional().or(z.literal("")),
    fatherJob: z.string().max(100).optional().or(z.literal("")),
    motherJob: z.string().max(100).optional().or(z.literal("")),
    whatsapp: z
      .string({ message: "Nomor WhatsApp wajib diisi" })
      .min(10, "Nomor WhatsApp minimal 10 digit")
      .max(15, "Nomor WhatsApp maksimal 15 digit")
      .regex(/^[0-9+]+$/, "Nomor WhatsApp hanya boleh berisi angka"),
    parentNik: z
      .string()
      .max(16, "NIK maksimal 16 digit")
      .optional()
      .or(z.literal("")),
    address: z.string().max(500).optional().or(z.literal("")),
  })
  .refine(
    (data) =>
      (data.fatherName && data.fatherName.length >= 2) ||
      (data.motherName && data.motherName.length >= 2),
    {
      message: "Nama ayah atau ibu wajib diisi minimal salah satu",
      path: ["fatherName"],
    },
  );

// ─── Step 3: Dokumen ───────────────────────────────────────────────────────────

export const documentSchema = z.object({
  notes: z.string().max(1000).optional().or(z.literal("")),
  parentEmail: z
    .string()
    .email("Format email tidak valid")
    .optional()
    .or(z.literal("")),
});

// ─── Full Combined Schema ──────────────────────────────────────────────────────

export const ppdbSchema = childDataSchema
  .merge(
    z.object({
      fatherName: z.string().max(120).optional().or(z.literal("")),
      motherName: z.string().max(120).optional().or(z.literal("")),
      fatherJob: z.string().max(100).optional().or(z.literal("")),
      motherJob: z.string().max(100).optional().or(z.literal("")),
      whatsapp: z
        .string({ message: "Nomor WhatsApp wajib diisi" })
        .min(10, "Nomor WhatsApp minimal 10 digit")
        .max(15, "Nomor WhatsApp maksimal 15 digit")
        .regex(/^[0-9+]+$/, "Nomor WhatsApp hanya boleh berisi angka"),
      parentNik: z
        .string()
        .max(16, "NIK maksimal 16 digit")
        .optional()
        .or(z.literal("")),
      address: z.string().max(500).optional().or(z.literal("")),
      notes: z.string().max(1000).optional().or(z.literal("")),
      parentEmail: z
        .string()
        .email("Format email tidak valid")
        .optional()
        .or(z.literal("")),
    }),
  )
  .refine(
    (data) =>
      (data.fatherName && data.fatherName.length >= 2) ||
      (data.motherName && data.motherName.length >= 2),
    {
      message: "Nama ayah atau ibu wajib diisi minimal salah satu",
      path: ["fatherName"],
    },
  );

export type PpdbFormData = z.infer<typeof ppdbSchema>;

// Field keys per step — used by trigger() for partial validation
export const STEP_1_FIELDS: (keyof PpdbFormData)[] = [
  "childName",
  "nickName",
  "birthPlace",
  "birthDate",
  "gender",
  "childNik",
  "allergies",
  "specialNeeds",
];

export const STEP_2_FIELDS: (keyof PpdbFormData)[] = [
  "fatherName",
  "motherName",
  "fatherJob",
  "motherJob",
  "whatsapp",
  "parentNik",
  "address",
];

export const STEP_3_FIELDS: (keyof PpdbFormData)[] = ["notes", "parentEmail"];
