// Server-only helper (not "use server"). The app runs behind nginx-proxy,
// which sets X-Real-IP / X-Forwarded-For; without a proxy these are absent.
import { headers } from "next/headers";

export const clientIp = async () => {
  const h = await headers();
  return (
    h.get("x-real-ip")?.trim() ||
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown"
  );
};
