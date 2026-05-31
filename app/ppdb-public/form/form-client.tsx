"use client";

import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  PpdbFormData,
  STEP_1_FIELDS,
  STEP_2_FIELDS,
  ppdbSchema,
} from "@/lib/validations/ppdb";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ArrowRight, UploadCloud, CheckCircle2, User, Users, FileText, X } from "lucide-react";
import React, { useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";

const STEPS = [
  { id: 1, title: "Data Anak", icon: User },
  { id: 2, title: "Data Orang Tua", icon: Users },
  { id: 3, title: "Dokumen", icon: FileText },
];

export default function PpdbFormClient({ year }: { year: string }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [selectedFiles, setSelectedFiles] = useState<
    Array<{ file: File; progress: number; error?: string }>
  >([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const MAX_FILES = Number(process.env.NEXT_PUBLIC_MAX_FILES) || 3;
  const MAX_BYTES =
    Number(process.env.NEXT_PUBLIC_MAX_UPLOAD_BYTES) || 5 * 1024 * 1024;
  const allowedTypes = [/^image\//, /^application\/pdf$/];

  const {
    register,
    handleSubmit,
    control,
    trigger,
    formState: { errors },
  } = useForm<PpdbFormData>({
    resolver: zodResolver(ppdbSchema),
    mode: "onTouched",
    defaultValues: {
      childName: "",
      nickName: "",
      birthPlace: "",
      birthDate: "",
      gender: undefined,
      childNik: "",
      allergies: "",
      specialNeeds: "",
      fatherName: "",
      motherName: "",
      fatherJob: "",
      motherJob: "",
      whatsapp: "",
      parentNik: "",
      address: "",
      notes: "",
      parentEmail: "",
    },
  });

  async function handleNextStep() {
    let isValid = false;
    if (step === 1) {
      isValid = await trigger(STEP_1_FIELDS);
    } else if (step === 2) {
      isValid = await trigger(STEP_2_FIELDS);
    }

    if (isValid) {
      setStep((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  function handlePrevStep() {
    setStep((prev) => Math.max(1, prev - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function removeFile(index: number) {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  }

  async function onSubmit(data: PpdbFormData) {
    setSubmitError(null);
    setLoading(true);

    try {
      const uploadedKeys: string[] = [];
      const toUpload = selectedFiles.filter(s => !s.error).map((s) => s.file).slice(0, MAX_FILES);

      // Handle file uploads (Mocked here since R2 integration might vary)
      if (toUpload.length) {
        const req = await fetch("/api/ppdb/upload-url", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            files: toUpload.map((f) => ({ name: f.name, type: f.type })),
          }),
        });
        if (req.ok) {
          const { urls } = await req.json();
          // Simulating upload mapping
          urls.forEach((u: any) => {
            if (u.key) uploadedKeys.push(u.key);
            else if (u.publicUrl) uploadedKeys.push(u.publicUrl);
          });
        }
      }

      // reCAPTCHA v3
      const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
      let token = "";
      if (siteKey && (window as any).grecaptcha?.execute) {
        try {
          token = await (window as any).grecaptcha.execute(siteKey, {
            action: "ppdb_submit",
          });
        } catch (err) {
          console.warn("reCAPTCHA execute failed", err);
        }
      }

      const payload = {
        ...data,
        files: uploadedKeys,
        recaptchaToken: token,
      };

      const res = await fetch("/api/ppdb/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const resultBody = await res.json().catch(() => ({}));
        throw new Error(resultBody?.message || "Gagal mengirim pendaftaran");
      }

      window.location.href = "/ppdb-public/thanks";
    } catch (err: any) {
      console.error(err);
      setSubmitError(err?.message || String(err));
      setLoading(false);
    }
  }

  return (
    <section className="container mx-auto max-w-4xl px-4 sm:px-6 relative z-10">
      
      {/* Header Info */}
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-3">
          Formulir Pendaftaran Siswa Baru
        </h1>
        <p className="text-muted-foreground">Tahun Ajaran {year}</p>
      </div>

      <div className="grid md:grid-cols-[240px_1fr] gap-8 bg-card rounded-3xl border shadow-xl shadow-primary/5 overflow-hidden">
        
        {/* Left Sidebar: Steps Progress */}
        <div className="bg-muted/40 p-6 md:border-r border-b md:border-b-0 hidden md:block">
          <div className="sticky top-24 space-y-8">
            {STEPS.map((s, idx) => {
              const isCompleted = step > s.id;
              const isActive = step === s.id;
              const Icon = s.icon;
              return (
                <div key={s.id} className="relative">
                  {idx !== STEPS.length - 1 && (
                    <div className={`absolute top-10 left-[19px] bottom-[-24px] w-[2px] transition-colors duration-300 ${isCompleted ? 'bg-primary' : 'bg-border'}`} />
                  )}
                  <div className={`flex items-start gap-4 transition-all duration-300 ${isActive ? 'opacity-100' : 'opacity-60'}`}>
                    <div className={`relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 bg-background transition-colors duration-300 ${
                      isCompleted ? 'border-primary bg-primary text-primary-foreground' :
                      isActive ? 'border-primary text-primary shadow-[0_0_15px_rgba(var(--primary),0.3)]' : 'border-muted-foreground text-muted-foreground'
                    }`}>
                      {isCompleted ? <CheckCircle2 className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                    </div>
                    <div className="pt-2">
                      <h3 className={`font-semibold text-sm transition-colors ${isActive ? 'text-primary' : ''}`}>Langkah {s.id}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">{s.title}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Mobile Steps Indicator */}
        <div className="md:hidden p-6 border-b bg-muted/20">
          <div className="flex items-center justify-between relative">
            <div className="absolute top-1/2 left-0 h-1 w-full -translate-y-1/2 bg-border rounded-full"></div>
            <div
              className="absolute top-1/2 left-0 h-1 -translate-y-1/2 bg-primary rounded-full transition-all duration-500 ease-out"
              style={{ width: `${((step - 1) / 2) * 100}%` }}
            ></div>
            {STEPS.map((s) => (
              <div
                key={s.id}
                className={`relative flex h-8 w-8 items-center justify-center rounded-full border-2 bg-background text-sm font-bold transition-all duration-300 ${
                  step > s.id ? "border-primary bg-primary text-primary-foreground" :
                  step === s.id ? "border-primary text-primary ring-4 ring-primary/20" : "border-border text-muted-foreground"
                }`}
              >
                {step > s.id ? <CheckCircle2 className="h-4 w-4" /> : s.id}
              </div>
            ))}
          </div>
          <div className="text-center mt-4">
            <h3 className="font-semibold text-primary">Langkah {step}: {STEPS[step-1].title}</h3>
          </div>
        </div>

        {/* Form Content */}
        <div className="p-6 md:p-8">
          <form onSubmit={handleSubmit(onSubmit)}>
            
            {/* STEP 1: Data Anak */}
            <div className={`transition-all duration-500 ${step === 1 ? "opacity-100 translate-x-0" : "opacity-0 hidden translate-x-8"}`}>
              <div className="mb-6">
                <h2 className="text-2xl font-bold mb-2">Biodata Anak</h2>
                <p className="text-sm text-muted-foreground">Pastikan nama dan tanggal lahir sesuai dengan Akta Kelahiran.</p>
              </div>

              <FieldGroup className="gap-y-5">
                <Field>
                  <FieldLabel htmlFor="childName">Nama Lengkap <span className="text-destructive">*</span></FieldLabel>
                  <Input id="childName" {...register("childName")} placeholder="Nama lengkap sesuai akta" className="h-11" />
                  {errors.childName && <p className="text-xs text-destructive mt-1 font-medium">{errors.childName.message}</p>}
                </Field>
                <Field>
                  <FieldLabel htmlFor="nickName">Nama Panggilan</FieldLabel>
                  <Input id="nickName" {...register("nickName")} placeholder="Nama panggilan anak" className="h-11" />
                </Field>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <Field>
                    <FieldLabel htmlFor="birthPlace">Tempat Lahir</FieldLabel>
                    <Input id="birthPlace" {...register("birthPlace")} placeholder="Contoh: Jakarta" className="h-11" />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="birthDate">Tanggal Lahir <span className="text-destructive">*</span></FieldLabel>
                    <Input type="date" id="birthDate" {...register("birthDate")} className="h-11" />
                    {errors.birthDate && <p className="text-xs text-destructive mt-1 font-medium">{errors.birthDate.message}</p>}
                  </Field>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <Field>
                    <FieldLabel htmlFor="gender">Jenis Kelamin <span className="text-destructive">*</span></FieldLabel>
                    <Controller
                      control={control}
                      name="gender"
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <SelectTrigger className="h-11">
                            <SelectValue placeholder="Pilih Jenis Kelamin" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Laki-laki">Laki-laki</SelectItem>
                            <SelectItem value="Perempuan">Perempuan</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.gender && <p className="text-xs text-destructive mt-1 font-medium">{errors.gender.message}</p>}
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="childNik">NIK Anak (16 Digit)</FieldLabel>
                    <Input id="childNik" {...register("childNik")} placeholder="Sesuai di Kartu Keluarga" className="h-11" />
                    {errors.childNik && <p className="text-xs text-destructive mt-1 font-medium">{errors.childNik.message}</p>}
                  </Field>
                </div>

                <Field>
                  <FieldLabel htmlFor="allergies">Riwayat Kesehatan / Kebutuhan Khusus</FieldLabel>
                  <Textarea id="allergies" {...register("allergies")} rows={3} placeholder="Contoh: Alergi susu sapi, asma, dsb. (Boleh dikosongkan jika tidak ada)" className="resize-none" />
                </Field>
              </FieldGroup>
            </div>

            {/* STEP 2: Data Orang Tua */}
            <div className={`transition-all duration-500 ${step === 2 ? "opacity-100 translate-x-0" : "opacity-0 hidden translate-x-8"}`}>
              <div className="mb-6">
                <h2 className="text-2xl font-bold mb-2">Data Orang Tua / Wali</h2>
                <p className="text-sm text-muted-foreground">Kami butuh data ini untuk pendaftaran akun dan komunikasi harian.</p>
              </div>

              {errors.fatherName && errors.fatherName.message === "Nama ayah atau ibu wajib diisi minimal salah satu" && (
                <div className="mb-5 rounded-lg bg-destructive/10 p-4 text-sm text-destructive font-semibold border border-destructive/20 flex items-center gap-2">
                  <X className="h-4 w-4 shrink-0" />
                  {errors.fatherName.message}
                </div>
              )}

              <FieldGroup className="gap-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 p-5 bg-muted/20 rounded-xl border">
                  <Field>
                    <FieldLabel htmlFor="fatherName">Nama Ayah</FieldLabel>
                    <Input id="fatherName" {...register("fatherName")} className="h-11 bg-background" />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="fatherJob">Pekerjaan Ayah</FieldLabel>
                    <Input id="fatherJob" {...register("fatherJob")} className="h-11 bg-background" />
                  </Field>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 p-5 bg-muted/20 rounded-xl border">
                  <Field>
                    <FieldLabel htmlFor="motherName">Nama Ibu</FieldLabel>
                    <Input id="motherName" {...register("motherName")} className="h-11 bg-background" />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="motherJob">Pekerjaan Ibu</FieldLabel>
                    <Input id="motherJob" {...register("motherJob")} className="h-11 bg-background" />
                  </Field>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <Field>
                    <FieldLabel htmlFor="whatsapp">No. WhatsApp Aktif <span className="text-destructive">*</span></FieldLabel>
                    <Input id="whatsapp" {...register("whatsapp")} placeholder="08123456789" className="h-11" />
                    <p className="text-[11px] text-muted-foreground mt-1">Nomor ini akan menjadi password default login Anda.</p>
                    {errors.whatsapp && <p className="text-xs text-destructive mt-1 font-medium">{errors.whatsapp.message}</p>}
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="parentNik">NIK Orang Tua / Wali</FieldLabel>
                    <Input id="parentNik" {...register("parentNik")} placeholder="16 Digit NIK" className="h-11" />
                    {errors.parentNik && <p className="text-xs text-destructive mt-1 font-medium">{errors.parentNik.message}</p>}
                  </Field>
                </div>

                <Field>
                  <FieldLabel htmlFor="address">Alamat Domisili</FieldLabel>
                  <Textarea id="address" {...register("address")} rows={3} placeholder="Alamat tempat tinggal anak saat ini" className="resize-none" />
                </Field>
              </FieldGroup>
            </div>

            {/* STEP 3: Dokumen */}
            <div className={`transition-all duration-500 ${step === 3 ? "opacity-100 translate-x-0" : "opacity-0 hidden translate-x-8"}`}>
              <div className="mb-6">
                <h2 className="text-2xl font-bold mb-2">Unggah Dokumen</h2>
                <p className="text-sm text-muted-foreground">Silakan unggah dokumen pendukung seperti Akta Kelahiran, Kartu Keluarga, dsb.</p>
              </div>

              <FieldGroup className="gap-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Field>
                    <FieldLabel htmlFor="parentEmail">Email Orang Tua (Opsional)</FieldLabel>
                    <Input id="parentEmail" type="email" {...register("parentEmail")} placeholder="email@contoh.com" className="h-11" />
                    {errors.parentEmail && <p className="text-xs text-destructive mt-1 font-medium">{errors.parentEmail.message}</p>}
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="notes">Catatan Tambahan</FieldLabel>
                    <Input id="notes" {...register("notes")} placeholder="Info lain terkait anak" className="h-11" />
                  </Field>
                </div>

                <Field>
                  <FieldLabel className="text-base">Dokumen Pendukung <span className="font-normal text-muted-foreground text-sm">(Maks. {MAX_FILES} File)</span></FieldLabel>
                  <div 
                    className="mt-2 group rounded-2xl border-2 border-dashed border-primary/20 bg-primary/5 hover:bg-primary/10 transition-colors p-8 text-center cursor-pointer relative"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-background/50 rounded-2xl backdrop-blur-[1px]">
                      <span className="font-semibold text-primary">Klik untuk memilih file</span>
                    </div>
                    <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <UploadCloud className="h-8 w-8 text-primary" />
                    </div>
                    <p className="text-foreground font-medium text-lg">Pilih atau Tarik File ke Sini</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Format didukung: JPG, PNG, PDF. <br/>Maksimal {Math.round(MAX_BYTES / 1024 / 1024)}MB per file.
                    </p>
                    <input
                      id="documents"
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept="image/*,application/pdf"
                      className="hidden"
                      onChange={(ev) => {
                        const files = ev.currentTarget.files;
                        if (!files) return;
                        
                        // Combine existing valid files with new ones up to MAX_FILES
                        const newArray = Array.from(files);
                        let totalFiles = [...selectedFiles];
                        
                        for (const f of newArray) {
                          if (totalFiles.length >= MAX_FILES) break;
                          let err: string | undefined;
                          if (f.size > MAX_BYTES) err = `Maks. ${Math.round(MAX_BYTES / 1024 / 1024)}MB`;
                          if (!allowedTypes.some((rx) => rx.test(f.type))) err = `Format tidak didukung`;
                          
                          // Avoid duplicates by name
                          if (!totalFiles.some(tf => tf.file.name === f.name)) {
                            totalFiles.push({ file: f, progress: 0, error: err });
                          }
                        }
                        setSelectedFiles(totalFiles);
                      }}
                    />
                  </div>

                  {selectedFiles.length > 0 && (
                    <div className="mt-5 space-y-3">
                      {selectedFiles.map((s, idx) => (
                        <div key={idx} className={`flex items-center justify-between gap-4 rounded-xl border p-4 shadow-sm ${s.error ? 'bg-destructive/5 border-destructive/20' : 'bg-background'}`}>
                          <div className="flex items-center gap-3 overflow-hidden">
                            <div className={`p-2 rounded-lg ${s.error ? 'bg-destructive/10' : 'bg-primary/10'}`}>
                              <FileText className={`h-5 w-5 ${s.error ? 'text-destructive' : 'text-primary'}`} />
                            </div>
                            <div className="overflow-hidden">
                              <p className="text-sm font-semibold truncate text-foreground">{s.file.name}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs text-muted-foreground font-medium">{Math.round(s.file.size / 1024)} KB</span>
                                {s.error ? (
                                  <span className="text-xs text-destructive font-semibold bg-destructive/10 px-2 py-0.5 rounded-full">{s.error}</span>
                                ) : (
                                  <span className="text-xs text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">Siap Diunggah</span>
                                )}
                              </div>
                            </div>
                          </div>
                          <Button type="button" variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive shrink-0 h-8 w-8 rounded-full" onClick={(e) => { e.stopPropagation(); removeFile(idx); }}>
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </Field>
              </FieldGroup>

              {submitError && (
                <div className="mt-6 rounded-xl bg-destructive/10 p-5 text-sm text-destructive font-medium border border-destructive/20 flex items-start gap-3">
                  <X className="h-5 w-5 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-base mb-1">Gagal Mengirim Form</h4>
                    <p>{submitError}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Sticky Bottom Actions */}
            <div className="mt-10 pt-6 border-t flex flex-col-reverse sm:flex-row justify-between gap-4">
              {step > 1 ? (
                <Button type="button" variant="outline" size="lg" onClick={handlePrevStep} disabled={loading} className="w-full sm:w-auto h-12 rounded-xl border-2 hover:bg-muted font-semibold">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Kembali
                </Button>
              ) : (
                <div className="hidden sm:block"></div>
              )}

              {step < 3 ? (
                <Button type="button" size="lg" onClick={handleNextStep} className="w-full sm:w-auto h-12 rounded-xl font-semibold shadow-lg shadow-primary/20">
                  Langkah Selanjutnya
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button type="submit" disabled={loading} size="lg" className="w-full sm:w-auto h-12 rounded-xl font-bold shadow-lg shadow-primary/30 bg-primary hover:bg-primary/90 text-primary-foreground relative overflow-hidden">
                  {loading ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Mengirim Pendaftaran...
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <CheckCircle2 className="mr-2 h-5 w-5" />
                      Selesaikan Pendaftaran
                    </span>
                  )}
                </Button>
              )}
            </div>
            
          </form>
        </div>
      </div>
    </section>
  );
}
