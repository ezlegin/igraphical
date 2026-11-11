"use server";

import { assertAdmin } from "@/lib/require-admin";

export async function getModelById<T>(
  model: any,
  id: number,
): Promise<T | null> {
  await assertAdmin();
  return await model.findUnique({
    where: { id },
  });
}
