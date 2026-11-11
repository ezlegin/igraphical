"use server";

import { assertAdmin } from "@/lib/require-admin";

import { auth } from "@igraph/auth";
import { database } from "@igraph/database";

export const getUserByIdentifier = async (phoneOrEmail: string) => {
  await assertAdmin();
  return await database.user.findFirst({
    where: {
      OR: [{ phone: phoneOrEmail }, { email: phoneOrEmail }],
    },
  });
};

export const getUserById = async (id: number) => {
  await assertAdmin();
  if (!id) return;
  return await database.user.findUnique({
    where: {
      id,
    },
    include: {
      image: true,
      wallet: true,
    },
  });
};

export const getSessionUser = async () => {
  await assertAdmin();
  const session = await auth();
  const userId = session?.user?.id;

  return userId ? await getUserById(+userId) : null;
};

export const getUsersCount = async () => {
  await assertAdmin();
  return await database.user.count();
};
