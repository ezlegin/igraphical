"use server";

import { assertAdmin } from "@/lib/require-admin";

import { database } from "@igraph/database";

export const getWalletByUserId = async (userId: number) => {
  await assertAdmin();
  return await database.wallet.findFirst({
    where: { userId },
  });
};
