"use server";

import { assertAdmin } from "@/lib/require-admin";

import { database } from "@igraph/database";

export const getPaymentById = async (id: number) => {
  await assertAdmin();
  return await database.enrollment.findMany({
    where: { id },
  });
};
