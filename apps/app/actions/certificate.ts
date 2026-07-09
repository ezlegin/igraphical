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

    const certificate = await database.certificate.findFirst({
      where: { serial: normalizedSerial },
      include: {
        enrollment: {
          include: {
            user: true,
            course: true,
          },
        },
      },
    });

    if (certificate) {
      return {
        success: "این مدرک مورد تایید آی‌گرافیکال می باشد",
        certificate,
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
