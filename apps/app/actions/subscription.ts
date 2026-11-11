"use server";

import { getSessionUser } from "@/data/user";
import { subscriptionsEnabled } from "@/lib/access";
import { gatewayOf, pay, siteUrl } from "@/lib/pay";
import { applyPaidPaymentEffects } from "@/lib/settle-payment";
import {
  activateSubscriptionForPayment,
  mentorshipAddonOptions,
  quoteSubscription,
  type QuoteInput,
} from "@/lib/subscription";
import { database, PaymentMethod } from "@igraph/database";
import { rateLimit } from "@igraph/utils";

const sanitize = (input: QuoteInput): QuoteInput => ({
  planId: Number(input?.planId),
  mentorship: input?.mentorship === true,
  couponCode:
    typeof input?.couponCode === "string"
      ? input.couponCode.slice(0, 64)
      : undefined,
  useWallet: input?.useWallet === true,
  paymentMethod: input?.paymentMethod,
});

/** Price preview for the plans page. Read-only. */
export const getSubscriptionQuote = async (input: QuoteInput) => {
  const user = await getSessionUser();
  if (!user) return { error: "لطفا ابتدا وارد شوید" };
  if (!rateLimit(`sub-quote:${user.id}`, 30, 60_000).allowed)
    return { error: "تعداد درخواست‌ها بیش از حد مجاز است" };
  return quoteSubscription(user.id, sanitize(input));
};

export const startSubscriptionCheckout = async (input: QuoteInput) => {
  if (!subscriptionsEnabled()) return { error: "خرید اشتراک فعال نیست" };

  const user = await getSessionUser();
  if (!user) return { error: "لطفا ابتدا وارد شوید" };
  if (!rateLimit(`sub-checkout:${user.id}`, 5, 60_000).allowed)
    return { error: "تعداد درخواست‌ها بیش از حد مجاز است" };

  const clean = sanitize(input);
  const res = await quoteSubscription(user.id, clean);
  if ("error" in res) return { error: res.error };
  const q = res.quote;

  const isFree = q.total === 0;
  const paymentMethod: PaymentMethod = isFree
    ? "NO_METHOD"
    : (clean.paymentMethod ?? "SADAD");
  const gateway = gatewayOf[paymentMethod];
  if (!isFree && !gateway) return { error: "روش پرداخت معتبر نمی باشد" };

  const now = new Date();
  const payment = await database.payment.create({
    data: {
      status: "PENDING",
      userId: user.id,
      total: q.total,
      itemsTotal: q.itemsTotal,
      paymentMethod,
      discountCode: q.couponCode,
      discountCodeAmount: q.couponAmount || null,
      couponId: q.couponId,
      walletUsed: q.walletAmount > 0,
      walletUsedAmount: q.walletAmount || null,
      subscription: {
        create: {
          userId: user.id,
          planId: q.planId,
          months: q.months,
          // real dates are set on activation (stacked on existing time)
          startsAt: now,
          endsAt: now,
          mentorship: q.mentorship,
          price: q.planPrice,
          mentorshipPrice: q.mentorshipPrice,
          status: "PENDING",
        },
      },
    },
  });

  if (isFree) {
    // covered entirely by coupon/wallet: settle right here
    const { count } = await database.payment.updateMany({
      where: { id: payment.id, status: "PENDING" },
      data: { status: "SUCCESS", paidAt: new Date() },
    });
    if (count === 1) {
      await activateSubscriptionForPayment(payment.id);
      await applyPaidPaymentEffects(payment.id);
    }
    return { success: "اشتراک شما فعال شد", redirectUrl: "/panel" };
  }

  try {
    const started = await pay.start({
      orderId: String(payment.id),
      amount: Math.round(q.total * 10), // Toman → Rial
      description: `Subscription ${q.months}m | User ${user.id} | Payment Id: ${payment.id}`,
      gateway: gateway!,
      customerMobile: user.phone,
      returnUrl: `${siteUrl}/checkout-result`,
      metadata: { userId: user.id, kind: "subscription" },
    });
    if (started.redirect.method !== "GET") throw new Error("POST redirect");
    return {
      success: "به صفحه پرداخت هدایت می شوید...",
      paymentUrl: started.redirect.url,
    };
  } catch (error) {
    console.error("Subscription payment start failed", payment.id, error);
    await database.payment.update({
      where: { id: payment.id },
      data: { status: "FAILED" },
    });
    return {
      error: "درگاه پرداخت پاسخگو نیست. لطفا دقایقی بعد مجددا تلاش کنید",
    };
  }
};

