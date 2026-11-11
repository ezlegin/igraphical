"use server";

import { assertAdmin } from "@/lib/require-admin";

import { database } from "@igraph/database";

export const getEnrollmentByUserIdAndCourseId = async (
  userId: number,
  courseId: number,
) => {
  await assertAdmin();
  return await database.enrollment.findFirst({
    where: {
      userId,
      courseId,
    },
    include: {
      classroom: true,
    },
  });
};
