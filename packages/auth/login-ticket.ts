import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * A *login ticket* is a short-lived, tamper-proof proof that an identifier
 * (phone number or e-mail) passed real verification on the server — either an
 * OTP code that was confirmed, or a password + OTP combination.
 *
 * Why this exists
 * ---------------
 * Next.js turns every export of a `"use server"` module into a public HTTP
 * endpoint, and callers control the arguments. Previously each app's
 * `authenticator()` action called `signIn(<provider>, { identifier })`, and the
 * Credentials `authorize()` callback minted a session from that identifier
 * alone. The password / OTP check lived in a *separate* action the browser
 * happened to call first, so an attacker could simply skip it.
 *
 * `authorize()` now refuses to mint a session unless it is handed a ticket that
 * only the verification actions can produce. An identifier on its own is no
 * longer sufficient to log in as anybody.
 */

const DEFAULT_TTL_MS = 10 * 60 * 1000; // 10 minutes

const getSecret = () => {
  const secret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;

  if (!secret) {
    throw new Error(
      "AUTH_SECRET is not configured; refusing to sign login tickets.",
    );
  }

  return secret;
};

export const normalizeIdentifier = (identifier: string) =>
  identifier.trim().toLowerCase();

const sign = (body: string) =>
  createHmac("sha256", getSecret()).update(body).digest("base64url");

/** Mint a ticket for an identifier that has just been verified server-side. */
export const createLoginTicket = (
  identifier: string,
  ttlMs: number = DEFAULT_TTL_MS,
): string => {
  const payload = {
    i: normalizeIdentifier(identifier),
    e: Date.now() + ttlMs,
  };

  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");

  return `${body}.${sign(body)}`;
};

/**
 * Verify a ticket is authentic, unexpired, and was issued for exactly this
 * identifier. Uses a constant-time signature comparison.
 */
export const verifyLoginTicket = (
  ticket: unknown,
  identifier: string,
): boolean => {
  if (typeof ticket !== "string" || ticket.length === 0) return false;

  const separator = ticket.lastIndexOf(".");
  if (separator <= 0 || separator === ticket.length - 1) return false;

  const body = ticket.slice(0, separator);
  const providedSignature = ticket.slice(separator + 1);

  let expectedSignature: string;
  try {
    expectedSignature = sign(body);
  } catch {
    return false;
  }

  const provided = Buffer.from(providedSignature);
  const expected = Buffer.from(expectedSignature);

  if (
    provided.length !== expected.length ||
    !timingSafeEqual(provided, expected)
  ) {
    return false;
  }

  let payload: { i?: unknown; e?: unknown };
  try {
    payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
  } catch {
    return false;
  }

  if (typeof payload?.i !== "string" || typeof payload?.e !== "number") {
    return false;
  }

  if (payload.e < Date.now()) return false;

  return payload.i === normalizeIdentifier(identifier);
};
