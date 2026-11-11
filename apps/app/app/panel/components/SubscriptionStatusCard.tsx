import { getSubscriptionSummary } from "@/lib/access";
import { database } from "@igraph/database";
import { getStartingPlanPrice } from "@/lib/subscription";
import { formatJalaliDate, formatPriceBy3Digits } from "@igraph/utils";
import {
  ArrowLeft,
  CalendarClock,
  Crown,
  Headset,
  History,
} from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import MentorshipDialog from "./MentorshipDialog";

const DAY = 24 * 60 * 60 * 1000;
const daysLeft = (d: Date) =>
  Math.max(0, Math.ceil((d.getTime() - Date.now()) / DAY));

const Fact = ({
  icon,
  label,
  value,
  muted,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  muted?: boolean;
}) => (
  <div className="flex items-center gap-2.5 rounded-xl border border-foreground/10 bg-background/40 px-3 py-2">
    <span className={muted ? "text-muted-foreground" : "text-primary"}>
      {icon}
    </span>
    <div className="min-w-0">
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p
        className={`truncate text-xs font-medium ${muted ? "text-muted-foreground" : ""}`}
      >
        {value}
      </p>
    </div>
  </div>
);

/** Subscription, mentorship and legacy-access status for the panel. */
const SubscriptionStatusCard = async ({ userId }: { userId: number }) => {
  const now = new Date();
  const [summary, startingPrice, legacy] = await Promise.all([
    getSubscriptionSummary(userId),
    getStartingPlanPrice(),
    database.enrollment.findFirst({
      where: { userId, isLegacy: true },
      orderBy: { accessEndsAt: "desc" },
      select: { accessEndsAt: true, mentorshipEndsAt: true },
    }),
  ]);

  const isActive = summary.active && !!summary.endsAt;
  const queuedOnly = !summary.active && !!summary.endsAt;
  const legacyActive = !!legacy?.accessEndsAt && legacy.accessEndsAt > now;
  const legacyMentorship =
    !!legacy?.mentorshipEndsAt && legacy.mentorshipEndsAt > now
      ? legacy.mentorshipEndsAt
      : null;

  // share of the purchased time that is still ahead (by plan length bought,
  // so it stays right even if dates were adjusted)
  const purchasedDays = summary.subscriptions.reduce(
    (acc, s) => acc + (s.months > 0 ? s.months * 30 : 0),
    0,
  );
  const remainingDays = isActive ? daysLeft(summary.endsAt!) : 0;
  const totalDays = Math.max(purchasedDays, remainingDays, 1);
  const remainingPct = Math.min(100, (remainingDays / totalDays) * 100);

  return (
    <div className="studio-card studio-noise relative overflow-hidden p-4 md:p-5">
      <div className="absolute -right-10 -top-10 size-32 rounded-full bg-primary/20 blur-2xl" />

      <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Crown size={18} />
          </span>

          <div className="min-w-0 flex-1 space-y-2">
            {isActive ? (
              <>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-bold">اشتراک فعال</p>
                  <span className="rounded-full bg-lime/15 px-2 py-0.5 text-[11px] font-medium text-lime">
                    {daysLeft(summary.endsAt!)} روز باقی مانده
                  </span>
                </div>
                <div className="max-w-sm space-y-1">
                  <div
                    className="h-1.5 overflow-hidden rounded-full bg-foreground/10"
                    role="progressbar"
                    aria-label="زمان باقی‌مانده از اشتراک"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={Math.round(remainingPct)}
                  >
                    <div
                      className="h-full rounded-full bg-gradient-to-l from-primary to-lime"
                      style={{ width: `${remainingPct}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    {remainingDays} روز از {totalDays} روز اشتراک باقی مانده
                  </p>
                </div>
              </>
            ) : queuedOnly ? (
              <p className="text-sm font-bold">
                اشتراک شما از{" "}
                {formatJalaliDate(summary.subscriptions[0]!.startsAt)} فعال
                می‌شود
              </p>
            ) : (
              <>
                <p className="text-sm font-bold">اشتراک فعالی ندارید</p>
                <p className="text-xs text-muted-foreground">
                  با یک اشتراک به همه دوره‌های آی‌گرافیکال دسترسی پیدا کنید.
                </p>
              </>
            )}

            <div className="flex flex-wrap gap-2">
              {isActive && (
                <Fact
                  icon={<CalendarClock size={15} />}
                  label="دسترسی به همه دوره‌ها"
                  value={`تا ${formatJalaliDate(summary.endsAt!)}`}
                />
              )}
              {summary.mentorshipEndsAt ? (
                <Fact
                  icon={<Headset size={15} />}
                  label="منتورشیپ"
                  value={`فعال تا ${formatJalaliDate(summary.mentorshipEndsAt)} (${daysLeft(summary.mentorshipEndsAt)} روز)`}
                />
              ) : legacyMentorship ? (
                <Fact
                  icon={<Headset size={15} />}
                  label="منتورشیپ دوره‌های قبلی"
                  value={`تا ${formatJalaliDate(legacyMentorship)} (${daysLeft(legacyMentorship)} روز)`}
                />
              ) : (
                <Fact
                  icon={<Headset size={15} />}
                  label="منتورشیپ"
                  value="فعال نیست"
                  muted
                />
              )}
              {legacyActive && (
                <Fact
                  icon={<History size={15} />}
                  label="دوره‌های خریداری‌شده قبلی"
                  value={`تا ${formatJalaliDate(legacy!.accessEndsAt!)}`}
                />
              )}
            </div>
          </div>
        </div>

        <div
          className={`flex shrink-0 flex-col gap-2 text-center [&>*]:w-full [&_button]:justify-center ${summary.endsAt ? "sm:w-44" : "sm:w-56"}`}
        >
          {isActive && (
            <MentorshipDialog hasMentorship={!!summary.mentorshipEndsAt} />
          )}
          {summary.endsAt ? (
            <Link
              href="/plans"
              className="rounded-full bg-primary px-4 py-2 text-xs font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              تمدید اشتراک
            </Link>
          ) : (
            // no subscription: this is the main action on the page
            <>
              <Link
                href="/plans"
                className="group flex items-center justify-center gap-2 rounded-full bg-lime px-6 py-3.5 text-sm font-black text-black shadow-[0_12px_40px_-10px_#d4ff3f] transition-transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <Crown size={17} />
                خرید اشتراک
                <ArrowLeft
                  size={17}
                  className="transition-transform group-hover:-translate-x-1"
                />
              </Link>
              {startingPrice && (
                <p className="text-[11px] text-muted-foreground">
                  شروع از{" "}
                  <b className="text-foreground">
                    {formatPriceBy3Digits(startingPrice)}
                  </b>{" "}
                  تومان
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubscriptionStatusCard;
