"use server";

import { assertStaff } from "@/lib/require-admin";

import { database } from "@igraph/database";

export async function getPostByUrl(url: string) {
  await assertStaff();
  return await database.post.findUnique({
    where: { url },
  });
}

export async function getPostById(id: string | number) {
  await assertStaff();
  return await database.post.findUnique({
    where: { id: +id },
    include: {
      image: true,
      categories: { include: { category: true } },
      author: true,
    },
  });
}
