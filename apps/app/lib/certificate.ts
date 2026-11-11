// Certificate issuing. Server-only: deliberately NOT a "use server" module, so
// nothing here is callable over HTTP. The public entry point is
// `requestMyCertificate` in actions/certificate.ts, which checks the session.
import { database } from "@igraph/database";
import { generateUniqueSerial, uploadCloudFile } from "@igraph/utils";
// server-only: certificate.ts is intentionally not re-exported from @igraph/utils
import { generateCertificate } from "@igraph/utils/src/certificate";
import { UploadApiResponse } from "cloudinary";

/**
 * Issues the certificate of a completed enrollment. Everything printed on it
 * (name, national ID, course, dates) is read from the database, never taken
 * from a caller. Idempotent: an existing certificate is returned as is.
 * Callers must already have checked that the enrollment belongs to the user.
 */
export const issueCertificate = async (
  enrollmentId: number,
): Promise<{ error: string } | { certificateId: number }> => {
  const enrollment = await database.enrollment.findUnique({
    where: { id: enrollmentId },
    include: { user: true, course: true, certificate: true },
  });
  if (!enrollment) return { error: "دوره یافت نشد" };
  if (enrollment.certificate)
    return { certificateId: enrollment.certificate.id };
  if (!enrollment.completedAt)
    return { error: "این دوره هنوز به پایان نرسیده است" };
  if (!enrollment.user.nationalId)
    return { error: "برای صدور مدرک، ابتدا کد ملی خود را در پروفایل ثبت کنید" };

  const serial = await generateUniqueSerial();
  const pdf = await generateCertificate(
    enrollment.user,
    enrollment.course.title,
    enrollment.course.duration,
    enrollment.completedAt,
    serial,
  );

  const { secure_url, bytes, public_id, resource_type } =
    (await uploadCloudFile(pdf, {
      format: "pdf",
      resource_type: "raw",
      folder: "certificate",
    })) as UploadApiResponse;

  try {
    const certificate = await database.certificate.create({
      data: {
        serial,
        url: secure_url,
        enrollmentId: enrollment.id,
        file: {
          create: {
            format: "pdf",
            public_id,
            size: bytes,
            type: "CERTIFICATE",
            url: secure_url,
            resource_type,
            fileName: serial + ".pdf",
          },
        },
      },
    });
    return { certificateId: certificate.id };
  } catch (error) {
    // two requests raced; enrollmentId is unique, so keep the first one
    const existing = await database.certificate.findUnique({
      where: { enrollmentId: enrollment.id },
    });
    if (existing) return { certificateId: existing.id };
    throw error;
  }
};
