"use server";

import { getSessionUser } from "@/data/user";
import { database } from "@igraph/database";
import { sendFinishCourseEmail, sendFinishCourseSms } from "@igraph/utils";
import { generateCertificateForUser } from "./certificate";

export const createLessonProgress = async (
  lessonId: number,
  classroomId: string,
) => {
  try {
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

    return result;
  } catch (error) {
    return { error: String(error) };
  }
};
