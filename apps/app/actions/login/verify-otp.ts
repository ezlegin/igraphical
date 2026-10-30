"use server";

import { getSessionUser } from "@/data/user";
import { database } from "@igraph/database";
import { isHumanOrNot, rateLimit, resetRateLimit } from "@igraph/utils";
// server-only: otp.ts is intentionally not re-exported from @igraph/utils
import { verifyOtpCode } from "@igraph/utils/src/otp";
import { createLoginTicket } from "@igraph/auth";

const MAX_FAILED_ATTEMPTS = 5;
const ATTEMPT_WINDOW_MS = 10 * 60 * 1000;

export const verifyOtp = async (
  otp: string,
  identifier: string,
  recaptchaToken?: string,
) => {
  try {
    // The attempt counter used to live in React state, so refreshing the page
    // reset it. This one is enforced on the server.
    const attempt = rateLimit(
      `otp-verify:${identifier.trim().toLowerCase()}`,
      MAX_FAILED_ATTEMPTS,
      ATTEMPT_WINDOW_MS,
    );

    if (!attempt.allowed) {
      return {
        error: "تعداد تلاش‌های ناموفق بیش از حد مجاز است. لطفا بعدا تلاش کنید.",
      };
    }

    if (recaptchaToken) await isHumanOrNot(recaptchaToken, "FA");

    const existingOtp = await database.otp.findFirst({
      where: {
        identifier,
      },
    });

    if (!existingOtp) return { error: "کد وارد شده معتبر نمی باشد !" };

    const hasExpired = existingOtp.expires < new Date();
    if (hasExpired) {
      return { error: `کد تایید منقضی شده است` };
    }

    // Constant-time comparison against a keyed HMAC — the code is never stored
    // in plaintext, so a database read cannot reveal a live OTP.
    const isValidOtp = verifyOtpCode(otp, identifier, existingOtp.otpCode);
    if (!isValidOtp) return { error: "کد وارد شده معتبر نمی باشد" };

    resetRateLimit(`otp-verify:${identifier.trim().toLowerCase()}`);

    // DELETE OTP
    const deletedOtp = await database.otp.delete({
      where: {
        identifier: existingOtp.identifier,
      },
      include: { user: true },
    });

    if (deletedOtp.user) {
      // Only ever bind an identifier to the *signed-in* user. `userId` used to
      // be supplied by the caller, which let an attacker move their own
      // phone/e-mail onto somebody else's account.
      const sessionUser = await getSessionUser();

      if (sessionUser && sessionUser.id === deletedOtp.user.id) {
        const type = deletedOtp.type === "EMAIL" ? "email" : "phone";

        await database.user.update({
          where: { id: deletedOtp.user.id },
          data: {
            ...(type === "email"
              ? { emailVerified: true, email: identifier }
              : { phoneVerified: true, phone: identifier }),
          },
        });
      }
    }

    // Proof that THIS identifier passed verification. `authorize()` refuses to
    // create a session without it, so calling the login action directly with a
    // bare phone number no longer works.
    const loginToken = createLoginTicket(identifier);

    return { success: "احراز هویت موفق بود!", loginToken };
  } catch (error) {
    return { error: String(error) };
  }
};
