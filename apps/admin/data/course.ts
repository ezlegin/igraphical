"use server";

import { assertAdmin } from "@/lib/require-admin";

import { database } from "@igraph/database";

export const getCourseByUrl = async (url: string) => {
  await assertAdmin();
  return await database.course.findUnique({
    where: { url },
    include: { image: true },
  });
};

export const getCourseById = async (id: string | number) => {
  await assertAdmin();
  return await database.course.findUnique({
    where: { id: +id },
    include: {
      discount: true,
      gallery: {
        include: {
          image: true,
        },
      },
      image: true,
      tutor: true,
      learn: true,
      category: true,
      prerequisite: true,
      curriculum: {
        include: {
          lessons: true,
        },
      },
    },
  });
};

export const getAllCoursesByIds = async (ids: number[]) => {
  await assertAdmin();
  const validIds = ids.filter((id) => id !== 0 && id !== undefined);

  if (validIds.length === 0) return [];

  return await database.course.findMany({
    where: {
      id: { in: validIds },
    },
    include: {
      image: true,
      tutor: {
        include: {
          image: true,
        },
      },
    },
  });
};

export const getFirstCourseByIds = async (ids: number[]) => {
  await assertAdmin();
  return await database.course.findFirst({
    where: {
      OR: ids.map((id) => ({ id })),
    },
  });
};
