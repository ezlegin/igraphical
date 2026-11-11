"use server";

import { assertStaff } from "@/lib/require-admin";

import { database } from "@igraph/database";

export async function getPostCategoryByUrl(url: string) {
  await assertStaff();
  return await database.postCategory.findUnique({
    where: { url },
  });
}

export async function getCourseCategoryByUrl(url: string) {
  await assertStaff();
  return await database.courseCategory.findUnique({
    where: { url },
  });
}

export async function getPostCategoryById(id: number) {
  await assertStaff();
  return await database.postCategory.findUnique({
    where: { id },
  });
}

export async function getCourseCategoryById(id: number) {
  await assertStaff();
  return await database.courseCategory.findUnique({
    where: { id },
  });
}