/** Mentorship lengths and prices the session user can add. Read-only. */
export const getMentorshipAddonOptions = async () => {
  if (!subscriptionsEnabled()) return { error: "خرید اشتراک فعال نیست" };
  const user = await getSessionUser();
  if (!user) return { error: "لطفا ابتدا وارد شوید" };
  if (!rateLimit(`sub-quote:${user.id}`, 30, 60_000).allowed)
    return { error: "تعداد درخواست‌ها بیش از حد مجاز است" };

  const res = await mentorshipAddonOptions(user.id);
  if ("error" in res) return { error: res.error };
  const wallet = await database.wallet.findUnique({
    where: { userId: user.id },
    select: { balance: true },
  });
  return {
    options: res.options.map(({ planId: _planId, ...o }) => o),
    accessEndsAt: res.accessEndsAt,
    walletBalance: Math.max(wallet?.balance ?? 0, 0),
  };
};

/**
 * Buys mentorship on its own for an existing subscriber. Only the option key
 * comes from the client; length and price are recomputed here.
 */
export const startMentorshipCheckout = async (input: {
  key: string;
  useWallet?: boolean;
  paymentMethod?: PaymentMethod;
}) => {
  if (!subscriptionsEnabled()) return { error: "خرید اشتراک فعال نیست" };

  const user = await getSessionUser();
  if (!user) return { error: "لطفا ابتدا وارد شوید" };
  if (!rateLimit(`sub-checkout:${user.id}`, 5, 60_000).allowed)
    return { error: "تعداد درخواست‌ها بیش از حد مجاز است" };

  const res = await mentorshipAddonOptions(user.id);
  if ("error" in res) return { error: res.error };
  const option = res.options.find((o) => o.key === String(input?.key));
  if (!option) return { error: "این گزینه در دسترس نیست" };

  let walletAmount = 0;
  if (input?.useWallet === true) {
    const wallet = await database.wallet.findUnique({
      where: { userId: user.id },
    });
    walletAmount = Math.min(Math.max(wallet?.balance ?? 0, 0), option.price);
  }
  const total = option.price - walletAmount;

  const isFree = total === 0;
  const paymentMethod: PaymentMethod = isFree
    ? "NO_METHOD"
    : input?.paymentMethod === "ZARRIN_PAL"
      ? "ZARRIN_PAL"
      : "SADAD";
  const gateway = gatewayOf[paymentMethod];
  if (!isFree && !gateway) return { error: "روش پرداخت معتبر نمی باشد" };

  const now = new Date();
  const payment = await database.payment.create({
    data: {
      status: "PENDING",
      userId: user.id,
      total,
      itemsTotal: option.price,
      paymentMethod,
      walletUsed: walletAmount > 0,
      walletUsedAmount: walletAmount || null,
      subscription: {
        create: {
          userId: user.id,
          planId: option.planId,
          // months = 0 marks a mentorship-only add-on: no access time is added
          months: 0,
          startsAt: now,
          endsAt: now,
          mentorship: true,
          // the length; activation re-anchors it after any paid mentorship
          mentorshipStartsAt: option.startsAt,
          mentorshipEndsAt: option.endsAt,
          price: 0,
          mentorshipPrice: option.price,
          status: "PENDING",
        },
      },
    },
  });

  if (isFree) {
    const { count } = await database.payment.updateMany({
      where: { id: payment.id, status: "PENDING" },
      data: { status: "SUCCESS", paidAt: new Date() },
    });
    if (count === 1) {
      await activateSubscriptionForPayment(payment.id);
      await applyPaidPaymentEffects(payment.id);
    }
    return { success: "منتورشیپ شما فعال شد", redirectUrl: "/panel" };
  }

  try {
    const started = await pay.start({
      orderId: String(payment.id),
      amount: Math.round(total * 10), // Toman → Rial
      description: `Mentorship ${option.days}d | User ${user.id} | Payment Id: ${payment.id}`,
      gateway: gateway!,
      customerMobile: user.phone,
      returnUrl: `${siteUrl}/checkout-result`,
      metadata: { userId: user.id, kind: "mentorship" },
    });
    if (started.redirect.method !== "GET") throw new Error("POST redirect");
    return {
      success: "به صفحه پرداخت هدایت می شوید...",
      paymentUrl: started.redirect.url,
    };
  } catch (error) {
    console.error("Mentorship payment start failed", payment.id, error);
    await database.payment.update({
      where: { id: payment.id },
      data: { status: "FAILED" },
    });
    return {
      error: "درگاه پرداخت پاسخگو نیست. لطفا دقایقی بعد مجددا تلاش کنید",
    };
  }
};
