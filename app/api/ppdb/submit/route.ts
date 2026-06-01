import { sendConfirmationEmail } from "@/lib/email";
import { prisma } from "@/lib/prisma";
import {
  GetObjectCommand,
  HeadObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { spawnSync } from "child_process";
import fs from "fs";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import os from "os";
import path from "path";
import { pipeline } from "stream/promises";

const accessKeyId = process.env.R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
const accountId = process.env.R2_ACCOUNT_ID;
const bucketEnv = process.env.R2_BUCKET;
const endpointEnv = process.env.R2_ENDPOINT;
const s3ApiEndpoint = accountId ? `https://${accountId}.r2.cloudflarestorage.com` : endpointEnv;

function makeClient() {
  if (!accessKeyId || !secretAccessKey || !bucketEnv || !s3ApiEndpoint)
    return null;
  return new S3Client({
    region: "auto",
    endpoint: s3ApiEndpoint,
    credentials: { accessKeyId, secretAccessKey },
    forcePathStyle: true,
  });
}

async function verifyRecaptcha(token?: string) {
  const secret = process.env.RECAPTCHA_SECRET_KEY;
  if (!secret) return { ok: true, skipped: true };
  if (!token) return { ok: false, message: "Missing recaptcha token" };

  const params = new URLSearchParams();
  params.append("secret", secret);
  params.append("response", token);

  const res = await fetch("https://www.google.com/recaptcha/api/siteverify", {
    method: "POST",
    body: params,
  });
  const json = await res.json();
  return json;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      childName,
      nickName,
      birthPlace,
      birthDate,
      gender,
      childNik,
      allergies,
      specialNeeds,
      fatherName,
      motherName,
      fatherJob,
      motherJob,
      whatsapp,
      parentNik,
      address,
      notes,
      parentEmail,
      files,
      recaptchaToken,
    } = body as any;

    // recaptcha
    const rc = await verifyRecaptcha(recaptchaToken);
    if (!rc || (rc.success === false && !rc.skipped)) {
      return NextResponse.json(
        { ok: false, message: "reCAPTCHA failed" },
        { status: 400 },
      );
    }

    // files may be object keys (from R2) or public URLs; accept both
    const submittedFiles: string[] = Array.isArray(files)
      ? files.slice(0, 10)
      : [];
    const savedPaths: string[] = [];
    const endpoint = process.env.R2_ENDPOINT;
    const bucket = process.env.R2_BUCKET;

    const MAX_BYTES = Number(
      process.env.MAX_UPLOAD_BYTES || String(5 * 1024 * 1024),
    );
    const allowedTypes = [/^image\//, /^application\/pdf$/];

    const s3 = makeClient();

    for (const f of submittedFiles) {
      if (!f) continue;
      if (typeof f !== "string") continue;
      if (f.startsWith("http://") || f.startsWith("https://")) {
        // already a public URL
        savedPaths.push(f);
      } else {
        // treat as object key; build a publicUrl if possible and store the key
        const key = f;
        // if we have an S3 client, validate object (size + content-type)
        if (s3) {
          try {
            const head = await s3.send(
              new HeadObjectCommand({ Bucket: bucketEnv, Key: key }),
            );
            const size = Number(head.ContentLength ?? 0);
            const ctype = head.ContentType ?? "";
            if (size > MAX_BYTES) {
              return NextResponse.json(
                { ok: false, message: `File ${key} exceeds max size` },
                { status: 400 },
              );
            }
            const okType = allowedTypes.some((rx) => rx.test(ctype));
            if (!okType) {
              return NextResponse.json(
                {
                  ok: false,
                  message: `File ${key} has disallowed content-type ${ctype}`,
                },
                { status: 400 },
              );
            }
          } catch (e) {
            console.error("HeadObject failed", e);
            return NextResponse.json(
              { ok: false, message: `File ${key} not found` },
              { status: 400 },
            );
          }
        }

        // optional virus scan: requires env VIRUS_SCAN_CMD (e.g. clamscan or clamdscan)
        const virusCmd = process.env.VIRUS_SCAN_CMD;
        if (s3 && virusCmd) {
          const tmpFile = path.join(
            os.tmpdir(),
            `ppdb-scan-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          );
          try {
            const get = await s3.send(
              new GetObjectCommand({ Bucket: bucketEnv, Key: key }),
            );
            const body = get.Body as any;
            const writeStream = fs.createWriteStream(tmpFile);
            await pipeline(body, writeStream);

            // run scanner synchronously to simplify flow
            const result = spawnSync(virusCmd, [tmpFile], {
              timeout: 1000 * 60 * 2,
            });
            if (result.error) {
              console.error("Virus scan execution error", result.error);
              return NextResponse.json(
                { ok: false, message: "Virus scan failure" },
                { status: 500 },
              );
            }
            // many scanners exit 0 = clean, 1 = infected, >1 = error
            if (result.status && result.status !== 0) {
              console.warn("Virus detected or scanner error", {
                status: result.status,
                stdout: result.stdout?.toString(),
                stderr: result.stderr?.toString(),
              });
              return NextResponse.json(
                { ok: false, message: `File ${key} failed virus scan` },
                { status: 400 },
              );
            }
          } catch (e) {
            console.error("Virus scan failed", e);
            return NextResponse.json(
              { ok: false, message: `Virus scan error for ${key}` },
              { status: 500 },
            );
          } finally {
            try {
              fs.unlinkSync(tmpFile);
            } catch {}
          }
        }

        if (endpoint && bucket) {
          savedPaths.push(`${endpoint}/${bucket}/${key}`);
        } else {
          savedPaths.push(key);
        }
      }
    }

    // create admission record; append parentEmail and savedPaths into notes
    const notesMerged = [
      notes || "",
      parentEmail ? `ParentEmail: ${parentEmail}` : "",
      savedPaths.length ? `Files: ${savedPaths.join(", ")}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    await prisma.admission.create({
      data: {
        childName,
        nickName: nickName || null,
        birthPlace: birthPlace || null,
        birthDate: new Date(birthDate),
        gender: gender || null,
        childNik: childNik || null,
        allergies: allergies || null,
        specialNeeds: specialNeeds || null,
        fatherName: fatherName || null,
        motherName: motherName || null,
        fatherJob: fatherJob || null,
        motherJob: motherJob || null,
        whatsapp,
        parentNik: parentNik || null,
        address: address || null,
        notes: notesMerged || null,
      },
    });

    // revalidate admin pages
    try {
      revalidatePath("/ppdb");
      revalidatePath("/ppdb-public");
      revalidatePath("/dashboard");
    } catch (e) {
      // ignore
    }

    // send confirmation email if parentEmail
    if (parentEmail) {
      try {
        const pName = fatherName || motherName || "Bapak/Ibu";
        await sendConfirmationEmail(
          parentEmail,
          `[PAUD/TK] Konfirmasi Pendaftaran Ananda ${childName}`,
          `*KONFIRMASI PENDAFTARAN SISWA BARU*\n\nYth. Bapak/Ibu ${pName},\n\nSemoga pesan ini menjumpai Bapak/Ibu dalam keadaan sehat.\n\nKami mengonfirmasi bahwa formulir pendaftaran atas nama Ananda *${childName}* telah berhasil kami terima dalam sistem Penerimaan Peserta Didik Baru (PPDB).\n\nSaat ini, tim panitia PPDB sedang melakukan verifikasi kelengkapan administrasi. Kami akan menginformasikan status pendaftaran Bapak/Ibu melalui WhatsApp atau Email secepatnya.\n\nTerima kasih atas kepercayaan Bapak/Ibu memilih PAUD/TK kami sebagai mitra pendidikan Ananda.\n\nHormat kami,\nPanitia PPDB PAUD/TK`,
        );
      } catch (e) {
        console.error("sendConfirmationEmail failed", e);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("/api/ppdb/submit error", error);
    return NextResponse.json(
      { ok: false, message: "Internal error" },
      { status: 500 },
    );
  }
}
