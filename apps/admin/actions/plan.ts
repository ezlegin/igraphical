"use server";

import { requireAdmin } from "@/lib/require-admin";
import { database } from "@igraph/database";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const toman = z.coerce.number().int().min(0).max(1_000_000_000);

const planSchema = z
  .object({
    title: z.string().trim().min(1).max(100),
    price: toman,
    compareAtPrice: toman.nullable(),
    mentorshipPrice: toman,
    isActive: z.boolean(),
    sortOrder: z.coerce.number().int().min(0).max(100),
  })
  .refine((p) => !p.isActive || p.price > 0, {
    message: "An active plan needs a price above 0",
  })
  .refine((p) => p.compareAtPrice == null || p.compareAtPrice > p.price, {
    message: "Compare-at price must be higher than the price",
  });

export type PlanFormValues = z.input<typeof planSchema>;

export const updatePlan = async (planId: number, values: PlanFormValues) => {
  if (!(await requireAdmin())) return { error: "Unauthorized" };

  const parsed = planSchema.safeParse(values);
  if (!parsed.success)
    return { error: parsed.error.issues[0]?.message ?? "Invalid values" };

  try {
    await database.plan.update({
      where: { id: Number(planId) },
      data: parsed.data,
    });
    revalidatePath("/subscriptions/plans");
    return { success: "Plan saved" };
  } catch (error) {
    return { error: String(error) };
  }
};
