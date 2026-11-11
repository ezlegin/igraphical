import { getSubscriptionSummary } from "@/lib/access";
import { database } from "@igraph/database";
import { formatJalaliDate } from "@igraph/utils";
import { Crown, Headset } from "lucide-react";
import Link from "next/link";

const DAY = 24 * 60 * 60 * 1000;
const daysLeft = (d: Date) =>
  Math.max(0, Math.ceil((d.getTime() - Date.now()) / DAY));

/** Subscription, mentorship and legacy-access status for the panel. */
const SubscriptionStatusCard = async ({ userId }: { userId: number }) => {
  const now = new Date();
  const [summary, legacy] = await Promise.all([
    getSubscriptionSummary(userId),
    database.enrollment.findFirst({
      where: { userId, isLegacy: true },
      orderBy: { accessEndsAt: "desc" },
      select: { accessEndsAt: true, mentorshipEndsAt: true },
    }),
  ]);

  const queuedOnly = !summary.active && !!summary.endsAt;
  const legacyActive = !!legacy?.accessEndsAt && legacy.accessEndsAt > now;
  const legacyMentorship =
    !!legacy?.mentorshipEndsAt && legacy.mentorshipEndsAt > now
      ? legacy.mentorshipEndsAt
      : null;
  const mentorshipEndsAt = summary.mentorshipEndsAt ?? legacyMentorship;

  return (
    <div className="studio-card studio-noise relative overflow-hidden p-5">
      <div className="absolute -top-10 -right-10 size-32 rounded-full bg-primary/20 blur-2xl" />
      <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-4">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
            <Crown size={22} />
          </span>
          <div className="space-y-1.5">
            {summary.active && summary.endsAt ? (
              <>
                <p className="font-bold">
                  اشتراک فعال —{" "}
                  <span className="text-primary">
                    {daysLeft(summary.endsAt)} روز
                  </span>{" "}
                  باقی مانده
                </p>
                <p className="text-sm text-muted-foreground">
                  دسترسی به همه دوره‌ها تا {formatJalaliDate(summary.endsAt)}
                </p>
              </>
            ) : queuedOnly ? (
              <p className="font-bold">
                اشتراک شما از{" "}
                {formatJalaliDate(summary.subscriptions[0]!.startsAt)} فعال
                می‌شود
              </p>
            ) : (
              <>
                <p className="font-bold">اشتراک فعالی ندارید</p>
                <p className="text-sm text-muted-foreground">
                  با یک اشتراک به همه دوره‌های آی‌گرافیکال دسترسی پیدا کنید.
                </p>
              </>
            )}

            {legacyActive && (
              <p className="text-sm text-muted-foreground">
                دسترسی به دوره‌های خریداری‌شده قبلی تا{" "}
                {formatJalaliDate(legacy!.accessEndsAt!)}
              </p>
            )}

            <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Headset size={15} />
              {summary.mentorshipEndsAt
                ? `منتورشیپ فعال تا ${formatJalaliDate(summary.mentorshipEndsAt)} (${daysLeft(summary.mentorshipEndsAt)} روز)`
                : mentorshipEndsAt
                  ? `منتورشیپ دوره‌های قبلی تا ${formatJalaliDate(mentorshipEndsAt)} (${daysLeft(mentorshipEndsAt)} روز)`
                  : "منتورشیپ فعال نیست"}
            </p>
          </div>
        </div>

        <Link
          href="/plans"
          className="w-fit shrink-0 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
        >
          {summary.endsAt ? "تمدید یا افزودن منتورشیپ" : "خرید اشتراک"}
        </Link>
      </div>
    </div>
  );
};

export default SubscriptionStatusCard;
