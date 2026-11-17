"use server";

import {
  PaymentType,
  renderFinishCourseEmail,
  renderOtpEmail,
  renderSuccessPaymentEmail,
  renderSuccessPaymentEmailToAdmin,
} from "./email-templates";
import { generateEmailOtp } from "./otp";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendEmail = async ({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) => {
  try {
    const { data, error } = await resend.emails.send({
      from: "آی‌گرافیکال <noreply@igraphical.ir>",
      to,
      subject,
      html,
    });

    if (error) {
      console.error(error);
      return { success: false, error };
    }

    return { success: true, messageId: data?.id };
  } catch (error) {
    console.error(error);
    return { success: false, error };
  }
};

//! -------------------------------------------------------------------

export const sendOtpEmail = async (email: string, userId?: number) => {
  const { plainOtp } = await generateEmailOtp(email, userId);
  const emailHtml = await renderOtpEmail(plainOtp);

  const result = await sendEmail({
    subject: `🔒 کد تایید: ${plainOtp}`,
    to: email,
    html: emailHtml,
  });

  // sendEmail swallows provider errors; surface them so the login form
  // doesn't claim a code was sent when it wasn't.
  if (!result.success)
    throw new Error(
      "ارسال ایمیل با خطا مواجه شد. لطفا بعدا تلاش کنید یا با شماره موبایل وارد شوید.",
    );

  return { success: true };
};

//! -------------------------------------------------------------------

export const sendSuccessPaymentEmail = async (
  email: string,
  fullName: string,
  payment: PaymentType
) => {
  const emailHtml = await renderSuccessPaymentEmail(fullName, payment);

  await sendEmail({
    to: email,
    subject: `✅ ثبت نام موفق!`,
    html: emailHtml,
  });
};

//! -------------------------------------------------------------------

export const sendSuccessPaymentEmailToAdmin = async (
  email: string,
  fullName: string,
  payment: PaymentType
) => {
  const emailHtml = await renderSuccessPaymentEmailToAdmin(fullName, payment);

  await sendEmail({
    to: email,
    subject: `✅ ثبت نام موفق!`,
    html: emailHtml,
  });
};

//! -------------------------------------------------------------------

export const sendFinishCourseEmail = async (
  email: string,
  courseTitle: string,
  fullName: string
) => {
  const emailHtml = await renderFinishCourseEmail(courseTitle, fullName);

  await sendEmail({
    to: email,
    subject: `🎉 تبریک اتمام دوره!`,
    html: emailHtml,
  });
};
