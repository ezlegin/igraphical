import { adminData } from "@/data/adminData";
import { database } from "@igraph/database";
import type { PaymentRecord } from "@obhco/pay";
import {
  cashBackCalculator,
  sendSuccessPaymentEmail,
  sendSuccessPaymentEmailToAdmin,
  sendSuccessPaymentSms,
} from "@igraph/utils";

export type SettleResult =
  | { status: "SUCCESS"; refId: string }
  | { status: "FAILED" }
  | { status: "PENDING" };

/**
 * Applies a verified gateway result to our Payment: on success enrolls the
 * cart's courses, settles wallet/coupon and notifies; on failure marks it
 * FAILED. Safe to call more than once (callback, result page and cron all
 * call it): deleting the cart is the claim, so only one caller enrolls.
 * Never call it with a record that did not come from `pay` (bank-verified).
 */
export async function settleGatewayPayment(record: PaymentRecord): Promise<SettleResult> {
  const paymentId = Number(record.orderId);
  const payment = await database.payment.findUnique({ where: { id: paymentId } });
  if (!payment) return { status: "FAILED" };

  const refId = record.providerReference || record.traceNumber || record.reference;

  if (payment.status === "SUCCESS") return { status: "SUCCESS", refId: payment.transactionId || refId };

  if (record.status === "pending") return { status: "PENDING" };

  if (record.status !== "completed") {
    await database.payment.updateMany({
      where: { id: paymentId, status: "PENDING" },
      data: { status: "FAILED" },
    });
    return { status: "FAILED" };
  }

  if (record.amount !== String(Math.round(payment.total * 10))) {
    console.error("Gateway amount does not match payment total", record.reference, paymentId);
    return { status: "FAILED" };
  }

  const cart = await database.cart.findFirst({
    where: { paymentId },
    include: { cartItem: { include: { course: true } } },
  });
  if (!cart) {
    // paid at the bank but the cart moved on (user started another checkout)
    console.error("Completed gateway payment has no cart; needs manual enrollment", record.reference, paymentId);
    return { status: "SUCCESS", refId };
  }

  const { count } = await database.cart.deleteMany({ where: { id: cart.id, paymentId } });
  if (count !== 1) return { status: "SUCCESS", refId };

  const updatedPayment = await database.payment.update({
    where: { id: paymentId },
    include: { user: true, enrollment: { include: { course: true } } },
    data: {
      status: "SUCCESS",
      paidAt: record.completedAt ?? new Date(),
      transactionId: refId,
      enrollment: {
        create: cart.cartItem.map((cartItem) => ({
          userId: cart.userId,
          courseId: cartItem.courseId,
          price: cartItem.paidPrice || 0,
          courseOriginalPrice: cartItem.course.basePrice,
          classroom: { create: { userId: cart.userId } },
        })),
      },
    },
  });

  //* CASHBACK
  const cashbackAmount = cashBackCalculator(
    updatedPayment.total,
    updatedPayment.paymentMethod === "DIGIPAY",
  );
  if (cashbackAmount > 0) {
    const transaction = {
      create: {
        amount: cashbackAmount,
        type: "INCREMENT" as const,
        description: "شارژ کیف پول جهت خرید دوره",
        paymentId: updatedPayment.id,
      },
    };
    await database.wallet.upsert({
      where: { userId: updatedPayment.userId },
      update: { balance: { increment: cashbackAmount }, transactions: transaction },
      create: { balance: cashbackAmount, userId: updatedPayment.userId, transactions: transaction },
    });
  }

  if (updatedPayment.walletUsed && updatedPayment.walletUsedAmount) {
    await database.wallet.update({
      where: { userId: updatedPayment.userId },
      data: {
        balance: { decrement: updatedPayment.walletUsedAmount },
        used: { increment: 1 },
        transactions: {
          create: {
            amount: updatedPayment.walletUsedAmount,
            type: "DECREMENT",
            description: "کسر کیف پول جهت خرید دوره",
            paymentId: updatedPayment.id,
          },
        },
      },
    });
  }

  if (updatedPayment.discountCode) {
    await database.coupon.update({
      where: { code: updatedPayment.discountCode },
      data: { used: { increment: 1 } },
    });
  }

  // notifications must not undo a settled payment
  try {
    await sendSuccessPaymentEmail(updatedPayment.user.email, updatedPayment.user.fullName, updatedPayment);
    await sendSuccessPaymentEmailToAdmin(adminData.email, updatedPayment.user.fullName, updatedPayment);
    await sendSuccessPaymentSms(updatedPayment.user.firstName, updatedPayment.user.phone);
  } catch (error) {
    console.error("Payment notifications failed", paymentId, error);
  }

  return { status: "SUCCESS", refId };
}
