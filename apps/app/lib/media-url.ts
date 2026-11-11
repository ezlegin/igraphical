// Signed, expiring links for files on the download host (dl.igraphical.ir).
// Server-only: never import this from a client component.
import { createHmac } from "crypto";

const MEDIA_HOST = "dl.igraphical.ir";
const LINK_TTL_SECONDS = 3 * 60 * 60; // a lesson link works for 3 hours

/**
 * Turns https://dl.igraphical.ir/Courses/x.mp4 into
 * https://dl.igraphical.ir/v.php?p=/Courses/x.mp4&u=<user>&e=<expiry>&s=<hmac>,
 * checked by deploy/dl-host/public_html/v.php. Until DL_SIGNING_SECRET is set
 * (i.e. the gateway is installed), URLs are returned unchanged.
 */
export const signMediaUrl = (rawUrl: string, userId: number) => {
  const secret = process.env.DL_SIGNING_SECRET;
  if (!secret || secret.length < 32) return rawUrl;

  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    return rawUrl;
  }
  if (url.hostname !== MEDIA_HOST) return rawUrl;

  const p = decodeURIComponent(url.pathname);
  const u = String(userId);
  const e = String(Math.floor(Date.now() / 1000) + LINK_TTL_SECONDS);
  const s = createHmac("sha256", secret).update(`${p}|${u}|${e}`).digest("hex");

  const signed = new URL(`https://${MEDIA_HOST}/v.php`);
  signed.searchParams.set("p", p);
  signed.searchParams.set("u", u);
  signed.searchParams.set("e", e);
  signed.searchParams.set("s", s);
  return signed.toString();
};
