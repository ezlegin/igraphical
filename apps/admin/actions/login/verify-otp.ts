"use server";

import { getOtpByIdentifier } from "@/data/otp";
import { getAdminByIdentifier } from "@/data/admin";
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
    const attemptKey = `admin-otp-verify:${identifier.trim().toLowerCase()}`;
    const attempt = rateLimit(
      attemptKey,
      MAX_FAILED_ATTEMPTS,
      ATTEMPT_WINDOW_MS,
    );

    if (!attempt.allowed) {
      return { error: "Too many failed attempts. Please try again later." };
    }

    // await isHumanOrNot(recaptchaToken, "EN");

    // OTP LOOK UP
    const existingOtp = await getOtpByIdentifier(identifier);

    // CHECK EXISTANCE
    if (!existingOtp) return { error: "Invalid Code" };

    // CHECK EXPIRATION
    const hasExpired = new Date(existingOtp.expires) < new Date();
    if (hasExpired) {
      return { error: `Code has been expired` };
    }

    // CHECK OTP
    // Codes are stored as a keyed HMAC, never in plaintext.
    const isValidOtp = verifyOtpCode(otp, identifier, existingOtp.otpCode);
    if (!isValidOtp) return { error: "Invalid Code" };

    resetRateLimit(attemptKey);

    // DELETE OTP
    await database.otp.delete({
      where: {
        identifier: existingOtp.identifier,
      },
    });

    // FIND USER OF THIS OTP
    const existingAdmin = await getAdminByIdentifier(identifier);

    // Signed proof of verification; authorize() refuses to log in without it.
    const loginToken = createLoginTicket(identifier);

    return { success: "Seccuess", role: existingAdmin?.role, loginToken };
  } catch (error) {
    console.error(error);
    return { error: "Something Happended" };
  }
};
