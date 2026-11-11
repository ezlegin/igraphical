// Expiring links for course files. Server-only: never import from a client
// component (it needs the storage secret).
//
// Lesson URLs in the database still point at the old download host
// (https://dl.igraphical.ir/Courses/...). The same files live in the private
// ArvanCloud bucket under the same path (Courses/...), so we translate the
// URL to a bucket key and hand out a presigned link instead. Until the S3_*
// variables are set, URLs are returned unchanged.
import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const OLD_MEDIA_HOST = "dl.igraphical.ir";
const LINK_TTL_SECONDS = 3 * 60 * 60; // a link works for 3 hours

let client: S3Client | null = null;

const storage = () => {
  const {
    S3_ENDPOINT,
    S3_REGION,
    S3_BUCKET,
    S3_ACCESS_KEY_ID,
    S3_SECRET_ACCESS_KEY,
  } = process.env;
  if (!S3_ENDPOINT || !S3_BUCKET || !S3_ACCESS_KEY_ID || !S3_SECRET_ACCESS_KEY)
    return null;

  // accept "s3.ir-thr-at1.arvanstorage.ir" as well as a full https:// URL
  const endpoint = /^https?:\/\//.test(S3_ENDPOINT)
    ? S3_ENDPOINT
    : `https://${S3_ENDPOINT}`;

  client ??= new S3Client({
    endpoint,
    region: S3_REGION || "default",
    forcePathStyle: true,
    credentials: {
      accessKeyId: S3_ACCESS_KEY_ID,
      secretAccessKey: S3_SECRET_ACCESS_KEY,
    },
  });
  return { client, bucket: S3_BUCKET };
};

/**
 * Bucket key for a stored lesson/teaser address:
 *   "Courses/a/b.mp4" or "/Courses/a/b.mp4"         → "Courses/a/b.mp4"
 *   "https://dl.igraphical.ir//Courses/a/b.mp4"     → "Courses/a/b.mp4"
 *   any other full URL (e.g. an external site)      → null (used as is)
 */
export const bucketKeyFor = (rawUrl: string) => {
  const value = rawUrl.trim();
  if (value && !/^[a-z]+:\/\//i.test(value) && !value.startsWith("//"))
    return value.replace(/\/+/g, "/").replace(/^\//, "");
  try {
    const url = new URL(rawUrl);
    if (url.hostname !== OLD_MEDIA_HOST) return null;
    return decodeURIComponent(url.pathname).replace(/\/+/g, "/").replace(/^\//, "");
  } catch {
    return null;
  }
};

/** Presigned link to a course file that stops working after 3 hours. */
export const signMediaUrl = async (rawUrl: string) => {
  const s3 = storage();
  const key = bucketKeyFor(rawUrl);
  if (!key) return rawUrl;
  // not configured yet: fall back to the old public host for plain paths
  if (!s3) return /^https?:\/\//i.test(rawUrl) ? rawUrl : `https://${OLD_MEDIA_HOST}/${key}`;

  try {
    return await getSignedUrl(
      s3.client,
      new GetObjectCommand({ Bucket: s3.bucket, Key: key }),
      { expiresIn: LINK_TTL_SECONDS },
    );
  } catch (error) {
    console.error("Presigning media URL failed", key, error);
    return rawUrl;
  }
};
