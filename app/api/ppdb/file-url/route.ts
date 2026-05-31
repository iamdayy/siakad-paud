import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
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
    const keys: string[] = [];
    if (Array.isArray(body.keys)) keys.push(...body.keys.slice(0, 20));
    else if (body.key) keys.push(body.key);

    if (keys.length === 0) {
      return NextResponse.json(
        { ok: false, message: "No key provided" },
        { status: 400 },
      );
    }

    const client = makeClient();
    const results: Array<{ key: string; url: string }> = [];

    for (const key of keys) {
      const cmd = new GetObjectCommand({ Bucket: bucket, Key: key });
      const signed = await getSignedUrl(client, cmd, { expiresIn: 60 * 30 });
      results.push({ key, url: signed });
    }

    return NextResponse.json({ ok: true, urls: results });
  } catch (error: any) {
    console.error("/api/ppdb/file-url error", error);
    return NextResponse.json(
      { ok: false, message: error?.message || "error" },
      { status: 500 },
    );
  }
}
