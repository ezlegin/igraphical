"use server";

import { priceType } from "@/app/(CART)/cart/components/Cart";
import { database, PaymentMethod, User, Wallet } from "@igraph/database";
import {
  sendSuccessPaymentEmail,
  sendSuccessPaymentEmailToAdmin,
  sendSuccessPaymentSms,
} from "@igraph/utils";
import { adminData } from "@/data/adminData";
import { gatewayOf, pay, siteUrl } from "@/lib/pay";
import { settleGatewayPayment } from "@/lib/settle-payment";
import { isPayError } from "@obhco/pay";

//* CREATE PAYMENT -------------------------------------------------------

export interface PaymentDataType {
  amount: number;
  coursesIds: number[];
  user: User & { wallet: Wallet | null };
  discountAmount?: number;
  discountCode?: string;
  discountCodeAmount?: number;
  itemsTotal: number;
  useWallet?: boolean;
  useWalletAmount?: number;
  prices: priceType[];
  paymentMethod: PaymentMethod;
}

export const createPayment = async (data: PaymentDataType) => {
  const {
    amount,
    coursesIds,
    discountAmount,
    discountCode,
    discountCodeAmount,
    user,
    itemsTotal,
    useWallet,
    useWalletAmount,
    prices,
    paymentMethod,
  } = data;

  try {
    const existingCoupon = await database.coupon.findFirst({
      where: { code: discountCode },
    });
    if (discountCode && !existingCoupon)
      return { error: "کد تخفیف معتبر نمی باشد" };

    const existingCourses = await database.course.findMany({
      where: { id: { in: coursesIds } },
    });
    if (existingCourses.length === 0)
      return { error: "این دوره (ها) معتبر نمی باشند" };

    const existingEnrollment = await database.enrollment.findFirst({
      where: { userId: user.id, courseId: { in: coursesIds } },
    });

    if (existingEnrollment)
      return { error: "شما قبلا در حداقل یکی از این دوره ها ثبت نام کرده اید" };

    const existingCampaign = await database.campaignOnGoing.findFirst({
      where: {
        startAt: { lte: new Date() },
        endAt: { gte: new Date() },
      },
    });

    const newPayment = await database.payment.create({
      data: {
        status: amount > 0 ? "PENDING" : "SUCCESS",
        userId: user.id,
        total: amount,
        itemsTotal,
        paymentMethod: amount > 0 ? paymentMethod : "NO_METHOD",
        discountCode,
        discountCodeAmount,
        couponId: existingCoupon?.id,
        discountAmount,
        walletUsed: useWallet,
        walletUsedAmount: useWalletAmount,
        campaignOnGoingId: existingCampaign?.id,

        enrollment:
          amount === 0
            ? {
                create: existingCourses.map((c, index) => ({
                  userId: user.id,
                  courseId: c.id,
                  price: prices[index]!.price,
                  courseOriginalPrice: c.basePrice,
                  classroom: {
                    create: {
                      userId: user.id,
                    },
                  },
                })),
              }
            : undefined,
      },

      include: {
        user: true,
        enrollment: {
          include: {
            course: true,
            classroom: true,
          },
        },
      },
    });

    // PURCHASE
    if (amount > 0) {
      const gateway = gatewayOf[paymentMethod];
      if (!gateway) return { error: "روش پرداخت معتبر نمی باشد" };

      let started;
      try {
        started = await pay.start({
          orderId: String(newPayment.id),
          amount: Math.round(amount * 10), // Toman → Rial
          description: `Payment For User ${user.id} | Payment Id: ${newPayment.id}`,
          gateway,
          customerMobile: user.phone,
          returnUrl: `${siteUrl}/checkout-result`,
          metadata: { userId: user.id },
        });
      } catch (error) {
        console.error("Payment start failed", newPayment.id, error);
        await database.payment.update({
          where: { id: newPayment.id },
          data: { status: "FAILED" },
        });
        return {
          error: "درگاه پرداخت پاسخگو نیست. لطفا دقایقی بعد مجددا تلاش کنید",
        };
      }

      // every checkout gateway here redirects with GET (only Mellat needs a POST form)
      if (started.redirect.method === "GET") {
        const updatedCart = await database.cart.update({
          where: { userId: user.id },
          data: {
            amount: amount * 10,
            authority: started.payment.reference,
            paymentId: newPayment.id,
          },
          include: { cartItem: true },
        });

        const cartItemsIds = updatedCart.cartItem.map((c) => c.id);

        for (let i = 0; i < cartItemsIds.length; i++) {
          await database.cartItem.update({
            where: {
              id: cartItemsIds[i],
            },
            data: {
              paidPrice: prices[i]?.price,
            },
          });
        }
      } else {
        return {
          error: "درگاه پرداخت پاسخگو نیست. لطفا دقایقی بعد مجددا تلاش کنید",
        };
      }
      return {
        success: "به صفحه پرداخت هدایت می شوید...",
        paymentUrl: started.redirect.url,
      };
    } else {
      if (newPayment.walletUsed) {
        await database.wallet.update({
          where: { id: user.wallet?.id },
          data: {
            balance: { decrement: newPayment.walletUsedAmount || 0 },
            used: { increment: 1 },
            transactions: newPayment.walletUsedAmount
              ? {
                  create: {
                    amount: newPayment.walletUsedAmount,
                    type: "DECREMENT",
                    description: "کسر کیف پول جهت خرید دوره",
                    paymentId: newPayment.id,
                  },
                }
              : undefined,
          },
        });
      }

      if (newPayment.discountCode) {
        await database.coupon.update({
          where: { code: newPayment.discountCode },
          data: {
            used: { increment: 1 },
          },
        });
      }

      await database.cart.delete({
        where: { userId: user.id },
      });

      //* Send Email
      await sendSuccessPaymentEmail(
        newPayment.user.email,
        newPayment.user.fullName,
        newPayment,
      );

      //* Send Email To Admin
      await sendSuccessPaymentEmailToAdmin(
        adminData.email,
        newPayment.user.fullName,
        newPayment,
      );

      //* Send Sms
      await sendSuccessPaymentSms(
        newPayment.user.firstName,
        newPayment.user.phone,
      );

      return {
        success: "در حال انتقال به لیست دوره ها...",
        redirectUrl: "/panel/courses",
      };
    }
  } catch (error) {
    return { error: String(error) };
  }
};

//* VERIFY PAYMENT -------------------------------------------------------

// Called by the result page with the `reference` the callback appended.
// The outcome always comes from the stored, bank-verified payment.
export const verifyPayment = async (reference: string) => {
  try {
    if (!reference) return { error: "کد مرجع معتبر نمی باشد" };

    let record = await pay.get(reference);
    if (!record) return { error: "کد مرجع معتبر نمی باشد" };
    if (record.status === "pending") record = (await pay.recheck(reference)) ?? record;

    const res = await settleGatewayPayment(record);
    if (res.status === "SUCCESS") return { success: "پرداخت موفق!", refId: res.refId };
    if (res.status === "PENDING")
      return { error: "پرداخت هنوز تایید نشده است. چند دقیقه دیگر وضعیت را در لیست پرداخت‌ها بررسی کنید" };
    return { error: "پرداخت ناموفق!" };
  } catch (error) {
    console.error(isPayError(error) ? error.code : error);
    return { error: "خطا در بررسی پرداخت" };
  }
};
