"use server";

import { requireAdmin } from "@/lib/require-admin";
import { database } from "@igraph/database";
import { revalidatePath } from "next/cache";

const addMonths = (date: Date, months: number) => {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
};

const validMonths = (m: unknown) =>
  Number.isInteger(Number(m)) && Number(m) >= 1 && Number(m) <= 36;

const refresh = () => revalidatePath("/subscriptions/list");

/** Gives a user free time (and optionally mentorship), stacked after what they have. */
export const grantSubscription = async (
  identifier: string,
  months: number,
  mentorship: boolean,
) => {
  if (!(await requireAdmin())) return { error: "Unauthorized" };
  if (!validMonths(months)) return { error: "Months must be 1–36" };

  const user = await database.user.findFirst({
    where: { OR: [{ phone: identifier.trim() }, { email: identifier.trim() }] },
  });
  if (!user) return { error: "No user with this phone/email" };

  const now = new Date();
  const [lastAccess, lastMentorship] = await Promise.all([
    database.subscription.findFirst({
      where: { userId: user.id, status: "ACTIVE", endsAt: { gt: now } },
      orderBy: { endsAt: "desc" },
    }),
    database.subscription.findFirst({
      where: {
        userId: user.id,
        status: "ACTIVE",
        mentorshipEndsAt: { gt: now },
      },
      orderBy: { mentorshipEndsAt: "desc" },
    }),
  ]);
  const startsAt = lastAccess?.endsAt ?? now;
  const mentorshipStartsAt = mentorship
    ? (lastMentorship?.mentorshipEndsAt ?? now)
    : null;

  await database.subscription.create({
    data: {
      userId: user.id,
      months: Number(months),
      startsAt,
      endsAt: addMonths(startsAt, Number(months)),
      mentorship,
      mentorshipStartsAt,
      mentorshipEndsAt: mentorshipStartsAt
        ? addMonths(mentorshipStartsAt, Number(months))
        : null,
      price: 0,
      status: "ACTIVE",
      source: "ADMIN",
    },
  });
  refresh();
  return { success: `Granted ${months} months to ${user.fullName}` };
};

/** Pushes the end date (and mentorship end, if it has mentorship) forward. */
export const extendSubscription = async (id: number, months: number) => {
  if (!(await requireAdmin())) return { error: "Unauthorized" };
  if (!validMonths(months)) return { error: "Months must be 1–36" };

  const sub = await database.subscription.findUnique({
    where: { id: Number(id) },
  });
  if (!sub || sub.status !== "ACTIVE")
    return { error: "Only active subscriptions can be extended" };

  // Later stacked subscriptions are shifted too, so time is never lost.
  const later = await database.subscription.findMany({
    where: {
      userId: sub.userId,
      status: "ACTIVE",
      startsAt: { gte: sub.endsAt },
      id: { not: sub.id },
    },
  });

  await database.$transaction([
    database.subscription.update({
      where: { id: sub.id },
      data: {
        endsAt: addMonths(sub.endsAt, months),
        mentorshipEndsAt: sub.mentorshipEndsAt
          ? addMonths(sub.mentorshipEndsAt, months)
          : null,
      },
    }),
    ...later.map((s) =>
      database.subscription.update({
        where: { id: s.id },
        data: {
          startsAt: addMonths(s.startsAt, months),
          endsAt: addMonths(s.endsAt, months),
        },
      }),
    ),
  ]);
  refresh();
  return { success: "Extended" };
};

/** Cancels access. Payment, progress and certificates are kept. */
export const cancelSubscription = async (id: number) => {
  if (!(await requireAdmin())) return { error: "Unauthorized" };

  const { count } = await database.subscription.updateMany({
    where: { id: Number(id), status: "ACTIVE" },
    data: { status: "CANCELED" },
  });
  if (count !== 1) return { error: "Subscription is not active" };
  refresh();
  return { success: "Canceled" };
};
