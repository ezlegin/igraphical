import { pay } from "@/lib/pay";
import { settleGatewayPayment } from "@/lib/settle-payment";
import { database } from "@igraph/database";
import { NextRequest, NextResponse } from "next/server";

// Run every few minutes from cron with header `x-cron-key: $CRON_SECRET_KEY`.
// Expires abandoned sessions, retries verifies, re-sends OBH reports, then
// settles any pending payment (subscription or legacy cart) whose bank
// payment finished without reaching us.
export async function POST(req: NextRequest) {
  const key = process.env.CRON_SECRET_KEY;
  if (!key || req.headers.get("x-cron-key") !== key)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const summary = await pay.reconcile();

  const pending = await database.payment.findMany({
    where: {
      status: { in: ["PENDING", "CANCELED"] },
      createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
    },
    select: { id: true },
    orderBy: { id: "desc" },
    take: 200,
  });

  const attempts = pending.length
    ? await database.gatewayPayment.findMany({
        where: {
          orderId: { in: pending.map((p) => String(p.id)) },
          status: { not: "pending" },
        },
        select: { reference: true },
      })
    : [];

  let settled = 0;
  for (const { reference } of attempts) {
    const record = await pay.get(reference);
    if (!record || record.status === "pending") continue;
    const res = await settleGatewayPayment(record);
    if (res.status === "SUCCESS") settled++;
  }

  return NextResponse.json({ ...summary, settled });
}
