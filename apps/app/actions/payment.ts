"use server";

import { pay } from "@/lib/pay";
import { settleGatewayPayment } from "@/lib/settle-payment";
import { isPayError } from "@obhco/pay";

//* VERIFY PAYMENT -------------------------------------------------------

// Called by the result page with the `reference` the callback appended.
// The outcome always comes from the stored, bank-verified payment.
export const verifyPayment = async (reference: string) => {
  try {
    if (!reference) return { error: "کد مرجع معتبر نمی باشد" };

    let record = await pay.get(reference);
    if (!record) return { error: "کد مرجع معتبر نمی باشد" };
    if (record.status === "pending")
      record = (await pay.recheck(reference)) ?? record;

    const res = await settleGatewayPayment(record);
    if (res.status === "SUCCESS")
      return { success: "پرداخت موفق!", refId: res.refId };
    if (res.status === "PENDING")
      return {
        error:
          "پرداخت هنوز تایید نشده است. چند دقیقه دیگر وضعیت را در لیست پرداخت‌ها بررسی کنید",
      };
    return { error: "پرداخت ناموفق!" };
  } catch (error) {
    console.error(isPayError(error) ? error.code : error);
    return { error: "خطا در بررسی پرداخت" };
  }
};
