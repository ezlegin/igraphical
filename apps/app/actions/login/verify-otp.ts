"use server";

import { database } from "@igraph/database";
import { detectInputType, isHumanOrNot } from "@igraph/utils";

export const verifyOtp = async (
  otp: string,
  identifier: string,
  recaptchaToken?: string,
) => {
  try {
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

    const isValidOtp = otp === existingOtp.otpCode;
    if (!isValidOtp) return { error: "کد وارد شده معتبر نمی باشد" };

    // DELETE OTP
    const deletedOtp = await database.otp.delete({
      where: {
        identifier: existingOtp.identifier,
      },
      include: { user: true },
    });

    if (deletedOtp.user) {
      const type = detectInputType(identifier);

      await database.user.update({
        where: { id: deletedOtp.user.id },
        data: {
          ...(type === "email"
            ? { emailVerified: true, email: identifier }
            : { phoneVerified: true, phone: identifier }),
        },
      });
    }

    return { success: "احراز هویت موفق بود!" };
  } catch (error) {
    return { error: String(error) };
  }
};
