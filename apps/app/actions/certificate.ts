"use server";

import {
  generateCertificate,
  generateUniqueSerial,
  isHumanOrNot,
  uploadCloudFile,
} from "@igraph/utils";
import { database, User } from "@igraph/database";
import { convertPersianDigitsToEnglish } from "@igraph/utils";
import { UploadApiResponse } from "cloudinary";

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

export const generateCertificateForUser = async ({
  user,
  course,
  enrollmentId,
}: {
  user: User;
  course: {
    title: string;
    duration: number;
    completedAt: Date;
  };
  enrollmentId: number;
}) => {
  try {
    const serialNumber = await generateUniqueSerial();

    const buffer = await generateCertificate(
      user,
      course.title,
      course.duration,
      course.completedAt || new Date(),
      serialNumber,
    );

    const { secure_url, bytes, public_id, resource_type } =
      (await uploadCloudFile(buffer, {
        format: "pdf",
        resource_type: "raw",
        folder: "certificate",
      })) as UploadApiResponse;

    const newCertificate = await database.certificate.create({
      data: {
        serial: serialNumber,
        url: secure_url,
        enrollmentId: enrollmentId,
      },
    });

    await database.file.create({
      data: {
        format: "pdf",
        public_id,
        size: bytes,
        type: "CERTIFICATE",
        url: secure_url,
        resource_type,
        fileName: serialNumber + ".pdf",
        certificateId: newCertificate.id,
      },
    });
  } catch (error) {
    console.log(error);
    return { error: (error as Error).message };
  }
};
