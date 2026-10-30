import { createHmac, randomInt, timingSafeEqual } from "node:crypto";

import { database } from "@igraph/database";

/**
 * Server-only OTP helpers.
 *
 * SECURITY: this module must never carry a `"use server"` directive and must
 * never be re-exported from `./index.ts`. It returns the plaintext code so it
 * can be delivered to the user, and a `"use server"` module turns every export
 * into a public HTTP endpoint — which is exactly how the OTP used to be
 * readable by anyone who called `generateSmsOtp("<victim phone>")`.
 */

export type OtpChannel = "SMS" | "EMAIL";

const OTP_TTL_MINUTES = 2;

const getSecret = () => {
  const secret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;

  if (!secret) {
    throw new Error("AUTH_SECRET is not configured; refusing to create OTPs.");
  }

  return secret;
};

/**
 * OTP codes are stored as an HMAC keyed with the server secret instead of in
 * plaintext.
 *
 * A 6-digit code has only 10^6 possible values, so an unkeyed hash would be
 * trivially reversible by brute force. Keying the HMAC with `AUTH_SECRET`
 * means that even a full database dump — or the admin/tutor
 * `getOtpByIdentifier()` readers — cannot recover a live code or test guesses
 * offline without also holding the secret.
 */
export const hashOtpCode = (code: string, identifier: string) =>
  createHmac("sha256", getSecret())
    .update(`${identifier.trim().toLowerCase()}:${code.trim()}`)
    .digest("base64url");

/** Constant-time comparison of a submitted code against the stored HMAC. */
export const verifyOtpCode = (
  code: string,
  identifier: string,
  storedHash: string | null | undefined,
): boolean => {
  if (!code || !storedHash) return false;

  const expected = Buffer.from(hashOtpCode(code, identifier));
  const provided = Buffer.from(storedHash);

  return (
    expected.length === provided.length && timingSafeEqual(expected, provided)
  );
};

const generateOtpCode = () =>
  // crypto.randomInt is a CSPRNG; Math.random() is predictable and was used here.
  randomInt(100000, 1000000).toString();

const generateExpires = (minutes: number) =>
  new Date(Date.now() + minutes * 60 * 1000);

const replaceOtp = async (
  identifier: string,
  userId: number | undefined,
  type: OtpChannel,
) => {
  const plainOtp = generateOtpCode();
  const expires = generateExpires(OTP_TTL_MINUTES);

  // A new request always invalidates the previous code.
  await database.otp.deleteMany({ where: { identifier } });

  await database.otp.create({
    data: {
      expires,
      identifier,
      otpCode: hashOtpCode(plainOtp, identifier),
      type,
      userId,
    },
  });

  return { plainOtp };
};

/** Creates (and returns) a fresh SMS OTP. Callers must deliver it, not expose it. */
export const generateSmsOtp = async (identifier: string, userId?: number) =>
  replaceOtp(identifier, userId, "SMS");

/** Creates (and returns) a fresh e-mail OTP. Callers must deliver it, not expose it. */
export const generateEmailOtp = async (identifier: string, userId?: number) =>
  replaceOtp(identifier, userId, "EMAIL");
