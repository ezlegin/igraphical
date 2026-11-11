// Subscription pricing and activation. Server-only (not "use server"):
// every amount here is computed from the database, never from the client.
import { database, PaymentMethod } from "@igraph/database";

export const DIGIPAY_MIN_AMOUNT = 1_000_000; // Toman

export type QuoteInput = {
  planId: number;
  mentorship: boolean;
  couponCode?: string;
  useWallet?: boolean;
  paymentMethod?: PaymentMethod;
};

export type Quote = {
  planId: number;
  months: number;
  title: string;
  planPrice: number;
  mentorship: boolean;
  mentorshipPrice: number;
  itemsTotal: number;
  couponId: number | null;
  couponCode: string | null;
  couponAmount: number;
  walletAmount: number;
  total: number;
};

const couponDiscount = async (code: string, base: number) => {
  const coupon = await database.coupon.findUnique({
    where: { code },
    include: { courseInclude: { select: { id: true } } },
  });
  const now = new Date();
  if (
    !coupon ||
    (coupon.from && coupon.from > now) ||
    (coupon.to && coupon.to < now) ||
    (coupon.limit != null && coupon.used >= coupon.limit) ||
    // course-specific coupons don't apply to plans
    coupon.type === "FIXED_ON_COURSE" ||
    coupon.courseInclude.length > 0
  )
    return { error: "کد تخفیف معتبر نمی باشد" as const };

  const raw =
    coupon.type === "PERCENT" ? (base * coupon.amount) / 100 : coupon.amount;
  return { coupon, amount: Math.min(Math.max(Math.round(raw), 0), base) };
};

export const quoteSubscription = async (
  userId: number,
  input: QuoteInput,
): Promise<{ error: string } | { quote: Quote }> => {
  const plan = await database.plan.findUnique({ where: { id: input.planId } });
  if (!plan || !plan.isActive) return { error: "این اشتراک در دسترس نیست" };

  const mentorship = !!input.mentorship;
  const mentorshipPrice = mentorship ? plan.mentorshipPrice : 0;
  const itemsTotal = plan.price + mentorshipPrice;

  let couponAmount = 0;
  let couponId: number | null = null;
  let couponCode: string | null = null;
  if (input.couponCode) {
    const res = await couponDiscount(input.couponCode.trim(), itemsTotal);
    if (!res.coupon) return { error: "کد تخفیف معتبر نمی باشد" };
    couponAmount = res.amount;
    couponId = res.coupon.id;
    couponCode = res.coupon.code;
  }

  let walletAmount = 0;
  if (input.useWallet) {
    const wallet = await database.wallet.findUnique({ where: { userId } });
    walletAmount = Math.min(
      Math.max(wallet?.balance ?? 0, 0),
      itemsTotal - couponAmount,
    );
  }

  const total = itemsTotal - couponAmount - walletAmount;

  if (input.paymentMethod === "DIGIPAY" && total < DIGIPAY_MIN_AMOUNT)
    return { error: "مبلغ برای پرداخت اقساطی کافی نیست" };

  return {
    quote: {
      planId: plan.id,
      months: plan.months,
      title: plan.title,
      planPrice: plan.price,
      mentorship,
      mentorshipPrice,
      itemsTotal,
      couponId,
      couponCode,
      couponAmount,
      walletAmount,
      total,
    },
  };
};

const addMonths = (date: Date, months: number) => {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
};

/**
 * Turns the PENDING subscription of a paid Payment into an ACTIVE one.
 * New time is stacked after the user's latest active subscription; mentorship
 * stacks on its own timeline. Returns false if another caller already
 * activated it (callback, result page and cron may race).
 */
export const activateSubscriptionForPayment = async (paymentId: number) =>
  database.$transaction(async (tx) => {
    const sub = await tx.subscription.findUnique({ where: { paymentId } });
    if (!sub || sub.status !== "PENDING") return false;

    const now = new Date();
    const [lastAccess, lastMentorship] = await Promise.all([
      tx.subscription.findFirst({
        where: { userId: sub.userId, status: "ACTIVE", endsAt: { gt: now } },
        orderBy: { endsAt: "desc" },
        select: { endsAt: true },
      }),
      tx.subscription.findFirst({
        where: {
          userId: sub.userId,
          status: "ACTIVE",
          mentorshipEndsAt: { gt: now },
        },
        orderBy: { mentorshipEndsAt: "desc" },
        select: { mentorshipEndsAt: true },
      }),
    ]);

    const startsAt = lastAccess?.endsAt ?? now;
    const mentorshipStartsAt = sub.mentorship
      ? (lastMentorship?.mentorshipEndsAt ?? now)
      : null;

    const { count } = await tx.subscription.updateMany({
      where: { id: sub.id, status: "PENDING" },
      data: {
        status: "ACTIVE",
        startsAt,
        endsAt: addMonths(startsAt, sub.months),
        mentorshipStartsAt,
        mentorshipEndsAt: mentorshipStartsAt
          ? addMonths(mentorshipStartsAt, sub.months)
          : null,
      },
    });
    return count === 1;
  });
