"use server";

import { getSessionUser } from "@/data/user";
import { database } from "@igraph/database";
import { sendFinishCourseEmail, sendFinishCourseSms } from "@igraph/utils";
import { generateCertificateForUser } from "./certificate";
import { canAccessCourse } from "@/lib/access";
import { signMediaUrl } from "@/lib/media-url";

export const createLessonProgress = async (
  lessonId: number,
  classroomId: string,
) => {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) return { error: "لطفا مجددا وارد شوید." };

    const owned = await database.classRoom.findUnique({
      where: { id: classroomId },
      include: {
        enrollment: {
          include: {
            course: { include: { curriculum: { include: { lessons: true } } } },
          },
        },
      },
    });
    if (!owned || owned.userId !== sessionUser.id)
      return { error: "کلاس درس یافت نشد" };
    if (
      !(await canAccessCourse(
        sessionUser.id,
        owned.enrollment.course,
        owned.enrollment,
      ))
    )
      return { error: "اشتراک شما به پایان رسیده است." };
    const lessonInCourse = owned.enrollment.course.curriculum.some((c) =>
      c.lessons.some((l) => l.id === lessonId),
    );
    if (!lessonInCourse) return { error: "درس یافت نشد" };

    const result = await database.$transaction(async (tx) => {
      const existingClassroom = await tx.classRoom.findFirst({
        where: { id: classroomId },
        include: {
          enrollment: {
            include: {
              lessonProgress: true,
              course: {
                include: {
                  curriculum: {
                    include: {
                      lessons: {
                        include: {
                          lessonProgress: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!existingClassroom) return { error: "کلاس درس یافت نشد" };

      await tx.lessonProgress.create({
        data: {
          completed: true,
          completedAt: new Date(),
          enrollmentId: existingClassroom.enrollmentId,
          userId: existingClassroom.userId,
          lessonId,
        },
      });

      const totalLessons =
        existingClassroom.enrollment.course.curriculum.reduce(
          (acc, curr) => acc + curr.lessons.length,
          0,
        );

      const totalCompletedLessons = await tx.lessonProgress.count({
        where: {
          Enrollment: {
            classroom: {
              id: classroomId,
            },
          },
        },
      });

      const progress = (totalCompletedLessons / totalLessons) * 100;

      await tx.enrollment.update({
        where: {
          id: existingClassroom.enrollmentId,
        },
        data: {
          progress,
          status: "IN_PROGRESS",
        },
      });

      const isLastLesson = totalCompletedLessons === totalLessons;

      if (isLastLesson) {
        await tx.enrollment.update({
          where: {
            id: existingClassroom.enrollmentId,
          },
          data: {
            completedAt: new Date(),
            progress,
          },
        });

        return {
          success: "تبریک! شما با موفقیت این دوره را به اتمام رساندید.",
          isLastLesson: true,
          enrollment: existingClassroom.enrollment, // Return for further processing
        };
      } else {
        return {
          success: "موفق باشید! پیش به سوی درس بعدی...",
          isLastLesson: false,
        };
      }
    });

    // Certificate
    if (result.enrollment && result.isLastLesson) {
      const user = await getSessionUser();
      if (!user) throw new Error("کاربر یافت نشد. لطفا مجددا وارد شوید.");

      const updatedClassroom = await database.classRoom.update({
        where: { id: classroomId },
        data: {
          enrollment: {
            update: {
              status: "COMPLETED", // update to status of compelted
            },
          },
        },
        include: { enrollment: { include: { course: true } } },
      });
      if (!updatedClassroom)
        throw new Error("دوره یافت نشد. لطفا مجددا تلاش کنید.");

      const existingCertificate = await database.certificate.findFirst({
        where: {
          enrollment: {
            classroom: {
              id: classroomId,
            },
          },
        },
      });

      if (!existingCertificate) {
        await generateCertificateForUser({
          course: {
            completedAt: result.enrollment.completedAt || new Date(),
            duration: result.enrollment.course.duration,
            title: result.enrollment.course.title,
          },
          enrollmentId: result.enrollment.id,
          user,
        });

        await sendFinishCourseSms(user.firstName, user.phone);

        await sendFinishCourseEmail(
          user.email,
          result.enrollment.course.title,
          user.fullName,
        );
      }
    }

    // never send the course tree (with lesson URLs) back to the browser
    const { enrollment: _omit, ...publicResult } = result as typeof result & {
      enrollment?: unknown;
    };
    void _omit;
    return publicResult;
  } catch (error) {
    return { error: String(error) };
  }
};

/** New lessons a student may open per 24 hours (re-opening is free). */
const DAILY_LESSON_LIMIT = 40;

/**
 * Returns the media URL of one lesson. Lesson URLs are never sent with the
 * classroom page; each one is requested here, after checking ownership,
 * access and the fair-use limit, so a page load can't reveal a whole course.
 */
export const getLessonSource = async (
  classroomId: string,
  lessonId: number,
) => {
  const user = await getSessionUser();
  if (!user) return { error: "لطفا مجددا وارد شوید." };

  const classroom = await database.classRoom.findUnique({
    where: { id: String(classroomId) },
    include: { enrollment: { include: { course: true } } },
  });
  if (!classroom || classroom.userId !== user.id)
    return { error: "کلاس درس یافت نشد" };

  const lesson = await database.lesson.findFirst({
    where: {
      id: Number(lessonId),
      section: { courseId: classroom.enrollment.courseId },
    },
    select: { id: true, url: true },
  });
  if (!lesson) return { error: "درس یافت نشد" };

  if (
    !(await canAccessCourse(
      user.id,
      classroom.enrollment.course,
      classroom.enrollment,
    ))
  )
    return { error: "اشتراک شما به پایان رسیده است." };

  const now = new Date();
  const day = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );
  const since = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  const seenRecently = await database.lessonView.findFirst({
    where: { userId: user.id, lessonId: lesson.id, createdAt: { gte: since } },
    select: { id: true },
  });

  if (!seenRecently) {
    const opened = await database.lessonView.groupBy({
      by: ["lessonId"],
      where: { userId: user.id, createdAt: { gte: since } },
    });
    if (opened.length >= DAILY_LESSON_LIMIT)
      return {
        error: `حداکثر ${DAILY_LESSON_LIMIT} جلسه جدید در ۲۴ ساعت قابل مشاهده است. جلسات دیده‌شده همچنان در دسترس‌اند.`,
      };
  }

  await database.lessonView.upsert({
    where: {
      userId_lessonId_day: { userId: user.id, lessonId: lesson.id, day },
    },
    update: {},
    create: { userId: user.id, lessonId: lesson.id, day },
  });

  return { url: await signMediaUrl(lesson.url) };
};
