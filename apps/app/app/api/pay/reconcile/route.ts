import { pay } from "@/lib/pay";
import { settleGatewayPayment } from "@/lib/settle-payment";
import { database } from "@igraph/database";
import { NextRequest, NextResponse } from "next/server";

// Run every few minutes from cron with header `x-cron-key: $CRON_SECRET_KEY`.
// Expires abandoned sessions, retries verifies, re-sends OBH reports, then
// settles any cart whose bank payment finished without reaching us.
export async function POST(req: NextRequest) {
  const key = process.env.CRON_SECRET_KEY;
  if (!key || req.headers.get("x-cron-key") !== key)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const summary = await pay.reconcile();

  const carts = await database.cart.findMany({
    where: { authority: { startsWith: "PAY-" }, payment: { status: "PENDING" } },
    select: { authority: true },
    take: 100,
  });
  let settled = 0;
  for (const { authority } of carts) {
    const record = await pay.get(authority!);
    if (!record || record.status === "pending") continue;
    const res = await settleGatewayPayment(record);
    if (res.status !== "PENDING") settled++;
  }

  return NextResponse.json({ ...summary, settled });
}
