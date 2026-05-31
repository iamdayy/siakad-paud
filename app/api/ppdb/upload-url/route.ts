import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { NextResponse } from "next/server";

const accessKeyId = process.env.R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
const accountId = process.env.R2_ACCOUNT_ID;
const bucket = process.env.R2_BUCKET;
const endpoint =
  process.env.R2_ENDPOINT ||
  (accountId ? `https://${accountId}.r2.cloudflarestorage.com` : undefined);

function makeClient() {
  if (!accessKeyId || !secretAccessKey || !bucket || !endpoint) {
    throw new Error("R2 credentials or bucket/endpoint not configured");
  }
  return new S3Client({
    region: "auto",
    endpoint,
    credentials: { accessKeyId, secretAccessKey },
    forcePathStyle: false,
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const files = body.files as Array<{ name: string; type?: string }>;
    if (!Array.isArray(files) || files.length === 0) {
      return NextResponse.json(
        { ok: false, message: "No files" },
        { status: 400 },
      );
    }

    const client = makeClient();
    const urls: Array<{ url: string; key: string; publicUrl?: string }> = [];

    for (const f of files) {
      const key = `ppdb/${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${f.name.replace(/[^a-zA-Z0-9.\-_]/g, "_")}`;
      const cmd = new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        ContentType: f.type || "application/octet-stream",
      });
      const signedUrl = await getSignedUrl(client, cmd, { expiresIn: 60 * 10 });
      const publicUrl =
        endpoint && bucket ? `${endpoint}/${bucket}/${key}` : undefined;
      urls.push({ url: signedUrl, key, publicUrl });
    }

    return NextResponse.json({ ok: true, urls });
  } catch (error: any) {
    console.error("/api/ppdb/upload-url error", error);
    return NextResponse.json(
      { ok: false, message: error?.message || "error" },
      { status: 500 },
    );
  }
}
