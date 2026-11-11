// Course and mentorship access rules. Server-side only: this is deliberately
// NOT a "use server" module, so none of these helpers are callable over HTTP.
import { database } from "@igraph/database";

/**
 * Until SUBSCRIPTIONS_ENABLED=true, the old rule applies: owning an enrollment
 * (classroom) means access forever. This keeps old users safe while the
 * migration and legacy backfill are rolled out. Flip it only after
 * `db:backfill-legacy --apply` has run in production.
 */
export const subscriptionsEnabled = () =>
  process.env.SUBSCRIPTIONS_ENABLED === "true";

type EnrollmentAccess = {
  isLegacy: boolean;
  accessEndsAt: Date | null;
  mentorshipEndsAt: Date | null;
};

/** Subscriptions that cover `now` (stacked plans produce several rows). */
const activeSubscriptionWhere = (userId: number, now: Date) => ({
  userId,
  status: "ACTIVE" as const,
  startsAt: { lte: now },
  endsAt: { gt: now },
});

export const getActiveSubscription = async (userId: number) => {
  const now = new Date();
  return database.subscription.findFirst({
    where: activeSubscriptionWhere(userId, now),
    orderBy: { endsAt: "desc" },
  });
};

/** Latest end date across all current and future-stacked subscriptions. */
export const getSubscriptionSummary = async (userId: number) => {
  const now = new Date();
  const subs = await database.subscription.findMany({
    where: { userId, status: "ACTIVE", endsAt: { gt: now } },
    orderBy: { endsAt: "asc" },
  });
  const active = subs.some((s) => s.startsAt <= now);
  const endsAt = subs.at(-1)?.endsAt ?? null;
  const mentorshipEndsAt =
    subs
      .map((s) => s.mentorshipEndsAt)
      .filter((d): d is Date => !!d && d > now)
      .sort((a, b) => a.getTime() - b.getTime())
      .at(-1) ?? null;
  return { active, endsAt, mentorshipEndsAt, subscriptions: subs };
};

const hasActiveSubscription = async (userId: number) =>
  !!(await getActiveSubscription(userId));

const hasActiveMentorship = async (userId: number) => {
  const now = new Date();
  return !!(await database.subscription.findFirst({
    where: {
      userId,
      status: "ACTIVE",
      mentorship: true,
      mentorshipStartsAt: { lte: now },
      mentorshipEndsAt: { gt: now },
    },
    select: { id: true },
  }));
};

const legacyValid = (e: EnrollmentAccess, field: "access" | "mentorship") => {
  const end = field === "access" ? e.accessEndsAt : e.mentorshipEndsAt;
  return e.isLegacy && !!end && end > new Date();
};

/**
 * Can this user watch the course right now?
 * free course → yes; legacy enrollment within its window → yes;
 * otherwise an active subscription is required.
 */
export const canAccessCourse = async (
  userId: number,
  course: { price: number },
  enrollment: EnrollmentAccess | null,
) => {
  if (!subscriptionsEnabled()) return !!enrollment || course.price === 0;
  if (course.price === 0) return true;
  if (enrollment && legacyValid(enrollment, "access")) return true;
  return hasActiveSubscription(userId);
};

/** Can this user use ask-tutor on this enrollment right now? */
export const canUseMentorship = async (
  userId: number,
  enrollment: EnrollmentAccess,
) => {
  if (!subscriptionsEnabled()) return true;
  if (legacyValid(enrollment, "mentorship")) return true;
  return hasActiveMentorship(userId);
};
