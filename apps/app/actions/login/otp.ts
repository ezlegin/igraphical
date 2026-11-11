"use server";

import { getSessionUser } from "@/data/user";
import { clientIp } from "@/lib/client-ip";
import { database } from "@igraph/database";
import {
  convertPersianDigitsToEnglish,
  detectInputType,
  isHumanOrNot,
  rateLimit,
  sendOtpEmail,
  sendOtpSms,
} from "@igraph/utils";

const MAX_OTP_REQUESTS = 5;
const MAX_OTP_PER_IP = 10; // per hour, signed-out
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
export async function sendOtp(data: {
  phoneOrEmail: string;
  recaptchaToken?: string;
}) {
  const phoneOrEmail = String(data?.phoneOrEmail ?? "");

  // DETECT INPUT TYPE
  const inputType = detectInputType(phoneOrEmail);

  const normalized =
    inputType === "phone"
      ? convertPersianDigitsToEnglish(phoneOrEmail)
      : phoneOrEmail.trim().toLowerCase();

  try {
    // Each code is a paid SMS. Signed-out requests (login) need reCAPTCHA and
    // are limited per IP, so one client can't text thousands of numbers.
    // Signed-in requests (changing phone/e-mail) are limited per account.
    const sessionUser = await getSessionUser();
    if (sessionUser) {
      if (
        !rateLimit(`otp-send-user:${sessionUser.id}`, 5, OTP_WINDOW_MS).allowed
      )
        return {
          error:
            "تعداد درخواست‌های کد تایید بیش از حد مجاز است. لطفا بعدا تلاش کنید.",
        };
    } else {
      if (
        !rateLimit(
          `otp-send-ip:${await clientIp()}`,
          MAX_OTP_PER_IP,
          60 * 60 * 1000,
        ).allowed
      )
        return {
          error:
            "تعداد درخواست‌های کد تایید بیش از حد مجاز است. لطفا بعدا تلاش کنید.",
        };
      if (!data?.recaptchaToken)
        return { error: "لطفا صفحه را دوباره بارگذاری کنید." };
      await isHumanOrNot(String(data.recaptchaToken), "FA");
    }

    const request = rateLimit(
      `otp-send:${normalized}`,
      MAX_OTP_REQUESTS,
      OTP_WINDOW_MS,
    );

    if (!request.allowed) {
      return {
        error:
          "تعداد درخواست‌های کد تایید بیش از حد مجاز است. لطفا بعدا تلاش کنید.",
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
