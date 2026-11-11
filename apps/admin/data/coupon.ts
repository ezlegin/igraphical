"use server";

import { assertAdmin } from "@/lib/require-admin";

import { database } from "@igraph/database";

export const getCouponByCode = async (code: string) => {
  await assertAdmin();
  return await database.coupon.findUnique({
    where: { code },
    include: {
      courseExclude: true,
      courseInclude: true,
    },
  });
};
