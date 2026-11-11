"use server";

import { getSessionUser } from "@/data/user";
import {
  ACTIVE_COURSE_LIMIT,
  activeCourseLimitMessage,
  canAccessCourse,
  countActiveCourses,
  subscriptionsEnabled,
} from "@/lib/access";
import { database } from "@igraph/database";
import { rateLimit } from "@igraph/utils";
import { revalidatePath } from "next/cache";

/**
 * Enrolls the session user in a course they can access (free course or
 * active subscription) and returns the classroom id. Idempotent.
 * Starting a new course, or returning to one the student removed, needs a
 * free slot under the active-course limit.
 */
export const enrollInCourse = async (courseId: number) => {
  if (!subscriptionsEnabled()) return { error: "این قابلیت فعال نیست" };

  const user = await getSessionUser();
  if (!user) return { error: "لطفا ابتدا وارد شوید" };
  if (!rateLimit(`enroll:${user.id}`, 20, 60_000).allowed)
    return { error: "تعداد درخواست‌ها بیش از حد مجاز است" };

  const course = await database.course.findUnique({
    where: { id: Number(courseId) },
  });
  if (!course || course.status === "DRAFT") return { error: "دوره یافت نشد" };

  const existing = await database.enrollment.findFirst({
    where: { userId: user.id, courseId: course.id },
    include: { classroom: true },
  });

  if (!(await canAccessCourse(user.id, course, existing)))
    return { error: "برای شروع این دوره، اشتراک تهیه کنید", needsPlan: true };

  if (existing?.classroom && !existing.archivedAt)
    return { classroomId: existing.classroom.id };

  // Taking a slot: a new enrollment, or one coming back from the archive.
  // Legacy and finished enrollments never count, so they are never blocked.
  const takesSlot = !existing || (!existing.isLegacy && !existing.completedAt);
  if (takesSlot) {
    const active = await countActiveCourses(user.id);
    const alreadyCounted = !!existing && !existing.archivedAt;
    if (!alreadyCounted && active >= ACTIVE_COURSE_LIMIT)
      return { error: activeCourseLimitMessage, limitReached: true };
  }

  const enrollment = existing
    ? await database.enrollment.update({
        where: { id: existing.id },
        data: {
          archivedAt: null,
          ...(existing.classroom
            ? {}
            : { classroom: { create: { userId: user.id } } }),
        },
        include: { classroom: true },
      })
    : await database.enrollment.create({
        data: {
          userId: user.id,
          courseId: course.id,
          price: 0,
          courseOriginalPrice: course.basePrice,
          classroom: { create: { userId: user.id } },
        },
        include: { classroom: true },
      });

  revalidatePath("/panel", "layout");
  return { classroomId: enrollment.classroom!.id };
};

/**
 * Removes a course from the student's active list, freeing a slot. Progress,
 * the classroom and any certificate are kept; `enrollInCourse` brings it back.
 */
export const archiveEnrollment = async (enrollmentId: number) => {
  if (!subscriptionsEnabled()) return { error: "این قابلیت فعال نیست" };

  const user = await getSessionUser();
  if (!user) return { error: "لطفا ابتدا وارد شوید" };
  // Swapping courses in and out all day would defeat the limit.
  if (!rateLimit(`archive:${user.id}`, 6, 24 * 60 * 60_000).allowed)
    return {
      error: "امروز بیش از حد مجاز دوره حذف کرده‌اید. فردا دوباره تلاش کنید.",
    };

  const { count } = await database.enrollment.updateMany({
    where: {
      id: Number(enrollmentId),
      userId: user.id,
      isLegacy: false,
      completedAt: null,
      archivedAt: null,
    },
    data: { archivedAt: new Date() },
  });
  if (!count) return { error: "دوره یافت نشد" };

  revalidatePath("/panel", "layout");
  return { success: "دوره از دوره‌های فعال شما حذف شد. پیشرفت شما محفوظ است." };
};
