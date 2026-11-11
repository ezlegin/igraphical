"use server";

import { getSessionUser } from "@/data/user";
import { canAccessCourse, subscriptionsEnabled } from "@/lib/access";
import { database } from "@igraph/database";
import { rateLimit } from "@igraph/utils";

/**
 * Enrolls the session user in a course they can access (free course or
 * active subscription) and returns the classroom id. Idempotent.
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

  if (existing?.classroom) return { classroomId: existing.classroom.id };

  const enrollment = existing
    ? await database.enrollment.update({
        where: { id: existing.id },
        data: { classroom: { create: { userId: user.id } } },
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

  return { classroomId: enrollment.classroom!.id };
};
