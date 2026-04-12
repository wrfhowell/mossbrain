import {
  S3Client,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { nanoid } from "nanoid";

const s3 = new S3Client({
  endpoint: process.env.S3_ENDPOINT,
  region: "auto",
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID!,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
  },
});

const bucket = process.env.S3_BUCKET!;

export async function uploadFile(
  key: string,
  body: Buffer | Uint8Array,
  contentType: string
): Promise<void> {
  await s3.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
    })
  );
}

export function getPublicUrl(key: string): string {
  return `${process.env.S3_PUBLIC_URL}/${key}`;
}

export function generateKey(prefix: string, filename: string): string {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, "0");
  const id = nanoid(12);
  const safe = filename.replace(/[^a-zA-Z0-9._-]/g, "_");
  return `${prefix}/${year}/${month}/${id}-${safe}`;
}
