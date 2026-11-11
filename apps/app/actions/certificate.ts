"use server";

import { getSessionUser } from "@/data/user";
import { issueCertificate } from "@/lib/certificate";
import { database } from "@igraph/database";
import {
  convertPersianDigitsToEnglish,
  isHumanOrNot,
  rateLimit,
} from "@igraph/utils";

export const verifyCertificate = async (
  serial: string,
  recaptchaToken: string,
) => {
  try {
    await isHumanOrNot(recaptchaToken, "FA");

    const normalizedSerial = convertPersianDigitsToEnglish(serial);

    // Public endpoint: return only what a certificate shows, never the
    // student's contact details or ID numbers.
    const found = await database.certificate.findFirst({
      where: { serial: normalizedSerial },
      select: {
        serial: true,
        issuedAt: true,
        enrollment: {
          select: {
            user: { select: { fullName: true } },
            course: { select: { title: true, duration: true } },
          },
        },
      },
    });

    if (found) {
      return {
        success: "این مدرک مورد تایید آی‌گرافیکال می باشد",
        certificate: {
          serial: found.serial,
          issuedAt: found.issuedAt,
          studentName: found.enrollment.user.fullName,
          courseTitle: found.enrollment.course.title,
          courseMinutes: found.enrollment.course.duration,
        },
      };
    } else {
      return { error: "این مدرک در سیستم مدارک آی‌گرافیکال ثبت نگردیده است." };
    }
  } catch (error) {
    return { error: String(error) };
  }
};

/**
 * Issues the session user's certificate for one of their completed courses.
 * Only the enrollment id comes from the caller; ownership and completion are
 * checked here and everything printed is read from the database.
 */
export const requestMyCertificate = async (enrollmentId: number) => {
  const user = await getSessionUser();
  if (!user) return { error: "لطفا ابتدا وارد شوید" };
  if (!rateLimit(`certificate:${user.id}`, 5, 10 * 60_000).allowed)
    return { error: "تعداد درخواست‌ها بیش از حد مجاز است" };

  const enrollment = await database.enrollment.findUnique({
    where: { id: Number(enrollmentId) },
    select: { userId: true },
  });
  if (!enrollment || enrollment.userId !== user.id)
    return { error: "دوره یافت نشد" };

  try {
    const res = await issueCertificate(Number(enrollmentId));
    if ("error" in res) return { error: res.error };
    return { success: true };
  } catch (error) {
    console.error("Certificate issue failed", enrollmentId, error);
    return { error: "صدور مدرک انجام نشد. لطفا دوباره تلاش کنید." };
  }
};
