"use server";

import { getOtpByIdentifier } from "@/data/otp";
import { createLoginTicket } from "@igraph/auth";
import { database } from "@igraph/database";
import { rateLimit, resetRateLimit } from "@igraph/utils";
// server-only: otp.ts is intentionally not re-exported from @igraph/utils
import { verifyOtpCode } from "@igraph/utils/src/otp";

const MAX_FAILED_ATTEMPTS = 5;
const ATTEMPT_WINDOW_MS = 10 * 60 * 1000;

export const verifyOtp = async (
  otp: string,
  identifier: string,
  // recaptchaToken: string,
) => {
  try {
    const attemptKey = `tutor-otp-verify:${identifier.trim().toLowerCase()}`;
    const attempt = rateLimit(
      attemptKey,
      MAX_FAILED_ATTEMPTS,
      ATTEMPT_WINDOW_MS,
    );

    if (!attempt.allowed) {
      return { error: "Too many failed attempts. Please try again later." };
    }

    // await isHumanOrNot(recaptchaToken, "EN");

    const existingOtp = await getOtpByIdentifier(identifier);

    if (!existingOtp) return { error: "Invalid Code" };

    const hasExpired = new Date(existingOtp.expires) < new Date();
    if (hasExpired) {
      return { error: `Code has been expired` };
    }

    // Codes are stored as a keyed HMAC, never in plaintext.
    const isValidOtp = verifyOtpCode(otp, identifier, existingOtp.otpCode);
    if (!isValidOtp) return { error: "Invalid Code" };

    resetRateLimit(attemptKey);

    await database.otp.delete({
      where: {
        identifier: existingOtp.identifier,
      },
    });

    // Signed proof of verification; authorize() refuses to log in without it.
    const loginToken = createLoginTicket(identifier);

    return { success: "Seccuess", loginToken };
  } catch (error) {
    return { error: "Something Happended" };
  }
};
