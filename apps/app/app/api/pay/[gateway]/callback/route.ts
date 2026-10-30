import { pay, siteUrl } from "@/lib/pay";
import { settleGatewayPayment } from "@/lib/settle-payment";
import { callbackRoute } from "@obhco/pay";

// Bank callback: @obhco/pay verifies with the bank server-to-server, then we
// enroll right away so a customer who closes the tab still gets the course.
async function handle(request: Request, ctx: { params: Promise<{ gateway: string }> }) {
  const { gateway } = await ctx.params;
  return callbackRoute(pay, gateway, {
    fallbackUrl: `${siteUrl}/cart`,
    onResult: async (payment) => {
      try {
        await settleGatewayPayment(payment);
      } catch (error) {
        // the result page and the reconcile cron retry it
        console.error("Settling payment from callback failed", payment.reference, error);
      }
    },
  })(request);
}

export { handle as GET, handle as POST };
