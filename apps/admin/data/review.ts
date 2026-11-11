"use server";

import { assertAdmin } from "@/lib/require-admin";

import { database } from "@igraph/database";

export const getReviewByUserIdAndCourseId = async (
  userId: number,
  courseId: number,
) => {
  await assertAdmin();
  return await database.review.findFirst({
    where: { userId, courseId },
  });
};
