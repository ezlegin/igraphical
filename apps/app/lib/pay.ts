import { createPay } from "@obhco/pay";
import { PaymentMethod } from "@igraph/database";
import { prismaPaymentStore } from "./pay-store";

export const siteUrl =
  process.env.NODE_ENV === "production"
    ? process.env.NEXT_PUBLIC_BASE_URL || "https://igraphical.ir"
    : "http://localhost:3000";

export const pay = createPay({
  service: "igraphical",
  baseUrl: siteUrl,
  store: prismaPaymentStore,
  environment: process.env.PAY_ENVIRONMENT === "test" ? "test" : "live",
  onReportError: (error, payment) =>
    console.error("OBH finance report failed", payment.reference, error),
});

// checkout payment method → @obhco/pay gateway code
export const gatewayOf: Partial<Record<PaymentMethod, string>> = {
  ZARRIN_PAL: "zarinpal",
  // SADAD: "sadad", // temporarily off (problem in production)
  DIGIPAY: "digipay",
};
