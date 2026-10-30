"use server";

import { getSessionUser } from "@/data/user";
import { database } from "@igraph/database";
import {
  convertPersianDigitsToEnglish,
  detectInputType,
  rateLimit,
  sendOtpEmail,
  sendOtpSms,
} from "@igraph/utils";

const MAX_OTP_REQUESTS = 5;
const OTP_WINDOW_MS = 10 * 60 * 1000;

/**
 * Sends a login / verification code.
 *
 * The `userId` that ends up on the OTP row is taken from the SESSION, never
 * from the caller. It used to be a function argument, which meant an attacker
 * could request a code to their own phone but have it recorded against a
 * victim's account — verifyOtp() would then write the attacker's phone number
 * onto that victim's record.
 *
 * `identifier` must match the signed-in user's current phone/e-mail when a
 * session exists, so a code can never be issued "on behalf of" somebody else.
 */
export async function sendOtp(data: { phoneOrEmail: string }) {
  const { phoneOrEmail } = data;

  // DETECT INPUT TYPE
  const inputType = detectInputType(phoneOrEmail);

  const normalized =
    inputType === "phone"
      ? convertPersianDigitsToEnglish(phoneOrEmail)
      : phoneOrEmail.trim().toLowerCase();

  try {
    const request = rateLimit(
      `otp-send:${normalized}`,
      MAX_OTP_REQUESTS,
      OTP_WINDOW_MS,
    );

    if (!request.allowed) {
      return {
        error: "تعداد درخواست‌های کد تایید بیش از حد مجاز است. لطفا بعدا تلاش کنید.",
      };
    }

    // LOOK UP
    const existingUser = await database.user.findFirst({
      where: {
        OR: [
          { phone: phoneOrEmail },
          { email: phoneOrEmail },
          { phone: normalized },
          { email: normalized },
        ],
      },
    });

    // The session decides who the OTP belongs to — not the caller.
    const sessionUser = await getSessionUser();
    const targetUserId = sessionUser?.id;

    if (inputType === "phone") {
      await sendOtpSms(normalized, targetUserId);
    } else {
      await sendOtpEmail(normalized, targetUserId);
    }

    return { isNewUser: !!!existingUser };
  } catch (error) {
    return { error: String(error) };
  }
}
